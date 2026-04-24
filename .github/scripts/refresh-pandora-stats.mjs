// Refresh Rykard's Pandora monthly listener count.
//
// Pandora renders listener stats client-side, so a plain fetch returns an
// empty shell. We render the artist page in headless Chromium, wait for the
// stat block to paint, then scrape the number from the page text.
//
// Output path is site/data/pandora-stats.json, which the /press page imports
// and renders as the third stat card. Schema:
//
//   {
//     "rykard": {
//       "monthlyListeners": <integer>,
//       "updatedAt": <ISO-8601>,
//       "source": <url>
//     }
//   }
//
// Run via `.github/workflows/refresh-pandora-stats.yml` on a monthly cron.
// On parse failure the script exits non-zero so the workflow fails loudly;
// on success + change the workflow opens a PR bumping the JSON. If Pandora
// ever blocks the headless browser, expect a failure notification and fall
// back to manually editing site/data/pandora-stats.json.

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PANDORA_URL =
  "https://www.pandora.com/artist/rykard/ARp9n26Jhk4qq72";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const OUT_PATH = join(REPO_ROOT, "site", "data", "pandora-stats.json");

function extractListenerCount(html) {
  const patterns = [
    /([\d,]+)\s*monthly\s*listeners/i,
    /monthly\s*listeners[^\d<]{0,50}([\d,]+)/i,
    /([\d,]+)\s*listeners/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (!m) continue;
    const n = parseInt(m[1].replace(/,/g, ""), 10);
    if (Number.isFinite(n) && n >= 500) {
      return n;
    }
  }
  return null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 900 },
      locale: "en-US",
    });
    const page = await context.newPage();

    console.log(`Navigating to ${PANDORA_URL}`);
    await page.goto(PANDORA_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Give the JS a beat to fetch + render stats.
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {
      console.log("networkidle timeout, proceeding anyway");
    });
    await page.waitForTimeout(4000);

    const html = await page.content();
    const count = extractListenerCount(html);

    if (count === null) {
      console.error(
        "Could not parse listener count. Page may have changed or been blocked.",
      );
      console.error("Sample of page text:", html.slice(0, 1000));
      process.exit(2);
    }

    const payload = {
      rykard: {
        monthlyListeners: count,
        updatedAt: new Date().toISOString(),
        source: PANDORA_URL,
      },
    };

    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
    console.log(
      `Wrote ${OUT_PATH}: ${count.toLocaleString()} monthly listeners`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
