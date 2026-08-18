// Stages the downloadable assets for the Rykard press kit.
//
// Sources are scattered: some art already ships with the site at print
// resolution, some only exists as a master on the catalog drive, and the NCO
// vinyl shoot is HEIC, which browsers do not display. This copies, converts and
// normalises all of it into public/press/rykard/ and prints the manifest rows
// (dimensions and byte size) the page shows next to each download.
//
// The vinyl shoot is HEIC with a 512px tile grid, which sharp's build cannot
// decode and ffmpeg exposes as one stream per tile rather than reassembling.
// Windows Imaging Component reads it correctly, so HEIC goes through a
// PowerShell decode first. That step is Windows-only; every other source is
// handled by sharp directly.
//
// Each asset also gets a 480px thumbnail so the press kit can show what every
// download actually looks like without pulling five megabytes of masters to
// render a contact sheet.
//
// Re-runnable. Existing files are overwritten, nothing else is touched.
//
// Run:
//   npx tsx scripts/press-kit-assets.ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "press", "rykard");
const CATALOG = "C:/Users/rippe/Desktop/Hunya Munya Catalog/RYKARD";
const LEGACY = path.join(process.cwd(), "public", "media", "legacy", "2010", "04");
const RELEASES = path.join(process.cwd(), "public", "media", "releases");

type Asset = { out: string; src: string; label: string; kind: "photo" | "art" | "logo" };

const ASSETS: Asset[] = [
  // Current photo, and the one the kit leads with. The other two are from the
  // 2010 album cycle and are kept only as archive, clearly labelled, so nobody
  // reaches for a sixteen-year-old portrait by accident.
  { out: "rykard-press-photo.jpg", src: "C:/Users/rippe/Desktop/DSC00599.jpg", label: "Press photo, current", kind: "photo" },
  { out: "rykard-press-photo-2010-1.jpg", src: path.join(LEGACY, "01_Rykard.jpg"), label: "Archive photo, 2010", kind: "photo" },
  { out: "rykard-press-photo-2010-2.jpg", src: path.join(LEGACY, "02_Rykard.jpg"), label: "Archive photo, 2010", kind: "photo" },
  // 4854 and 4860 from this folder are the sleeve stack and the plant's signed
  // QC letter. Internal paperwork, not press assets.
  { out: "rykard-nco-test-pressing-1.jpg", src: `${CATALOG}/NCO VINYL SHARED/GRAPHICS (Photos - Artwork - GFX Ideas w- Final Folder)/IMG_4853.HEIC`, label: "NCO test pressing on the deck", kind: "photo" },
  { out: "rykard-nco-test-pressing-2.jpg", src: `${CATALOG}/NCO VINYL SHARED/GRAPHICS (Photos - Artwork - GFX Ideas w- Final Folder)/IMG_4863.HEIC`, label: "NCO test pressing, white label", kind: "photo" },
  { out: "hmr010-nco-front.jpg", src: path.join(RELEASES, "hmr010-nco-cover.jpg"), label: "North Cormorant Obscurity, front", kind: "art" },
  { out: "hmr010-nco-back.jpg", src: path.join(RELEASES, "hmr010-nco-back.jpg"), label: "North Cormorant Obscurity, back", kind: "art" },
  { out: "arrive-the-radio-beacon-cover.jpg", src: path.join(RELEASES, "rykard-arrive-the-radio-beacon-cover.jpg"), label: "Arrive the Radio Beacon", kind: "art" },
  // The site copy of this one is only 700px. The master on the catalog drive is
  // 3386px, which is the whole point of a press kit.
  { out: "luminosity-cover.jpg", src: `${CATALOG}/Albums/RYKARD - Luminosity 2016 MASTERS/Artwork/Front.jpg`, label: "Luminosity", kind: "art" },
  { out: "night-towers-cover.jpg", src: path.join(RELEASES, "rykard-night-towers-cover.jpg"), label: "Night Towers", kind: "art" },
  // The pressed record itself. PNG with transparency, so these stay PNG all the
  // way through rather than being flattened onto black by a JPEG re-encode.
  { out: "hmr010-nco-vinyl-a.png", src: path.join(RELEASES, "hmr010-nco-vinyl-a.png"), label: "NCO vinyl, A side", kind: "art" },
  { out: "hmr010-nco-vinyl-b.png", src: path.join(RELEASES, "hmr010-nco-vinyl-b.png"), label: "NCO vinyl, B side", kind: "art" },
  { out: "hunya-munya-logo.png", src: path.join(process.cwd(), "public", "logo.png"), label: "Hunya Munya Records logo", kind: "logo" },
];

// WIC via PresentationCore. Returns a temp JPEG path for sharp to pick up.
function heicToJpeg(src: string): string {
  const tmp = path.join(os.tmpdir(), `heic-${path.basename(src, path.extname(src))}.jpg`);
  const ps = `
Add-Type -AssemblyName PresentationCore
$stream = [System.IO.File]::OpenRead(${JSON.stringify(src)})
$dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($stream, [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
$enc = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
$enc.QualityLevel = 95
$enc.Frames.Add($dec.Frames[0])
$fs = [System.IO.File]::Create(${JSON.stringify(tmp)})
$enc.Save($fs); $fs.Close(); $stream.Close()
`;
  execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: "pipe" });
  return tmp;
}

function human(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const rows: string[] = [];
  const missing: string[] = [];

  const kept: string[] = [];

  for (const a of ASSETS) {
    if (!fs.existsSync(a.src)) {
      // A source can go away after it has been staged, since some of them are
      // loose files on the desktop. The staged copy under public/ is committed
      // and is the one that ships, so that case is fine and only the truly
      // unstaged ones are a gap.
      const dest = path.join(OUT, a.out);
      if (fs.existsSync(dest)) {
        const meta = await sharp(dest).metadata();
        const size = fs.statSync(dest).size;
        kept.push(`${a.out}  (${meta.width}x${meta.height}, ${human(size)})`);
        rows.push(
          `  { file: "${a.out}", thumb: "${a.out.replace(/\.[^.]+$/, "")}-thumb.${a.out.endsWith(".png") ? "png" : "jpg"}", label: ${JSON.stringify(a.label)}, kind: "${a.kind}", dims: "${meta.width}x${meta.height}", size: "${human(size)}" },`,
        );
      } else {
        missing.push(`${a.out}  <-  ${a.src}`);
      }
      continue;
    }
    const dest = path.join(OUT, a.out);
    if (a.out.endsWith(".png")) {
      fs.copyFileSync(a.src, dest);
    } else {
      // Re-encode rather than copy: strips camera metadata and keeps a 5000px
      // master to a few megabytes.
      const source = a.src.toLowerCase().endsWith(".heic") ? heicToJpeg(a.src) : a.src;
      await sharp(source).rotate().jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
      if (source !== a.src) fs.rmSync(source, { force: true });
    }
    const meta = await sharp(dest).metadata();
    const size = fs.statSync(dest).size;

    // Thumbnail beside the master, same basename plus -thumb. Anything that
    // arrived as a PNG keeps its alpha; a JPEG thumb would flatten the record
    // and the logo onto a black square. Everything else is a photograph and
    // compresses better as JPEG.
    const base = a.out.replace(/\.[^.]+$/, "");
    const keepsAlpha = a.out.endsWith(".png");
    const thumb = keepsAlpha ? `${base}-thumb.png` : `${base}-thumb.jpg`;
    const pipeline = sharp(dest).resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true });
    await (keepsAlpha ? pipeline.png({ compressionLevel: 9 }) : pipeline.jpeg({ quality: 78, mozjpeg: true }))
      .toFile(path.join(OUT, thumb));

    rows.push(
      `  { file: "${a.out}", thumb: "${thumb}", label: ${JSON.stringify(a.label)}, kind: "${a.kind}", dims: "${meta.width}x${meta.height}", size: "${human(size)}" },`,
    );
    console.log(`  ${a.out.padEnd(36)} ${String(meta.width)}x${meta.height}  ${human(size)}`);
  }

  if (kept.length > 0) {
    console.log(`\n${kept.length} already staged, source no longer present:`);
    for (const k of kept) console.log(`  ${k}`);
  }
  if (missing.length > 0) {
    console.log(`\n${missing.length} source file(s) not found and never staged:`);
    for (const m of missing) console.log(`  ${m}`);
  }
  console.log(`\nManifest rows for the page:\n${rows.join("\n")}`);
}

main();
