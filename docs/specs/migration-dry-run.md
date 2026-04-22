# hunyamunyarecords.com — WP Export Dry-Run Report

**Export analyzed:** `hunyamunyarecords.WordPress.2026-04-22.xml` (6.3 MB, 78,093 lines, WXR 1.2, WP 6.9.4)
**Source:** https://www.hunyamunyarecords.com
**Target repo:** https://github.com/evanatpizzarobot/hunyamunya.git
**Audience:** Claude Code — consume alongside `hunyamunyarecords-rebuild-v1.md`
**Status:** Ready to execute; no blockers

---

## Headline numbers

| Type | Count | Notes |
|---|---|---|
| `post` (news) | 52 | 51 published + 1 draft (empty, ignore) |
| `page` | 29 | 1 parent roster page + 22 artist pages + misc (releases/discography/press/shop/contact) |
| `attachment` | 114 | Images only — 98 .jpg, 14 .png, 2 .jpeg. No audio. |
| `nav_menu_item` | 25 | Skip; rebuild menu in Next.js |
| `wpcf7_contact_form` | 1 | Single CF7 form, see §6 |
| `custom_css` | 1 | Skip; rebuild styling in Tailwind |
| Authors | 1 | `admin` (Evan) — collapse to single author |
| Date range | 2010-04-14 → 2025-12-13 | 15 years of content |
| Body content | 222 `content:encoded` blocks, ~148KB of prose | Lean — a weekend migration |

**Good news:** the site is actually simple. No Elementor/Divi/Visual Composer pagebuilder HTML. Mostly Gutenberg blocks + some legacy classic-editor HTML. No custom post types for `artist` or `release` — the original spec assumption was wrong and the actual structure is cleaner than expected (see §3).

---

## 1. Content classification plan

The export has no `artist` or `release` custom post types. Everything is either `post` or `page`. The `/artists` page (ID 12) is the parent of all 22 artist pages. Releases live inside two manually-maintained list pages (`/releases-2` ID 16 and `/discography` ID 79) AND are described in news posts. This changes the migration shape from the original spec.

### 1.1 Classification rules for `wp-import.ts`

```
if post_type == "page":
    if post_id == 12:                            → skip (becomes /artists generated from artists/*.mdx)
    elif post_parent == 12:                      → content/artists/{slug}.mdx
    elif post_id in {14, 16, 79}:                → merge into seed release catalog; do NOT emit as MDX pages
    elif post_id == 247:                         → content/pages/press.mdx
    elif post_id == 445:                         → content/pages/shop.mdx  (or fold into /catalog)
    elif slug in ("tim-fretwell",) and post_parent == 0:
                                                 → flag duplicate slug collision (see §7)
    else:                                        → content/pages/{slug}.mdx (manual review flag)
elif post_type == "post":
    → content/news/{YYYY-MM-DD}-{slug}.mdx

elif post_type == "attachment":
    → rehost to R2, register in media-manifest.json

else:                                            → skip (nav_menu_item, custom_css, wpcf7)
```

### 1.2 Artist roster (22 pages confirmed, all `post_parent=12`)

| Slug | Title |
|---|---|
| `rykard` | Rykard (set `tier: anchor`) |
| `blue-room-project` | Blue Room Project |
| `boom-jinx` | Boom Jinx |
| `catnip-claws-2` | Catnip & Claws (note: slug collision with tag `catnip-claws` — see §7) |
| `darius-kohanim` | Darius Kohanim |
| `dirk-bajema` | Dirk Bajema |
| `distant-fragment` | Distant Fragment |
| `evan-marcus` | Evan Marcus |
| `fabian-schumann` | Fabian Schumann |
| `habersham` | Habersham |
| `huge-a` | Huge-A |
| `kytami` | Kytami |
| `leevey` | Leevey |
| `madoka` | Madoka |
| `noel-sanger` | Noel Sanger |
| `nosmo-kris-b` | Nosmo & Kris B |
| `serge-govor` | Serge Govor |
| `shiloh` | Shiloh |
| `shmuel-flash-huge-a` | Shmuel Flash |
| `snake-sedrick-khans` | Snake Sedrick & Khans |
| `tim-fretwell` | Tim Fretwell (see §7 for slug collision) |
| `yenn` | Yenn |

Rykard gets `tier: anchor`, all others default to `tier: archived` (Evan will promote any active ones manually post-migration).

### 1.3 Release catalog — seed directly from `/discography` (page 79)

`wp-import.ts` parses page 79 to produce the canonical 12" + CD list below, then cross-references news posts by tag to flesh out release dates, press quotes, and external links. This is manual-curation-assisted rather than fully automated: the importer emits drafts, Evan confirms.

**12" Vinyl Releases**

| Catalog | Artist | Title |
|---|---|---|
| HMR001 | D Bajema | Twilight (Original + Noel Sanger Mix) |
| HMR002 | Blue Room Project | 5B (Original + Madoka Mix) |
| HMR003 | Evan Marcus | Ten Feet From Heaven (Original + 017 Breaks Mix) |
| HMR004 | Snake Sedrick & Khans | Circular (Original + Tim Fretwell Mix) |
| HMR005 | Darius Kohanim | Revitalized (Original + Habersham Mix) |
| HMR006 | Boom Jinx | Flicker (Original + Shiloh Mix) |
| HMR007 | Distant Fragment | Chasing Memories (Original + Shmuel Flash & Huge-A Mix) |
| HMR008 | Huge-A | Time Code (Original + Nosmo & Kris B Mixes) |
| HMR009 | Yenn | What I Feel (Original + Fabian Schumann & Evan Marcus Mixes) |
| HMR010 | Rykard | NCO (North Cormorant Obscurity + Troup Head) — 2025-12-12 |

**CD full-lengths** (linked on discography page via Discogs)

| Artist | Title | Year | Discogs |
|---|---|---|---|
| Rykard | Arrive The Radio Beacon | 2010 | release/2993676 |
| Evan Marcus | The Orange Album | 2013 | release/12157212 |
| Rykard | Luminosity | 2016 | release/9084114 |
| Rykard | Night Towers | 2018 | release/11959458 |

**Digital-only releases derived from news posts + tags**

- Catnip & Claws — Halcyon Days EP (2011)
- Rykard — Ictis (2016 single)
- Rykard — Artificial Sunshine (2016 single, with video)
- Rykard — Lansallos (2017 music video)
- Rykard — Red Venom (2020 YouTube)
- Rykard — Explorers Vol. 1 (2019-07-12)
- Rykard — Explorers Vol. 2 (2019-ish)
- Rykard — Explorers Vol. 3 (2020-12-20)
- Rykard — Explorers Vol. 4 (2023-07-07)

---

## 2. Categories and tags

Taxonomies are light. Four categories: `41`, `latest-news`, `rykard`, `van-marcus` — none of these are useful in the new schema; discard and re-derive from post classification. 100 post_tags exist; keep them as MDX frontmatter `tags:` for cross-linking. `post_tag` values like `arrive-the-radio-beacon`, `luminosity`, `night-towers`, `nco` are the best signal for linking news posts to release pages — the importer will wire `related_releases:` frontmatter automatically when a news post's tag matches a known release slug.

---

## 3. Custom fields (postmeta) — what to preserve

From 50+ distinct postmeta keys, only a handful matter:

| Key | Count | Action |
|---|---|---|
| `_aioseop_title` | 49 | → frontmatter `seo.title` |
| `_aioseop_description` | 47 | → frontmatter `seo.description` |
| `_aioseop_keywords` | 49 | Drop — keywords are dead for SEO. Don't carry into new site. |
| `_aioseop_menulabel` | 10 | → frontmatter `menu_label` if different from title |
| `_aioseop_noindex`, `_aioseop_nofollow`, `_aioseop_sitemap_exclude` | 5 each | → frontmatter `seo.index`, `seo.follow`, `seo.in_sitemap` |
| `_thumbnail_id` | 5 | Cross-reference with attachments, resolve to R2 URL → frontmatter `hero_image` |
| `_wp_attached_file` | 114 | Original filename for each attachment → R2 path |
| `_wp_attachment_metadata` | 114 | Ignore — we regenerate sizes via `sharp` |
| `port_thumb_image_url`, `port_large_image_url`, `photo_small_image_url`, `photo_large_image_url`, `front_large_image_url`, `front_large_image_link`, `post_thumb_image_url` | 9 each | Portfolio-theme artist image fields. Map to `portrait: `, `hero_image: ` in artist frontmatter. Must cross-reference with image attachments to resolve. |
| `background_color` | 3 | Used on 3 artist pages. → frontmatter `palette_override.bg` (optional). |
| `video` | 9 | Legacy custom "video URL" field. Already duplicated in body; ignore. |
| `_wp_old_slug` | 5 | → add to redirect map. Each `_wp_old_slug` value needs a 301 → current slug. |
| `_oembed_*` | ~160 | Skip. WP's auto-embed cache. We re-resolve oEmbeds at build time from raw URLs in body. |
| `aktt_*`, `_social_*`, `akismet_*`, `_jetpack_*`, `_wp_page_template`, `_menu_item_*` | many | Skip. Plugin plumbing, irrelevant. |

**Verdict:** no ACF. No Yoast. Just the classic All in One SEO Pack plus a handful of portfolio-theme fields. The read-only login is only needed to resolve the 9 portfolio-theme image URLs to their current attachment IDs if the XML's serialized values are lossy; if `media-manifest.json` has the originals, we don't need the login for content. Still useful for sanity-checking, but no blocker.

---

## 4. Shortcodes and embeds — transformation map

**Shortcodes found (non-CF7 form internals):**

| Shortcode | Count | Transform |
|---|---|---|
| `[caption ...]...[/caption]` | 6 | Unwrap to `<figure><img/><figcaption/></figure>` — native HTML. |
| `[youtube ...]` | 1 | Rewrite to `<YouTubeEmbed id="…"/>` component |
| `[soundcloud ...]` | 1 | Rewrite to `<SoundCloudEmbed url="…"/>` component |
| `[contact-form-7 ...]` | 1 | Replace with `<ContactForm form="general"/>` pointing at new Pages Function |
| `[Full]`, `[Amazon]`, `[Inside]` | 4+3+1 | False positives — these are CF7 field references inside the form HTML. Ignore when outside `post_type=wpcf7_contact_form`. |

**Gutenberg blocks found:**

| Block | Count | Transform |
|---|---|---|
| `wp:paragraph` | 242 | `<p>...</p>` — pass through |
| `wp:image` | 54 | `<Image src="r2://…" .../>` via media-manifest rewrite |
| `wp:html` | 18 | Pass-through HTML, sanitize scripts |
| `wp:embed` | 14 | Route by provider → `<YouTubeEmbed/>`, `<BandcampEmbed/>`, etc. |
| `wp:core-embed/youtube` | 3 | `<YouTubeEmbed id="…"/>` |
| `wp:core-embed/soundcloud` | 1 | `<SoundCloudEmbed url="…"/>` |
| `wp:gallery` | 1 | `<Gallery images={[...]}/>` component |
| `wp:file` | 1 | Link to R2 URL |
| `wp:shortcode` | 1 | Wraps `[contact-form-7 …]`, handled above |

**External embed hosts seen in body text (for the unified `<Player/>` component to handle):**

- `www.youtube.com` / `youtu.be` — 54 mentions
- `soundcloud.com` — 6
- `music.apple.com` / `apple.co` / `itunes.apple.com` — ~20 combined (note: itunes.apple.com URLs are legacy, often broken — follow-up task to validate in `wp-verify.ts`)
- `open.spotify.com` / `spoti.fi` — 3+2
- `rykard.bandcamp.com` — 8 purchase links + body references
- `www.amazon.com` / `amzn.to` — 8+7
- `www.discogs.com` — 4
- `hunyamunya.myshopify.com` — 4
- `hunyamunya.bigcartel.com` — 4 (legacy; almost certainly dead — `wp-verify.ts` should probe)
- `www.beatport.com` — 3
- `www.pandora.com` — 3
- `newmedia.kcrw.com` / `newmedia.kcrw.org` — 6 (legacy KCRW tracklist URLs; KCRW has restructured their archive, so these likely 404. Flag for Evan to re-link or archive.org fallback.)
- `dedpop.co.uk` — 2

**Action for `wp-verify.ts`:** HEAD-check every external link in migrated content; produce `dead-links.md` with any 404s/timeouts so Evan can decide per-link whether to fix, swap to archive.org snapshot, or remove.

---

## 5. Media rehost scope

**Sizing:**
- 114 attachment records
- 87 unique attachments referenced in body content
- 45 additional URL references point to WP-generated thumbnail sizes (e.g. `-150x150.jpg`, `-300x300.jpg`, `-1024x605.jpg`). These are derivatives of the 114 originals, not separate files.

**Rehost approach (updated):**
1. Download each of the 114 originals from `hunyamunyarecords.com/wp-content/uploads/{YYYY}/{MM}/{file}`
2. Strip EXIF, convert to AVIF + WebP, keep original as fallback
3. Upload to R2 under `media/legacy/{YYYY}/{MM}/{original-filename}.{avif,webp,original}`
4. In MDX rewrites, strip the size suffix (`-150x150`, `-1024x605`) from every URL before looking up the manifest; Next.js `Image` regenerates sizes on the fly from the R2 original
5. Produce `migration/media-manifest.json` mapping every old URL (including sized variants) to the new R2 base path

**Upload folder spread:** dates range 2010-04 through 2025-12. The heaviest months are 2010/04 (26 originals — initial label catalog), 2025/08 (27 — recent redesign asset batch), suggesting Evan did a bulk re-upload during the NCO campaign. Worth keeping in mind for the `alt` text pass: 2025 uploads may have better alt than 2010 ones.

**Budget:** all-images at ~500KB average = ~60MB rehosted. R2 free tier absorbs this with room for ~100x growth.

---

## 6. Contact form

**One CF7 form exists.** Title: `Arrive The Radio Beacon [UPC: 845350021837]` — name is misleading; looking at the form fields (`your-name`, `your-email`, `your-subject`, `your-message`, `submit`, `textarea`) this is the generic site contact form, not anything release-specific. Evan probably repurposed/renamed it long ago.

**Action:**
- Do NOT preserve the CF7 installation
- Replace the single `[contact-form-7 id="4f9d527"]` embed (on page 14, which is mis-titled "Contact" but sits at slug `/releases`) with the new `<ContactForm form="general"/>` component
- Page 14's slug (`/releases`) is wrong for a contact form. Treat as slug-collision cleanup: move content to `/contact`, add 301 from `/releases` → `/catalog`, add 301 from `/releases-2` → `/catalog`

---

## 7. Flags that need Evan's eyes (non-blocking)

These are known issues surfaced from the data. The importer will flag each in `content/_review/` with the problem described; Evan sorts post-first-run.

1. **Slug collision — Tim Fretwell.** Two pages have slug `/tim-fretwell`:
   - ID 410 (parent=12): the artist page under `/artists/tim-fretwell`
   - ID 1052 (parent=0): a top-level `/tim-fretwell` page (possibly a duplicate or a redirect target)
   **Action:** import artist at `/artists/tim-fretwell`, import the orphan at `/_review/tim-fretwell-orphan.mdx` for Evan to decide.

2. **Slug collision — Catnip & Claws.** Slug `catnip-claws-2` suggests there was once a `catnip-claws` page that got renamed. No `catnip-claws` page exists anymore in the export. Use `/artists/catnip-claws-2` or rename to `/artists/catnip-claws` during import and add a 301 from the old URL. Recommend rename for readability.

3. **Mis-titled pages:**
   - Page 14 has slug `/releases` but title `Contact`
   - Page 16 has slug `/releases-2` but title `Releases`
   **Action:** treat page 16 as the releases list (fold into catalog seed), page 14 as the contact form carrier (fold into `/contact`), 301 both old URLs.

4. **KCRW tracklist URLs (6 links) likely 404.** `newmedia.kcrw.com/tracklists/...` has since been restructured. The Anne Litt / KCRW proof point is too valuable to leave as a dead link — we should grab a working reference from web.archive.org for each, or rewrite to a working KCRW archive page.

5. **Bigcartel store URLs (4) likely dead.** `hunyamunya.bigcartel.com` has almost certainly gone dark. Replace with Shopify / Bandcamp links.

6. **The one `draft` post (ID 932, "Explorer's Volume. #4 incoming...") is empty-slug and no body.** Safe to skip entirely.

7. **The `shop` page (ID 445) is a flat list of purchase links** — many referencing dead services (Google Play, old iTunes URLs). Consider folding into per-release `buy:` frontmatter rather than a standalone `/shop` page. This matches the new spec where Bandcamp/Discogs/Shopify are external.

8. **No home page found in pages.** Current WP serves a "latest posts" homepage via theme config. The new site's `app/page.tsx` drives the homepage from `content/campaigns/current.yml`; nothing to migrate here.

---

## 8. URL redirect map — first pass

Based on the export, the redirect builder (`scripts/redirects-build.ts`) produces at minimum these rules. Full list will be larger once `_wp_old_slug` entries and per-attachment URLs are processed.

```
# Structural cleanup
/artists             → /artists                         (no-op, structure preserved)
/releases            → /catalog                         (old slug, mis-titled "Contact")
/releases-2          → /catalog                         (the real releases page)
/discography         → /catalog
/shop                → /catalog?buy=1                   (or 301 to primary Bandcamp)
/press               → /press
/contact             → /contact

# Artists
/rykard              → /artists/rykard
# ... every parent=12 page keeps /artists/{slug} pattern

# News — WordPress default is /%postname%/ ; confirm with sample:
/{post-slug}/        → /news/{post-slug}
# The actual permalink structure is stored in options table, not in WXR. Claude Code
# must either probe 3–5 live news URLs with the read-only login, or default to the
# `/?p={id}` pattern WP uses as fallback. Suggest: probe then write the rule.

# Feeds
/feed/               → /rss.xml
/comments/feed/      → 410

# Attachments (from media-manifest)
/wp-content/uploads/{path}         → https://media.hunyamunyarecords.com/legacy/{path}
```

---

## 9. Spec addenda (changes to `hunyamunyarecords-rebuild-v1.md`)

These deltas are applied in the updated spec:

1. **Drop the "custom post type" assumption.** The importer classifies by `post_type + post_parent` + slug list, not by a non-existent CPT.
2. **Release catalog is seeded from `/discography` page content**, not extracted algorithmically from news. Releases that only appear in news posts (the Explorers series, singles, EPs) are drafted by the importer and flagged for Evan's final pass.
3. **Artist tier defaults to `archived` for everyone except Rykard (`anchor`).** Evan promotes others to `active` manually.
4. **Portfolio-theme custom fields (`port_*`, `photo_*`, `front_*`) are explicitly mapped** rather than ignored, so artist pages preserve their hero/portrait imagery.
5. **No ACF plumbing needed.** Removes a chunk of complexity from the importer.
6. **The repo URL is locked:** `github.com/evanatpizzarobot/hunyamunya.git`. Both the site and Beacon live in this one repo using a monorepo layout: `/site` for Next.js, `/beacon` for FastAPI + React. See updated specs for structure.

---

## 10. Ready-to-execute handoff checklist for Claude Code

Before Claude Code starts the migration scripts, confirm:

- [x] WP XML export received (`hunyamunyarecords.WordPress.2026-04-22.xml`) and inventoried (this doc)
- [x] Release catalog seed list extracted from `/discography`
- [x] Artist roster list extracted from `parent=12` pages
- [x] Shortcode and embed transformation map defined
- [x] Media scope sized (114 originals, ~60MB)
- [x] Known flags documented for manual review (§7)
- [ ] Read-only WP login delivered separately — needed for `wp-verify.ts` and optional `port_*` image field extraction
- [ ] Evan confirms repo layout: monorepo `/site` + `/beacon` vs. two separate repos
- [ ] Evan confirms: auto-rename `catnip-claws-2` → `catnip-claws` on import (y/n)

**Nothing in the export blocks Week 1 of the site-rebuild plan.** The importer can start immediately and Evan resolves `_review/` flags as they surface.
