# Hunya Munya Records — SEO & Content Hub Strategy (Phase 1)

**Status**: Draft, spec master: Claude (Cowork). Pairs with `hunyamunyarecords-rebuild-v1.md` and `hosting-addendum.md`.
**Repo**: `github.com/evanatpizzarobot/hunyamunya.git` → `/site`
**Audience**: CC (for bake-in during v1 build) + Evan (for post-launch audit + content work) + Beacon (for press/backlink integration).

---

## 0. Framing

Evan's ask:
> "Massive SEO audit, refine the entire site to be an SEO and content hub for Hunya Munya Records, the artists like Rykard and others to find us. Especially for ambient electronic music, all related electronic music, indie boutique label from Los Angeles."

The right way to do this is **three phases, not one audit**:

| Phase | When | Who | Goal |
|---|---|---|---|
| **A. Bake-in** | During v1 build (now) | CC | Every SEO primitive that's cheap now and expensive later ships with launch. |
| **B. Baseline audit** | Month 1 post-launch | Evan + Claude | Measure reality, fix crawl/index gaps, establish metric baselines. |
| **C. Content hub** | Month 2+ ongoing | Evan + Beacon | Keyword targeting, content calendar, internal + external link building. |

Retrofitting Phase A onto a built site costs 10× more than shipping it correctly once. That's why this doc exists *before* launch, not after.

---

## 1. Positioning & Target Keywords

### 1.1 Brand identity (what we're signaling)

Hunya Munya Records is an **independent ambient electronic music label from Los Angeles**, founded **2003**, with a **15+ year vinyl catalog** and a roster spanning ambient, electronic, experimental, and adjacent genres. Notable lineage: Rykard ("North Cormorant Obscurity" — 25M+ Pandora plays), "Arrive the Radio Beacon," and a full vinyl-first release catalog (HMR001–HMR010 + CD full-lengths).

Every page on the site should reinforce at least two of these signals: **ambient/electronic**, **Los Angeles**, **independent/boutique**, **since 2003**, **vinyl/physical-first**.

### 1.2 Keyword tiers

**Tier 1 — Branded (should rank #1-3 within 6 months; if not, something is broken)**
- hunya munya records
- hunyamunya / hunya munya
- rykard + [album name] (per-release)
- [artist name] + hunya munya (per-roster-artist)

**Tier 2 — Core niche (realistic target: page 1 within 12 months)**
- ambient electronic record label
- independent ambient record label
- los angeles electronic music label
- boutique electronic label
- los angeles ambient music
- indie record label los angeles
- ambient record label usa

**Tier 3 — Long-tail content (target: incremental organic traffic, dozens of these)**
- ambient music label since 2003
- indie electronic vinyl label
- experimental ambient vinyl releases
- "rykard" + [descriptor: ambient, drone, electronic, etc.]
- per-artist long-tail combinations (Beacon will help surface these)
- per-release descriptive queries ("[album name] vinyl", "[album name] ambient", etc.)

**Tier 4 — Editorial / discovery (organic via content hub)**
- Genre essays ("what is ambient electronic", "los angeles ambient scene")
- Label retrospectives (15-year anniversary, vinyl discography chronologies)
- Artist interviews
- Release liner notes / production notes

### 1.3 What we are NOT chasing

- "record label" (unwinnable)
- "electronic music" (unwinnable)
- "ambient music" (unwinnable head term — but winnable in combination: "ambient record label", "ambient label los angeles", per-artist ambient queries)
- Anything that would require us to become a news publisher (we are a label, not Pitchfork)

---

## 2. Phase A — Bake-In (ships with v1)

This section is **load-bearing for CC**. Every item here must be in the v1 build, not deferred.

### 2.1 URL structure (final)

| Route | Path pattern | Notes |
|---|---|---|
| Home | `/` | Label identity, latest releases, featured artists |
| Artists index | `/artists` | Roster grid |
| Artist page | `/artists/{slug}` | Per-artist hub |
| Catalog index | `/catalog` | Full discography, filterable |
| Release page | `/catalog/{catno-slug}` | e.g., `/catalog/hmr001-arrive-the-radio-beacon` — **catalog number + slug is deliberate**; it's a stable canonical key and signals "this is a numbered release on a real label" |
| News index | `/news` | Reverse-chron |
| News post | `/news/{yyyy}/{slug}` | Year in path keeps URL stable when topic archives grow |
| About | `/about` | Label story, 2003 origin, Los Angeles, mission |
| Contact | `/contact` | PHP form (per addendum) |
| Press | `/press` | Aggregated press coverage (phase C; stub in v1) |

**No trailing slashes.** Already enforced via `.htaccess` (addendum §3).

**No query-string pages indexed.** Catalog filters must use client-side state, not URL params, unless we explicitly want a filter variation to be a separate indexable page (we don't — for now).

### 2.2 `<head>` primitives (every page)

Every route must emit these tags via a shared `SEO` component in Next.js. CC should NOT hand-write these per page — build once, parameterize from page-level frontmatter/props.

**Required on every page:**
```html
<title>{pageTitle}</title>
<meta name="description" content="{metaDescription}" />
<link rel="canonical" href="https://hunyamunyarecords.com{path}" />
<meta name="robots" content="index,follow" />

<!-- OpenGraph -->
<meta property="og:site_name" content="Hunya Munya Records" />
<meta property="og:type" content="{ogType}" />
<meta property="og:title" content="{ogTitle}" />
<meta property="og:description" content="{ogDescription}" />
<meta property="og:url" content="https://hunyamunyarecords.com{path}" />
<meta property="og:image" content="{ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{ogTitle}" />
<meta name="twitter:description" content="{ogDescription}" />
<meta name="twitter:image" content="{ogImage}" />

<!-- Theme -->
<meta name="theme-color" content="#0a0a0a" /> <!-- matches site palette; adjust per final design -->
```

**Title formulas:**

| Page type | Formula | Example |
|---|---|---|
| Home | `Hunya Munya Records — Independent Ambient Electronic Label, Los Angeles` | (exact) |
| Artist | `{Artist Name} — Hunya Munya Records` | `Rykard — Hunya Munya Records` |
| Release | `{Release Title} — {Artist Name} — {CatNo} — Hunya Munya Records` | `Arrive the Radio Beacon — Rykard — HMR008 — Hunya Munya Records` |
| News | `{Post Title} — Hunya Munya Records` | |
| About | `About — Hunya Munya Records` | |
| Catalog | `Catalog — Releases on Hunya Munya Records` | |
| Artists | `Artists — Hunya Munya Records Roster` | |

**Meta description formulas** (150-160 chars, natural prose, not keyword stuffed):

| Page type | Approach |
|---|---|
| Home | Hand-written. Should hit: ambient electronic, Los Angeles, independent, since 2003, vinyl catalog, Rykard + one other notable artist. |
| Artist | Hand-written per artist, from bio frontmatter field `metaDescription`. Fallback: first 155 chars of bio with "—" prefix. Must mention "Hunya Munya Records". |
| Release | Formula: `{Release Title} by {Artist} — {CatNo}, released {Year} on Hunya Munya Records. {Format}. {One-line description from frontmatter}.` |
| News | First 155 chars of article body, sanitized. |
| Catalog | "The complete release catalog of Hunya Munya Records — vinyl and digital releases since 2003 from artists including Rykard, [two more], and more." |

All title/description strings must exist as explicit frontmatter fields so they're reviewable, not auto-generated slop. CC: add `seoTitle` and `metaDescription` to every MDX schema. Auto-fallback if missing, but prefer explicit.

### 2.3 Schema.org / JSON-LD

Inject JSON-LD `<script type="application/ld+json">` blocks in `<head>` on the relevant page types. Use these exact types (Google honors them for rich results):

**Global (every page) — Organization**
```json
{
  "@context": "https://schema.org",
  "@type": "MusicLabel",
  "@id": "https://hunyamunyarecords.com/#organization",
  "name": "Hunya Munya Records",
  "url": "https://hunyamunyarecords.com",
  "logo": "https://hunyamunyarecords.com/logo.png",
  "foundingDate": "2003",
  "foundingLocation": {
    "@type": "Place",
    "name": "Los Angeles, CA, USA"
  },
  "sameAs": [
    "https://hunyamunyarecords.bandcamp.com",
    "https://www.discogs.com/label/[ID]-Hunya-Munya-Records",
    "https://www.instagram.com/[handle]",
    "https://www.facebook.com/[handle]"
  ]
}
```
*Evan: confirm the Discogs label ID and socials; if any don't exist yet, omit them rather than fake.*

**Artist page — MusicGroup**
```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "{Artist Name}",
  "url": "https://hunyamunyarecords.com/artists/{slug}",
  "image": "{hero image absolute URL}",
  "genre": ["Ambient", "Electronic", ...],
  "recordLabel": { "@id": "https://hunyamunyarecords.com/#organization" },
  "sameAs": [... artist's external links ...],
  "album": [
    { "@type": "MusicAlbum", "name": "...", "url": "..." },
    ...
  ]
}
```

**Release page — MusicAlbum**
```json
{
  "@context": "https://schema.org",
  "@type": "MusicAlbum",
  "name": "{Release Title}",
  "byArtist": { "@type": "MusicGroup", "name": "{Artist Name}", "url": "..." },
  "recordLabel": { "@id": "https://hunyamunyarecords.com/#organization" },
  "datePublished": "{YYYY-MM-DD}",
  "catalogNumber": "{HMR###}",
  "albumReleaseType": "AlbumRelease",
  "numTracks": {N},
  "image": "{cover art absolute URL}",
  "genre": [...],
  "track": [
    { "@type": "MusicRecording", "name": "...", "position": 1, "duration": "PT4M32S" },
    ...
  ]
}
```
*If track durations aren't available in the migration data, omit `duration` rather than fake. Position is required.*

**News post — Article**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Title}",
  "datePublished": "{ISO}",
  "dateModified": "{ISO}",
  "author": { "@type": "Organization", "name": "Hunya Munya Records" },
  "publisher": { "@id": "https://hunyamunyarecords.com/#organization" },
  "image": "{hero}",
  "mainEntityOfPage": "{canonical URL}"
}
```

**Every page — BreadcrumbList** (auto-generated from route segments)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hunyamunyarecords.com" },
    { "@type": "ListItem", "position": 2, "name": "Artists", "item": "https://hunyamunyarecords.com/artists" },
    { "@type": "ListItem", "position": 3, "name": "Rykard", "item": "https://hunyamunyarecords.com/artists/rykard" }
  ]
}
```

CC: build a `lib/schema.ts` that exports typed factories (`orgSchema()`, `artistSchema(data)`, `releaseSchema(data)`, `articleSchema(data)`, `breadcrumbSchema(segments)`). Compose into a `<SEO>` component. Validate output against https://validator.schema.org during dev.

### 2.4 Sitemap + robots

**`/sitemap.xml`** — generated at build time from the union of all MDX routes + static routes. Must include `<lastmod>` from MDX frontmatter `updatedAt` (fall back to `publishedAt`). Priority weights:
- Home: 1.0
- Artists index, Catalog index: 0.9
- Artist pages, Release pages: 0.8
- News index: 0.7
- News posts: 0.6
- Everything else: 0.5

Large site won't need an index file — single sitemap is fine until we blow past 1000 URLs.

**`/robots.txt`**:
```
User-agent: *
Allow: /

Sitemap: https://hunyamunyarecords.com/sitemap.xml
```
No disallow rules. No AI-scraper blocks (label benefits from being cited in AI answers; this is a choice, not an oversight).

### 2.5 Images — SEO-critical details

**Every `<img>` must have meaningful `alt` text.** Migration pipeline must:
1. Preserve existing WP alt text where present.
2. For images missing alt, flag in the migration report; Evan fills in batch post-import.
3. Never auto-generate "image1.jpg" as alt. Empty is better than junk (`alt=""` tells screen readers/crawlers to skip).

**Cover art convention:** Every release has a hero cover art image sized 1200×1200 (source-of-truth), rendered responsive via Next.js `<Image>` or pre-generated AVIF/WebP variants from the build pipeline.

**OG image convention:** If a page doesn't have its own hero, fall back to a site-default `/og-default.png` (1200×630, branded). Per-page `ogImage` frontmatter field overrides.

**File naming:** Image filenames should be descriptive: `rykard-arrive-the-radio-beacon-cover.jpg`, not `IMG_4421.jpg`. The migration pipeline should rename from WP's original filenames to `{catno}-{slug}-{role}.ext` for releases and `{artist-slug}-{role}.ext` for artist images. Role = `cover`, `hero`, `press`, etc.

### 2.6 Core Web Vitals — target budgets

Google uses CWV as a ranking signal. These are the bake-in budgets:

| Metric | Target | How enforced |
|---|---|---|
| LCP (Largest Contentful Paint) | <2.0s | Static export + `<Image>` with priority on hero + AVIF |
| CLS (Cumulative Layout Shift) | <0.05 | All images width/height attributes set; no late-injected ads/embeds |
| INP (Interaction to Next Paint) | <150ms | Minimal JS — Next.js App Router with RSC, no heavy client-side state |
| FCP | <1.2s | Server-render + small critical CSS |
| TTFB | <400ms | Apache from NetActuate — should be fine; static HTML |

CC: add Lighthouse CI to the GitHub Actions workflow post-build; fail the build if any page scores <90 on Performance, Accessibility, or SEO.

### 2.7 Internal linking architecture

The single biggest post-launch SEO win is internal linking. Bake the primitives in:

**On every artist page:**
- Link to every release by that artist (auto-generated from release frontmatter's `artist` field)
- Link to 3 related roster artists ("You might also like:") — start with genre-tag overlap; refine post-launch

**On every release page:**
- Link to artist page
- Link to label page (About)
- "More from {CatNo range}" — previous and next catalog release
- "More ambient/electronic/[genre] releases" — filtered catalog links

**On every news post:**
- Link to any artist or release mentioned (migration pipeline should auto-link artist names and release titles in body HTML using a dictionary lookup; flag matches for Evan to confirm)

**Home page:**
- Featured release (most recent or editor's pick)
- 3-5 featured artists
- Latest news
- Explicit link to "Full catalog since 2003" and "All artists" (anchor text matters — these should link to `/catalog` and `/artists` with descriptive text, not "here")

### 2.8 Anchor text hygiene

Every internal link must use descriptive anchor text. Global rule for CC:
- Never use "click here", "read more", "learn more" as the full anchor text
- Artist name, release title, news headline — use those
- For "continue reading" style links (news feed → post), wrap the entire card in the link and let screen readers / crawlers read the headline as the anchor (ARIA `aria-label` on the `<a>` with the headline is fine)

### 2.9 Home page copy — SEO anchor content

The home page needs a visible, crawlable block of text that establishes the label's identity. **Not hidden, not cloaked, just real copy above or within the fold.** Suggested structure (Evan to finalize wording):

> **Hunya Munya Records** is an independent ambient electronic music label based in Los Angeles. Since 2003, we've released [N] vinyl records and digital albums from artists including **Rykard**, [artist 2], [artist 3], and [artist 4] — working across ambient, electronic, and experimental music. Browse the [full catalog](/catalog), meet the [roster](/artists), or read about the [label](/about).

This 60-word block hits: brand name, category (ambient electronic, independent label), location (Los Angeles), founding year (2003), format (vinyl + digital), roster signals (specific names), internal links with keyword-rich anchor text. That's the pattern. We'll audit and refine in Phase B.

### 2.10 About page — label story as SEO foundation

The About page is where we earn the "ambient electronic label since 2003, Los Angeles" authority signal. Evan should write 400-800 words of real prose covering:
- Origin story (2003, Los Angeles, founder story)
- Musical identity / A&R approach
- Milestones (HMR001, anniversary, notable releases, press)
- Current state + what's ahead (2026 Rykard album, etc.)

This is the single page most likely to rank for "Los Angeles ambient label" style queries. It's worth the time to write well.

### 2.11 Artist bios — SEO-friendly structure

Each artist MDX frontmatter must have:
- `name` (display name)
- `slug`
- `genres` (array — drives internal filtering + keyword relevance)
- `yearsActive` (e.g., "2008–present")
- `shortBio` (1 sentence, used on cards + meta fallback)
- `metaDescription` (155 chars, SEO)
- `fullBio` (MDX body — 150-400 words, real prose)
- `externalLinks` (Bandcamp, Spotify, Apple Music, Discogs, socials)
- `press` (array of {source, quote, url, date})

Rykard's bio should explicitly hit: "25M+ Pandora plays on 'North Cormorant Obscurity'", "15-year vinyl anniversary", "Arrive the Radio Beacon," "ambient", "Los Angeles / Hunya Munya Records". These are earned authority signals, not keyword stuffing.

### 2.12 Contact + label info in the footer (every page)

Every page footer should include machine-readable label contact info:
- Label name (text)
- City + country (Los Angeles, CA, USA)
- Contact link
- Social icons with semantic links
- "An independent record label since 2003" tagline

This reinforces Organization schema to crawlers and gives every page a location signal.

---

## 3. Phase B — Post-Launch Baseline Audit

Runs in month 1 after `hunyamunyarecords.com` is live on the new stack.

### 3.1 Instrumentation (set up day 1 post-launch)

1. **Google Search Console** — verify domain, submit sitemap. This is non-negotiable; it's the ground truth for indexation and query data.
2. **Bing Webmaster Tools** — same drill. Cheap to set up, gives Bing + DuckDuckGo data.
3. **Analytics** — recommend **Plausible** (privacy-friendly, lightweight, $9/mo) over GA4 unless Evan has a strong preference. Both work.
4. **Real-user CWV monitoring** — either Plausible's built-in web vitals or a small inline script posting to a PHP endpoint (we have PHP).
5. **Sitemap ping** — automate `curl https://www.google.com/ping?sitemap=...` in the GitHub Actions deploy workflow so Google re-crawls on each deploy.

### 3.2 Crawl + index verification (week 1)

- Crawl the entire site with Screaming Frog (free up to 500 URLs — we'll be under that) or Sitebulb trial.
- Verify every sitemap URL returns 200, no redirect chains, has unique title + description, valid schema.
- Spot-check 10 random pages in Search Console's URL Inspection tool for indexation.
- Check for duplicate content (titles/descriptions). Next.js SSG shouldn't produce any, but migration artifacts might.
- Verify all 301 redirects from `.htaccess` fire correctly (use `curl -I` on legacy URLs).
- Verify no leaked dev/staging URLs in sitemap.

### 3.3 Baseline metrics snapshot (end of month 1)

Record these numbers; they're the comparison set for every future audit:

| Metric | Tool | Baseline |
|---|---|---|
| Total indexed pages | Search Console | |
| Branded queries rank | Search Console (Performance → Queries → filter "hunya") | |
| Top non-branded queries driving impressions | Search Console | |
| CWV pass rate (mobile + desktop) | Search Console → Core Web Vitals | |
| Backlink count + referring domains | Ahrefs Webmaster Tools (free) | |
| Domain Rating / Authority Score | Ahrefs / Moz free tools | |
| Organic sessions / month | Plausible / GA4 | |
| Top landing pages | Plausible | |

Evan: schedule a 30-minute check-in at end of month 1 to review these together.

### 3.4 Technical fixes typically surfaced in baseline (anticipate + address)

- Images missing alt text (flagged during migration; batch fill post-launch)
- Meta descriptions that got auto-generated from poor content (rewrite)
- Orphan pages (no internal links pointing in) — usually artist or news pages that fell out of nav
- Thin content pages (artist pages with 2-sentence bios) — prioritize for content enrichment
- External links to 404s (dead Bandcamp/KCRW/BigCartel URLs already flagged in migration-dry-run — resolve during content cleanup)

---

## 4. Phase C — Content Hub Build-Out

Month 2+ and ongoing. This is where the "SEO hub for Rykard and others to find us" promise actually gets delivered.

### 4.1 Content pillars (3-5 evergreen cornerstones)

Build these out deliberately; they become the site's authority anchors:

1. **"The Hunya Munya Records Story" (label retrospective)** — long-form piece on the 15-year catalog, founder story, scene context. 1500-2500 words. Lives at `/about` or `/about/history`.

2. **"Ambient Electronic Music — A Hunya Munya Perspective"** — genre explainer with specific examples from the catalog. Ranks for "what is ambient electronic music", "ambient electronic artists", etc. 1200-1800 words.

3. **"Rykard Deep Dive"** — not just a bio, but a long-form piece including "Arrive the Radio Beacon" production notes, the "North Cormorant Obscurity" Pandora story, upcoming 2026 album context. 1500-2000 words. Lives at `/artists/rykard/story` or similar.

4. **"The Hunya Munya Vinyl Catalog — Complete Guide"** — a curated walkthrough of HMR001–HMR010+, one paragraph per release, with links to each release page. Ranks for "hunya munya discography" and long-tail release queries.

5. **"Los Angeles Ambient Music Scene"** — essay placing the label in its geographic/scene context. Evan is the natural voice for this. 1000-1500 words.

### 4.2 Recurring content types (feed the news section)

- **Release announcements** (every time a release ships — news post + linked release page + linked artist page = internal linking gold)
- **Artist spotlights** (pull from the roster — one per month, tied to a new mix, interview, or playlist)
- **Press roundups** (quarterly — "Hunya Munya in the press" — captures backlinks and reinforces authority)
- **Catalog anniversaries** ("10 years of HMR003", etc. — easy to produce, keeps site fresh)

### 4.3 External signals — the backlink work (Beacon integration)

Beacon (phase 1 spec) already has an outlet DB and coverage tracking. Extend it with SEO-focused fields:

- Outlet's Domain Rating (DR) / Authority Score — pull via Ahrefs API if Evan wants to pay, or manually at first
- Dofollow vs. nofollow on captured coverage links
- Anchor text used in the external link (critical — anchor text diversity is a real ranking factor)

**Non-Beacon external-signal targets:**
- **Discogs** — ensure every release is in the Hunya Munya Records label page; Discogs passes link juice and drives discovery
- **MusicBrainz** — same; feeds into iTunes, Spotify metadata
- **Bandcamp** — label page should link back to hunyamunyarecords.com prominently; each release page should too
- **Wikipedia** — only if we can meet notability criteria. Rykard + 25M Pandora plays might qualify; the label itself would need to reach a citation bar. Don't force it.
- **Last.fm, RateYourMusic** — supplementary; driven by fans more than us, but we can seed
- **YouTube label channel** — embed previews or full releases with description boxes linking to the release page. YouTube SEO is its own discipline; worth a separate mini-spec if Evan wants to invest.

### 4.4 Keyword tracking (ongoing)

Pick 20-30 target queries across Tiers 1-3, track weekly ranks. Options:
- **Ahrefs Webmaster Tools** (free — limited but useful)
- **SerpRobot / Accuranker** (paid — more precise)
- **Search Console** (free — use as ground truth for clicks/impressions, not rank)

Document the query list in a spreadsheet; Beacon can eventually track this natively.

### 4.5 Integration with Beacon

Beacon (phase 1) already tracks campaigns, outlets, pitches, coverage. Phase 2 extensions that make it an SEO tool too:

- **Backlink tracker** — parse coverage URLs, extract all external links back to hunyamunyarecords.com, record anchor text + dofollow status
- **SERP position monitor** — daily check of target queries, alert on rank changes
- **Content gap analyzer** — compare our pages against top-ranking competitors for target queries, surface missing subtopics
- **Internal linking suggester** — scan new content, suggest existing pages to link to based on keyword overlap

These are Phase 2/3 for Beacon. Flagged here so Beacon's phase 1 data model doesn't paint itself into a corner (it already won't — Coverage and Outlet are generic enough).

---

## 5. Priority + Rollout

| Priority | Item | Owner | When |
|---|---|---|---|
| P0 | All of §2 (Phase A bake-in) | CC | During v1 build — nothing defers |
| P0 | About page real copy (§2.10) | Evan | Before launch |
| P0 | Home page anchor copy (§2.9) | Evan | Before launch |
| P0 | Artist bios — at minimum Rykard + top 3 actives with full bios | Evan | Before launch |
| P1 | Search Console + Plausible + sitemap ping | Evan + Claude | Launch day |
| P1 | Crawl + index verification | Claude | Week 1 post-launch |
| P1 | Baseline metrics snapshot | Claude | End of month 1 |
| P2 | Content pillar #1 (label retrospective) | Evan | Month 2 |
| P2 | Content pillar #3 (Rykard deep dive) | Evan + Rykard | Month 2 (aligned with 2026 album campaign) |
| P2 | Discogs / MusicBrainz audit + completeness pass | Evan | Month 2 |
| P3 | Remaining content pillars | Evan | Months 3-6 |
| P3 | Beacon SEO extensions (§4.5) | CC | After Beacon Phase 1 ships |

---

## 6. Success Criteria (12-month)

- **Branded:** Ranking #1-3 for "hunya munya records" and all artist-name + "hunya munya" combinations.
- **Core niche (Tier 2):** At least 3 of the Tier 2 queries ranking in top 20; 1 in top 10.
- **Traffic:** 3-5× the organic traffic baseline established at end of month 1.
- **Backlinks:** +25 new referring domains (Beacon will earn most of these as a side effect of the PR work).
- **Indexation:** 100% of sitemap URLs indexed in Search Console with no crawl errors.
- **CWV:** All pages pass Core Web Vitals (green) on both mobile and desktop.

These are realistic-but-ambitious targets for a boutique label site with strong content. They're not promises — SEO is partially outside our control (algorithm changes, competitor moves) — but they're what success looks like if we execute.

---

## 7. Open Questions for Evan

1. **Analytics:** Plausible ($9/mo, privacy-friendly) or GA4 (free, Google)? Strong lean toward Plausible for this use case unless you already use GA4 elsewhere.
2. **Discogs label ID:** Confirm the Discogs URL for Hunya Munya Records so we can cite it in schema `sameAs`.
3. **Social handles:** Final Instagram / Facebook / Bandcamp handles to hardcode into the Organization schema + footer.
4. **About page:** Do you want to draft this yourself, or would a rough first draft from me (based on the conversation history — 2003, Los Angeles, ambient electronic, Rykard, vinyl catalog) help you iterate faster?
5. **YouTube:** Is there an existing Hunya Munya Records YouTube channel, or a separate mini-push worth doing?
6. **Anniversary angle:** 2003 → 2026 is **23 years**. There's a natural anniversary content angle (even more so at 25 in 2028). Worth playing up in launch copy?

---

## 8. Changelog

- **2026-04-22** — Initial draft. Paired with main site rebuild spec + hosting addendum + Beacon phase 1.
