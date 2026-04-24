# Content Drafts v2

**Status**: Final. Ready for CC to wire into the relevant files.
**Supersedes**: `content-drafts-v1.md` for About, home hero, and Rykard bio where they overlap. v1 was an early draft written against incomplete label history. v2 incorporates corrections from the 2026-04-22 to 2026-04-23 review cycle.

**House rules** applied to every piece of public-facing copy below:

- Zero em-dashes, zero en-dashes. Hyphens only for compound words and numeric ranges written as "2005 to 2008" rather than "2005-2008."
- Track titles in double quotes: "North Cormorant Obscurity".
- Album titles in italics: *Arrive the Radio Beacon*.
- Catalog number suffix letters are always lowercase (HMB005a, HMB005b, HMB002b, etc.).

**Schema alignment**: The YAML frontmatter examples below are schema-valid against `site/lib/schema.ts` as of 2026-04-23. Field names in the YAML are schema-authoritative (the schema is the source of truth; v2 examples follow it). Body copy, tracklists, titles, credits text, and decisions in v2 are content-authoritative. If a schema change is needed to support v2 content, extend the schema and note the change in the changelog below.

---

## 1. About page — `app/about/page.tsx`

Landed in commit `05a8c2a`. This is the canonical reference version in case any future edit needs to align.

Hunya Munya Records is an independent label and publisher. We started in the early 2000s, going back and forth between Seattle, WA and Vancouver, B.C., sending out our first promos on CDRs in 2002 and 2003, then white-label pressings, leading to the official release of HMR001 in 2004. The first era, HMR001 through HMR009 (2004 to 2008), was a run of progressive house, breaks, and tech house 12"s. Alongside the label, from 2005 to 2007, Hunya Munya Publishing ran with Colin Moreh, Justin Moreh, Marcus Zuhr, and Evan Marcus pitching to commercials and landing sync placements on television.

The move to Los Angeles came in 2008 and 2009, where the label has been based ever since. From 2010 onward we shifted into ambient, chillout, and cinematic electronic, where most of the recent catalog lives, and licensing work for radio, film, and television has continued alongside it. That makes 2026 our twenty-fourth year. The music has moved. The approach hasn't.

The label has always been vinyl-first for the records that earn it. Ten numbered HMR 12"s, four CD full-lengths, and eighteen digital releases from our 2005 to 2008 Hunya Munya Digital sublabel: a catalog that rewards repeat listening more than it chases attention. Some of these records are twenty years old and still finding new listeners; a few we lost track of in previous site migrations and are only now putting back where they belong.

Our best-known lineage runs through [Rykard](/artists/rykard), a.k.a. Richard Wearing, working from the Lancashire countryside in the north of England. His 2010 debut *Arrive the Radio Beacon* brought the label its widest international reach, with "North Cormorant Obscurity" surpassing twenty-five million streams and support from BBC Radio, KCRW, and CBC along the way. The full-lengths *Luminosity* (2016) and *Night Towers* (2018) followed. Our newest release, HMR010, is the fifteen-year anniversary 12" vinyl reissue of "North Cormorant Obscurity," re-edited and mixed for vinyl, with an unreleased B Side called "Troup Head." Pressed by Vinyl Ceremony and mastered in LA. A new Rykard album is also in the works.

Beyond Rykard, the roster runs through artists like [Darius Kohanim](/artists/darius-kohanim), [Habersham](/artists/habersham), [Distant Fragment](/artists/distant-fragment), and a long list of collaborators whose work has shaped the label's sound. The complete [roster](/artists) and [catalog](/catalog) are a few clicks away.

We work slow. We put out records we actually want to put out. We like physical media, clean mastering, real liner notes, and artwork you can hold in your hands. We've never chased trends and we've never faked engagement.

Every record on the label came together somewhere, with someone: rooms, collaborators, scenes that held them up. That's been true across Vancouver, Seattle, and Los Angeles, across two decades of genres reshaping themselves. We're still glad to be part of whatever's next.

If you're an artist working in ambient, electronic, cinematic, or adjacent territory, and you've got something for release or for sync that you think belongs here, the door is open. We read every submission, though we can't always respond. If you're a listener, the [catalog](/catalog) is the best way in. Start anywhere and let it lead you outward.

Evan Marcus, founder

---

## 2. Contact page — `app/contact/page.tsx`

Short line that sits alongside the contact form (the full form spec lives in `contact-form-v1.md`). Evan's preferred framing:

General enquiries, demo submissions, press, sync and licensing: contact@hunyamunyarecords.com.

**Suggested placement**: under the form as the email fallback, not above it as the page intro. The form's Purpose dropdown already covers demo / press / licensing / general, so repeating those categories above the form is redundant. Placing this as a one-line "prefer email?" fallback beneath the form avoids the duplication.

---

## 3. Home page hero §01 copy (blocker fix)

The current `app/page.tsx` §01 P1 opens with "Hunya Munya Records is an LA based boutique label and publisher since 2002..." That contradicts the About v3 founding story (Vancouver / Seattle 2002 through 2008, Los Angeles 2008 onward).

**Replacement**:

> Hunya Munya Records is an independent boutique label and publisher, founded in 2002. Los Angeles since 2008.

**Or a single-sentence variant**:

> Independent boutique label and publisher, founded 2002. Based in Los Angeles since 2008.

The home §01 only needs to not contradict the About page. The full founding story lives on `/about`.

---

## 4. Rykard — Explorers series (HMB005a through HMB005d)

### 4.1 Series overview

Four-volume EP series Rykard built around memories of childhood, released across four years (2019 to 2023). Uniform credits across all four:

- Written and produced by Rick Wearing
- Mastered by Justin Moreh
- Cover art by Barry Wearing (BAZ ART)

Catalog scheme uses lowercase letter suffixes on a shared HMB005 root: `HMB005a` (Vol. 1), `HMB005b` (Vol. 2), `HMB005c` (Vol. 3), `HMB005d` (Vol. 4). This mirrors the sibling-number convention now used for HMB002 / HMB002b.

### 4.2 Explorers Vol. 1 — `content/releases/2019-rykard-explorers-vol-1.mdx`

**Body copy**:

*Explorers Vol. 1* opened a four-volume EP series Rykard built around memories of childhood. Three tracks: "The Explorers" (6:42), "Into Nebula" (4:38), and "Looks Real" (5:33). Lush, spacious electronics, patient arrangements, and the meditative pull that would run through the whole series.

The arc rolled out slowly across four years. Vol. 1 landed in July 2019; Vol. 2 followed in February 2020; Vol. 3 in December 2020; Vol. 4 closed the series in July 2023.

Released on digital. Fourculture Magazine covered the launch with a stellar review.

Written and produced by Rick Wearing. Mastered by Justin Moreh. Cover art by Barry Wearing.

Available on Spotify, Apple Music, Bandcamp, and Pandora.

**Frontmatter**:

```yaml
slug: explorers-vol-1
title: Explorers Vol. 1
catalog_number: HMB005a
artist: rykard
artists_additional: []
release_date: '2019-07-12'
format:
  - digital
genres:
  - ambient
  - electronic
  - downtempo
moods:
  - contemplative
  - meditative
  - spacious
tracklist:
  - { number: 1, title: "The Explorers", duration: "6:42" }
  - { number: 2, title: "Into Nebula",   duration: "4:38" }
  - { number: 3, title: "Looks Real",    duration: "5:33" }
credits:
  producer: "Rick Wearing"
  mastering: "Justin Moreh"
  artwork: "Barry Wearing"
sold_out: false
cover_image: /media/releases/rykard-explorers-vol-1-cover.jpg
# full-res source: https://f4.bcbits.com/img/a0686809454_10.jpg
gallery: []
embeds:
  spotify: "https://open.spotify.com/album/6yOb6vtbk50FXUUirq2okq"
# Apple Music album URL (no schema slot for Apple Music buy links yet):
#   https://music.apple.com/ca/album/explorers-vol-1-single/1468228100
buy:
  bandcamp: "https://rykard.bandcamp.com/album/explorers-vol-1"
  pandora:  "https://www.pandora.com/artist/rykard/explorers-vol-1/ALznXd9bVthmnmk"
  discogs:  "https://www.discogs.com/release/14184268"
press_quotes:
  - quote: "Rykard is back with a new form of electronic bliss on The Explorers Vol 1."
    source: "Fourculture Magazine"
    url: "https://fourculture.com/rykard-is-back-with-a-new-form-of-electronic-bliss-on-the-explorers-vol-1/"
sync_available: true
status: published
featured: false
proof_points:
  - { label: "Opening EP in Rykard's four-volume Explorers series" }
  - { label: "Stellar review in Fourculture Magazine on release" }
related_news:
  - rykard-explorers-ep-coming-soon
  - rykard-explorers-vol-1-releasing-7-12-19
  - fourculture-magazine-gives-rykard-explorers-vol-1-a-stellar-review
  - where-to-listen-to-rykard-explorers-vol-1
```

### 4.3 Explorers Vol. 2 — `content/releases/2020-rykard-explorers-vol-2.mdx`

**Body copy**:

*Explorers Vol. 2* is the second EP in Rykard's four-volume childhood-memory series, out February 2020. Three tracks: "Manta Force" (5:47), "Lynne and Katy Play Atari" (3:29), and "Be My Galaxy" (5:40). Where Vol. 1 set the meditative pace, Vol. 2 brings in hip-hop and trip-hop elements: low-fi beats, thicker bass, and kinetic moments alongside the spacious pads.

Released on limited CD (cat. HMB005b) and digital. Mike Stanton reviewed it in I Heart Noise, calling the record "a heady trip into the deepest and warmest electronic bliss-core" and "a record of sublime electronic exploration."

Written and produced by Rick Wearing. Mastered by Justin Moreh. Cover art by Barry Wearing.

Available on Spotify, Apple Music, Bandcamp, and Discogs.

**Frontmatter**:

```yaml
slug: explorers-vol-2
title: Explorers Vol. 2
catalog_number: HMB005b
artist: rykard
artists_additional: []
release_date: '2020-02-20'
format:
  - cd
  - digital
genres:
  - ambient
  - electronic
  - downtempo
  - trip-hop
moods:
  - contemplative
  - textural
  - kinetic
tracklist:
  - { number: 1, title: "Manta Force",                duration: "5:47" }
  - { number: 2, title: "Lynne and Katy Play Atari",  duration: "3:29" }
  - { number: 3, title: "Be My Galaxy",               duration: "5:40" }
credits:
  producer: "Rick Wearing"
  mastering: "Justin Moreh"
  artwork: "Barry Wearing"
sold_out: false
cover_image: /media/legacy/2019/11/rykard-explorers-vol2-edit.jpg
# full-res source: https://f4.bcbits.com/img/a1721942845_10.jpg
gallery: []
embeds:
  spotify: "https://open.spotify.com/album/7ousMySsnfTXXzuVTb7ucd"
# Apple Music album URL (no schema slot for Apple Music buy links yet):
#   https://music.apple.com/us/album/explorers-vol-2-single/1496087818
buy:
  bandcamp: "https://rykard.bandcamp.com/album/explorers-vol-2"
  discogs:  "https://www.discogs.com/release/14895581"
press_quotes:
  - quote: "A heady trip into the deepest and warmest electronic bliss-core."
    source: "Mike Stanton, I Heart Noise"
    url: "https://ihrtn.net/review-rykard-explorers-vol-2/"
  - quote: "Rykard has created a record of sublime electronic exploration."
    source: "Mike Stanton, I Heart Noise"
    url: "https://ihrtn.net/review-rykard-explorers-vol-2/"
sync_available: true
status: published
featured: false
proof_points:
  - { label: "Second EP in Rykard's Explorers series" }
  - { label: "Limited CD pressing (cat. HMB005b)" }
  - { label: "Featured review in I Heart Noise" }
related_news:
  - rykard-explorers-vol-2-coming-soon
  - rykard-explorers-vol-2-out-now
  - i-heart-noise-reviews-rykard-explorers-vol-2
```

### 4.4 Explorers Vol. 3 — `content/releases/2020-rykard-explorers-vol-3.mdx`

**Body copy**:

*Explorers Vol. 3* is the third EP in Rykard's four-volume childhood-memory series, released December 20, 2020. Three tracks: "Red Venom" (4:44), "Delphinus" (3:41), and "Phaelon" (5:37). The EP pulls back toward the series' patient, spacious core: shimmering ambient, melodic pads, and long quiet passages after Vol. 2's rhythmic turn.

Written and produced by Rick Wearing. Mastered by Justin Moreh. Cover art by Barry Wearing.

Available on Spotify, Apple Music, Bandcamp, and Pandora.

**Frontmatter**:

```yaml
slug: explorers-vol-3
title: Explorers Vol. 3
catalog_number: HMB005c
artist: rykard
artists_additional: []
release_date: '2020-12-20'
format:
  - digital
genres:
  - ambient
  - electronic
  - downtempo
moods:
  - contemplative
  - spacious
  - meditative
tracklist:
  - { number: 1, title: "Red Venom", duration: "4:44" }
  - { number: 2, title: "Delphinus", duration: "3:41" }
  - { number: 3, title: "Phaelon",   duration: "5:37" }
credits:
  producer: "Rick Wearing"
  mastering: "Justin Moreh"
  artwork: "Barry Wearing"
sold_out: false
cover_image: /media/legacy/2020/09/explorers-vol3-1000x1000.jpg
# full-res source: https://f4.bcbits.com/img/a0571445925_10.jpg
gallery: []
embeds:
  spotify: "https://open.spotify.com/album/3MiYj95fcwbgGpd3twrrn0"
# Apple Music album URL (no schema slot for Apple Music buy links yet):
#   https://music.apple.com/us/album/explorers-vol-3-single/1543276213
buy:
  bandcamp: "https://rykard.bandcamp.com/album/explorers-vol-3"
  pandora:  "https://www.pandora.com/artist/rykard/explorers-vol-3-single/ALmgpK472nzwV59"
press_quotes: []
sync_available: true
status: published
featured: false
proof_points:
  - { label: "Third EP in Rykard's Explorers series" }
related_news:
  - rykard-explorers-vol-3-coming-soon
  - rykard-explorers-vol-3-out-now
```

### 4.5 Explorers Vol. 4 — `content/releases/2023-rykard-explorers-vol-4.mdx`

**Body copy**:

*Explorers Vol. 4* is the fourth and final EP in a series Rykard began in 2019, built around memories of childhood and paced to let those memories breathe. Four tracks: "Dead Man's Trip" (3:48), "Stars Like Dust" (4:48), "Fading Into the Light" (5:20), and "Hydra" (4:40). Textural, spacious pieces with the occasional harder edge, sitting in the same contemplative territory the Explorers series has occupied from the start.

The full series ran across four years: Vol. 1 in July 2019, Vol. 2 in February 2020, Vol. 3 in December 2020, and Vol. 4 in July 2023 to close the arc.

Written and produced by Rick Wearing. Mastered by Justin Moreh. Cover art by Barry Wearing.

Out now on Spotify, Apple Music, Bandcamp, and Pandora.

**Frontmatter**:

```yaml
slug: explorers-vol-4
title: Explorers Vol. 4
catalog_number: HMB005d
artist: rykard
artists_additional: []
release_date: '2023-07-07'
format:
  - digital
genres:
  - ambient
  - electronic
  - downtempo
moods:
  - contemplative
  - spacious
  - textural
tracklist:
  - { number: 1, title: "Dead Man's Trip",      duration: "3:48" }
  - { number: 2, title: "Stars Like Dust",      duration: "4:48" }
  - { number: 3, title: "Fading Into the Light", duration: "5:20" }
  - { number: 4, title: "Hydra",                duration: "4:40" }
credits:
  producer: "Rick Wearing"
  mastering: "Justin Moreh"
  artwork: "Barry Wearing"
sold_out: false
cover_image: /media/legacy/2023/07/Vol-4-Cover-scaled.jpg
# full-res source: https://f4.bcbits.com/img/a0981153425_10.jpg
gallery: []
embeds:
  spotify: "https://open.spotify.com/album/2mhSE7AHF3Lginh1h5ThLE"
# Apple Music album URL (no schema slot for Apple Music buy links yet):
#   https://music.apple.com/us/album/explorers-vol-4-ep/1692204328
buy:
  bandcamp: "https://rykard.bandcamp.com/album/explorers-vol-4"
  pandora:  "https://www.pandora.com/artist/rykard/ARp9n26Jhk4qq72"
press_quotes: []
sync_available: true
status: published
featured: false
proof_points:
  - { label: "Fourth and final EP in Rykard's Explorers series" }
  - { label: "Caps a four-volume arc started in 2019" }
related_news:
  - explorers-vol-4-coming-7-7-23
  - rykard-explorers-vol-4-out-now
```

---

## 5. NCO 12" vinyl reissue (HMR010)

### 5.1 Spotify embed decision

On `content/releases/2025-rykard-nco.mdx`: use the NCO track embed (Spotify track ID `19J954JmVakR1RPFHVeDQx`) rather than the full *Arrive the Radio Beacon* album embed.

Reasoning: HMR010 is the 15-year NCO reissue specifically. The track is the focal point, not the album. The vinyl-specific re-edit is not on Spotify, and Side B is intentionally vinyl-exclusive, so the embed functions as a sample of what the Side A track sounds like in its original recording.

### 5.2 Side B "Troup Head" vinyl-exclusive callout

Add a short parenthetical near the embed on the HMR010 release page:

> Side B "Troup Head" is exclusive to this vinyl pressing and not available on streaming.

This frames the embed as a sample of Side A and reinforces the physical-media value proposition for collectors.

---

## 6. Rykard artist page — `content/artists/rykard.mdx`

Two changes:

### 6.1 Add Bandcamp link to the `links:` frontmatter

Replace `links: {}` with:

```yaml
links:
  website:  "https://rykard.com"
  bandcamp: "https://rykard.bandcamp.com"
```

### 6.2 Remove WordPress migration cruft from body

The current body contains an inline website link `<p><a href="http://www.rykard.com">rykard.com</a></p>` followed by 17 empty `<p>&nbsp;</p>` paragraphs (lines 29 through 67 as of 2026-04-23). Remove the inline link (the frontmatter now covers it) and all 17 empty paragraphs. The body should end cleanly after the bio paragraph that begins "As he continues to release music and perform..."

### 6.3 Template rendering

Verify the artist page template at `app/artists/[slug]/page.tsx` reads `links.website` and `links.bandcamp` and renders them in order (website first, bandcamp below). If the template does not yet handle the `links` object, extend it. Minimum viable is plain anchor links labeled with the domain ("rykard.com" and "rykard.bandcamp.com").

---

## 7. Catalog number conventions

### 7.1 Series codes

| Series | Format | Examples | Notes |
|--------|--------|----------|-------|
| `HMR` | 12" vinyl | HMR001 through HMR010 | Numbered vinyl releases, 2004 to present |
| `HMB` | CD and digital full-lengths / EPs | HMB001, HMB002, HMB002b, HMB003, HMB004, HMB005a-d, HMB006 | CD sublabel, 2010 to present |
| `HMDIGITAL` | Digital-only | HMDIGITAL001 through HMDIGITAL018 | Hunya Munya Digital sublabel, 2005 to 2008 |

### 7.2 Suffix casing

Catalog number suffix letters are **always lowercase**. HMB002b, HMB005a, HMB005b, HMB005c, HMB005d.

### 7.3 HMB002 disambiguation

Two releases were originally assigned HMB002 (conflict surfaced via Discogs). Resolution:

- `HMB002` → Catnip & Claws, *Halcyon Days EP* (2011). Unchanged. Earlier release, keeps the root number.
- `HMB002b` → Evan Marcus, *The Orange Album* (2013). Renumbered with lowercase `b` suffix.

### 7.4 301 redirects for renumbered releases

Add to the Apache `.htaccess` file (deploy target per `hosting-addendum.md`):

```apache
RewriteRule ^catalog/hmb002-the-orange-album/?$ \
  /catalog/hmb002b-the-orange-album [R=301,L]

RewriteRule ^catalog/hmb002B-the-orange-album/?$ \
  /catalog/hmb002b-the-orange-album [R=301,L]
```

The second rule covers any brief window during which the uppercase-B URL was reachable.

### 7.5 Sibling-number pattern

When the catalog needs to disambiguate variants of a single release, or mark a multi-volume series sharing one root, use lowercase suffix letters in chronological release order: `HMB005a`, `HMB005b`, `HMB005c`, `HMB005d`. Future series can follow the same pattern (e.g., `HMRxxxa`, `HMRxxxb` if a vinyl release ever gets a paired single or sibling).

---

## 8. Font direction

**Locked in**: Inter. Single family, no JetBrains Mono, no Spectral, no Source Serif. Editorial feel comes from letter-spacing, uppercase transformations, italic, and size contrast.

**Required refinements** (pending per last tune list):

- `font-feature-settings: "tnum"` (tabular numbers) on all numeric fields that should align vertically: catalog numbers (HMR010, HMB005a, HMDIGITAL018, etc.), tracklist position and duration cells, stats strip numbers (years, releases, artists, stream counts). This is the single typographic move that makes the site read as a record-label site without needing a separate mono family.

---

## 9. House writing rules (for reference)

1. **No em-dashes, no en-dashes** anywhere in public-facing copy. Use periods, commas, colons, semicolons, parentheses, or restructure. Hyphens are allowed for compound words and spelled-out numbers.
2. **Numeric ranges**: "2005 to 2008" rather than "2005-2008" or "2005–2008."
3. **Track titles**: double quotes. `"North Cormorant Obscurity"`.
4. **Album titles**: italics. `*Arrive the Radio Beacon*`.
5. **Catalog numbers**: `HMR010`, `HMB005b`, `HMDIGITAL018`. All caps on the series code, digits and suffix letters follow. Suffix letters lowercase.
6. **Artist names**: "a.k.a." for aliases, lowercase periods. "Rykard, a.k.a. Richard Wearing."
7. **Internal links** in MDX body: standard markdown links with descriptive anchor text. `[Rykard](/artists/rykard)` rather than `[click here](/artists/rykard)`.
8. **First-person voice**: "we" for the label, signed by "Evan Marcus, founder" on the About page.

---

## 10. Pending items outside v2 scope

The following are flagged for the next pass and not covered by this spec:

- Home page tunes: max content width 1440, tabular numbers enforcement, "25M+ streams" caption scoped to NCO, header "Now playing" pill (drop or rewire).
- Subpage typesetting rollout: catalog index, release detail, artist index, artist detail, news, about, contact.
- `/catalog` vs `/discography` user-facing distinction (nav labeling).
- Shopify product integration (buy links + gallery imagery for NCO, Night Towers, Luminosity, Arrive the Radio Beacon). Reference data captured in a separate `shopify-product-data.md` spec when ready.
- Lighthouse CI gate.
- News body auto-linking (SEO spec §2.7).
- Image alt audit (SEO spec §2.5).

---

## Changelog

- **2026-04-23** — v2. Consolidated final About + Contact + Home hero §01 + Explorers Vols 1 through 4 + NCO embed decision + Rykard artist page edits + catalog number conventions + house writing rules. Supersedes `content-drafts-v1.md` for overlapping sections.
- **2026-04-23 (later)** — v2.1 schema reconciliation. Explorers YAML examples aligned to `site/lib/schema.ts`: `position` renamed to `number` on tracklist entries; `credits.written_by` + `credits.produced_by` consolidated into `credits.producer`; `proof_points` changed from string arrays to object arrays keyed on `label`; `buy.spotify` removed (Spotify lives under `embeds.spotify`); `buy.apple_music` removed and captured as comments in frontmatter since the schema has no Apple Music buy slot yet. Schema extension candidate noted below.

## Schema extension candidates

The following gaps surfaced during v2.1 reconciliation. None are blocking; all are nice-to-have.

1. **Apple Music buy link**. The schema has `embeds.apple` for an iframe-ready URL but no `buy.apple_music` slot for a plain storefront CTA. If "Buy on Apple Music" becomes a strategic purchase path alongside Bandcamp, extend `buy` with `apple_music: z.string().url().optional()`.

2. **Writer credit separation**. `credits.producer` currently carries both the writing and production credit for Rykard's work. If a future release has different writer vs producer (e.g., a remix, a co-write, a cover), extend `credits` with `writer` and/or `composer` fields. Body copy can continue to read "Written and produced by" from the single `producer` field until that distinction matters.
