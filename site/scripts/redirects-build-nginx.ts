// Nginx parallel to scripts/redirects-build.ts. Reads the same
// migration/classified.json data and emits site/public/.nginx-redirects.conf,
// which the VPS nginx server block `include`s from /var/www/hunyamunya/.
//
// Two shapes of rule:
//   * Path redirects (structural):
//       location ~ ^/releases/?$ { return 301 /catalog; }
//   * Query-string redirects (WP plain permalinks) all live on the `/` path,
//     so they go into a single `location = /` block with a sequence of
//     `if ($args = "...")` guards and a try_files fallback to the homepage.
//
// Nginx `if` inside `location` is famously fragile, but the two operations we
// use (return 301 and the single final try_files) are on the safe list.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const CLASSIFIED_JSON_PATH = resolve(ROOT, "migration/classified.json");
const OUT_PATH = resolve(ROOT, "public/.nginx-redirects.conf");

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
type QueryRedirect = { kind: "query"; queryValue: string; to: string; status: 301 | 410 };
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
    { kind: "path", from: "^/releases/?$", to: "/catalog", status: 301 },
    { kind: "path", from: "^/releases-2/?$", to: "/catalog", status: 301 },
    { kind: "path", from: "^/shop/?$", to: "/catalog", status: 301 },
    { kind: "path", from: "^/catalog/hmb002-the-orange-album/?$", to: "/catalog/hmb002b-the-orange-album", status: 301 },
    { kind: "path", from: "^/catalog/hmb002B-the-orange-album/?$", to: "/catalog/hmb002b-the-orange-album", status: 301 },
    { kind: "path", from: "^/press/?$", to: "/press", status: 301 },
    { kind: "path", from: "^/artists/catnip-claws-2/?$", to: "/artists/catnip-claws", status: 301 },
    { kind: "path", from: "^/tim-fretwell/?$", to: "/artists/tim-fretwell", status: 301 },
    { kind: "path", from: "^/feed/?$", to: "-", status: 410 },
    { kind: "path", from: "^/comments/feed/?$", to: "-", status: 410 },
    { kind: "path", from: "^/feed/rss2?/?$", to: "-", status: 410 },
  ];
}

function buildQueryRedirectsFromClassified(items: ClassifiedItem[]): Redirect[] {
  const redirects: Redirect[] = [];

  for (const item of items) {
    if (item.post_type === "post" && item.class === "news" && item.status === "publish") {
      const year = yearFromPostDate(item.post_date);
      redirects.push({
        kind: "query",
        queryValue: `p=${item.post_id}`,
        to: `/news/${year}/${item.post_name}`,
        status: 301,
      });
      continue;
    }

    if (item.post_type !== "page") continue;

    if (item.post_id === PAGE_ID_ARTISTS_PARENT) {
      redirects.push({ kind: "query", queryValue: `page_id=${item.post_id}`, to: "/artists", status: 301 });
      continue;
    }

    if (item.post_parent === PAGE_ID_ARTISTS_PARENT) {
      redirects.push({
        kind: "query",
        queryValue: `page_id=${item.post_id}`,
        to: `/artists/${slugForArtist(item.post_name)}`,
        status: 301,
      });
      continue;
    }

    if (PAGE_IDS_TO_CATALOG.has(item.post_id)) {
      redirects.push({ kind: "query", queryValue: `page_id=${item.post_id}`, to: "/catalog", status: 301 });
      continue;
    }

    if (item.post_id === PAGE_ID_PRESS) {
      redirects.push({ kind: "query", queryValue: `page_id=${item.post_id}`, to: "/press", status: 301 });
      continue;
    }

    if (item.post_id === PAGE_ID_TIM_FRETWELL_ORPHAN) {
      redirects.push({ kind: "query", queryValue: `page_id=${item.post_id}`, to: "/artists/tim-fretwell", status: 301 });
      continue;
    }
  }

  return redirects;
}

function emitPathRule(r: PathRedirect): string {
  if (r.status === 410) {
    return `location ~ ${r.from} { return 410; }`;
  }
  return `location ~ ${r.from} { return ${r.status} ${r.to}; }`;
}

function emitQueryGuard(r: QueryRedirect): string {
  // Escape backslash and double quote for safety; our values are simple
  // alphanumeric + `=` + digits, so nothing really to escape, but be defensive.
  const safe = r.queryValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  if (r.status === 410) {
    return `    if ($args = "${safe}") { return 410; }`;
  }
  return `    if ($args = "${safe}") { return ${r.status} ${r.to}; }`;
}

function renderSnippet(pathRules: PathRedirect[], queryRules: QueryRedirect[]): string {
  const lines: string[] = [];
  lines.push("# Generated by site/scripts/redirects-build-nginx.ts; do not edit by hand.");
  lines.push(`# Last generated: ${new Date().toISOString()}`);
  lines.push("# Included from /etc/nginx/sites-available/hunyamunya.");
  lines.push("");
  if (pathRules.length) {
    lines.push("# -- Structural path redirects --");
    for (const r of pathRules) lines.push(emitPathRule(r));
    lines.push("");
  }
  if (queryRules.length) {
    lines.push("# -- WP plain-permalink query redirects (all fire on exactly '/') --");
    lines.push("location = / {");
    for (const r of queryRules) lines.push(emitQueryGuard(r));
    lines.push("    try_files /index.html =404;");
    lines.push("}");
  }
  return lines.join("\n") + "\n";
}

async function main() {
  const classifiedRaw = readFileSync(CLASSIFIED_JSON_PATH, "utf8");
  const classified = JSON.parse(classifiedRaw) as ClassifiedDump;

  const structural = buildStructuralRedirects().filter((r): r is PathRedirect => r.kind === "path");
  const queries = buildQueryRedirectsFromClassified(classified.items).filter(
    (r): r is QueryRedirect => r.kind === "query",
  );

  const snippet = renderSnippet(structural, queries);
  writeFileSync(OUT_PATH, snippet);

  console.log("Structural path redirects:", structural.length);
  console.log("Query-string redirects:", queries.length);
  console.log("Wrote", OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
