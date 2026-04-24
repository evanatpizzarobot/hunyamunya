// Build app/icon.png (and app/apple-icon.png) from the HM-NCO-Logo master.
// Next.js 14 app-router convention: a `icon.png` file at app/ gets wired into
// <link rel="icon"> automatically and rendered at multiple sizes by the browser.
// We crop just the cormorant mark (upper region) and render on a dark navy
// background so the white bird stays legible at 16x16.

import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = resolve(ROOT, "public/media/legacy/2025/08/HM-NCO-Logo.png");
const OUT_ICON = resolve(ROOT, "app/icon.png");
const OUT_APPLE = resolve(ROOT, "app/apple-icon.png");

// Bird-only crop region within the 1232x621 HM-NCO master. Derived by
// eyeballing the silhouette bounds: the cormorant head sits above the
// wordmark, beak extending right. These bounds include a small padding
// around the bird and exclude "HUNYAMUNYA RECORDS" text beneath it.
const BIRD_CROP = { left: 300, top: 30, width: 650, height: 360 };

// Deep navy pulled from the master's background so the pad added by
// fit:contain matches the source plate.
const PAD_COLOR = { r: 29, g: 58, b: 84 };

async function main() {
  const meta = await sharp(SRC).metadata();
  if (!meta.width || !meta.height) throw new Error("cannot read source dimensions");
  console.log(`source: ${meta.width}x${meta.height}`);

  const bird = await sharp(SRC).extract(BIRD_CROP).toBuffer();

  await sharp(bird)
    .resize(512, 512, { fit: "contain", background: PAD_COLOR })
    .png()
    .toFile(OUT_ICON);
  console.log("wrote", OUT_ICON);

  await sharp(bird)
    .resize(180, 180, { fit: "contain", background: PAD_COLOR })
    .png()
    .toFile(OUT_APPLE);
  console.log("wrote", OUT_APPLE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
