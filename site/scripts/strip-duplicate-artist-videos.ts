// One-off: the WP body carries a bare YouTube URL that duplicates the
// featured_video already rendered as an embedded player in the Listen
// section. Strip any bare YouTube URL line whose video ID matches the
// artist's featured_video. Conservative: leaves <iframe>, <figure> embeds,
// and unrelated YouTube links alone. Idempotent.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTISTS_DIR = resolve(ROOT, "content/artists");
const YT_ID =
  /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

function idOf(url: string): string | null {
  const m = url.match(YT_ID);
  return m ? m[1] : null;
}

for (const name of readdirSync(ARTISTS_DIR)) {
  if (!name.endsWith(".mdx")) continue;
  const path = resolve(ARTISTS_DIR, name);
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  const featured = (parsed.data.featured_video ?? "") as string;
  const featuredId = featured ? idOf(featured) : null;
  if (!featuredId) continue;

  // Match a whole-line bare YouTube URL whose ID matches featured_video.
  // Keep the regex anchored to line starts so <figure>/<a>-wrapped embeds
  // (which start with '<') aren't touched.
  const re = new RegExp(
    `^\\s*https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)${featuredId}[^\\n]*\\n?`,
    "gm",
  );
  const next = parsed.content.replace(re, "");
  if (next === parsed.content) continue;

  // Collapse any run of 3+ blank lines left behind into a single blank.
  const cleaned = next.replace(/\n{3,}/g, "\n\n");
  const out = matter.stringify(cleaned, parsed.data);
  writeFileSync(path, out);
  console.log(`stripped bare featured_video URL from ${name}`);
}
