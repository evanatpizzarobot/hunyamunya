// One-off: scan the WXR export, find every artist page (child of post_id 12),
// pull its first YouTube URL, and print a slug -> URL mapping for manual
// review + MDX application. Not wired into wp-import because the featured
// video is curated data — Evan may swap a different track's video later.

import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";

const ROOT = process.cwd();
const XML_PATH = resolve(ROOT, "migration/hunyamunyarecords.WordPress.2026-04-22.xml");
const ARTISTS_DIR = resolve(ROOT, "content/artists");

const ARTIST_PARENT_ID = 12;
const YT_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

function firstYouTubeIdFrom(text: string): string | null {
  const m = text.match(YT_RE);
  return m ? m[1] : null;
}

function loadArtistSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const name of readdirSync(ARTISTS_DIR)) {
    if (name.endsWith(".mdx")) slugs.add(name.replace(/\.mdx$/, ""));
  }
  return slugs;
}

function main() {
  const xml = readFileSync(XML_PATH, "utf8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    parseTagValue: false,
    trimValues: false,
  });
  const doc = parser.parse(xml) as any;
  const items: any[] = doc?.rss?.channel?.item ?? [];

  const artistSlugs = loadArtistSlugs();
  const results: { wp_slug: string; mdx_slug: string | null; yt_id: string; title: string }[] = [];
  const noMatch: { wp_slug: string; title: string }[] = [];

  for (const item of items) {
    if (item["wp:post_type"] !== "page") continue;
    const parent = Number(item["wp:post_parent"] ?? 0);
    if (parent !== ARTIST_PARENT_ID) continue;
    const status = String(item["wp:status"] ?? "");
    if (status !== "publish") continue;
    const wpSlug = String(item["wp:post_name"] ?? "").trim();
    const title = String(item["title"] ?? "").trim();
    const content = String(item["content:encoded"] ?? "");
    const ytId = firstYouTubeIdFrom(content);
    if (!ytId) continue;

    let mdxSlug: string | null = null;
    if (artistSlugs.has(wpSlug)) mdxSlug = wpSlug;
    else {
      // Try a few known remappings (duo merges, trailing -2 on dupes, etc.)
      const candidates = [
        wpSlug.replace(/-2$/, ""),
        wpSlug.replace(/-and-/g, "-"),
        wpSlug.replace(/-&-/g, "-"),
      ];
      for (const c of candidates) if (artistSlugs.has(c)) { mdxSlug = c; break; }
    }

    if (mdxSlug) results.push({ wp_slug: wpSlug, mdx_slug: mdxSlug, yt_id: ytId, title });
    else noMatch.push({ wp_slug: wpSlug, title });
  }

  // Dedupe: if multiple WP pages resolve to the same MDX slug, keep the first.
  const byMdxSlug = new Map<string, (typeof results)[number]>();
  for (const r of results) if (r.mdx_slug && !byMdxSlug.has(r.mdx_slug)) byMdxSlug.set(r.mdx_slug, r);

  console.log(JSON.stringify(
    {
      matched: Array.from(byMdxSlug.values()).sort((a, b) => (a.mdx_slug ?? "").localeCompare(b.mdx_slug ?? "")),
      unmatched_wp_pages: noMatch.sort((a, b) => a.wp_slug.localeCompare(b.wp_slug)),
      counts: {
        wp_artist_pages_with_youtube: results.length + noMatch.length,
        resolved_to_mdx: byMdxSlug.size,
        unmatched: noMatch.length,
      },
    },
    null,
    2,
  ));
}

main();
