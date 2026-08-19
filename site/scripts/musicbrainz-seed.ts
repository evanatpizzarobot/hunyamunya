// Generates an HTML page of pre-filled MusicBrainz "Add Release" forms, one
// per catalog release that MusicBrainz does not already have. Each form POSTs
// the release editor's seeding format to musicbrainz.org/release/add, so
// adding a release becomes: click, review the pre-filled editor, submit.
//
// MusicBrainz has no write API for releases; the seeded editor is the
// supported path (https://musicbrainz.org/doc/Development/Release_Editor_Seeding).
// You must be LOGGED IN to musicbrainz.org before clicking, or the editor
// comes up empty after the login redirect.
//
// Run from site/: npx tsx scripts/musicbrainz-seed.ts
// Output: hmr-musicbrainz-seeder.html on the Desktop. Desktop-only on
// purpose (it is a working file, not site content); regenerate any time.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getAllReleases } from "../lib/content";

const LABEL_MBID = "19259b9b-fce6-406d-94a1-8f2949feb58d";
const LABEL_NAME = "Hunya Munya Records";

// Titles already present on MusicBrainz as of 2026-08-18 (label releases plus
// Rykard release groups). Matched loosely; these get listed for manual review
// instead of seeded, so we never create duplicates.
// Run through the same norm() as catalog titles at compare time; keeping the
// raw strings here previously let "Arrive The Radio Beacon" slip past the
// guard (norm strips "the", the list entry kept it) and seed a duplicate.
const ALREADY_ON_MB_RAW = [
  "arrive the radio beacon",
  "halcyon days",
  "luminosity",
  "rhythm phoenix",
  "hell bent",
  "explorers vol 2",
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(ep|the)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function durationMs(mmss: string | undefined): number | null {
  if (!mmss) return null;
  const parts = mmss.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 3) return ((parts[0] * 60 + parts[1]) * 60 + parts[2]) * 1000;
  if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
  return null;
}

const FORMAT_MAP: Record<string, string> = {
  "vinyl-12": '12" Vinyl',
  "vinyl-7": '7" Vinyl',
  "vinyl-lp": "Vinyl",
  cassette: "Cassette",
  cd: "CD",
  digital: "Digital Media",
};

function main() {
  const alreadyOnMb = ALREADY_ON_MB_RAW.map(norm);
  const releases = getAllReleases().filter((r) => r.data.status !== "draft");
  const toSeed = releases.filter((r) => !alreadyOnMb.includes(norm(r.data.title)));
  const existing = releases.filter((r) => alreadyOnMb.includes(norm(r.data.title)));

  const forms = toSeed
    .map((r, idx) => {
      const d = r.data;
      const byline = r.resolvedArtists
        .filter((a) => a.role === "primary")
        .map((a) => a.name ?? a.slug)
        .join(" & ") || d.artist;
      const fields: Array<[string, string]> = [
        ["name", d.title],
        ["status", "official"],
        ["language", "eng"],
        ["script", "Latn"],
        ["artist_credit.names.0.name", byline],
        ["labels.0.mbid", LABEL_MBID],
        ["labels.0.name", LABEL_NAME],
      ];
      if (d.catalog_number) fields.push(["labels.0.catalog_number", d.catalog_number]);
      if (d.release_date) {
        const [y, m, day] = d.release_date.split("-");
        fields.push(["events.0.date.year", y], ["events.0.date.month", m], ["events.0.date.day", day]);
      } else if (r.year) {
        fields.push(["events.0.date.year", String(r.year)]);
      }
      const primaryFormat = FORMAT_MAP[d.format[0]] ?? "Digital Media";
      fields.push(["events.0.country", primaryFormat === "Digital Media" ? "XW" : "US"]);
      fields.push(["mediums.0.format", primaryFormat]);
      d.tracklist.forEach((t, i) => {
        fields.push([`mediums.0.track.${i}.name`, t.title]);
        fields.push([`mediums.0.track.${i}.number`, String(t.number)]);
        const ms = durationMs(t.duration);
        if (ms) fields.push([`mediums.0.track.${i}.length`, String(ms)]);
        // Only plain artist names (V/A compilations) become a track artist
        // credit. "Remix: X" / "Featuring: X" values are relationship
        // annotations, not the track's artist, and would seed a bogus artist
        // literally named "Remix: X"; those stay off and can be added as
        // proper remixer/featuring relationships in the editor if desired.
        if (t.credits && !t.credits.includes(":")) {
          fields.push([`mediums.0.track.${i}.artist_credit.names.0.name`, t.credits]);
        }
      });
      // Outbound URLs; the editor auto-detects relationship types for known
      // domains (Spotify, Apple, Bandcamp, Discogs), so no link_type is sent.
      const urls = [
        d.streaming.spotify ?? d.embeds.spotify,
        d.streaming.apple ?? d.embeds.apple,
        d.buy.bandcamp,
        d.buy.discogs,
      ].filter((u): u is string => Boolean(u));
      urls.forEach((u, i) => fields.push([`urls.${i}.url`, u]));
      fields.push([
        "edit_note",
        `Seeded from the official label site, https://hunyamunyarecords.com${r.urlPath} (Hunya Munya Records catalog). ` +
          (d.format.length > 1 ? `Also released as: ${d.format.join(", ")}. ` : "") +
          "Original release data from label archives; catalog re-released to streaming platforms in 2026.",
      ]);

      const inputs = fields
        .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
        .join("\n        ");
      const meta = [
        d.catalog_number ?? "no catno",
        r.year || "?",
        primaryFormat,
        `${d.tracklist.length} tracks`,
        urls.length ? `${urls.length} links` : "no links",
      ].join(" · ");
      return `    <div class="row">
      <div class="info">
        <strong>${String(idx + 1).padStart(2, "0")}. ${esc(byline)} · ${esc(d.title)}</strong>
        <span>${esc(meta)}</span>
      </div>
      <form method="post" action="https://musicbrainz.org/release/add" target="_blank">
        ${inputs}
        <button type="submit">Open pre-filled editor</button>
      </form>
    </div>`;
    })
    .join("\n");

  const existingRows = existing
    .map(
      (r) =>
        `    <li>${esc(r.data.title)} (${esc(r.data.catalog_number ?? "no catno")}): already on MusicBrainz. Check it is linked to the label and has the right date/format.</li>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HMR MusicBrainz Seeder</title>
<style>
  body { background: #111; color: #ddd; font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
  h1 { font-size: 1.4rem; } h2 { font-size: 1.1rem; margin-top: 2.5rem; }
  .notice { background: #2a2214; border: 1px solid #6b5316; padding: 0.8rem 1rem; border-radius: 6px; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid #333; padding: 0.7rem 0; }
  .info { display: flex; flex-direction: column; gap: 0.15rem; }
  .info span { color: #999; font-size: 0.8rem; }
  button { background: #ba478f; color: #fff; border: 0; padding: 0.5rem 0.9rem; border-radius: 5px; cursor: pointer; white-space: nowrap; }
  button:hover { background: #d15aa4; }
  li { margin: 0.4rem 0; color: #bbb; }
</style>
</head>
<body>
  <h1>Hunya Munya Records: MusicBrainz seeder</h1>
  <p class="notice">Log in at <a href="https://musicbrainz.org/login" target="_blank" style="color:#e8a">musicbrainz.org/login</a> FIRST. Each button opens MusicBrainz's Add Release editor pre-filled with that release's data; review each tab (artist matching especially: pick the existing MusicBrainz artist when the editor suggests one, e.g. Rykard) and press Enter Edit to submit. Generated ${toSeed.length} seeds from the site content files.</p>
  <h2>Releases to add (${toSeed.length})</h2>
${forms}
  <h2>Already on MusicBrainz (${existing.length}): review, do not re-add</h2>
  <ul>
${existingRows}
    <li>Note: "Arrive The Radio Beacon" exists TWICE on the label (2010-03-10 and 2010-03-30 entries). Propose a merge at the label page.</li>
  </ul>
</body>
</html>
`;

  const desktop = path.join(os.homedir(), "Desktop", "hmr-musicbrainz-seeder.html");
  fs.writeFileSync(desktop, html);
  console.log(`Wrote ${desktop}`);
  console.log(`${toSeed.length} releases to seed, ${existing.length} already on MusicBrainz.`);
}

main();
