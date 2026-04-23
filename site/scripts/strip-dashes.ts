// One-off: per the Pizza Robot Studios global rule, em dashes and double
// hyphens used as em dashes are banned across all user-facing text. This
// script sweeps every MDX and YAML file under site/content/ and rewrites
// them in place. Idempotent.
//
// Replacement rules:
//   " — "  -> ", "     (spaced em dash reads as a comma break)
//   " – "  -> ", "     (spaced en dash used as em dash, same treatment)
//   "—"    -> ", "     (bare em dash; extra space trimmed by postpass)
//   "–"    -> "-"      (bare en dash; common in compound adjectives /
//                        date ranges, hyphen is the correct replacement)
//   " -- " -> ", "     (ASCII double-hyphen as em dash)
//   Post-pass: collapse any ",  " (two-space after comma) to ", ", and
//   any "  " (double space) to single space.

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve, extname } from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = resolve(ROOT, "content");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    const s = statSync(path);
    if (s.isDirectory()) walk(path, acc);
    else if ([".mdx", ".md", ".yml", ".yaml"].includes(extname(name))) acc.push(path);
  }
  return acc;
}

function rewrite(content: string): string {
  let s = content;
  s = s.replace(/ — /g, ", ");     // " — "
  s = s.replace(/ – /g, ", ");     // " – " (used as em dash)
  s = s.replace(/ -- /g, ", ");          // " -- "
  s = s.replace(/—/g, ", ");       // bare "—"
  s = s.replace(/–/g, "-");        // bare "–" (date ranges, compounds)
  // Post-pass cleanup.
  s = s.replace(/,  +/g, ", ");          // collapse multi-space after comma
  s = s.replace(/ ,/g, ",");             // fix " ," -> ","
  return s;
}

let changed = 0;
for (const path of walk(CONTENT_DIR)) {
  const raw = readFileSync(path, "utf8");
  const next = rewrite(raw);
  if (next !== raw) {
    writeFileSync(path, next);
    changed++;
    console.log(`rewrote ${path.replace(ROOT + "\\", "").replace(ROOT + "/", "")}`);
  }
}
console.log(`\n${changed} file(s) rewritten.`);
