// Spec: rebuild-v1 §8.2, migration-dry-run §1.1, hosting-addendum §3.
// Parse site/migration/hunyamunyarecords.WordPress.2026-04-22.xml,
// normalize every WXR item, dump to site/migration/raw.json for auditing.
// MDX emission is a later step.

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";
import matter from "gray-matter";
import { artistSchema, newsSchema, releaseSchema } from "../lib/schema";

const ROOT = process.cwd();
const XML_PATH = resolve(ROOT, "migration/hunyamunyarecords.WordPress.2026-04-22.xml");
const RAW_JSON_PATH = resolve(ROOT, "migration/raw.json");
const CLASSIFIED_JSON_PATH = resolve(ROOT, "migration/classified.json");
const ARTISTS_DIR = resolve(ROOT, "content/artists");
const NEWS_DIR = resolve(ROOT, "content/news");
const RELEASES_DIR = resolve(ROOT, "content/releases");
const PAGES_DIR = resolve(ROOT, "content/pages");
const REVIEW_DIR = resolve(ROOT, "content/_review");
const REPORT_PATH = resolve(ROOT, "migration/report.md");

// Page IDs that carry special meaning per migration-dry-run §1.1.
const PAGE_ID_ARTISTS_PARENT = 12;
const PAGE_IDS_RELEASE_SEEDS = new Set([14, 16, 79]);
const PAGE_ID_PRESS = 247;
const PAGE_ID_SHOP = 445;

// Items Evan has already decided on. Do not re-emit these to content/_review/
// on subsequent runs. Keyed by post_id. Values are short resolution notes for
// the migration report.
const RESOLVED_REVIEW_FLAGS: Record<number, string> = {
  14: "Legacy CF7 contact form embed. Deleted; /releases → /catalog already in .htaccess.",
  16: "Release list body; content already in the release seed data. Deleted; /releases-2 → /catalog already in .htaccess.",
  504: "Catnip & Claws: emitted at content/artists/catnip-claws.mdx with legacy_slug preserved; redirect from /artists/catnip-claws-2 is in .htaccess.",
  932: "Draft post with empty body; deliberately skipped from publication.",
  1052: "Duplicate of canonical /artists/tim-fretwell. Deleted; 301 from /?page_id=1052 and /tim-fretwell to /artists/tim-fretwell.",
};

type Postmeta = { key: string; value: string };
type Category = { domain: string; nicename: string; label: string };

type RawItem = {
  post_id: number;
  post_type: string;
  post_parent: number;
  post_name: string;
  post_date: string;
  post_date_gmt: string;
  pub_date: string;
  status: string;
  creator: string;
  title: string;
  link: string;
  guid: string;
  excerpt: string;
  content: string;
  attachment_url?: string;
  menu_order: number;
  postmeta: Postmeta[];
  categories: Category[];
};

type ChannelMeta = {
  title: string;
  link: string;
  description: string;
  base_site_url: string;
  base_blog_url: string;
  language?: string;
  wxr_version?: string;
  authors: Array<{ login: string; email: string; display_name: string }>;
};

type RawDump = {
  parsed_at: string;
  xml_path: string;
  channel: ChannelMeta;
  counts_by_post_type: Record<string, number>;
  items: RawItem[];
};

type ItemClass =
  | "artist"
  | "release_seed_page"
  | "press_page"
  | "shop_page"
  | "news"
  | "attachment"
  | "misc_page"
  | "skip";

type ReviewReason =
  | "tim_fretwell_orphan"
  | "catnip_claws_rename"
  | "mis_titled_page"
  | "draft_skipped"
  | "misc_page_needs_sorting";

type ReviewFlag = {
  post_id: number;
  post_type: string;
  post_name: string;
  title: string;
  reason: ReviewReason;
  note: string;
};

type ClassifiedItem = RawItem & {
  class: ItemClass;
  review_flags: ReviewReason[];
};

type ClassifiedDump = {
  classified_at: string;
  counts_by_class: Record<string, number>;
  review: ReviewFlag[];
  items: ClassifiedItem[];
};

// WP XML uses empty strings and zero ids in ways that need defensive coercion.
const toInt = (v: unknown, fallback = 0): number => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
};

const toStr = (v: unknown, fallback = ""): string => {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // CDATA blocks become objects depending on parser config; pull the string out.
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (typeof obj["#text"] === "string") return obj["#text"] as string;
    if (typeof obj["__cdata"] === "string") return obj["__cdata"] as string;
  }
  return fallback;
};

const asArray = <T>(v: T | T[] | undefined | null): T[] => {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
};

function normalizePostmeta(raw: unknown): Postmeta[] {
  return asArray(raw).map((pm) => {
    const obj = pm as Record<string, unknown>;
    return {
      key: toStr(obj["wp:meta_key"]),
      value: toStr(obj["wp:meta_value"]),
    };
  });
}

function normalizeCategories(raw: unknown): Category[] {
  return asArray(raw).map((cat) => {
    const obj = cat as Record<string, unknown>;
    const attrs = obj as { "@_domain"?: string; "@_nicename"?: string; "#text"?: string };
    return {
      domain: toStr(attrs["@_domain"]),
      nicename: toStr(attrs["@_nicename"]),
      label: toStr(attrs["#text"] ?? obj),
    };
  });
}

function normalizeItem(raw: Record<string, unknown>): RawItem {
  return {
    post_id: toInt(raw["wp:post_id"]),
    post_type: toStr(raw["wp:post_type"]),
    post_parent: toInt(raw["wp:post_parent"]),
    post_name: toStr(raw["wp:post_name"]),
    post_date: toStr(raw["wp:post_date"]),
    post_date_gmt: toStr(raw["wp:post_date_gmt"]),
    pub_date: toStr(raw["pubDate"]),
    status: toStr(raw["wp:status"]),
    creator: toStr(raw["dc:creator"]),
    title: toStr(raw["title"]),
    link: toStr(raw["link"]),
    guid: toStr(raw["guid"]),
    excerpt: toStr(raw["excerpt:encoded"]),
    content: toStr(raw["content:encoded"]),
    attachment_url: toStr(raw["wp:attachment_url"]) || undefined,
    menu_order: toInt(raw["wp:menu_order"]),
    postmeta: normalizePostmeta(raw["wp:postmeta"]),
    categories: normalizeCategories(raw["category"]),
  };
}

function pmValue(item: RawItem, key: string): string {
  const hit = item.postmeta.find((pm) => pm.key === key);
  return hit ? hit.value : "";
}

function stripSizeSuffix(relPath: string): string {
  return relPath.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, "$1");
}

function rewriteBody(content: string): string {
  let out = content;
  // Strip HTML comments (covers Gutenberg block markers and legacy <!--more--> etc).
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  // Strip script tags for safety (dry-run §4 "sanitize scripts").
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Strip inline style="..." attributes. MDX renders HTML as JSX, which expects
  // `style` as an object literal, not a string. WP themes bake in dimensions
  // we don't want on the new site anyway; design tokens and CSS handle sizing.
  out = out.replace(/\s+style\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\s+style\s*=\s*'[^']*'/gi, "");
  // Normalize void elements to self-closing (MDX/JSX requires <br/>, not <br>).
  // Covers the common ones we've seen in WP content.
  out = out.replace(
    /<(br|hr|img|input|area|base|col|embed|link|meta|param|source|track|wbr)((?:\s+[^>\/]+)?)(?<!\/)>/gi,
    "<$1$2 />",
  );
  // Rename `class` to `className` so JSX doesn't warn (and to match React).
  out = out.replace(/\s+class\s*=/gi, " className=");
  // Rewrite WP uploads URLs to site-relative /media/legacy/ paths with size suffixes stripped.
  out = out.replace(
    /https?:\/\/(?:www\.)?hunyamunyarecords\.com\/wp-content\/uploads\/([^\s)"'<>\]]+)/g,
    (_m, p: string) => `/media/legacy/${stripSizeSuffix(p)}`
  );
  // Collapse blank lines.
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return out + "\n";
}

function slugForArtist(item: RawItem): { slug: string; legacy_slug?: string } {
  if (item.post_name === "catnip-claws-2") {
    return { slug: "catnip-claws", legacy_slug: "catnip-claws-2" };
  }
  return { slug: item.post_name };
}

function classifyItem(item: RawItem): { class: ItemClass; review: ReviewReason[] } {
  const review: ReviewReason[] = [];

  if (item.post_type === "attachment") {
    return { class: "attachment", review };
  }

  if (item.post_type === "post") {
    // Only publish-status posts become news. Drafts, private, trash, etc. are skipped
    // from public emission but flagged so Evan can see what's lurking (dry-run §7 flag 6
    // specifically calls out the single draft at post_id 932).
    if (item.status !== "publish") {
      review.push("draft_skipped");
      return { class: "skip", review };
    }
    return { class: "news", review };
  }

  if (item.post_type === "page") {
    // The /artists parent page itself is not emitted; the index renders from
    // content/artists/*.mdx.
    if (item.post_id === PAGE_ID_ARTISTS_PARENT) {
      return { class: "skip", review };
    }

    // Any page whose parent is the /artists page is an artist page.
    if (item.post_parent === PAGE_ID_ARTISTS_PARENT) {
      if (item.post_name === "catnip-claws-2") {
        review.push("catnip_claws_rename");
      }
      return { class: "artist", review };
    }

    // Orphan /tim-fretwell at top level (dry-run §7 flag 1).
    if (item.post_name === "tim-fretwell" && item.post_parent === 0) {
      review.push("tim_fretwell_orphan");
      return { class: "misc_page", review };
    }

    // Release catalog seed pages (dry-run §1.1, §1.3). Also flag the mis-titled
    // /releases (id 14) and /releases-2 (id 16) pages per §7 flag 3.
    if (PAGE_IDS_RELEASE_SEEDS.has(item.post_id)) {
      if (item.post_id === 14 || item.post_id === 16) {
        review.push("mis_titled_page");
      }
      return { class: "release_seed_page", review };
    }

    if (item.post_id === PAGE_ID_PRESS) return { class: "press_page", review };
    if (item.post_id === PAGE_ID_SHOP) return { class: "shop_page", review };

    review.push("misc_page_needs_sorting");
    return { class: "misc_page", review };
  }

  // nav_menu_item, custom_css, wpcf7_contact_form, anything unknown.
  return { class: "skip", review };
}

function extractChannelMeta(channel: Record<string, unknown>): ChannelMeta {
  const authorsRaw = asArray(channel["wp:author"]);
  return {
    title: toStr(channel["title"]),
    link: toStr(channel["link"]),
    description: toStr(channel["description"]),
    base_site_url: toStr(channel["wp:base_site_url"]),
    base_blog_url: toStr(channel["wp:base_blog_url"]),
    language: toStr(channel["language"]) || undefined,
    wxr_version: toStr(channel["wp:wxr_version"]) || undefined,
    authors: authorsRaw.map((a) => {
      const obj = a as Record<string, unknown>;
      return {
        login: toStr(obj["wp:author_login"]),
        email: toStr(obj["wp:author_email"]),
        display_name: toStr(obj["wp:author_display_name"]),
      };
    }),
  };
}

function assertTargetsEmptyOrForced(): void {
  if (process.argv.includes("--force")) return;
  const targets = [ARTISTS_DIR, NEWS_DIR, RELEASES_DIR, PAGES_DIR, REVIEW_DIR];
  const occupied: string[] = [];
  for (const dir of targets) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw e;
    }
    const nonGitkeep = entries.filter((e) => e !== ".gitkeep");
    if (nonGitkeep.length > 0) {
      occupied.push(`  ${dir} (${nonGitkeep.length} items)`);
    }
  }
  if (!occupied.length) return;

  console.error(
    [
      "ABORT: wp-import wholesale overwrites content directories. The following",
      "contain unsaved work that would be destroyed:",
      "",
      ...occupied,
      "",
      "If this is intentional (fresh migration pass), re-run with --force:",
      "  npm run import:wp -- --force",
      "",
      "See site/migration/README.md for the one-shot policy.",
    ].join("\n"),
  );
  process.exit(2);
}

async function main() {
  assertTargetsEmptyOrForced();

  console.log("Reading", XML_PATH);
  const xml = readFileSync(XML_PATH, "utf8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
    parseAttributeValue: false,
    processEntities: true,
    trimValues: false,
    cdataPropName: "__cdata",
  });

  const doc = parser.parse(xml);
  const channelRaw = (doc as Record<string, unknown>)["rss"] as Record<string, unknown> | undefined;
  const channel = channelRaw?.["channel"] as Record<string, unknown> | undefined;
  if (!channel) throw new Error("WXR parse error: no rss.channel found");

  const rawItems = asArray(channel["item"]) as Record<string, unknown>[];
  const items = rawItems.map(normalizeItem);

  const countsByType: Record<string, number> = {};
  for (const it of items) {
    countsByType[it.post_type] = (countsByType[it.post_type] ?? 0) + 1;
  }

  const dump: RawDump = {
    parsed_at: new Date().toISOString(),
    xml_path: XML_PATH,
    channel: extractChannelMeta(channel),
    counts_by_post_type: countsByType,
    items,
  };

  mkdirSync(dirname(RAW_JSON_PATH), { recursive: true });
  writeFileSync(RAW_JSON_PATH, JSON.stringify(dump, null, 2));

  console.log("Parsed", items.length, "items");
  console.log("By post_type:", countsByType);
  console.log("Wrote", RAW_JSON_PATH);

  // Classification pass.
  const classified: ClassifiedItem[] = [];
  const reviewFlags: ReviewFlag[] = [];
  const countsByClass: Record<string, number> = {};

  for (const item of items) {
    const { class: cls, review } = classifyItem(item);
    countsByClass[cls] = (countsByClass[cls] ?? 0) + 1;
    classified.push({ ...item, class: cls, review_flags: review });
    for (const reason of review) {
      reviewFlags.push({
        post_id: item.post_id,
        post_type: item.post_type,
        post_name: item.post_name,
        title: item.title,
        reason,
        note: reviewNote(reason, item),
      });
    }
  }

  const classifiedDump: ClassifiedDump = {
    classified_at: new Date().toISOString(),
    counts_by_class: countsByClass,
    review: reviewFlags,
    items: classified,
  };

  writeFileSync(CLASSIFIED_JSON_PATH, JSON.stringify(classifiedDump, null, 2));

  console.log("");
  console.log("Classified by class:", countsByClass);
  console.log("Review flags:", reviewFlags.length);
  for (const f of reviewFlags) {
    console.log(`  [${f.reason}] id=${f.post_id} "${f.title}"`);
  }
  console.log("Wrote", CLASSIFIED_JSON_PATH);

  // Emission pass.
  // Clear previous run output so removed content doesn't linger across runs.
  rmSync(ARTISTS_DIR, { recursive: true, force: true });
  rmSync(NEWS_DIR, { recursive: true, force: true });
  rmSync(RELEASES_DIR, { recursive: true, force: true });
  rmSync(PAGES_DIR, { recursive: true, force: true });
  rmSync(REVIEW_DIR, { recursive: true, force: true });

  const stats: EmitStats = {
    artists: 0,
    artists_skipped: 0,
    artist_stubs: 0,
    news: 0,
    news_skipped: 0,
    releases: 0,
    releases_skipped: 0,
    pages: 0,
    review_files: 0,
  };
  emitArtists(classified, stats);
  emitArtistStubs(stats);
  emitNews(classified, stats);
  emitReleases(stats);
  emitPages(classified, stats);

  writeReport(items.length, countsByType, countsByClass, reviewFlags, stats);

  console.log("");
  console.log("Emitted artists:", stats.artists);
  if (stats.artists_skipped) console.log("Artists skipped (schema fail):", stats.artists_skipped);
  if (stats.artist_stubs) console.log("Emitted stub artists (digital-era):", stats.artist_stubs);
  console.log("Emitted news:", stats.news);
  if (stats.news_skipped) console.log("News skipped:", stats.news_skipped);
  console.log("Emitted releases (draft):", stats.releases);
  if (stats.releases_skipped) console.log("Releases skipped:", stats.releases_skipped);
  console.log("Emitted pages:", stats.pages);
  console.log("Review files written:", stats.review_files);
  console.log("Wrote", REPORT_PATH);
}

type EmitStats = {
  artists: number;
  artists_skipped: number;
  artist_stubs: number;
  news: number;
  news_skipped: number;
  releases: number;
  releases_skipped: number;
  pages: number;
  review_files: number;
};

type ReleaseSeed = {
  slug: string;
  title: string;
  catalog_number?: string;
  artist: string;
  artists_additional?: string[];
  release_date?: string;
  year: number;
  format: Array<"vinyl-12" | "vinyl-7" | "vinyl-lp" | "cassette" | "cd" | "digital">;
  discogs_id?: string;
  note?: string;
};

// Seed list transcribed from the /discography page body (dry-run §1.3), verified
// against site/migration/hunyamunyarecords.WordPress.2026-04-22.xml page_id 79.
// All emitted as `status: draft` for Evan's manual review pass.
const RELEASE_SEEDS: ReleaseSeed[] = [
  // 12" vinyl, HMR001 to HMR010. Original mix years for HMR001-009 are from
  // the 2010-2012 era; exact per-release dates are not in the WP export.
  { slug: "twilight", title: "Twilight", catalog_number: "HMR001", artist: "dirk-bajema", year: 2010, format: ["vinyl-12"], note: "Original + Noel Sanger Mix" },
  { slug: "5b", title: "5B", catalog_number: "HMR002", artist: "blue-room-project", year: 2010, format: ["vinyl-12"], note: "Original + Madoka Mix" },
  { slug: "ten-feet-from-heaven", title: "Ten Feet From Heaven", catalog_number: "HMR003", artist: "evan-marcus", year: 2011, format: ["vinyl-12"], note: "Original + 017 Breaks Mix" },
  { slug: "circular", title: "Circular", catalog_number: "HMR004", artist: "snake-sedrick-khans", year: 2011, format: ["vinyl-12"], note: "Original + Tim Fretwell Mix" },
  { slug: "revitalized", title: "Revitalized", catalog_number: "HMR005", artist: "darius-kohanim", year: 2011, format: ["vinyl-12"], note: "Original + Habersham Mix" },
  { slug: "flicker", title: "Flicker", catalog_number: "HMR006", artist: "boom-jinx", year: 2011, format: ["vinyl-12"], note: "Original + Shiloh Mix" },
  { slug: "chasing-memories", title: "Chasing Memories", catalog_number: "HMR007", artist: "distant-fragment", year: 2012, format: ["vinyl-12"], note: "Original + Shmuel Flash & Huge-A Mix" },
  { slug: "time-code", title: "Time Code", catalog_number: "HMR008", artist: "huge-a", year: 2012, format: ["vinyl-12"], note: "Original + Nosmo & Kris B Mixes" },
  { slug: "what-i-feel", title: "What I Feel", catalog_number: "HMR009", artist: "yenn", year: 2012, format: ["vinyl-12"], note: "Original + Fabian Schumann & Evan Marcus Mixes" },
  { slug: "nco", title: "NCO", catalog_number: "HMR010", artist: "rykard", release_date: "2025-12-12", year: 2025, format: ["vinyl-12"], note: "North Cormorant Obscurity + Troup Head" },
  // CD full-lengths (linked via Discogs on the /discography page).
  { slug: "arrive-the-radio-beacon", title: "Arrive The Radio Beacon", artist: "rykard", year: 2010, format: ["cd", "digital"], discogs_id: "2993676" },
  { slug: "the-orange-album", title: "The Orange Album", artist: "evan-marcus", year: 2013, format: ["cd", "digital"], discogs_id: "12157212" },
  { slug: "luminosity", title: "Luminosity", artist: "rykard", year: 2016, format: ["cd", "digital"], discogs_id: "9084114" },
  { slug: "night-towers", title: "Night Towers", artist: "rykard", year: 2018, format: ["cd", "digital"], discogs_id: "11959458" },
  // Digital-only releases inferred from news posts + tags (dry-run §1.3).
  { slug: "halcyon-days-ep", title: "Halcyon Days EP", artist: "catnip-claws", year: 2011, format: ["digital"] },
  { slug: "ictis", title: "Ictis", artist: "rykard", year: 2016, format: ["digital"] },
  { slug: "artificial-sunshine", title: "Artificial Sunshine", artist: "rykard", year: 2016, format: ["digital"] },
  { slug: "lansallos", title: "Lansallos", artist: "rykard", year: 2017, format: ["digital"] },
  { slug: "red-venom", title: "Red Venom", artist: "rykard", year: 2020, format: ["digital"] },
  { slug: "explorers-vol-1", title: "Explorers Vol. 1", artist: "rykard", release_date: "2019-07-12", year: 2019, format: ["digital"] },
  { slug: "explorers-vol-2", title: "Explorers Vol. 2", artist: "rykard", year: 2019, format: ["digital"] },
  { slug: "explorers-vol-3", title: "Explorers Vol. 3", artist: "rykard", release_date: "2020-12-20", year: 2020, format: ["digital"] },
  { slug: "explorers-vol-4", title: "Explorers Vol. 4", artist: "rykard", release_date: "2023-07-07", year: 2023, format: ["digital"] },
  // HMDIGITAL sublabel (Discogs label 79509) per docs/specs/digital-catalog-discogs.md.
  // All MP3 320 kbps File releases except HMDIGITAL015 and 018 which are physical CDr.
  { slug: "ever-after", title: "Ever After", catalog_number: "HMDIGITAL001", artist: "jairus-miller", year: 2005, format: ["digital"], note: "1×File, MP3 320" },
  { slug: "inn", title: "Inn", catalog_number: "HMDIGITAL002", artist: "darius-kohanim", year: 2005, format: ["digital"], note: "1×File, MP3 320" },
  { slug: "burton", title: "Burton", catalog_number: "HMDIGITAL003", artist: "darius-kohanim", year: 2005, format: ["digital"], note: "1×File, MP3 320" },
  { slug: "dune-in-erf-minor", title: "Dune In Erf Minor", catalog_number: "HMDIGITAL004", artist: "habersham", artists_additional: ["darius-kohanim"], year: 2005, format: ["digital"], note: "1×File, MP3 320" },
  { slug: "doolesitlike", title: "Doolesitlike", catalog_number: "HMDIGITAL005", artist: "habersham", artists_additional: ["darius-kohanim"], year: 2005, format: ["digital"], note: "1×File, MP3 320" },
  { slug: "life-goes-on", title: "Life Goes On", catalog_number: "HMDIGITAL006", artist: "evan-marcus", year: 2005, format: ["digital"], note: "2×File, MP3 320" },
  { slug: "still-here", title: "Still Here", catalog_number: "HMDIGITAL007", artist: "joel-armstrong", artists_additional: ["gobo"], year: 2006, format: ["digital"], note: "1×File, MP3 320" },
  { slug: "ift", title: "IFT", catalog_number: "HMDIGITAL008", artist: "underground-systems", year: 2006, format: ["digital"], note: "3×File, MP3 320" },
  { slug: "distant-fragment-ep", title: "Distant Fragment EP", catalog_number: "HMDIGITAL009", artist: "distant-fragment", year: 2006, format: ["digital"], note: "2×File, MP3 320. EP." },
  { slug: "running-after-time-ep", title: "Running After Time EP", catalog_number: "HMDIGITAL010", artist: "cassino", artists_additional: ["laben"], year: 2006, format: ["digital"], note: "2×File, MP3 320. EP." },
  { slug: "jetlag-ep", title: "Jetlag EP", catalog_number: "HMDIGITAL011", artist: "daniel-gregory", year: 2007, format: ["digital"], note: "2×File, MP3 320. EP." },
  { slug: "the-music-speaks", title: "The Music Speaks", catalog_number: "HMDIGITAL012", artist: "dj-thee-o", year: 2007, format: ["digital"], note: "3×File, MP3 320" },
  { slug: "long-night", title: "Long Night", catalog_number: "HMDIGITAL013", artist: "curtis", artists_additional: ["dakota"], year: 2007, format: ["digital"], note: "2×File, MP3 320" },
  { slug: "komodose-ep", title: "Komodose EP", catalog_number: "HMDIGITAL014", artist: "darius-kohanim", year: 2007, format: ["digital"], note: "EP. Discogs shows two versions; enrichment pass pending." },
  { slug: "international-soundscapes-ep", title: "International Soundscapes EP", catalog_number: "HMDIGITAL015", artist: "various-artists", year: 2008, format: ["cd"], note: "CDr compilation. Tracklist + artist credits pending enrichment." },
  { slug: "running-after-time-remix-ep", title: "Running After Time Remix EP", catalog_number: "HMDIGITAL016", artist: "cassino", artists_additional: ["laben"], year: 2008, format: ["digital"], note: "Remix EP, companion to HMDIGITAL010. Discogs shows two versions; enrichment pass pending." },
  { slug: "the-reminisce-ep", title: "The Reminisce EP", catalog_number: "HMDIGITAL017", artist: "darius-kohanim", year: 2008, format: ["digital"], note: "8×File, MP3 320. EP, largest digital release." },
  { slug: "sense-of-happiness", title: "Sense Of Happiness", catalog_number: "HMDIGITAL018", artist: "robert-g-roy", year: 2008, format: ["cd"], note: "CDr single." },
];

// Stub artist pages for HMDIGITAL-era contributors who aren't in the WP export.
// These are emitted AFTER the WP-migrated artists so they never overwrite
// canonical pages. Each stub gets tier=archived and a one-line context note;
// Evan fills in bios over time.
type StubArtist = {
  slug: string;
  name: string;
  yearsActive?: string;
  shortBio?: string;
  contextNote: string;
};

const STUB_ARTISTS: StubArtist[] = [
  { slug: "jairus-miller", name: "Jairus Miller", yearsActive: "2005", contextNote: "Released *Ever After* (HMDIGITAL001) on Hunya Munya Digital in 2005." },
  { slug: "joel-armstrong", name: "Joel Armstrong", yearsActive: "2006", contextNote: "Collaborated with Gobo on *Still Here* (HMDIGITAL007) in 2006." },
  { slug: "gobo", name: "Gobo", yearsActive: "2006", contextNote: "Collaborated with Joel Armstrong on *Still Here* (HMDIGITAL007) in 2006." },
  { slug: "underground-systems", name: "Underground Systems", yearsActive: "2006", contextNote: "Released *IFT* (HMDIGITAL008) in 2006." },
  { slug: "cassino", name: "Cassino", yearsActive: "2006-2008", contextNote: "Collaborator on *Running After Time EP* (HMDIGITAL010, 2006) and its Remix EP (HMDIGITAL016, 2008) with Labèn." },
  { slug: "laben", name: "Labèn", yearsActive: "2006-2008", contextNote: "Collaborator on *Running After Time EP* (HMDIGITAL010, 2006) and its Remix EP (HMDIGITAL016, 2008) with Cassino." },
  { slug: "daniel-gregory", name: "Daniel Gregory", yearsActive: "2007", contextNote: "Released *Jetlag EP* (HMDIGITAL011) in 2007." },
  { slug: "dj-thee-o", name: "DJ Thee-O", yearsActive: "2007", contextNote: "Released *The Music Speaks* (HMDIGITAL012) in 2007." },
  { slug: "curtis", name: "Curtis", yearsActive: "2007", contextNote: "Collaborated with Dakota on *Long Night* (HMDIGITAL013) in 2007." },
  { slug: "dakota", name: "Dakota", yearsActive: "2007", contextNote: "Collaborated with Curtis on *Long Night* (HMDIGITAL013) in 2007." },
  { slug: "robert-g-roy", name: "Robert G Roy", yearsActive: "2008", contextNote: "Released *Sense Of Happiness* (HMDIGITAL018) in 2008." },
  { slug: "various-artists", name: "Various Artists", yearsActive: "2008", contextNote: "Credit slot for *International Soundscapes EP* (HMDIGITAL015, 2008) compilation." },
];

const AUTHOR_DISPLAY_NAME = "Evan Rippertoe";

function isoDateFromWp(wpDate: string): string {
  // WP format: "2010-04-14 13:43:10". We need "2010-04-14".
  const m = wpDate.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function buildArtistFrontmatter(item: RawItem): Record<string, unknown> {
  const { slug, legacy_slug } = slugForArtist(item);
  const tier = slug === "rykard" ? "anchor" : "archived";

  const aioTitle = pmValue(item, "_aioseop_title").trim();
  const aioDesc = pmValue(item, "_aioseop_description").trim();
  const noindex = pmValue(item, "_aioseop_noindex").trim();
  const nofollow = pmValue(item, "_aioseop_nofollow").trim();
  const sitemapExclude = pmValue(item, "_aioseop_sitemap_exclude").trim();

  const menuLabel = pmValue(item, "_aioseop_menulabel").trim();

  const front: Record<string, unknown> = {
    slug,
    name: item.title,
    status: "archived",
    tier,
  };
  if (legacy_slug) front.legacy_slug = legacy_slug;
  if (menuLabel && menuLabel !== item.title) front.menu_label = menuLabel;
  if (aioTitle) front.seoTitle = aioTitle;
  if (aioDesc) front.metaDescription = aioDesc;

  // Only emit a nested `seo` block for non-default robots flags (index/follow/sitemap).
  const seo: Record<string, unknown> = {};
  if (noindex === "on" || noindex === "1") seo.index = false;
  if (nofollow === "on" || nofollow === "1") seo.follow = false;
  if (sitemapExclude === "on" || sitemapExclude === "1") seo.in_sitemap = false;
  if (Object.keys(seo).length) front.seo = seo;

  return front;
}

function emitArtists(classified: ClassifiedItem[], stats: EmitStats): void {
  mkdirSync(ARTISTS_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR, { recursive: true });

  const artists = classified.filter((c) => c.class === "artist");

  for (const item of artists) {
    const frontmatter = buildArtistFrontmatter(item);
    const body = rewriteBody(item.content);

    const parsed = artistSchema.safeParse(frontmatter);
    if (!parsed.success) {
      const reviewPath = resolve(REVIEW_DIR, `artist-invalid-${item.post_name}.mdx`);
      const errText = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      const reviewContent =
        `> Artist frontmatter failed schema validation. Fix and move back to content/artists/.\n` +
        `>\n> Errors:\n${errText}\n\n` +
        matter.stringify(body, frontmatter);
      writeFileSync(reviewPath, reviewContent);
      stats.review_files++;
      stats.artists_skipped++;
      continue;
    }

    const slug = parsed.data.slug;
    const outPath = resolve(ARTISTS_DIR, `${slug}.mdx`);
    writeFileSync(outPath, matter.stringify(body, parsed.data));
    stats.artists++;
  }
}

function releaseAppearsFor(slug: string, seed: ReleaseSeed): boolean {
  if (seed.artist === slug) return true;
  if (seed.artists_additional?.includes(slug)) return true;
  return false;
}

function autoEnrichStub(stub: StubArtist): {
  yearsActive: string;
  shortBio: string;
  seoTitle: string;
  metaDescription: string;
  releases: ReleaseSeed[];
} {
  const releases = RELEASE_SEEDS.filter((r) => releaseAppearsFor(stub.slug, r)).sort(
    (a, b) => a.year - b.year,
  );
  const years = releases.map((r) => r.year);
  const minYear = years.length ? Math.min(...years) : undefined;
  const maxYear = years.length ? Math.max(...years) : undefined;
  const yearsActive = stub.yearsActive
    ?? (minYear !== undefined && maxYear !== undefined
      ? (minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`)
      : "");

  const n = releases.length;
  const releaseWord = n === 1 ? "release" : "releases";
  const yearPhrase = n === 0
    ? ""
    : minYear === maxYear
      ? ` in ${minYear}`
      : ` between ${minYear} and ${maxYear}`;
  const shortBio = stub.shortBio
    ?? (n > 0
      ? `${stub.name} released ${n} ${releaseWord} on Hunya Munya Records${yearPhrase}.`
      : stub.contextNote);

  const seoTitle = `${stub.name} — Hunya Munya Records`;
  const metaDescription =
    n > 0
      ? `${stub.name} on Hunya Munya Records — ${n} ${releaseWord}${yearPhrase} across ambient and electronic music.`
      : `${stub.name} on Hunya Munya Records.`;

  return { yearsActive, shortBio, seoTitle, metaDescription, releases };
}

function emitArtistStubs(stats: EmitStats): void {
  mkdirSync(ARTISTS_DIR, { recursive: true });

  for (const stub of STUB_ARTISTS) {
    const outPath = resolve(ARTISTS_DIR, `${stub.slug}.mdx`);
    // Never overwrite a canonical artist page from the WP migration.
    if (existsSync(outPath)) continue;

    const enriched = autoEnrichStub(stub);

    const front: Record<string, unknown> = {
      slug: stub.slug,
      name: stub.name,
      status: "archived",
      tier: "archived",
      seoTitle: enriched.seoTitle,
      metaDescription: enriched.metaDescription,
    };
    if (enriched.yearsActive) front.yearsActive = enriched.yearsActive;
    if (enriched.shortBio) front.shortBio = enriched.shortBio;

    const parsed = artistSchema.safeParse(front);
    if (!parsed.success) {
      const errText = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(`Artist stub "${stub.slug}" failed schema:\n${errText}`);
    }

    const body =
      `${stub.contextNote}\n\n> Full bio pending. Enrichment pass will populate bio, external links, and press quotes.\n`;
    writeFileSync(outPath, matter.stringify(body, parsed.data));
    stats.artist_stubs++;
  }
}

function emitPages(classified: ClassifiedItem[], stats: EmitStats): void {
  mkdirSync(PAGES_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR, { recursive: true });

  for (const item of classified) {
    if (item.class === "press_page") {
      const front: Record<string, unknown> = {
        slug: "press",
        title: item.title || "Press",
        legacy_slug: item.post_name,
      };
      const seoTitle = pmValue(item, "_aioseop_title").trim();
      const seoDesc = pmValue(item, "_aioseop_description").trim();
      if (seoTitle || seoDesc) {
        front.seo = {
          ...(seoTitle && { title: seoTitle }),
          ...(seoDesc && { description: seoDesc }),
        };
      }
      writeFileSync(resolve(PAGES_DIR, "press.mdx"), matter.stringify(rewriteBody(item.content), front));
      stats.pages++;
    } else if (item.class === "shop_page") {
      const front: Record<string, unknown> = {
        slug: "shop",
        title: item.title || "Shop",
        legacy_slug: item.post_name,
      };
      const body =
        `> **Review flag:** per hosting-addendum §16 and dry-run §7 flag 7, the /shop page should ideally fold into per-release \`buy:\` fields. This import preserves the original page content for Evan's review. Dead services referenced here (Google Play, old iTunes URLs, hunyamunya.bigcartel.com) should be stripped or replaced with live Shopify/Bandcamp links.\n\n` +
        rewriteBody(item.content);
      writeFileSync(resolve(PAGES_DIR, "shop.mdx"), matter.stringify(body, front));
      stats.pages++;
    } else if (item.class === "misc_page") {
      if (RESOLVED_REVIEW_FLAGS[item.post_id]) continue;
      const filename = `misc-page-${item.post_id}-${item.post_name || "unnamed"}.mdx`;
      const front: Record<string, unknown> = {
        post_id: item.post_id,
        title: item.title,
        legacy_slug: item.post_name,
      };
      const reasons = item.review_flags.length
        ? item.review_flags.map((r) => `- ${r}`).join("\n")
        : "- unclassified";
      const body =
        `> **Review needed.** This page did not match any classification rule. Flags:\n${reasons}\n>\n> Decide: move to content/pages/, fold into another file, or delete. If deleted, add a 301 redirect from \`/${item.post_name}\` to the best target.\n\n` +
        rewriteBody(item.content);
      writeFileSync(resolve(REVIEW_DIR, filename), matter.stringify(body, front));
      stats.review_files++;
    } else if (item.class === "release_seed_page" && item.review_flags.includes("mis_titled_page")) {
      if (RESOLVED_REVIEW_FLAGS[item.post_id]) continue;
      // Mis-titled pages 14 (Contact) and 16 (Releases): content is already captured
      // via the release seed data, but preserve the body in _review for Evan to skim.
      const filename = `page-${item.post_id}-${item.post_name || "unnamed"}.mdx`;
      const front: Record<string, unknown> = {
        post_id: item.post_id,
        title: item.title,
        legacy_slug: item.post_name,
      };
      const body =
        `> **Review note.** Dry-run §7 flag 3: page ${item.post_id} is mis-titled (\`${item.title}\` at slug \`${item.post_name}\`). Content folded into release seeds / contact form rewrite; this file is kept for reference. 301s are generated by scripts/redirects-build.ts.\n\n` +
        rewriteBody(item.content);
      writeFileSync(resolve(REVIEW_DIR, filename), matter.stringify(body, front));
      stats.review_files++;
    }
  }
}

function writeReport(
  itemsTotal: number,
  countsByType: Record<string, number>,
  countsByClass: Record<string, number>,
  reviewFlags: ReviewFlag[],
  stats: EmitStats,
): void {
  const lines: string[] = [];
  lines.push(`# Migration report`);
  lines.push(``);
  lines.push(`**Run at:** ${new Date().toISOString()}`);
  lines.push(`**Source:** \`site/migration/hunyamunyarecords.WordPress.2026-04-22.xml\``);
  lines.push(`**Items parsed:** ${itemsTotal}`);
  lines.push(``);
  lines.push(`## Parse counts by \`post_type\``);
  lines.push(``);
  lines.push(`| post_type | count |`);
  lines.push(`|---|---|`);
  for (const [k, v] of Object.entries(countsByType).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push(``);
  lines.push(`## Classification`);
  lines.push(``);
  lines.push(`| class | count |`);
  lines.push(`|---|---|`);
  for (const [k, v] of Object.entries(countsByClass).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push(``);
  lines.push(`## Emitted MDX`);
  lines.push(``);
  lines.push(`| kind | written | skipped |`);
  lines.push(`|---|---|---|`);
  lines.push(`| artists | ${stats.artists} | ${stats.artists_skipped} |`);
  lines.push(`| news | ${stats.news} | ${stats.news_skipped} |`);
  lines.push(`| releases (draft) | ${stats.releases} | ${stats.releases_skipped} |`);
  lines.push(`| pages | ${stats.pages} | 0 |`);
  lines.push(`| review | ${stats.review_files} | 0 |`);
  lines.push(``);
  lines.push(`## Review flags`);
  lines.push(``);
  if (!reviewFlags.length) {
    lines.push(`None.`);
  } else {
    lines.push(`| post_id | reason | title | status |`);
    lines.push(`|---|---|---|---|`);
    for (const f of reviewFlags) {
      const status = RESOLVED_REVIEW_FLAGS[f.post_id] ? "resolved" : "open";
      lines.push(`| ${f.post_id} | \`${f.reason}\` | ${f.title.replace(/\|/g, "\\|")} | ${status} |`);
    }
    lines.push(``);
    lines.push(`### Notes`);
    lines.push(``);
    for (const f of reviewFlags) {
      const resolution = RESOLVED_REVIEW_FLAGS[f.post_id];
      if (resolution) {
        lines.push(`- **id ${f.post_id} — \`${f.reason}\` (resolved):** ${resolution}`);
      } else {
        lines.push(`- **id ${f.post_id} — \`${f.reason}\`:** ${f.note}`);
      }
    }
  }
  lines.push(``);
  lines.push(`## Next steps`);
  lines.push(``);
  lines.push(`1. Evan reviews \`site/content/_review/*.mdx\` and moves/edits/deletes as needed.`);
  lines.push(`2. Run \`npm run rehost:media\` to download WP uploads into \`site/public/media/legacy/\` (per hosting-addendum §3).`);
  lines.push(`3. Run \`npm run verify:wp\` to HEAD-check every external URL and produce \`dead-links.md\`.`);
  lines.push(`4. Run \`npm run build:redirects\` to populate the \`BEGIN REDIRECTS\` / \`END REDIRECTS\` block in \`site/public/.htaccess\`.`);
  lines.push(``);

  writeFileSync(REPORT_PATH, lines.join("\n"));
}

function buildReleaseFrontmatter(seed: ReleaseSeed): Record<string, unknown> {
  const front: Record<string, unknown> = {
    slug: seed.slug,
    title: seed.title,
    artist: seed.artist,
    format: seed.format,
    status: "draft",
  };
  if (seed.catalog_number) front.catalog_number = seed.catalog_number;
  if (seed.release_date) front.release_date = seed.release_date;
  if (seed.artists_additional?.length) front.artists_additional = seed.artists_additional;
  if (seed.discogs_id) front.buy = { discogs: `https://www.discogs.com/release/${seed.discogs_id}` };
  return front;
}

function emitReleases(stats: EmitStats): void {
  mkdirSync(RELEASES_DIR, { recursive: true });

  for (const seed of RELEASE_SEEDS) {
    const frontmatter = buildReleaseFrontmatter(seed);
    const parsed = releaseSchema.safeParse(frontmatter);
    if (!parsed.success) {
      const reviewPath = resolve(REVIEW_DIR, `release-invalid-${seed.slug}.mdx`);
      const errText = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      writeFileSync(
        reviewPath,
        `> Release seed failed schema validation. Fix and move back to content/releases/.\n>\n> Errors:\n${errText}\n\n` +
          matter.stringify("", frontmatter),
      );
      stats.review_files++;
      stats.releases_skipped++;
      continue;
    }

    const body =
      seed.note
        ? `> Seed notes from /discography page: ${seed.note}\n\nStatus: **draft**. Confirm release date, tracklist, cover, credits, press quotes, and buy links before publishing.\n`
        : `Status: **draft**. Confirm release date, tracklist, cover, credits, press quotes, and buy links before publishing.\n`;

    const filename = `${seed.year}-${seed.artist}-${seed.slug}.mdx`;
    writeFileSync(resolve(RELEASES_DIR, filename), matter.stringify(body, parsed.data));
    stats.releases++;
  }
}

function buildNewsFrontmatter(item: RawItem): {
  frontmatter: Record<string, unknown>;
  date: string;
} {
  const date = isoDateFromWp(item.post_date);
  const tags = item.categories
    .filter((c) => c.domain === "post_tag")
    .map((c) => c.nicename)
    .filter(Boolean);

  const aioTitle = pmValue(item, "_aioseop_title").trim();
  const aioDesc = pmValue(item, "_aioseop_description").trim();

  const front: Record<string, unknown> = {
    slug: item.post_name,
    title: item.title,
    date,
    author: AUTHOR_DISPLAY_NAME,
  };
  const excerpt = item.excerpt.trim();
  if (excerpt) front.excerpt = excerpt;
  if (tags.length) front.tags = tags;
  if (aioTitle) front.seoTitle = aioTitle;
  if (aioDesc) front.metaDescription = aioDesc;

  return { frontmatter: front, date };
}

function emitNews(classified: ClassifiedItem[], stats: EmitStats): void {
  mkdirSync(NEWS_DIR, { recursive: true });

  const news = classified.filter((c) => c.class === "news");

  for (const item of news) {
    const { frontmatter, date } = buildNewsFrontmatter(item);

    if (!date) {
      // No parseable date means we can't name the file. Send to review.
      const reviewPath = resolve(REVIEW_DIR, `news-nodate-${item.post_name || item.post_id}.mdx`);
      writeFileSync(reviewPath, `> News post has no parseable post_date. Resolve manually.\n\n` + matter.stringify(rewriteBody(item.content), frontmatter));
      stats.review_files++;
      stats.news_skipped++;
      continue;
    }

    const parsed = newsSchema.safeParse(frontmatter);
    if (!parsed.success) {
      const reviewPath = resolve(REVIEW_DIR, `news-invalid-${item.post_name}.mdx`);
      const errText = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      writeFileSync(
        reviewPath,
        `> News frontmatter failed schema validation. Fix and move back to content/news/.\n>\n> Errors:\n${errText}\n\n` +
          matter.stringify(rewriteBody(item.content), frontmatter),
      );
      stats.review_files++;
      stats.news_skipped++;
      continue;
    }

    const body = rewriteBody(item.content);
    const outPath = resolve(NEWS_DIR, `${date}-${parsed.data.slug}.mdx`);
    writeFileSync(outPath, matter.stringify(body, parsed.data));
    stats.news++;
  }
}

function reviewNote(reason: ReviewReason, item: RawItem): string {
  switch (reason) {
    case "tim_fretwell_orphan":
      return "Top-level /tim-fretwell page (dry-run §7 flag 1). Orphan. Move to _review/ for Evan to decide if it's a redirect target or duplicate.";
    case "catnip_claws_rename":
      return "Artist page slug is 'catnip-claws-2'. Per Evan's 2026-04-22 decision, rename to 'catnip-claws' on import and add 301 from the old slug.";
    case "mis_titled_page":
      return `Page id ${item.post_id} title="${item.title}" but slug="${item.post_name}". Dry-run §7 flag 3. Folded into release seed / contact page.`;
    case "draft_skipped":
      return "Draft post with empty body (dry-run §7 flag 6, post_id 932). Skipped.";
    case "misc_page_needs_sorting":
      return "Page does not match any classification rule. Emitted to content/_review/ for manual routing.";
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
