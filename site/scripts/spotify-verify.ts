// Checks every Spotify link in the content tree actually produces a playable
// embed. Worth having because a link can be perfectly valid and still render a
// blank player: Spotify builds the *artist* embed from top-tracks popularity
// data, so a profile with no listening history yet (a catalog that just went
// live) resolves fine, returns the right name, and serves an empty tracklist.
// Album embeds carry their tracks directly and do not have this problem.
//
// Run: npx tsx scripts/spotify-verify.ts
import fs from "node:fs";
import path from "node:path";

type Row = {
  file: string;
  field: string;
  url: string;
  kind: string;
  name: string | null;
  tracks: number | null;
  http: number;
};

const CONTENT = path.join(process.cwd(), "content");

function embedUrl(url: string): { kind: string; id: string } | null {
  const m = url.match(
    /open\.spotify\.com\/(?:embed\/)?(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/,
  );
  return m ? { kind: m[1], id: m[2] } : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Pulls the entity out of the embed page's __NEXT_DATA__ blob. `trackList` is
// what the widget renders, so an empty one means an empty player.
//
// Spotify throttles rapid sequential requests, and a throttled response looks
// exactly like an empty tracklist, so retry with backoff before believing a
// zero. `tracks: null` means the probe never got a usable answer, which is not
// the same finding as a confirmed empty player.
async function probe(kind: string, id: string, attempts = 3) {
  let last = { http: 0, name: null as string | null, tracks: null as number | null };
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(500 * 2 ** i);
    try {
      const res = await fetch(`https://open.spotify.com/embed/${kind}/${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      last = { http: res.status, name: null, tracks: null };
      if (!res.ok) continue;
      const html = await res.text();
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!m) continue;
      const entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
      const tracks = Array.isArray(entity?.trackList) ? entity.trackList.length : null;
      last = { http: res.status, name: entity?.name ?? null, tracks };
      // A real zero is stable, so only trust it once retries are exhausted.
      if (tracks !== null && tracks > 0) return last;
    } catch {
      // Network hiccup; fall through to the next attempt.
    }
  }
  return last;
}

// Only the fields that actually render an iframe: `embeds.spotify` on releases
// and top-level `spotify_embed` on artists. `links.spotify` and `buy.spotify`
// are plain outbound hyperlinks, and a profile with no popularity data is still
// a perfectly good link to send someone, so those are not checked.
function collect(): { file: string; field: string; url: string }[] {
  const out: { file: string; field: string; url: string }[] = [];
  for (const dir of ["releases", "artists"]) {
    const full = path.join(CONTENT, dir);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full).filter((f) => f.endsWith(".mdx"))) {
      const body = fs.readFileSync(path.join(full, f), "utf8");
      const fm = body.split(/^---$/m)[1] ?? "";
      let block = "";
      for (const line of fm.split("\n")) {
        const top = line.match(/^([A-Za-z_]+):/);
        if (top) block = top[1];
        const hit = line.match(
          /^\s*(spotify|spotify_embed):\s*'?(https:\/\/open\.spotify\.com\/\S+?)'?\s*$/,
        );
        if (!hit) continue;
        const isEmbedField =
          hit[1] === "spotify_embed" || (hit[1] === "spotify" && block === "embeds");
        if (isEmbedField) out.push({ file: `${dir}/${f}`, field: hit[1], url: hit[2] });
      }
    }
  }
  return out;
}

async function main() {
  const found = collect();
  const rows: Row[] = [];
  for (const item of found) {
    const parsed = embedUrl(item.url);
    if (!parsed) {
      rows.push({ ...item, kind: "UNPARSEABLE", name: null, tracks: null, http: 0 });
      continue;
    }
    const r = await probe(parsed.kind, parsed.id);
    rows.push({ ...item, kind: parsed.kind, ...r });
  }

  const bad = rows.filter((r) => r.tracks === 0);
  const unknown = rows.filter((r) => r.tracks === null);
  for (const r of rows) {
    const flag = r.tracks === null ? "UNKNOWN" : r.tracks === 0 ? "EMPTY" : "ok";
    console.log(
      `${flag.padEnd(6)} ${String(r.tracks ?? "-").padStart(3)} tracks  ${r.kind.padEnd(8)} ${(r.name ?? "?").padEnd(28)} ${r.file}`,
    );
  }
  console.log(`\n${rows.length} links checked, ${bad.length} would render a blank player.`);
  if (bad.length > 0) {
    console.log("Blank players:");
    for (const r of bad) console.log(`  ${r.file} (${r.field}): ${r.url}`);
  }
  if (unknown.length > 0) {
    console.log(`${unknown.length} could not be reached after retries (rerun to confirm):`);
    for (const r of unknown) console.log(`  ${r.file} (${r.field}): ${r.url}`);
  }
  if (bad.length > 0) process.exitCode = 1;
}

main();
