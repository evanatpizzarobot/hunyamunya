// One-off: apply featured_video URLs (scraped by extract-artist-videos.ts)
// to each artist MDX frontmatter. Idempotent: replaces an existing value.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTISTS_DIR = resolve(ROOT, "content/artists");

const videos: Record<string, string> = {
  "blue-room-project": "https://www.youtube.com/watch?v=l-Rrck0Rdv0",
  "boom-jinx": "https://www.youtube.com/watch?v=4Fdwv28uOGc",
  "catnip-claws": "https://www.youtube.com/watch?v=-GeMZ9N09us",
  "darius-kohanim": "https://www.youtube.com/watch?v=7-ZPjXl9Zww",
  "dirk-bajema": "https://www.youtube.com/watch?v=CMIHhf5cIuA",
  "distant-fragment": "https://www.youtube.com/watch?v=gPuPgP6u8RI",
  "evan-marcus": "https://www.youtube.com/watch?v=nJBLjYajtYc",
  "habersham": "https://www.youtube.com/watch?v=7-ZPjXl9Zww",
  "huge-a": "https://www.youtube.com/watch?v=d4cDOgimLJs",
  "madoka": "https://www.youtube.com/watch?v=rx1CAahZuBs",
  "noel-sanger": "https://www.youtube.com/watch?v=BpPEsuRDOXQ",
  "snake-sedrick-khans": "https://www.youtube.com/watch?v=5TW6f6EqBTU",
  "tim-fretwell": "https://www.youtube.com/watch?v=mxUVqXGIx8A",
};

for (const [slug, url] of Object.entries(videos)) {
  const path = resolve(ARTISTS_DIR, `${slug}.mdx`);
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  parsed.data.featured_video = url;
  const out = matter.stringify(parsed.content, parsed.data);
  writeFileSync(path, out);
  console.log(`wrote ${slug}`);
}
