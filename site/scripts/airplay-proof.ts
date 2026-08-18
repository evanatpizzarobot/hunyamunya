// Resolves durable proof for the airplay claims on the press page.
//
// Two jobs:
//   1. Every citation URL in app/press/page.tsx is checked. The KCRW tracklist
//      deep links from 2010 now bounce to a generic playlists page, so a live
//      200 is not enough; a redirect away from the original path counts as
//      broken. Anything broken gets a Wayback snapshot looked up, preferring a
//      capture close to the play date it is citing.
//   2. Probes the retired BBC Music artist page (bbc.co.uk/music/artists/{mbid}),
//      which used to list every BBC programme that played an artist. If a
//      capture exists it is the only free route to a named BBC show.
//
// archive.org rate-limits aggressively, so every call backs off and retries
// rather than reporting a false negative. Nothing is written; this prints what
// it found so the citations can be repointed deliberately.
//
// Run:
//   npx tsx scripts/airplay-proof.ts
//   npx tsx scripts/airplay-proof.ts --json > proof.json
import fs from "node:fs";
import path from "node:path";

const PRESS = path.join(process.cwd(), "app", "press", "page.tsx");
const RYKARD_MBID = "59e88556-72fd-47db-afb7-bdb2a3b22bc6";

type Citation = { station: string; date: string; url: string };
type Verdict = Citation & {
  live: "ok" | "redirected" | "dead" | "unknown";
  finalUrl?: string;
  archived?: string;
  archivedAt?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// archive.org answers 429 under load. Five tries with widening gaps turns a
// rate limit into a slow answer instead of a wrong one.
async function fetchRetry(url: string, init?: RequestInit, tries = 5): Promise<Response | null> {
  let wait = 1500;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: "follow", ...init });
      if (res.status !== 429 && res.status < 500) return res;
    } catch {
      // network reset, treated the same as a 429: wait and try again
    }
    await sleep(wait);
    wait *= 2;
  }
  return null;
}

// Pulls station name, play date and citation url out of the STATIONS literal.
function parseCitations(src: string): Citation[] {
  const out: Citation[] = [];
  const blocks = src.split(/\n  \{\n    name: /).slice(1);
  for (const b of blocks) {
    const station = b.match(/^"([^"]+)"/)?.[1];
    if (!station) continue;
    const playChunks = b.split(/\n      \{\n/).slice(1);
    for (const p of playChunks) {
      const url = p.match(/url:\s*"([^"]+)"/)?.[1];
      if (!url) continue;
      out.push({ station, date: p.match(/date:\s*"([^"]+)"/)?.[1] ?? "?", url });
    }
  }
  return out;
}

// A 200 that landed somewhere else entirely is not a citation any more.
function classify(res: Response | null, original: string): { live: Verdict["live"]; finalUrl?: string } {
  if (!res) return { live: "unknown" };
  const from = new URL(original);
  const to = new URL(res.url);
  if (!res.ok) return { live: "dead", finalUrl: res.url };
  const samePlace = from.hostname.replace(/^www\./, "") === to.hostname.replace(/^www\./, "") &&
    from.pathname.replace(/\/$/, "") === to.pathname.replace(/\/$/, "");
  return samePlace ? { live: "ok" } : { live: "redirected", finalUrl: res.url };
}

// Wayback wants YYYYMMDD; ask for a capture near the play date so the snapshot
// actually shows that day's tracklist rather than a later redesign.
function timestampFor(date: string): string | undefined {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function findSnapshot(url: string, near?: string): Promise<{ url: string; at: string } | null> {
  const q = new URL("https://archive.org/wayback/available");
  q.searchParams.set("url", url.replace(/^https?:\/\//, ""));
  if (near) q.searchParams.set("timestamp", near);
  const res = await fetchRetry(q.toString());
  if (!res) return null;
  const data = (await res.json().catch(() => null)) as
    | { archived_snapshots?: { closest?: { available?: boolean; url?: string; timestamp?: string } } }
    | null;
  const snap = data?.archived_snapshots?.closest;
  if (!snap?.available || !snap.url) return null;
  return { url: snap.url, at: snap.timestamp ?? "?" };
}

async function main() {
  const json = process.argv.includes("--json");
  const src = fs.readFileSync(PRESS, "utf8");
  const citations = parseCitations(src);
  if (!json) console.log(`Checking ${citations.length} citation link(s) from the press page.\n`);

  const verdicts: Verdict[] = [];
  for (const c of citations) {
    const res = await fetchRetry(c.url, { method: "GET" }, 3);
    const { live, finalUrl } = classify(res, c.url);
    const v: Verdict = { ...c, live, finalUrl };
    if (live !== "ok") {
      const snap = await findSnapshot(c.url, timestampFor(c.date));
      if (snap) {
        v.archived = snap.url;
        v.archivedAt = snap.at;
      }
    }
    verdicts.push(v);
    if (!json) {
      const tag = v.live === "ok" ? "live " : v.live === "redirected" ? "MOVED" : v.live === "dead" ? "DEAD " : "?????";
      console.log(`  ${tag} ${c.station.padEnd(20)} ${c.date.padEnd(14)} ${v.archived ? "archived " + v.archivedAt : v.live === "ok" ? "" : "no snapshot"}`);
    }
    await sleep(400);
  }

  // The retired BBC artist page: the one free source that names BBC shows.
  const bbcUrl = `https://www.bbc.co.uk/music/artists/${RYKARD_MBID}`;
  const bbc = await findSnapshot(bbcUrl);
  if (!json) {
    console.log(`\nBBC Music artist page (${RYKARD_MBID}):`);
    console.log(bbc ? `  archived ${bbc.at}  ${bbc.url}` : "  no capture found");
    const broken = verdicts.filter((v) => v.live !== "ok");
    const rescued = broken.filter((v) => v.archived);
    console.log(`\n${verdicts.length - broken.length} link(s) still live, ${broken.length} broken, ${rescued.length} recoverable from the archive.`);
    if (broken.length > rescued.length)
      console.log("Links with no snapshot need a different source before they can be cited.");
  }
  if (json) console.log(JSON.stringify({ citations: verdicts, bbc }, null, 2));
}

main();
