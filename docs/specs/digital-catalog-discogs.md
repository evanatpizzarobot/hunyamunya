# Hunya Munya Digital — Release Catalog (Discogs-sourced)

**Source**: https://www.discogs.com/label/79509-Hunya-Munya-Digital
**Captured**: 2026-04-22
**Scope**: 18 digital-only releases, HMDIGITAL001–HMDIGITAL018, 2005–2008.
**Parent label**: Hunya Munya Records (separate Discogs label ID).
**Purpose of this doc**: Feed CC the canonical list to scaffold `/catalog/digital` and generate 18 release MDX files. Supplants the 9 "digital-only drafts" from the WP migration (those were partial; this is the full list from Discogs, which is the source of truth).

---

## 1. Architecture decision — where digital releases live

**Recommendation: sub-route of catalog, not a top-level page.**

| Route | Purpose | Indexable? | Notes |
|---|---|---|---|
| `/catalog` | Master catalog — all formats, filterable UI | Yes, canonical | Default view shows all releases (vinyl + CD + digital) with format filter chips |
| `/catalog/vinyl` | Vinyl-only landing | Yes | SEO target: "hunya munya vinyl catalog" |
| `/catalog/cd` | CD-only landing | Yes | SEO target: "hunya munya cd releases" |
| `/catalog/digital` | Digital-only landing | Yes | SEO target: "hunya munya digital releases", "hmdigital catalog" |
| `/catalog/{catno-slug}` | Individual release page | Yes | e.g., `/catalog/hmdigital001-jairus-miller-ever-after` |

**Why this pattern over alternatives:**

- **vs. top-level `/digital-releases`** — top-level hides the relationship to the rest of the catalog. Search engines (and visitors) should see digital as part of the label's output, not a separate product line.
- **vs. query-param filter only (`/catalog?format=digital`)** — query-param pages don't index well and don't get their own title/meta/schema. We lose the SEO handle for "hunya munya digital releases" as a distinct query.
- **vs. unified `/catalog` with tabs (no separate URLs)** — same problem as above; no dedicated indexable landing page per format.

**Breadcrumb hierarchy**: Home → Catalog → Digital → {Release}. Clean and crawler-friendly.

**Implementation note for CC**: The three sub-routes (`/catalog/vinyl`, `/catalog/cd`, `/catalog/digital`) are just the master `/catalog` component with a format filter pre-applied, plus a format-specific `<SEO>` tag block (title, meta description, schema). One component, three pre-filtered entry points.

### 1.1 Frontmatter addition

All release MDX files need a `format` (already in the schema if CC followed the v1 spec). Values: `vinyl` | `cd` | `digital`. Digital releases additionally get:

```yaml
format: digital
formatDetails:
  type: "File"        # "File" for MP3, "CDr" for burned disc
  bitrate: "320 kbps" # if MP3
  fileCount: 1        # number of audio files in release
  isEP: false
  isCompilation: false
```

These drive the release page's "Format" block and populate the `MusicAlbum.albumReleaseType` + `numTracks` in JSON-LD.

### 1.2 Catalog number namespace

The `catalogNumber` field in frontmatter should store the exact Discogs-canonical form: `HMDIGITAL001`, `HMDIGITAL002`, etc. (no hyphen, leading zero-pad to 3). For URL slugs, lowercase: `hmdigital001-jairus-miller-ever-after`.

---

## 2. The 18 releases (raw data from Discogs)

All releases are MP3 320 kbps File releases unless otherwise noted. CDr releases (015, 018) are physical burned discs — they are digital-era releases but technically physical format, so `format: digital` with a note is fine, OR we classify them as `cd` — Evan's call. My default recommendation: **classify 015 and 018 as `cd` since they are physical discs**; everything else `digital`.

| CatNo | Artist | Title | Year | Format | Notes |
|---|---|---|---|---|---|
| HMDIGITAL001 | Jairus Miller | Ever After | 2005 | 1×File, MP3 320 | |
| HMDIGITAL002 | Darius Kohanim | Inn | 2005 | 1×File, MP3 320 | |
| HMDIGITAL003 | Darius Kohanim | Burton | 2005 | 1×File, MP3 320 | |
| HMDIGITAL004 | Habersham & Darius Kohanim | Dune In Erf Minor | 2005 | 1×File, MP3 320 | |
| HMDIGITAL005 | Habersham & Darius Kohanim | Doolesitlike | 2005 | 1×File, MP3 320 | |
| HMDIGITAL006 | Evan Marcus | Life Goes On | 2005 | 2×File, MP3 320 | |
| HMDIGITAL007 | Joel Armstrong & Gobo | Still Here | 2006 | 1×File, MP3 320 | Discogs note: "Gobo (3)" disambiguator — just use "Gobo" on site |
| HMDIGITAL008 | Underground Systems | IFT | 2006 | 3×File, MP3 320 | |
| HMDIGITAL009 | Distant Fragment | Distant Fragment EP | 2006 | 2×File, MP3 320, EP | |
| HMDIGITAL010 | Cassino & Labèn | Running After Time EP | 2006 | 2×File, MP3 320, EP | |
| HMDIGITAL011 | Daniel Gregory | Jetlag EP | 2007 | 2×File, MP3 320, EP | |
| HMDIGITAL012 | DJ Thee-O | The Music Speaks | 2007 | 3×File, MP3 320 | Discogs note: "DJ Thee-O*" — asterisk is Discogs disambiguation, drop it |
| HMDIGITAL013 | Curtis & Dakota | Long Night | 2007 | 2×File, MP3 320 | Discogs note: "Curtis & Dakota*" — drop the asterisk |
| HMDIGITAL014 | Darius Kohanim | Komodose EP | 2007 | 2 versions (see note) | Multiple versions on Discogs — grab both on enrichment pass |
| HMDIGITAL015 | Various Artists | International Soundscapes EP | 2008 | CDr, EP | **Physical (CDr)** — compilation. `isCompilation: true` |
| HMDIGITAL016 | Cassino & Labèn | Running After Time Remix EP | 2008 | 2 versions (see note) | Remix EP — companion to HMDIGITAL010 |
| HMDIGITAL017 | Darius Kohanim | The Reminisce EP | 2008 | 8×File, MP3 320, EP | Largest digital release — 8 tracks |
| HMDIGITAL018 | Robert G Roy | Sense Of Happiness | 2008 | CDr, Single | **Physical (CDr)** — single |

### 2.1 Artist observations

- **Darius Kohanim** is the most prolific digital-era artist: 6 releases (002, 003, 004, 005, 014, 017), plus 2 collaborations with Habersham.
- **Evan Marcus** (HMDIGITAL006) — is this you, Evan? If so, flag it on the artist page.
- **Habersham** appears only as a collaborator with Darius Kohanim (004, 005).
- **Various Artists** compilation (HMDIGITAL015) likely features multiple roster + guest artists; tracklist needs pulling from the individual Discogs release page for proper artist crediting.
- **Gobo**, **DJ Thee-O**, **Curtis & Dakota** — Discogs added disambiguator suffixes (`(3)`, `*`). These are Discogs conventions when multiple artists share a name; strip them on our site.

### 2.2 New artists to scaffold

The WP export gave us 22 artists. Digital adds these new names that probably don't have artist pages yet:

- Jairus Miller
- Darius Kohanim (may already exist as "DariusRafael" or similar — dedupe check)
- Habersham
- Evan Marcus
- Joel Armstrong
- Gobo
- Underground Systems
- Distant Fragment
- Cassino
- Labèn
- Daniel Gregory
- DJ Thee-O
- Curtis (& Dakota)
- Dakota
- Robert G Roy

**Evan: please confirm which of these are worth standing up proper artist pages for vs. just listing on release pages.** Not every digital-era artist needs a full roster page — some were one-off contributions. A conservative approach: **every artist gets at least a stub artist page** (just name + list of releases), then enrichment happens only for artists Evan actively wants to feature. This keeps URL structure consistent and internal linking clean.

---

## 3. What's missing — enrichment pass

This label-level scrape gives us the essentials. What it does NOT include, and would need a per-release enrichment pass:

- **Cover art** — each Discogs release page has images; we'd need to fetch them. Scrape from individual release URLs.
- **Tracklists with durations** — needed for full `MusicAlbum` schema with `MusicRecording.duration`.
- **Release dates** (month/day) — Discogs often has these; we only captured year.
- **Credits** (producer, mastering, artwork, etc.) — good for release page detail blocks.
- **Genre/style tags** — Discogs labels these; useful for catalog filters.
- **HMDIGITAL014 and HMDIGITAL016** — both show "2 versions" on the label page. Need to visit individual release pages to enumerate.

**Recommended enrichment approach**: one-time script that hits the Discogs API (free, requires token) to pull full release data for each of the 18 HMDIGITAL releases + the 14 HMR releases. Output: `enrichment-report.md` + updates to release MDX frontmatter in a separate branch for Evan to review. This is a **post-launch task** — don't block launch on it.

### 3.1 Audio availability

These digital releases were distributed via (now-defunct) stores like Beatport, iTunes, Amazon MP3, and likely the old HMR Bigcartel. Current availability is almost certainly zero unless Evan has the masters and wants to re-upload.

**Question for Evan**: do you want the release pages to link to a streaming/purchase source? If the masters exist and could be uploaded to Bandcamp, that becomes the canonical "listen/buy" link per release. If not, release pages will be informational-only (which is fine — the catalog still has SEO and historical value).

---

## 4. Frontmatter template (per digital release)

CC — this is the shape of each MDX file that `content/releases/` should contain for digital:

```yaml
---
title: "Ever After"
artist: "Jairus Miller"
artistSlug: "jairus-miller"
catalogNumber: "HMDIGITAL001"
releaseDate: "2005"                  # YYYY or YYYY-MM-DD when known
year: 2005
format: "digital"
formatDetails:
  type: "File"
  bitrate: "320 kbps"
  fileCount: 1
  isEP: false
  isCompilation: false
genres: []                           # populate during enrichment pass
coverImage: "/media/releases/hmdigital001-cover.jpg"  # placeholder; fetch during enrichment
discogsUrl: "https://www.discogs.com/release/[ID]"    # populate during enrichment pass
bandcampUrl: ""                      # empty until Evan uploads
seoTitle: "Ever After — Jairus Miller — HMDIGITAL001 — Hunya Munya Records"
metaDescription: "Ever After by Jairus Miller — HMDIGITAL001, released 2005 on Hunya Munya Records. Digital release."
tracklist: []                        # populate during enrichment pass
---

<!-- Body: optional release notes, liner notes, press quotes, when available. -->
```

Digital compilations (HMDIGITAL015) need:
```yaml
artist: "Various Artists"
artistSlug: "various-artists"
formatDetails:
  isCompilation: true
```

And Darius Kohanim's HMDIGITAL014/016 (multi-version) need the `versions` array — defer to enrichment pass.

---

## 5. Handoff to CC — what to do now

### 5.1 Phase 1 (now, with this doc):

1. Add `/catalog/digital`, `/catalog/vinyl`, `/catalog/cd` sub-routes (same component, pre-filtered).
2. Scaffold 18 digital release MDX files under `content/releases/` using the data in §2 and the template in §4. Cover images are placeholders for now.
3. Scaffold stub artist pages for the new digital-era artists listed in §2.2 (name + release list only; bio `TBD`).
4. Update `/catalog` master page to show all 56+ releases (14 HMR + 18 HMDIGITAL + 9 migration drafts — but dedupe since the 9 drafts overlap with this list).
5. **Dedupe**: the 9 "digital-only drafts" from the WP migration should map into these 18 Discogs releases. Merge any body content from the drafts into the new canonical MDX files, then delete the draft versions.

### 5.2 Deferred (enrichment pass, post-launch):

1. Discogs API enrichment script — populate `discogsUrl`, cover images, tracklists, durations, release dates, genres, credits for all releases (HMR + HMDIGITAL).
2. Upload recovered masters to Bandcamp (Evan's decision) and populate `bandcampUrl`.
3. Review cover art — if any are low quality, source higher-res from Evan's archives.

---

## 6. Open questions for Evan

1. **Scope of artist pages for digital-era artists.** Default: every artist gets at least a stub page (consistent URL structure, good for internal linking). Override if there are names you'd rather not surface.
2. **HMDIGITAL006 — Evan Marcus.** Is this you? If so, we should treat it accordingly on the artist page (bio, connection to label, etc.).
3. **HMDIGITAL015 / HMDIGITAL018 classification.** Both are CDr (physical). My default: classify as `format: cd` not `digital` since they are physical discs. Confirm or override.
4. **Masters availability.** Do you have masters for any/all of these 18? Bandcamp upload is the cleanest way to make them listenable again and gives each release page a real "listen/buy" link.
5. **Discogs API token.** If you have a Discogs account and can generate an API token, the enrichment pass becomes trivial. Otherwise I'll write it as a scraper that walks individual release pages.
6. **HMR vinyl releases on Discogs.** The digital sublabel is ID 79509; the main "Hunya Munya Records" label has a separate Discogs ID with the 14 HMR vinyl/CD releases. Want me to scrape that too for the enrichment data on those releases?

---

## 7. Changelog

- **2026-04-22** — Initial scrape + architecture recommendation. 18 digital releases captured.
