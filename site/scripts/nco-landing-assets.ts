// Build the web-sized derivatives the HMR010 landing page renders.
//
// The masters in public/media/releases are 5000x5000 archive scans at roughly
// 1.9 MB each. next.config sets images.unoptimized (output: "export"), so
// whatever the markup points at is exactly what ships: a 1.9 MB JPEG into a
// 500px slot, twice on one page. These derivatives match the spec of the
// hmr010-nco-front.webp that already exists (1200px, webp), so the landing
// page stays under a sane weight budget.
//
// The vinyl PNG carries an alpha channel and sits on the dark ground, so it
// stays transparent rather than being flattened onto a plate.
//
// Masters are left untouched; the catalog page and press kit still use them.
// Run: npx tsx scripts/nco-landing-assets.ts

import { statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const DIR = resolve(ROOT, "public/media/releases");

// 1200px matches the existing front.webp and is comfortably over 2x the
// largest slot the landing page renders these into.
const EDGE = 1200;

type Job = { from: string; to: string; alpha: boolean };

const JOBS: Job[] = [
  { from: "hmr010-nco-back.jpg", to: "hmr010-nco-back.webp", alpha: false },
  { from: "hmr010-nco-vinyl-a.png", to: "hmr010-nco-vinyl-a.webp", alpha: true },
];

async function main() {
  for (const job of JOBS) {
    const src = resolve(DIR, job.from);
    const out = resolve(DIR, job.to);
    const before = await sharp(src).metadata();

    await sharp(src)
      .resize({ width: EDGE, height: EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 100, effort: 6 })
      .toFile(out);

    const after = await sharp(out).metadata();
    const srcKb = statSync(src).size / 1024;
    const outKb = statSync(out).size / 1024;
    console.log(
      `${job.from} ${before.width}x${before.height} ${srcKb.toFixed(0)} KB` +
        `  ->  ${job.to} ${after.width}x${after.height} ${outKb.toFixed(0)} KB`,
    );
    if (job.alpha && !after.hasAlpha) {
      throw new Error(`${job.to} lost its alpha channel`);
    }
    if (outKb > 300) {
      throw new Error(`${job.to} is ${outKb.toFixed(0)} KB, over the 300 KB budget`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
