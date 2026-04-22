# Decisions log

Append-only record of in-flight decisions that modify or extend Cowork's specs. When Cowork ships a spec update (v2+), decisions here should either be folded into the new spec or retained here as overrides.

Format: `## YYYY-MM-DD — short title`, then context, decision, rationale, spec sections affected.

---

## 2026-04-22 — Cowork spec v1 em-dash policy

**Context:** global user policy (`~/.claude/CLAUDE.md`) bans em-dashes and double hyphens in user-facing writing as an anti-AI-detection measure. Cowork's specs (`docs/specs/migration-dry-run.md` and `docs/specs/rebuild-v1.md`) are full of both.

**Decision:** Cowork's specs are preserved verbatim in `/docs/specs/` as historical artifacts of the planning phase; they are internal planning docs and not user-facing content. All NEW writing on this project (code comments, the repo README, decisions log entries, future spec addenda, migrated MDX content bodies, and any UI text) follows the em-dash-free rule strictly.

**Spec sections affected:** none. This is a meta-policy.

---

## 2026-04-22 — Shopify store promoted to top-nav tab

**Context:** Cowork's spec v1 §16 ("out of scope for v1") explicitly excludes on-site e-commerce and treats Shopify as an external per-release buy destination. Evan clarified during scaffolding that the Shopify store (`https://hunyamunya.myshopify.com`) is "a really important part now" and should have a dedicated top-nav entry.

**Decision:** the site header nav gains a top-level "Shop" entry that external-links to `https://hunyamunya.myshopify.com` (open in new tab, `rel="noopener noreferrer"`, visual external-link affordance so users aren't surprised). This coexists with spec §7 per-release `buy.shopify` links on individual release pages.

**Rationale:** physical vinyl, CDs, and merch are a real revenue channel, not a historical footnote. Top-level nav placement communicates that to visitors. On-site checkout is still out of scope; Shopify handles transactions.

**Spec sections affected:** §4 (homepage structure, implicit nav), §7 (catalog, release pages), §16 (scope, clarifies Shopify is first-class external).

---

## 2026-04-22 — Newsletter email capture dropped from v1

**Context:** Cowork's spec v1 §1 (stack, "Email capture: Buttondown or ConvertKit") and §4.4 (homepage "Signal / newsletter" section) assume a newsletter provider and an email-capture widget.

**Decision:** no newsletter in v1. The homepage "Signal" section and any newsletter embed on `/submit` are removed. The homepage layout needs rebalancing so the section below the catalog entry point still feels intentional (probably a press-quote rotator and a link to `/submit` only).

**Spec sections affected:** §1 (stack row "Email capture" is unused), §4 (homepage §4.4 removed or repurposed), §9 (submissions unaffected; demo/sync/press forms stay).

---

## 2026-04-22 — SEO Phase 1 spec arrived; URL pattern for releases changes

**Context:** Cowork issued `docs/specs/seo-audit-phase-1.md`. §2 "Phase A — bake-in" is load-bearing for the MDX rendering layer (route implementations) and must ship with v1, not be retrofitted.

**Key structural deltas from the main rebuild spec:**
1. **Release URL pattern is `/catalog/{catno-slug}`**, not `/catalog/{slug}`. Example: `/catalog/hmr001-arrive-the-radio-beacon`. This is canonical and signals "numbered release on a real label" to crawlers. Release pages without a catalog number (digital-only inferred from news) use just `{slug}`.
2. **News URL pattern is `/news/{yyyy}/{slug}`** with year in the path, not `/news/{slug}`.
3. **Required frontmatter additions** (to be rolled into `lib/schema.ts` Zod schemas when route work starts): `seoTitle`, `metaDescription`, `ogImage` (top-level, not nested under `seo`). Artist schema gains: `yearsActive`, `shortBio`, `fullBio`, `externalLinks`, `press`. The existing `seo.*` nested block can coexist or migrate.
4. **JSON-LD factories:** build `lib/jsonld.ts` (new file — `lib/schema.ts` is already Zod) with typed factories for Organization (MusicLabel), MusicGroup, MusicAlbum, Article, BreadcrumbList. Compose into a shared `<SEO>` component.
5. **Sitemap** at `/sitemap.xml` generated from MDX union with `<lastmod>` from frontmatter `updatedAt` (fall back to date). Single sitemap until >1000 URLs.
6. **robots.txt:** allow-all, sitemap pointer, no AI scraper blocks.
7. **Lighthouse CI** added to the deploy workflow, fail build if any page scores <90 on Perf/A11y/SEO.

**Rationale:** retrofitting SEO primitives onto a built site costs 10× what baking them in does. Phase A items are "cheap now, expensive later."

**Spec sections affected:** main rebuild-v1 §2 (URL structure, router shape), §3 (frontmatter schemas gain SEO fields), §10 (SEO + schema — superseded/extended). Hosting addendum is unaffected.

**Open items for Evan** (from SEO spec §7, for when they come up):
- Analytics: Plausible vs GA4 (SEO spec recommends Plausible). STILL OPEN.
- Discogs label ID: for schema sameAs. STILL OPEN.
- Social handles: Instagram / Facebook / Bandcamp for footer + Organization schema. STILL OPEN.
- About page: Evan to draft, or accept a first draft from Cowork. STILL OPEN.
- YouTube channel: exists? STILL OPEN.
- 23-year anniversary angle for launch copy. STILL OPEN.

---

## 2026-04-22 — Three _review files resolved (deletes + redirects)

Evan's decisions on the three `site/content/_review/` files emitted by the first wp-import run:

1. **`misc-page-1052-tim-fretwell.mdx`** (orphan page, post_id 1052, parent=0, slug `tim-fretwell`). Inspect body first; if it duplicates the canonical `/artists/tim-fretwell`, delete and add a 301 from `/?page_id=1052` to `/artists/tim-fretwell`. If unique content, merge into the canonical artist page's frontmatter/body, then delete + 301. Either way: does not survive as its own file.

2. **`page-14-releases.mdx`** (page id 14, mis-titled "Contact" at slug `/releases`). Delete. Body is the legacy CF7 form embed; not useful as content. No extra 301 needed (`.htaccess` already maps `/releases` → `/catalog`). Grep the form embed first for any field names or copy that should mirror onto the new `/contact` route; likely nothing worth keeping, but 30 seconds to check.

3. **`page-16-releases-2.mdx`** (page id 16, titled "Releases" at slug `/releases-2`). Delete. Content already extracted into the release seed list. No extra 301 needed (`.htaccess` already maps `/releases-2` → `/catalog`).

**Inspection results (for the record):**
- **1052 tim-fretwell orphan:** duplicate of canonical `/artists/tim-fretwell`. Same image, same YouTube embed, same bio text (canonical has better editorial polish). No merge needed; straight delete + 301. Adding two redirect rules to redirects-build: `/?page_id=1052` → `/artists/tim-fretwell` and `/tim-fretwell` (bare top-level slug) → `/artists/tim-fretwell`.
- **14 Contact form:** only substantive copy on the page is the line "If your submitting a demo, please include contact info, and a direct link. Thank you." The rest is the CF7 shortcode. Saving the subheading copy here for when `/contact` is built: suggested cleaned version is "If you're submitting a demo, please include contact info and a direct link. Thank you." No 301 needed beyond the existing `/releases` → `/catalog` rule.
- **16 Releases:** body is the HMR001-HMR010 + CD list already transcribed into the release seed data. Nothing to salvage.

**wp-import follow-ups from this decision:**
- Stop emitting these three items to `content/_review/`. Once Evan's decision is encoded, further wp-import runs shouldn't resurrect them.
- Add a `--force` safety to wp-import: if any target content dir is non-empty and `--force` isn't passed, bail with a clear error. Cheap insurance against accidentally nuking manual edits.
- Document the one-shot policy in `site/migration/README.md`: wp-import wholesale rewrites content dirs by design, further edits after the migration review phase are direct-to-MDX.

---

## 2026-04-22 — Cloudflare out, NetActuate Apache in (supersedes earlier CF decisions)

**Context:** Cowork issued `docs/specs/hosting-addendum.md` mid-scaffold. It supersedes §1, §8.3, §8.6, §9, and §13 of the main site spec. The new site replaces the existing WordPress install on the same cPanel account at the same IP (162.223.15.199), so DNS, MX, SPF, DMARC, and Google Workspace email are all untouched.

**Decision:** hosting stack is:
- **Host:** NetActuate cPanel Apache, docroot `/home/hmrecords/public_html/`.
- **Build:** Next.js static export (`output: 'export'`, `images.unoptimized: true`, `trailingSlash: false`).
- **Deploy:** GitHub Actions on push to `main` builds `site/` and force-pushes the `site/out/` tree to a `deploy` branch. cPanel Git™ Version Control pulls the `deploy` branch into `public_html_new`, then Evan manually renames folders to cut over.
- **Media:** pre-optimized by `media-rehost.ts` with `sharp` into AVIF + WebP + original at widths 240/480/960/1440, written to `site/public/media/legacy/{YYYY}/{MM}/...`, committed to `deploy` branch, served by Apache directly from `/media/...`.
- **Forms:** PHP endpoint at `site/public/api/contact.php` on the VM (honeypot + timing check + file-based rate limit). Sends via PHP `mail()` to `evan@hunyamunyarecords.com`; logs JSON to `/home/hmrecords/submissions/{intent}/{YYYY}/{MM}/{uuid}.json`.
- **Clean URLs + 301s:** Apache `.htaccess` at `site/public/.htaccess`. The legacy 301 map is generated by `redirects-build.ts` into a `BEGIN REDIRECTS` / `END REDIRECTS` block inside that file.

**Out, as of this decision:** Cloudflare Pages, Cloudflare R2, Cloudflare Pages Functions, Turnstile, Resend, Buttondown/ConvertKit, WP Application Password (the importer uses the XML; permalink pattern is confirmed via a single unauthenticated `curl -I`).

**Also confirmed in the addendum:** no analytics in v1 (newly added; previously open).

**Rationale:** the original spec assumed a full Cloudflare stack. NetActuate is where all Evan's music-related domains already live; cutover is a cPanel folder rename rather than a DNS change. Smaller ongoing ops surface, fewer third-party contracts, cheaper.

**Spec sections affected:** main spec §1 (stack table), §8.3 (media rehost), §8.6 (cutover), §9 (form anti-spam), §13 (env vars). Read `docs/specs/hosting-addendum.md` for the authoritative replacement text; the main `rebuild-v1.md` is intentionally left as-is so the delta remains visible.

**Note on the addendum paste:** Evan's paste of the addendum had a visual duplication of §2-§5 (copy/paste artifact). The committed version in `docs/specs/hosting-addendum.md` is the deduplicated clean version. If Cowork's upstream source differs, replace with upstream.

---

## 2026-04-22 — Media CDN on subdomain (SUPERSEDED)

**Superseded by:** the 2026-04-22 NetActuate pivot above. Media is served from `/media/...` on the root domain, not a subdomain.

Original context preserved for audit:

**Context:** Cowork's spec §13 env var `R2_PUBLIC_URL=https://media.hunyamunyarecords.com` and §17.7 open question.

**Decision:** use `media.hunyamunyarecords.com` (CNAME to R2 custom domain). Not `/media` path on main domain via Workers.

**Rationale:** cleaner caching story, easier to swap media backends later without touching app code, matches spec's presumed default.

**Spec sections affected:** §1, §13. Requires a DNS record when Evan sets up R2.

---

## 2026-04-22 — No artist ever delisted, ever

**Context:** Cowork's spec §17.3 asked whether any artists should be removed entirely.

**Decision:** no. Every artist who has ever released on Hunya Munya Records stays on the site. Archived tier renders leaner, but the artist page still exists at `/artists/{slug}` and remains indexable.

**Rationale:** the label's identity is as a 20-year archive. Preserving the roster, even for artists inactive for 10+ years, is a values commitment, not a pragmatic choice. This rule takes precedence over any future "clean up the roster" request unless Evan explicitly reverses it.

**Spec sections affected:** §6 (artist tiers), §8.2 (classification rules). Also binds future migration/import scripts: if an artist's data is sparse, flag for `content/_review/`, never skip.
