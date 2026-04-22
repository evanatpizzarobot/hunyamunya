// Spec: rebuild-v1 §8.3 as revised by hosting-addendum §3.
// Download 114 WP originals from hunyamunyarecords.com/wp-content/uploads,
// transcode via sharp to AVIF + WebP + original at widths 240/480/960/1440
// (where source width permits), write to site/public/media/legacy/{YYYY}/{MM}/,
// produce site/migration/media-manifest.json mapping old URLs (including the
// WP-generated size variants like -150x150, -300x300, -1024x605) to new paths.
//
// Apache serves these files directly from the deploy branch; no R2.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CLASSIFIED_JSON_PATH = resolve(ROOT, "migration/classified.json");
const MEDIA_ROOT = resolve(ROOT, "public/media/legacy");
const MANIFEST_PATH = resolve(ROOT, "migration/media-manifest.json");

const WIDTHS = [240, 480, 960, 1440] as const;
const CONCURRENCY = 4;

type ClassifiedItem = {
  post_id: number;
  post_type: string;
  post_name: string;
  post_date: string;
  title: string;
  attachment_url?: string;
  class: string;
};

type ClassifiedDump = { items: ClassifiedItem[] };

type ManifestEntry = {
  original_url: string;
  base_path: string;           // e.g. /media/legacy/2010/04/Rykard
  original_ext: string;        // e.g. jpg, png
  original_width: number;
  original_height: number;
  variants: Array<{ width: number; format: "avif" | "webp" | "original" }>;
  size_variant_aliases: string[]; // old URLs including -150x150 etc., all resolve to base_path + .ext
};

type Manifest = {
  generated_at: string;
  entries: Record<string, ManifestEntry>; // keyed by original URL
};

function parseUploadPath(url: string): { year: string; month: string; filename: string; basename: string; ext: string } | null {
  const m = url.match(/\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^/?#]+)$/);
  if (!m) return null;
  const filename = m[3];
  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  const basename = extMatch ? filename.slice(0, -(extMatch[0].length)) : filename;
  return { year: m[1], month: m[2], filename, basename, ext };
}

function mimeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

type ProcessResult = { ok: true; entry: ManifestEntry; url: string } | { ok: false; url: string; error: string };

async function processAttachment(url: string): Promise<ProcessResult> {
  const parsed = parseUploadPath(url);
  if (!parsed) return { ok: false, url, error: "URL is not under /wp-content/uploads/{YYYY}/{MM}/" };

  const { year, month, basename, ext } = parsed;
  const outDir = resolve(MEDIA_ROOT, year, month);
  mkdirSync(outDir, { recursive: true });

  const originalPath = resolve(outDir, `${basename}.${ext}`);

  // SVGs and GIFs skip transcoding — sharp doesn't do animated GIF well, and
  // SVG is already resolution-independent.
  const skipTranscode = ext === "svg" || ext === "gif";

  let buf: Buffer;
  try {
    buf = await downloadBuffer(url);
  } catch (e) {
    return { ok: false, url, error: (e as Error).message };
  }

  // Always write the original.
  writeFileSync(originalPath, buf);

  let width = 0;
  let height = 0;
  const variants: ManifestEntry["variants"] = [{ width: 0, format: "original" }];

  if (!skipTranscode) {
    try {
      const meta = await sharp(buf).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
      for (const w of WIDTHS) {
        if (width && w >= width) {
          // Skip sizes larger than the source; we'd just be upscaling.
          continue;
        }
        const resized = sharp(buf).resize({ width: w, withoutEnlargement: true });
        await resized.clone().avif({ quality: 55 }).toFile(resolve(outDir, `${basename}.${w}.avif`));
        await resized.clone().webp({ quality: 80 }).toFile(resolve(outDir, `${basename}.${w}.webp`));
        variants.push({ width: w, format: "avif" });
        variants.push({ width: w, format: "webp" });
      }
      // Also generate AVIF+WebP at original width if it's smaller than the smallest
      // breakpoint (so very small images still get modern formats).
      if (width && width < WIDTHS[0]) {
        await sharp(buf).avif({ quality: 55 }).toFile(resolve(outDir, `${basename}.${width}.avif`));
        await sharp(buf).webp({ quality: 80 }).toFile(resolve(outDir, `${basename}.${width}.webp`));
        variants.push({ width, format: "avif" });
        variants.push({ width, format: "webp" });
      }
    } catch (e) {
      return { ok: false, url, error: `sharp failed: ${(e as Error).message}` };
    }
  }

  const basePath = `/media/legacy/${year}/${month}/${basename}`;

  // WP-generated size variants (e.g. -150x150, -300x300, -1024x605) share the
  // same original. Any MDX or external link that still uses those sized URLs
  // should resolve to the original on the new site.
  const aliases = buildSizeAliases(url);

  return {
    ok: true,
    url,
    entry: {
      original_url: url,
      base_path: basePath,
      original_ext: ext,
      original_width: width,
      original_height: height,
      variants,
      size_variant_aliases: aliases,
    },
  };
}

function buildSizeAliases(originalUrl: string): string[] {
  // WP produces variants at common sizes; we don't know which ones exist on the
  // live server without probing, so list the universe of possibilities and let
  // .htaccess resolve misses to the original via the clean-URL fallback.
  // For now we include the sizes actually referenced in MDX (see dry-run §5).
  const parsed = parseUploadPath(originalUrl);
  if (!parsed) return [];
  const { year, month, basename, ext } = parsed;
  const commonSizes = ["150x150", "300x300", "300x169", "300x225", "1024x605", "1024x683", "768x576", "240x240"];
  return commonSizes.map((sz) => `/wp-content/uploads/${year}/${month}/${basename}-${sz}.${ext}`);
}

async function runInBatches<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>, onProgress?: (i: number, total: number) => void): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (true) {
      const i = index++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
      if (onProgress) onProgress(i + 1, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  const classified = JSON.parse(readFileSync(CLASSIFIED_JSON_PATH, "utf8")) as ClassifiedDump;
  const attachments = classified.items.filter((i) => i.class === "attachment" && i.attachment_url);

  console.log(`Rehosting ${attachments.length} attachments to ${MEDIA_ROOT}`);
  mkdirSync(MEDIA_ROOT, { recursive: true });

  const results = await runInBatches(
    attachments,
    CONCURRENCY,
    (item) => processAttachment(item.attachment_url!),
    (done, total) => {
      if (done % 10 === 0 || done === total) {
        console.log(`  ${done}/${total} processed`);
      }
    },
  );

  const entries: Manifest["entries"] = {};
  const failures: Array<{ url: string; error: string }> = [];
  for (const r of results) {
    if (r.ok) {
      entries[r.entry.original_url] = r.entry;
      // Index aliases under their own keys too so lookups by size-variant URL succeed.
      for (const alias of r.entry.size_variant_aliases) {
        const aliasKey = `https://www.hunyamunyarecords.com${alias}`;
        if (!entries[aliasKey]) {
          entries[aliasKey] = { ...r.entry, original_url: aliasKey };
        }
      }
    } else {
      failures.push({ url: r.url, error: r.error });
    }
  }

  const manifest: Manifest = {
    generated_at: new Date().toISOString(),
    entries,
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log("");
  console.log(`Wrote manifest: ${MANIFEST_PATH}`);
  console.log(`Succeeded: ${results.filter((r) => r.ok).length}/${attachments.length}`);
  if (failures.length) {
    console.log(`Failed: ${failures.length}`);
    for (const f of failures) console.log(`  ${f.url}  ${f.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
