# hunyamunyarecords.com — Rebuild Spec v1

**Owner:** Evan Rippertoe (Hunya Munya Records)
**Built by:** Claude Code
**Date:** 2026-04-22
**Status:** Ready to execute — WP export received and inventoried (see `migration-dry-run.md`)
**Repo:** https://github.com/evanatpizzarobot/hunyamunya.git (monorepo — this project lives in `/site`)
**Delivery target:** Working staging URL + full migration within 2 weeks

---

## 0. Why this exists

hunyamunyarecords.com is a 20+ year-old WordPress site with a full roster of 15+ ambient/electronic artists and a deep release archive. It is currently visually dated and chronically exposed to WordPress-specific attack surface (wp-login brute force, plugin CVEs, comment spam, theme vulns). The goal is:

1. **Get off WordPress entirely.** No PHP runtime, no admin panel, no database on the public web, nothing to hack.
2. **Preserve every piece of existing content.** Artists, releases, news posts, media, slugs, and internal links must all survive the migration. Google rank and backlinks must carry over via a 301 map.
3. **Redesign around a hybrid architecture** — current roster and active campaigns up front, full archive deep but explorable. Closer in feel to Warp, Kranky, Ghostly International, Thrill Jockey than a generic band/label template.
4. **Make the homepage re-skinnable for active campaigns** without touching code. First real campaign: Rykard's upcoming album.
5. **Route submissions and press to evan@hunyamunyarecords.com** cleanly, with enough structure to feed Beacon (see companion spec) later.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | Matches VR.org and DramaRadar stacks Evan already runs. SSG + ISR out of the box. |
| Styling | **Tailwind CSS v3** + CSS variables for theming | Matches existing projects. Fast iteration on design passes. |
| Content | **MDX files in repo** (`/content/{artists,releases,news,pages}`) with gray-matter frontmatter | No DB, no CMS. Git is the backup. Full-text searchable in IDE. |
| Media | **Cloudflare R2** (large assets) + `/public` (under ~500KB assets) | R2 free egress to Cloudflare Pages. Keeps repo lean. |
| Hosting | **Cloudflare Pages** | Free tier plenty. Edge CDN. Zero cold starts. |
| Forms | **Cloudflare Pages Functions** → Resend API → `evan@hunyamunyarecords.com` | No third-party form provider. Submissions also write JSON to R2 for Beacon ingest. |
| Analytics | **Cloudflare Web Analytics** (privacy-friendly, free) + **Plausible** optional | No GA. Lighter page weight, no cookie banner needed. |
| Search | **Pagefind** (client-side, static) | Zero-infra full-text search built at compile time. Perfect for archive. |
| Embeds | Native iframes for Bandcamp, Spotify, SoundCloud, YouTube | Lazy-loaded, respect reduced-motion. |
| Email capture | Buttondown or ConvertKit, embedded form | Archive of past emails preserved where possible. |

**Not used:** Vercel (Cloudflare Pages is cheaper and matches VR.org). No headless CMS — MDX is the CMS. No Contentful/Sanity/Payload. Revisit only if Evan hires editors who don't use git.

---

## 2. Repo structure

Lives at `github.com/evanatpizzarobot/hunyamunya.git` under `/site`. The repo is a monorepo shared with Beacon (see companion spec), with this top-level layout:

```
hunyamunya/                          # repo root
├── site/                            # THIS SPEC — Next.js site
├── beacon/                          # companion spec — FastAPI + React tool
├── .github/workflows/               # shared CI
├── README.md                        # repo orientation
└── .gitignore
```

`site/` itself:

```
site/
├── app/
│   ├── layout.tsx                # Root layout, header, footer, fonts
│   ├── page.tsx                  # Homepage (campaign-driven)
│   ├── artists/
│   │   ├── page.tsx              # Roster index
│   │   └── [slug]/page.tsx       # Artist detail
│   ├── catalog/
│   │   ├── page.tsx              # Release archive grid (filterable)
│   │   └── [slug]/page.tsx       # Release detail
│   ├── news/
│   │   ├── page.tsx              # News index (paginated)
│   │   └── [slug]/page.tsx       # Post detail
│   ├── press/page.tsx            # Press kit + coverage
│   ├── submit/page.tsx           # Demo / press / licensing routing
│   ├── about/page.tsx
│   ├── api/
│   │   └── contact/route.ts      # Form handler → Resend + R2 JSON log
│   ├── robots.ts
│   ├── sitemap.ts
│   └── opengraph-image.tsx
├── content/
│   ├── artists/
│   │   └── rykard.mdx            # Frontmatter + bio MDX
│   ├── releases/
│   │   └── 2026-rykard-[slug].mdx
│   ├── news/
│   │   └── 2026-04-22-album-announce.mdx
│   ├── press/
│   │   └── quotes.yml
│   └── campaigns/
│       └── current.yml           # Homepage campaign config
├── lib/
│   ├── content.ts                # MDX loaders, typed
│   ├── redirects.ts              # 301 map (generated from WP export)
│   ├── schema.ts                 # Zod schemas for frontmatter
│   └── seo.ts
├── components/
│   ├── ReleaseGrid.tsx
│   ├── ArtistCard.tsx
│   ├── Hero.tsx                  # Swaps between campaign and default
│   ├── Player.tsx                # Unified Bandcamp/Spotify/SC embed
│   ├── Filter.tsx                # Artist/year/format/genre facets
│   └── ...
├── scripts/
│   ├── wp-import.ts              # Full WP XML → MDX migration
│   ├── wp-verify.ts              # Diff against live WP (uses login)
│   ├── media-rehost.ts           # Download WP media → R2 + rewrite URLs
│   ├── redirects-build.ts        # Build 301 map from old slugs
│   └── seed-campaigns.ts
├── public/
│   ├── fonts/
│   ├── logo.svg
│   └── ...
├── tests/
│   ├── redirects.test.ts         # Assert every old URL has a target
│   ├── content.test.ts           # Assert every MDX frontmatter validates
│   └── a11y.test.ts              # axe-core on key routes
├── next.config.mjs
├── tailwind.config.ts
├── wrangler.toml                 # Cloudflare Pages config
└── README.md
```

---

## 3. Content model (frontmatter contracts)

All MDX frontmatter is validated by Zod on build. Build fails loudly on schema violations.

### 3.1 Artist (`content/artists/{slug}.mdx`)

```yaml
---
slug: rykard
name: Rykard
status: active              # active | archived
tier: anchor                # anchor | active | archived
genres: [ambient, electronic, modern-classical]
bio_short: "One-sentence bio for cards."
bio_long: |
  Longer bio. Rendered as MDX body below the frontmatter.
hometown: ...
years_on_label: [2009, 2026]
links:
  website: https://...
  bandcamp: https://...
  spotify: https://open.spotify.com/artist/...
  apple: https://...
  instagram: https://...
  discogs: https://...
  contact: evan@hunyamunyarecords.com
hero_image: r2://artists/rykard/hero.jpg
portrait: r2://artists/rykard/portrait.jpg
press_quotes:
  - quote: "..."
    source: "The Wire"
    url: "https://..."
    year: 2011
featured_release: 2010-arrive-the-radio-beacon
seo:
  title: "Rykard — Hunya Munya Records"
  description: "..."
---

MDX body = long-form bio / liner notes / anything.
```

### 3.2 Release (`content/releases/{year}-{artist}-{slug}.mdx`)

```yaml
---
slug: arrive-the-radio-beacon
title: "Arrive the Radio Beacon"
catalog_number: HMR-014
artist: rykard              # references artist slug
artists_additional: []      # for splits/comps
release_date: 2010-03-15
format: [vinyl-12, digital, cassette]   # vinyl-12 | vinyl-7 | vinyl-lp | cassette | cd | digital
genres: [ambient, drone, electronic]
moods: [nocturnal, contemplative, oceanic]
duration_minutes: 47
tracklist:
  - number: 1
    title: "North Cormorant Obscurity"
    duration: "7:42"
    credits: "Written and produced by Rykard."
    isrc: ...
  - number: 2
    title: "..."
credits:
  producer: Rykard
  mastering: ...
  artwork: ...
  photography: ...
  liner_notes: ...
cover_image: r2://releases/arrive-the-radio-beacon/cover.jpg
gallery: [r2://releases/.../1.jpg, r2://releases/.../2.jpg]
embeds:
  bandcamp: "https://hunyamunya.bandcamp.com/album/..."
  spotify: "https://open.spotify.com/album/..."
  apple: "https://music.apple.com/..."
  youtube: "https://..."
buy:
  bandcamp: "https://..."
  discogs: "https://www.discogs.com/release/..."
  shopify: "https://..."           # optional, only if in stock
  boomkat: "https://..."
  rough_trade: "https://..."
press_quotes:
  - quote: "..."
    source: "Boomkat"
    url: "..."
    year: 2010
sync_available: true
status: published          # draft | published | archived | oop (out of print)
featured: false
proof_points:
  - label: "25M+ Pandora plays"
    value: 25000000
    source: "Pandora Artist Analytics"
    year_through: 2026
seo:
  title: "Arrive the Radio Beacon — Rykard | Hunya Munya Records"
  description: "..."
  og_image: r2://releases/.../og.jpg
---

Liner notes. MDX body.
```

### 3.3 News (`content/news/{YYYY-MM-DD}-{slug}.mdx`)

```yaml
---
slug: rykard-north-cormorant-15-year-vinyl
title: "Rykard — North Cormorant Obscurity 15-Year Vinyl Edition"
date: 2025-xx-xx
author: Evan Rippertoe
excerpt: "..."
hero_image: r2://news/.../hero.jpg
tags: [rykard, vinyl, anniversary]
related_releases: [2025-rykard-north-cormorant-15yr]
related_artists: [rykard]
---

MDX body.
```

### 3.4 Campaign (`content/campaigns/current.yml`)

Drives the homepage hero and "Now" section. Evan edits this when campaigns swap.

```yaml
active:
  id: rykard-album-2026
  type: pre-release          # pre-release | release | tour | reissue | none
  artist: rykard
  release: 2026-rykard-[tbd]   # leave null until announce
  headline: "Rykard — new album, autumn 2026"
  tagline: "A return to the lineage of Arrive the Radio Beacon."
  hero_media:
    type: image              # image | video | loop
    src: r2://campaigns/rykard-2026/hero.jpg
    poster: r2://campaigns/rykard-2026/hero-poster.jpg
  cta_primary:
    label: "Join the mailing list"
    href: "#subscribe"
  cta_secondary:
    label: "Listen: Arrive the Radio Beacon"
    href: "/catalog/arrive-the-radio-beacon"
  proof_points:              # shown as small stats row on hero
    - "25M+ Pandora plays"
    - "15 years in cult rotation"
    - "First new album since HMR-014"
  active_from: 2026-04-22
  active_until: null
  palette_override:
    accent: "#c9a36b"         # campaign can override global accent
    bg: "#0b0c0f"
fallback:
  headline: "Hunya Munya Records"
  tagline: "Ambient and electronic music since 2003."
  hero_media:
    type: loop
    src: r2://home/default-loop.mp4
```

---

## 4. Homepage — hybrid architecture

Structure top-to-bottom:

1. **Hero** — driven entirely by `campaigns/current.yml`. When a campaign is `active`, hero reads from it. When null, fallback. Two visual states must both feel intentional.
2. **Now** — currently active artists (grid of ~3–6 cards, only `tier: active` or `anchor`), plus "Latest" (2 most recent news items).
3. **Catalog entry point** — a single, typographic "20 years, N releases — explore the catalog" block that links to `/catalog`. Teases 4 random-but-stable featured releases (seeded-random per day so it's stable within a day).
4. **Signal / newsletter** — unobtrusive email capture, quote from a well-known outlet (rotating), link to `/submit`.
5. **Footer** — full site map, social, legal, contact.

The design system must survive the campaign swap without breaking. Hero is the only section that changes dramatically between campaigns; everything below stays structurally identical.

---

## 5. Design direction

**Mood:** archival, music-first, slightly nocturnal, unashamedly literary. Reference labels visually: Warp (density), Kranky (restraint), Ghostly (system), Thrill Jockey (warmth). Not: generic band site, not dark-mode-for-dark-mode's-sake, not overbuilt motion.

**Type:**
- Display: a serif with character — `GT Sectra`, `Tiempos Headline`, or free alternative `Fraunces` (variable).
- Body: a geometric or grotesk — `Inter`, `GT America`, or free alternative `IBM Plex Sans`.
- Mono (credits, catalog numbers): `JetBrains Mono` or `IBM Plex Mono`.
- Default to free alternatives; Evan can license later if he wants.

**Color (baseline; campaigns can override accent + bg):**
- `--bg`: `#0d0d0f` (near-black, warm)
- `--bg-elevated`: `#17181b`
- `--fg`: `#ece9e2` (warm off-white)
- `--fg-muted`: `#9a958b`
- `--accent`: `#c9a36b` (old-gold / brass — replace if Evan has an existing brand color)
- `--border`: `#2a2a2e`

**Motion:** minimal. Page transitions are instant. Hover states are subtle underline/opacity shifts. Hero video autoplays muted, pauses off-screen, respects `prefers-reduced-motion`.

**Density:** generous line-height, catalog grids breathe, artist pages lean longform. Think "liner notes" not "dashboard."

Evan's collaborator Carly (if in the loop) should get the first comp round before any code ships past scaffolding. Have a `/design-preview` route with the key components on one page for review.

---

## 6. Artist pages — tiered

### 6.1 Tier: anchor (currently: Rykard)
- Full hero with portrait or landscape art
- Long bio rendered from MDX body
- Full discography (chronological, newest first, with covers)
- Active campaign callout if any
- Press quotes carousel
- Proof points band (plays, awards, notable placements)
- Streaming/social links prominent
- Dedicated "Work with Rykard" contact CTA (sync, booking, interviews) routed to `evan@hunyamunyarecords.com`

### 6.2 Tier: active
- Same structure as anchor, slightly less real-estate; no proof-points band by default (opt-in via frontmatter)
- Still full-service page

### 6.3 Tier: archived
- Leaner. Bio, HMR discography, "where to find them now" links, press quotes from the era. Still feels curated. No "currently working with Hunya Munya" framing; tone is "part of our 20-year story."
- Same URL pattern — tier only affects rendering, never routing — so archived artists are not buried or hidden from search engines.

---

## 7. Catalog / release archive

**Route:** `/catalog`

**Layout:** responsive grid of release covers with catalog number + artist + title + year below each. Newest first by default.

**Filters (URL-driven so they're linkable/shareable):**
- Artist (multi-select)
- Year (range or decade)
- Format (vinyl-12 / vinyl-7 / LP / cassette / CD / digital)
- Genre (multi-select from a closed list populated from releases)
- In-print only (toggle)

**Sort:** newest, oldest, A–Z artist, catalog number.

**Search:** a search box at the top of the catalog page wired to Pagefind. Queries return releases, artists, and news.

Each release card links to `/catalog/{slug}`. Release page includes: cover + gallery, full tracklist with durations/credits, streaming embeds (the Player component picks the best embed given what's available), buy buttons (external — Bandcamp/Discogs/Boomkat/etc.), press quotes, liner notes (MDX body), related releases by same artist.

---

## 8. WordPress migration — the hard part

This is where the project either succeeds quietly or fails loudly. Treat it as a dedicated phase.

### 8.1 Inputs from Evan
- `hmr-wp-export.xml` (Tools > Export > All Content in WP admin)
- Read-only WP admin login for verification passes and custom-field extraction
- Any brand assets (logo files, historical palette, preferred fonts)

### 8.2 `scripts/wp-import.ts` — what it does

**Context from dry-run (`migration-dry-run.md`):** the export has no custom post types — everything is `page` or `post`. Artist roster is 22 pages under `post_parent=12`. Release catalog is a hand-curated list on the `/discography` page (post_id=79) and a secondary `/releases-2` page (post_id=16). News posts (52 published, 1 empty draft to skip) are standard WP posts. No ACF, no Yoast — only classic All in One SEO Pack postmeta and a handful of portfolio-theme image fields.

1. Parse XML with `fast-xml-parser`. Dump structured JSON to `/migration/raw.json` for auditing.
2. Classify every item per rules in `migration-dry-run.md §1.1`:
   - `post_type=page` with `post_parent=12` → `content/artists/{slug}.mdx` (Rykard gets `tier: anchor`, others `tier: archived` by default)
   - `post_type=page` with `post_id ∈ {14, 16, 79}` → **do not emit as pages**; instead, parse body to seed `content/releases/*.mdx`
   - `post_type=page` with `post_id = 247` → `content/pages/press.mdx`
   - `post_type=page` with `post_id = 445` → fold into per-release `buy:` fields where possible; otherwise `content/pages/shop.mdx` (flag as legacy)
   - `post_type=post` → `content/news/{YYYY-MM-DD}-{slug}.mdx`; cross-reference tags to link `related_releases:`
   - `post_type=attachment` → rehost via `media-rehost.ts`, register in manifest
   - Everything else (`nav_menu_item`, `custom_css`, `wpcf7_contact_form`) → skip
3. Release catalog seeding: parse `/discography` (post 79) body for `HMR{NNN} – {Artist} – {Title}` patterns plus the linked Discogs CD entries. Emit one `content/releases/{slug}.mdx` per hit with `status: draft` for Evan's review. Cross-reference news posts by tag (e.g. tag `night-towers` → `related_news:` on Night Towers release).
4. Preserve postmeta:
   - `_aioseop_title` → `seo.title`; `_aioseop_description` → `seo.description`; drop `_aioseop_keywords`
   - `_thumbnail_id` → resolve via manifest → `hero_image:`
   - `port_*`, `photo_*`, `front_*` portfolio fields → `portrait:` / `hero_image:` on artist pages (9 artists have these)
   - `_wp_old_slug` → append to redirect map
   - `background_color` (3 items) → optional `palette_override.bg` in frontmatter
   - Skip all plugin plumbing: `_oembed_*`, `aktt_*`, `_social_*`, `akismet_*`, `_jetpack_*`, `_wp_page_template`, `_menu_item_*`, `_wp_attachment_metadata`
5. Rewrite Gutenberg blocks and shortcodes per `migration-dry-run.md §4`:
   - `wp:paragraph` / `wp:html` → pass-through
   - `wp:image` / `wp:gallery` / `wp:file` → `<Image/>` / `<Gallery/>` / `<FileLink/>` with R2 URLs from manifest
   - `wp:embed`, `wp:core-embed/youtube`, `wp:core-embed/soundcloud` → route to unified `<Player/>` component by provider
   - `[caption]` → `<figure><img/><figcaption/></figure>`
   - `[youtube]`, `[soundcloud]` → `<YouTubeEmbed/>`, `<SoundCloudEmbed/>`
   - `[contact-form-7 …]` → `<ContactForm form="general"/>`
   - Strip image size suffixes (`-150x150`, `-300x300`, `-1024x605`) from URLs before manifest lookup; Next.js regenerates sizes from R2 original.
6. Normalize slugs. Every original `post_name` is kept in a `legacy_slug:` frontmatter field so we can build the 301 map. Handle known collisions:
   - Dual `/tim-fretwell` pages (IDs 410 + 1052): keep artist at `/artists/tim-fretwell`, put orphan in `_review/`
   - `/catnip-claws-2` (artist page 504): rename to `/artists/catnip-claws` and 301 the `-2` slug (pending Evan y/n — see §17)
   - Pages 14 (`/releases`, mis-titled "Contact") and 16 (`/releases-2`, titled "Releases"): 301 both to `/catalog`; page 14's CF7 embed replaced by `<ContactForm/>` and used on `/contact`
7. Link verification: HEAD-check every external href in migrated content. Known-dead hosts from the export (`hunyamunya.bigcartel.com`, legacy `newmedia.kcrw.com` tracklist URLs) get flagged for `dead-links.md` so Evan can swap in archive.org fallbacks or remove.
8. Generate a migration report: `migration/report.md` with counts (artists found, releases found, news posts, images rehosted, unclassified posts flagged for manual review). Flagged items go to `content/_review/` for Evan to sort.

### 8.3 `scripts/media-rehost.ts`

1. Walk every `<img>`, `<video>`, and `[audio]` URL in migrated content.
2. Download from `hunyamunyarecords.com/wp-content/uploads/...`.
3. For each asset: probe dimensions, strip EXIF, convert to AVIF + WebP + original fallback via `sharp`. Upload to R2 under `media/legacy/{YYYY}/{MM}/{original-name}.{ext}`.
4. Rewrite references in MDX to `r2://...` paths. Next.js `Image` component resolves R2 URLs via a signed CDN origin.
5. Keep a manifest: `migration/media-manifest.json` mapping old URL → new URL. Feeds the redirect builder for hotlinked images.

### 8.4 `scripts/redirects-build.ts`

Produces `public/_redirects` (Cloudflare Pages native 301 file) from:
- Every `legacy_slug` → new canonical URL
- WP category/tag archive URLs → closest new URL (usually `/news?tag=...` or artist page)
- Feed URLs (`/feed/`, `/comments/feed/`) → new RSS at `/rss.xml`
- Media URLs → R2 URLs (via the manifest from 8.3)
- Anything that doesn't map cleanly gets a 410 (gone) rather than a 404 so Google de-indexes cleanly

Every rule is tested in `tests/redirects.test.ts` (it reads `_redirects` and a list of known old URLs from the WP export, asserts each has a defined target).

### 8.5 `scripts/wp-verify.ts`

Uses the read-only WP login to crawl the live site's sitemap, fetch every URL, and compare title + published date + slug against the migrated MDX. Reports any drift. Run this immediately before cutover.

### 8.6 Cutover plan

1. Deploy the new site on `staging.hunyamunyarecords.com` (Cloudflare Pages preview).
2. Evan reviews. Flagged `_review/` items get sorted.
3. Run `wp-verify.ts` one final time.
4. Point DNS (`hunyamunyarecords.com` A/AAAA → Cloudflare Pages).
5. Old WP goes read-only for 30 days as a fallback, then taken down. The DB export is archived in R2.
6. Submit new sitemap to Google Search Console; use the "Change of address" tool only if hostname changes (it doesn't — this is a reskin on the same domain).

---

## 9. Submissions + contact flow

**Route:** `/submit`

A single page with three cleanly separated intents:

1. **Demo submission** (for artists pitching to the label)
2. **Sync / licensing inquiry**
3. **Press / interview request**

Each intent is a short form. All route to `evan@hunyamunyarecords.com` via Cloudflare Pages Function → Resend, AND write a structured JSON record to R2 (`submissions/{intent}/{YYYY}/{MM}/{uuid}.json`). Beacon (Phase 2+) reads this R2 bucket to ingest inbound press requests.

**Anti-spam:** Cloudflare Turnstile (free, no CAPTCHA rage). Rate-limit per IP. Honey-pot field. Reject payloads with links > threshold.

**Fields to collect:**
- Demo: name, artist name, hometown, email, genres (multi), links (Bandcamp/SoundCloud/private), message (500-char cap), RIYL tags
- Sync: company, project title, project type (film/TV/ad/game), usage scope, budget range, track of interest (optional)
- Press: outlet, writer, deadline, angle, requested materials

All stored as normalized JSON so Beacon can query them later.

---

## 10. SEO + schema

- Next.js Metadata API for per-page title/description/og.
- `app/sitemap.ts` auto-generated from content.
- `app/robots.ts` allows all, points to sitemap.
- JSON-LD emitted per page:
  - Homepage: `Organization` + `MusicGroup` (the label itself)
  - Artist: `MusicGroup` with `genre`, `album`, `sameAs` links
  - Release: `MusicAlbum` with `byArtist`, `track`, `datePublished`, `recordLabel`
  - News: `NewsArticle`
- OpenGraph image per page via `opengraph-image.tsx`; releases auto-generate an OG card from cover art + title.
- RSS feed at `/rss.xml` for news (+ an all-releases feed at `/releases.xml` for completists).

---

## 11. Performance budget

All must be met on mobile (simulated 4G Moto G4):

- LCP < 1.8s
- CLS < 0.05
- INP < 200ms
- Total JS < 120KB gzip on homepage
- Images: AVIF primary, WebP fallback, `loading="lazy"` off-screen
- Fonts: `font-display: swap`, subset to needed glyphs, self-hosted (no Google Fonts request)
- Video heroes: poster image inline, video lazy-loads and only plays when in viewport

---

## 12. Accessibility

- WCAG 2.2 AA baseline
- Focus visible on every interactive element
- All embedded players have text alternatives (tracklist links)
- Color contrast 4.5:1 minimum for body text, verified in CI via `axe-core`
- `prefers-reduced-motion` respected everywhere
- Every image has meaningful `alt` (migrated from WP `alt`/`title` or flagged for Evan to fill)

---

## 13. Environment + secrets

```
# .env.local
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=hmr-media
R2_PUBLIC_URL=https://media.hunyamunyarecords.com
RESEND_API_KEY=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
BUTTONDOWN_API_KEY=           # or CONVERTKIT_API_KEY
WP_LEGACY_URL=https://hunyamunyarecords.com   # for migration scripts only
WP_LEGACY_USER=
WP_LEGACY_APP_PASSWORD=       # WP Application Password, not main pw
```

WP creds live in `.env.local` only, never committed. Remove before cutover.

---

## 14. Testing

- `vitest` unit tests for content loaders and schema validation
- `playwright` smoke tests for: homepage renders, artist page renders, release page renders, catalog filters work, submission form posts
- `axe-core` run via Playwright on the 5 most-trafficked routes
- Link checker (`linkinator` or similar) run in CI over the full built site — zero broken internal links allowed before deploy
- Redirect test suite asserts every old slug from the WP export resolves to a live URL

---

## 15. Phased deliverables (for Claude Code)

**Week 1**
- Scaffold repo, deploy empty "coming soon" page to staging subdomain
- Build `wp-import.ts` and run it against Evan's export; produce migration report
- Build `media-rehost.ts` and run it; all legacy media in R2
- Build `redirects-build.ts`; redirect test suite green
- Scaffold all routes with placeholder data rendered from migrated content

**Week 2**
- Final design pass (typography, colors, spacing) — `/design-preview` route for Evan + Carly review
- Homepage with campaign engine (Rykard campaign loaded from `campaigns/current.yml`)
- Artist tier rendering (anchor vs active vs archived)
- Catalog with filters + Pagefind search
- Submission forms + Turnstile + Resend + R2 logging
- SEO metadata, schema.org, sitemap, RSS
- Performance + a11y audit pass
- Cutover rehearsal on staging, then live

**Post-launch (ongoing)**
- Build admin-free content editing flow: Evan edits MDX in a git-based UI (TinaCMS or Keystatic as optional add-on) if he ever wants it. Optional, not required for launch.

---

## 16. Out of scope for v1 (explicit)

- E-commerce on-site. Selling happens on Bandcamp / Shopify / Discogs. The site deep-links; it does not checkout.
- Comments. Nothing to moderate. External discussion happens on Bandcamp/socials.
- User accounts of any kind.
- Multi-language. English only v1.
- Admin UI. Evan (and future editors) edit MDX via git; TinaCMS/Keystatic is a post-launch option.

---

## 17. Questions Claude Code should surface back to Evan during build

These will come up; ask rather than guess:

1. Is there an existing logo SVG we should preserve, or redraw? (Current export includes raster logos only.)
2. The news archive actually starts at 2010-04-14, not 2003 as originally assumed. Oldest published post: "Rykard - Arrive The Radio Beacon" (post_id 20). Earlier pre-2010 label history exists offline and can be added as `/about` / catalog backfill if Evan has source material.
3. Are there any artists from the 22-page roster who should be **delisted entirely** (legal/relationship reasons) rather than archived? Default behavior is: preserve all, mark `tier: archived`, keep in catalog.
4. Auto-rename `catnip-claws-2` → `catnip-claws` on import? (Recommended y.)
5. Is there a Bandcamp "label" account URL to link prominently, or is `rykard.bandcamp.com` the canonical storefront for now? (Shop page 445 only lists artist-specific Bandcamp URLs.)
6. Newsletter provider preference: Buttondown, ConvertKit, or Substack?
7. Domain for media CDN: keep on `hunyamunyarecords.com/media` via Workers, or use `media.hunyamunyarecords.com`?
8. Permalink probe: current WP permalink structure isn't in the XML. Should `wp-verify.ts` probe 3–5 live news URLs with the read-only login to confirm pattern before generating 301s? (Recommended y.)
9. The `/shop` page (ID 445) has a mix of live and dead purchase links. Fold into per-release `buy:` fields (recommended), or preserve as a standalone `/shop` page after link cleanup?

---

## 18. Done definition

- All old URLs 301 to the correct new URL, verified by automated test
- All legacy content present in MDX and rendered, verified by `wp-verify.ts`
- Lighthouse mobile scores: Perf ≥ 95, A11y ≥ 98, SEO ≥ 100
- Evan can swap campaigns by editing one YAML file
- Submission forms post successfully and arrive at evan@hunyamunyarecords.com with proper subject-line routing
- Site is live on hunyamunyarecords.com with no active WordPress instance serving traffic
