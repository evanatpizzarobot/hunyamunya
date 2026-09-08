// Build public/og-default.png, the fallback share card.
//
// lib/seo.ts falls back to /og-default.png whenever a page passes no ogImage.
// That file never existed, so 36 of 139 pages (every static route, the 20 news
// posts with no hero, the 3 releases with no cover art, and various-artists)
// were emitting a 404 as their og:image and twitter:image. Share cards on
// Slack, Discord, iMessage, LinkedIn and X rendered blank, including on the
// pages a journalist or a DSP editor is most likely to paste.
//
// The card mirrors the site's own ambient treatment: the #05090d ground with
// the three ocean radial washes from globals.css .ambient-gradient, the label
// logo centred, and an accent hairline. Run: npx tsx scripts/og-default-build.ts

import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = resolve(ROOT, "public/logo.png");
const OUT = resolve(ROOT, "public/og-default.png");

// Facebook, LinkedIn, Slack and X all key off 1200x630. seo.ts already
// declares these exact dimensions in the openGraph images entry.
const W = 1200;
const H = 630;

// Logo is 900x600 and would swallow the card at full size. 520px wide sits it
// comfortably inside the frame with room for the hairline and the wordmark.
const LOGO_W = 520;

// Ground and washes lifted from .ambient-gradient in app/globals.css so the
// card reads as the same surface as the site it links to.
const BACKDROP = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="a" cx="15%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#14324f" stop-opacity="0.55"/>
      <stop offset="62%" stop-color="#14324f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="85%" cy="75%" r="58%">
      <stop offset="0%" stop-color="#1b4669" stop-opacity="0.45"/>
      <stop offset="68%" stop-color="#1b4669" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c" cx="55%" cy="95%" r="50%">
      <stop offset="0%" stop-color="#0d2138" stop-opacity="0.55"/>
      <stop offset="70%" stop-color="#0d2138" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#05090d"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <rect width="${W}" height="${H}" fill="url(#c)"/>
  <rect x="${(W - 220) / 2}" y="${H - 132}" width="220" height="1" fill="#26B7D3" opacity="0.55"/>
</svg>`;

async function main() {
  const meta = await sharp(SRC).metadata();
  if (!meta.width || !meta.height) throw new Error("cannot read logo dimensions");
  console.log(`logo: ${meta.width}x${meta.height}`);

  const logo = await sharp(SRC)
    .resize({ width: LOGO_W, fit: "inside", withoutEnlargement: true })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  // Sit the mark slightly above centre so the hairline below reads as a base
  // rather than as a stray rule floating under a centred block.
  const top = Math.round((H - (logoMeta.height ?? 0)) / 2) - 26;
  const left = Math.round((W - (logoMeta.width ?? 0)) / 2);

  await sharp(Buffer.from(BACKDROP))
    .composite([{ input: logo, top, left }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(OUT);

  const out = await sharp(OUT).metadata();
  const { size } = await import("node:fs/promises").then((fs) => fs.stat(OUT));
  console.log(`wrote ${OUT}`);
  console.log(`  ${out.width}x${out.height}, ${(size / 1024).toFixed(0)} KB`);
  if (out.width !== W || out.height !== H) throw new Error("unexpected output size");
  if (size > 300 * 1024) throw new Error(`over the 300 KB budget: ${size} bytes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
