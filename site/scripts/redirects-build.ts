// Spec: rebuild-v1 §8.4 as revised by hosting-addendum §5.
// Read site/migration/classified.json (written by wp-import), combine with
// structural redirects, and populate the BEGIN REDIRECTS / END REDIRECTS
// marker block in site/public/.htaccess.
//
// WP uses plain permalinks (/?p=ID for posts, /?page_id=ID for pages),
// confirmed via curl -I probe on 2026-04-22. So most redirects are
// query-string matches via RewriteCond.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const CLASSIFIED_JSON_PATH = resolve(ROOT, "migration/classified.json");
const HTACCESS_PATH = resolve(ROOT, "public/.htaccess");
const BEGIN_MARKER = "# BEGIN REDIRECTS";
const END_MARKER = "# END REDIRECTS";

type ClassifiedItem = {
  post_id: number;
  post_type: string;
  post_parent: number;
  post_name: string;
  post_date: string;
  status: string;
  title: string;
  class: string;
  review_flags: string[];
};

type ClassifiedDump = {
  items: ClassifiedItem[];
};

type PathRedirect = { kind: "path"; from: string; to: string; status: 301 | 410 };
type QueryRedirect = { kind: "query"; queryPattern: string; to: string; status: 301 | 410 };
type Redirect = PathRedirect | QueryRedirect;

const PAGE_ID_ARTISTS_PARENT = 12;
const PAGE_IDS_TO_CATALOG = new Set([14, 16, 79, 445]);
const PAGE_ID_PRESS = 247;
const PAGE_ID_TIM_FRETWELL_ORPHAN = 1052;

function slugForArtist(postName: string): string {
  return postName === "catnip-claws-2" ? "catnip-claws" : postName;
}

function yearFromPostDate(postDate: string): string {
  const m = postDate.match(/^(\d{4})/);
  if (!m) throw new Error(`cannot extract year from post_date: ${postDate}`);
  return m[1];
}

function buildStructuralRedirects(): Redirect[] {
  return [
    // Structural mis-titled pages and collapsed URLs. Cheap backlink/index insurance
    // even though WP used plain permalinks; these slugs may have been in sitemaps
    // from a previous permalink regime.
    { kind: "path", from: "^releases/?$", to: "/catalog", status: 301 },
    { kind: "path", from: "^releases-2/?$", to: "/catalog", status: 301 },
    { kind: "path", from: "^shop/?$", to: "/catalog", status: 301 },
    // HMB002 → HMB002b rename: Evan Marcus The Orange Album was briefly at the
    // no-suffix URL before the 2026-04-23 renumber. Second rule catches the
    // uppercase-B variant that also existed during the brief interim before the
    // suffix-casing normalization.
    { kind: "path", from: "^catalog/hmb002-the-orange-album/?$", to: "/catalog/hmb002b-the-orange-album", status: 301 },
    { kind: "path", from: "^catalog/hmb002B-the-orange-album/?$", to: "/catalog/hmb002b-the-orange-album", status: 301 },
    { kind: "path", from: "^artists/catnip-claws-2/?$", to: "/artists/catnip-claws", status: 301 },
    { kind: "path", from: "^tim-fretwell/?$", to: "/artists/tim-fretwell", status: 301 },
    // Feeds go to 410 so Google deindexes (spec §8.4).
    { kind: "path", from: "^feed/?$", to: "-", status: 410 },
    { kind: "path", from: "^comments/feed/?$", to: "-", status: 410 },
    { kind: "path", from: "^feed/rss2?/?$", to: "-", status: 410 },
  ];
}

function buildQueryRedirectsFromClassified(items: ClassifiedItem[]): Redirect[] {
  const redirects: Redirect[] = [];

  for (const item of items) {
    if (item.post_type === "post" && item.class === "news" && item.status === "publish") {
      const year = yearFromPostDate(item.post_date);
      redirects.push({
        kind: "query",
        queryPattern: `^p=${item.post_id}$`,
        to: `/news/${year}/${item.post_name}`,
        status: 301,
      });
      continue;
    }

    if (item.post_type !== "page") continue;

    if (item.post_id === PAGE_ID_ARTISTS_PARENT) {
      redirects.push({
        kind: "query",
        queryPattern: `^page_id=${item.post_id}$`,
        to: "/artists",
        status: 301,
      });
      continue;
    }

    if (item.post_parent === PAGE_ID_ARTISTS_PARENT) {
      redirects.push({
        kind: "query",
        queryPattern: `^page_id=${item.post_id}$`,
        to: `/artists/${slugForArtist(item.post_name)}`,
        status: 301,
      });
      continue;
    }

    if (PAGE_IDS_TO_CATALOG.has(item.post_id)) {
      redirects.push({
        kind: "query",
        queryPattern: `^page_id=${item.post_id}$`,
        to: "/catalog",
        status: 301,
      });
      continue;
    }

    if (item.post_id === PAGE_ID_PRESS) {
      redirects.push({
        kind: "query",
        queryPattern: `^page_id=${item.post_id}$`,
        to: "/press",
        status: 301,
      });
      continue;
    }

    if (item.post_id === PAGE_ID_TIM_FRETWELL_ORPHAN) {
      redirects.push({
        kind: "query",
        queryPattern: `^page_id=${item.post_id}$`,
        to: "/artists/tim-fretwell",
        status: 301,
      });
      continue;
    }
  }

  return redirects;
}

function emitRule(r: Redirect): string {
  if (r.kind === "path") {
    if (r.status === 410) {
      return `RewriteRule ${r.from} - [R=410,L]`;
    }
    return `RewriteRule ${r.from} ${r.to} [R=${r.status},L,NE]`;
  }
  // Query-string match: two lines, RewriteCond + RewriteRule.
  // Trailing `?` on the target strips the incoming query string.
  // NE flag preserves percent-encoded characters in the target (one news slug
  // has %e2%80%99 and similar sequences; without NE Apache double-encodes them).
  return [
    `RewriteCond %{QUERY_STRING} ${r.queryPattern}`,
    `RewriteRule ^/?$ ${r.to}? [R=${r.status},L,NE]`,
  ].join("\n");
}

function sectionHeader(title: string): string {
  return `# -- ${title} --`;
}

function renderRedirectBlock(pathRules: Redirect[], queryRules: Redirect[]): string {
  const lines: string[] = [];
  lines.push("# This block is generated by scripts/redirects-build.ts; do not edit by hand.");
  lines.push(`# Last generated: ${new Date().toISOString()}`);
  lines.push("");
  if (pathRules.length) {
    lines.push(sectionHeader("Structural path redirects"));
    for (const r of pathRules) lines.push(emitRule(r));
    lines.push("");
  }
  if (queryRules.length) {
    lines.push(sectionHeader("WP plain-permalink query redirects"));
    for (const r of queryRules) {
      lines.push(emitRule(r));
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n+$/, "\n");
}

async function main() {
  const classifiedRaw = readFileSync(CLASSIFIED_JSON_PATH, "utf8");
  const classified = JSON.parse(classifiedRaw) as ClassifiedDump;

  const structural = buildStructuralRedirects();
  const queries = buildQueryRedirectsFromClassified(classified.items);

  const block = renderRedirectBlock(structural, queries);

  const existing = readFileSync(HTACCESS_PATH, "utf8");
  const beginIdx = existing.indexOf(BEGIN_MARKER);
  const endIdx = existing.indexOf(END_MARKER);
  if (beginIdx < 0 || endIdx < 0 || endIdx < beginIdx) {
    throw new Error(
      `BEGIN/END REDIRECTS markers not found (or reversed) in ${HTACCESS_PATH}. ` +
        `The baseline .htaccess must contain "${BEGIN_MARKER}" followed by "${END_MARKER}".`,
    );
  }

  const prefix = existing.slice(0, beginIdx + BEGIN_MARKER.length);
  const suffix = existing.slice(endIdx);
  const updated = `${prefix}\n${block}${suffix}`;

  writeFileSync(HTACCESS_PATH, updated);

  console.log("Structural path redirects:", structural.length);
  console.log("Query-string redirects:", queries.length);
  console.log("Wrote", HTACCESS_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
