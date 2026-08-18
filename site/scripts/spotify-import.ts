// Bulk-imports Spotify album links into release frontmatter from a blob pasted
// straight out of the distributor report, in the shape:
//
//   Title: Dune in Erf Minor
//   UPC: 638865308704
//   Spotify URI: spotify:album:6llH1ss1SEw6G0fiyhQYAV
//   Link: https://open.spotify.com/album/6llH1ss1SEw6G0fiyhQYAV
//
// Entries may be newline-separated or run together on one line; the parser
// splits on "Title:" either way, and only the title and an album id are
// actually required.
//
// Nothing is guessed. A title that matches no release, or more than one, is
// reported and skipped rather than written to the closest thing. The one bit of
// give: distributors drop the format suffix the catalog keeps ("The Reminisce"
// for "The Reminisce EP"), so an exact miss retries without a trailing
// EP/LP/Single, still only accepting a single hit, and says so in the output. Every link
// that does get written is then probed to confirm the embed returns tracks,
// because a valid Spotify link can still render a blank player.
//
// Run:
//   npx tsx scripts/spotify-import.ts links.txt
//   npx tsx scripts/spotify-import.ts links.txt --dry
//   cat links.txt | npx tsx scripts/spotify-import.ts
import fs from "node:fs";
import path from "node:path";
import { embedUrl, normalizeTitle, probe } from "./lib/spotify-probe";

const RELEASES = path.join(process.cwd(), "content", "releases");

// Fallback form only, applied to an already-normalised title.
function stripFormatSuffix(s: string): string {
  return s.replace(/\s+(ep|lp|single)$/, "").trim();
}

type Entry = { title: string; upc?: string; albumId: string; url: string };
type ReleaseFile = { file: string; full: string; title: string; catno?: string; existing?: string };

function parseBlob(raw: string): { entries: Entry[]; skipped: string[] } {
  const entries: Entry[] = [];
  const skipped: string[] = [];
  // Split on each "Title:" marker, keeping what follows it together.
  const chunks = raw.split(/(?=Title:)/i).filter((c) => /Title:/i.test(c));
  for (const chunk of chunks) {
    // Title runs until the next known field label or end of chunk.
    // [\s\S] rather than . with the /s flag, which this tsconfig target rejects.
    const t = chunk.match(/Title:\s*([\s\S]+?)(?=\s*(?:UPC:|Spotify URI:|Link:|ISRC:|$))/i);
    const id = chunk.match(/spotify:album:([A-Za-z0-9]+)/) ??
      chunk.match(/open\.spotify\.com\/album\/([A-Za-z0-9]+)/);
    const upc = chunk.match(/UPC:\s*([0-9]+)/i);
    const title = t?.[1]?.trim().replace(/\s+/g, " ");
    if (!title || !id) {
      skipped.push(title ? `"${title}" (no album id found)` : "(entry with no title)");
      continue;
    }
    entries.push({
      title,
      upc: upc?.[1],
      albumId: id[1],
      url: `https://open.spotify.com/album/${id[1]}`,
    });
  }
  return { entries, skipped };
}

function loadReleases(): ReleaseFile[] {
  return fs
    .readdirSync(RELEASES)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const full = fs.readFileSync(path.join(RELEASES, f), "utf8");
      const fm = full.split(/^---$/m)[1] ?? "";
      const title = fm.match(/^title:\s*(?:'([^']*)'|"([^"]*)"|(.+?))\s*$/m);
      const catno = fm.match(/^catalog_number:\s*(\S+)\s*$/m);
      // Existing embeds.spotify, if any.
      let block = "";
      let existing: string | undefined;
      for (const line of fm.split("\n")) {
        const top = line.match(/^([A-Za-z_]+):/);
        if (top) block = top[1];
        const hit = line.match(/^\s*spotify:\s*'?(https:\/\/open\.spotify\.com\/\S+?)'?\s*$/);
        if (hit && block === "embeds") existing = hit[1];
      }
      return {
        file: f,
        full,
        title: (title?.[1] ?? title?.[2] ?? title?.[3] ?? "").trim(),
        catno: catno?.[1],
        existing,
      };
    });
}

// Inserts or replaces embeds.spotify in a frontmatter block, preserving any
// sibling keys such as an existing youtube embed.
function withSpotify(source: string, url: string): string {
  const parts = source.split(/^---$/m);
  if (parts.length < 3) throw new Error("no frontmatter");
  const fm = parts[1];
  const lines = fm.split("\n");

  const embedsIdx = lines.findIndex((l) => /^embeds:/.test(l));
  if (embedsIdx === -1) {
    // No embeds key at all: add one just before `buy:` if present, else append.
    const buyIdx = lines.findIndex((l) => /^buy:/.test(l));
    const insertAt = buyIdx === -1 ? lines.length - 1 : buyIdx;
    lines.splice(insertAt, 0, "embeds:", `  spotify: '${url}'`);
  } else if (/^embeds:\s*\{\s*\}\s*$/.test(lines[embedsIdx])) {
    lines.splice(embedsIdx, 1, "embeds:", `  spotify: '${url}'`);
  } else {
    // Existing block with children. Replace a spotify child if present,
    // otherwise append one after the block's last child.
    let end = embedsIdx + 1;
    let spotifyLine = -1;
    while (end < lines.length && /^\s+\S/.test(lines[end])) {
      if (/^\s*spotify:/.test(lines[end])) spotifyLine = end;
      end++;
    }
    if (spotifyLine !== -1) lines.splice(spotifyLine, 1, `  spotify: '${url}'`);
    else lines.splice(end, 0, `  spotify: '${url}'`);
  }

  parts[1] = lines.join("\n");
  return parts.join("---");
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const fileArg = args.find((a) => !a.startsWith("--"));

  let raw = "";
  if (fileArg) raw = fs.readFileSync(fileArg, "utf8");
  else if (!process.stdin.isTTY) raw = fs.readFileSync(0, "utf8");
  if (!raw.trim()) {
    console.error("No input. Pass a file path or pipe the blob on stdin.");
    process.exit(1);
  }

  const { entries, skipped } = parseBlob(raw);
  const releases = loadReleases();
  console.log(`Parsed ${entries.length} entries against ${releases.length} releases.\n`);
  for (const s of skipped) console.log(`  UNPARSED  ${s}`);

  const applied: { entry: Entry; rel: ReleaseFile; loose: boolean }[] = [];
  const unmatched: Entry[] = [];
  const ambiguous: { entry: Entry; hits: ReleaseFile[] }[] = [];
  const unchanged: { entry: Entry; rel: ReleaseFile }[] = [];
  const conflicts: { entry: Entry; rel: ReleaseFile }[] = [];

  for (const e of entries) {
    const want = normalizeTitle(e.title);
    let hits = releases.filter((r) => normalizeTitle(r.title) === want);
    let loose = false;
    if (hits.length === 0) {
      const bare = stripFormatSuffix(want);
      hits = releases.filter((r) => stripFormatSuffix(normalizeTitle(r.title)) === bare);
      loose = hits.length > 0;
    }
    if (hits.length === 0) {
      unmatched.push(e);
      continue;
    }
    if (hits.length > 1) {
      ambiguous.push({ entry: e, hits });
      continue;
    }
    const rel = hits[0];
    if (rel.existing === e.url) {
      unchanged.push({ entry: e, rel });
      continue;
    }
    if (rel.existing && rel.existing !== e.url) {
      conflicts.push({ entry: e, rel });
      continue;
    }
    applied.push({ entry: e, rel, loose });
  }

  for (const { entry, rel } of applied) {
    console.log(`  ${dry ? "WOULD SET" : "SET"}  ${(rel.catno ?? "?").padEnd(14)} ${rel.title.padEnd(34)} ${rel.file}`);
    if (!dry) fs.writeFileSync(path.join(RELEASES, rel.file), withSpotify(rel.full, entry.url));
  }
  for (const { entry, rel } of unchanged)
    console.log(`  same       ${(rel.catno ?? "?").padEnd(14)} ${entry.title} (already set)`);
  for (const { entry, rel } of conflicts)
    console.log(`  CONFLICT   ${(rel.catno ?? "?").padEnd(14)} ${entry.title}\n               file has ${rel.existing}\n               blob has ${entry.url}  (skipped, resolve by hand)`);
  for (const { entry, hits } of ambiguous)
    console.log(`  AMBIGUOUS  "${entry.title}" matches ${hits.length}: ${hits.map((h) => h.catno ?? h.file).join(", ")}  (skipped)`);
  for (const e of unmatched) console.log(`  NO MATCH   "${e.title}"  ${e.url}  (skipped)`);

  const looseHits = applied.filter((a) => a.loose);
  if (looseHits.length > 0) {
    console.log(`
${looseHits.length} matched only after ignoring a trailing EP/LP/Single:`);
    for (const { entry, rel } of looseHits)
      console.log(`  "${entry.title}" -> "${rel.title}" (${rel.catno ?? rel.file})`);
  }

  // Confirm the links that were written actually produce a playable embed.
  if (applied.length > 0) {
    console.log(`\nVerifying ${applied.length} embed(s)...`);
    let blank = 0;
    const mismatched: { rel: ReleaseFile; got: string }[] = [];
    for (const { entry, rel } of applied) {
      const parsed = embedUrl(entry.url)!;
      const r = await probe(parsed.kind, parsed.id);
      if (r.tracks === 0) blank++;

      // A link can be valid, return tracks, and still point at the wrong
      // record. Compare what Spotify calls the album against the release it
      // was written to. Subtitles and reissue suffixes differ legitimately, so
      // only flag when neither name contains the other at all.
      const a = normalizeTitle(rel.title);
      const b = normalizeTitle(r.name ?? "");
      const namesAgree = !b || a === b || a.includes(b) || b.includes(a);
      if (!namesAgree) mismatched.push({ rel, got: r.name ?? "?" });

      const flag = r.tracks === null ? "UNKNOWN" : r.tracks === 0 ? "BLANK!!" : namesAgree ? "ok" : "TITLE?";
      console.log(
        `  ${flag.padEnd(8)} ${String(r.tracks ?? "-").padStart(3)} tracks  ${(r.name ?? "?").padEnd(30)} ${rel.catno ?? rel.file}`,
      );
    }
    if (mismatched.length > 0) {
      console.log(`\n${mismatched.length} link(s) point at an album with a different name:`);
      for (const m of mismatched)
        console.log(`  ${(m.rel.catno ?? m.rel.file).padEnd(14)} file says "${m.rel.title}", Spotify says "${m.got}"`);
      console.log("  Check these before committing; a valid link can still be the wrong record.");
    }
    if (blank > 0 || mismatched.length > 0) process.exitCode = 1;
  }

  const needsEyes = unmatched.length + ambiguous.length + conflicts.length + skipped.length;
  console.log(
    `\n${dry ? "DRY RUN. " : ""}${applied.length} written, ${unchanged.length} already set, ${needsEyes} need a human.`,
  );
  if (needsEyes > 0) console.log("Nothing ambiguous was guessed at; the skipped ones are listed above.");
}

main();
