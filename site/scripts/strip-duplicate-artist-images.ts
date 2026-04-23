// One-off: each artist MDX body may carry a leading <figure>, <a>-wrapped
// <img>, or bare <img> referencing the same image that's now also rendered
// as the portrait in the artist page header, so the page shows the photo
// twice. This script strips every HTML node in the body that references the
// portrait/hero_image path. Idempotent.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTISTS_DIR = resolve(ROOT, "content/artists");

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildStripRegexes(portraitPath: string): RegExp[] {
  const esc = escapeForRegex(portraitPath);
  return [
    // <figure ...wp-block-image...>...src="PORTRAIT"...</figure>
    new RegExp(`<figure[^>]*wp-block-image[^>]*>(?:(?!<\\/figure>)[\\s\\S])*${esc}(?:(?!<\\/figure>)[\\s\\S])*<\\/figure>\\s*\\n?`),
    // <a href="PORTRAIT"><img ... /></a>
    new RegExp(`<a[^>]*href="${esc}"[^>]*>\\s*<img[^>]*\\/>\\s*<\\/a>\\s*\\n?`),
    // Bare <img ... src="PORTRAIT" ... />
    new RegExp(`<img[^>]*src="${esc}"[^>]*\\/>\\s*\\n?`),
  ];
}

for (const name of readdirSync(ARTISTS_DIR)) {
  if (!name.endsWith(".mdx")) continue;
  const path = resolve(ARTISTS_DIR, name);
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  const portrait = (parsed.data.portrait ?? parsed.data.hero_image ?? "") as string;
  if (!portrait) continue;

  let content = parsed.content;
  let changed = false;
  for (const re of buildStripRegexes(portrait)) {
    const next = content.replace(re, "");
    if (next !== content) {
      changed = true;
      content = next;
    }
  }
  if (!changed) continue;

  const out = matter.stringify(content, parsed.data);
  writeFileSync(path, out);
  console.log(`stripped duplicate portrait media from ${name}`);
}
