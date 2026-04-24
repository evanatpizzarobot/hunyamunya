# Decisions log

Append-only record of in-flight decisions that modify or extend Cowork's specs. When Cowork ships a spec update (v2+), decisions here should either be folded into the new spec or retained here as overrides.

Format: `## YYYY-MM-DD — short title`, then context, decision, rationale, spec sections affected.

---

## 2026-04-23 — Contact page simplified to email-only

**Context:** The `/contact` page previously wrapped a full `ContactForm` React component (`site/components/ContactForm.tsx`) that POSTed to `public/contact-submit.php` (per `docs/specs/contact-form-v1.md`) and redirected to a success route at `site/app/contact/sent/page.tsx`. A v2 migration (`docs/specs/contact-form-v2.md`) was drafted to replace the PHP with a Cloudflare Worker calling the Resend API.

**Decision:** Drop the form entirely. `/contact` now renders a single email display with a hydration-based reveal (`site/components/ContactEmail.tsx`): obfuscated `contact [at] hunyamunyarecords [dot] com` in SSR'd HTML, swapped to a real `mailto:contact@hunyamunyarecords.com` anchor once React hydrates. Retired `ContactForm.tsx`, the `/contact/sent` route, and `contact-submit.php`. `contact-form-v1.md` stays in the repo as historical record; `contact-form-v2.md` stays with a header note marking it superseded and shelved for future reconsideration.

**Rationale:** Label industry standard is direct email. Dropping the form eliminates infrastructure (Worker, Resend API, backend endpoint maintenance, captcha overhead), reduces spam surface, and matches how most visitors prefer to reach indie labels. At current label-scale spam volume, Gmail's default filter handles obfuscation's leakage without operator intervention.

**Reconsider when:** spam volume past Gmail's filter exceeds a few per week, or systematic lead capture becomes a business need. Next step at that point would be Cloudflare Turnstile on `/contact` or a hosted form service (Formspree).

**Spec sections affected:** `contact-form-v1.md` (retired, preserved for history), `contact-form-v2.md` (shelved, header annotated), `rebuild-v1.md` (any §Contact-form references now stale; read in light of this decision), `app/robots.ts` (dropped the `/contact-submit.php` and `/contact/sent` disallow rules since both paths are gone).

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

## 2026-04-22 — Label owner's name is Evan Marcus, not Evan Rippertoe

**Context:** Cowork's early spec drafts referred to the label owner as "Evan Rippertoe" (likely derived from his email `rippertm@gmail.com` and the Windows username `rippe`). I propagated that name into: site copy (About sign-off, news author default), scripts, schema defaults, repo README, and the project memory files. Evan flagged the error when he saw "Evan Rippertoe, founder" on the About page.

**Correction:** his name is **Evan Marcus**. Same person as the Pizza Robot Studios founder named in the global `~/.claude/CLAUDE.md`. He is also the artist credited on HMR003 "Ten Feet From Heaven" (2004) and HMB006 "Re//Rel" (2020).

**Changes applied 2026-04-22:**
- `site/app/about/page.tsx` sign-off corrected.
- `site/scripts/wp-import.ts` `AUTHOR_DISPLAY_NAME` constant corrected (propagates through the 51 news MDX `author:` fields on next regen).
- `site/lib/schema.ts` `newsSchema` `author` default corrected.
- `README.md` owner line corrected.
- Memory files (`spec_v1.md`, `MEMORY.md`) corrected with a note to prevent future sessions from reintroducing the typo.

**Not changed:** Cowork's spec docs in `docs/specs/` (`rebuild-v1.md`, `content-drafts-v1.md`) that originated the typo. Those are historical record of Cowork's drafts, preserved as-is; the sign-off correction here is the authoritative source going forward.

---

## 2026-04-22 — Founding year corrected from 2003 to 2002; positioning tightened

**Context:** Evan's revised footer tagline uses "since 2002." Earlier spec docs (seo-audit-phase-1.md §1.1, hosting-addendum implicit, home anchor copy) said 2003, which was Cowork's assumption from early context. Evan's tagline is authoritative.

**Decision:** the label founding year is **2002**, not 2003. All visible copy and Organization JSON-LD use 2002. Spec documents (`seo-audit-phase-1.md`, `hosting-addendum.md`) are preserved verbatim with their original 2003 mention as historical record; code and content use 2002 going forward.

**Positioning (Evan's footer tagline is the canonical phrasing):** "LA based boutique label & publisher since 2002. Crafting Electronic, Ambient & Chillout for Radio/Film/TV. Plus collectible limited Vinyl & CDs worldwide."

**Derived keyword adjustments** (supersedes SEO spec §1.1):
- "ambient electronic record label" remains a Tier 2 target.
- Add "LA boutique record label", "electronic music publisher Los Angeles", "ambient chillout licensing", "collectible vinyl label Los Angeles" to the Tier 2-3 target list for follow-on SEO work.
- "Radio/Film/TV" positioning opens a sync-licensing angle that wasn't in the original Cowork brief — likely relevant for future /sync or /licensing page copy.

**Spec sections affected:**
- Home hero eyebrow and anchor paragraph: updated.
- Home catalog-entry block: "24 years" (was 23).
- /about hero paragraph and meta description.
- /artists, /catalog, /catalog/{format}, root layout, campaigns/current.yml: all meta and default taglines updated.
- Organization JSON-LD: `foundingDate: "2002"`.

**Not swept:** artist bio MDX bodies that reference 2003 — those are dates in the artists' own histories, not the label's founding year (e.g., "Noel Sanger has been releasing since 2003"). Left alone.

**Context:** Cowork shipped `docs/specs/digital-catalog-discogs.md` listing 18 releases from the Hunya Munya Digital sublabel (HMDIGITAL001-018, 2005-2008) scraped from Discogs label 79509. This is net-new catalog; the parent Hunya Munya Records label (vinyl/CD) is on a different Discogs ID.

**Decisions applied:**
1. **Architecture:** catalog format landings live under `/catalog/{format}` — `/catalog/digital`, `/catalog/vinyl`, `/catalog/cd`. Not top-level, not query-string only. Next.js App Router resolves literal segments before dynamic, so these sibling routes coexist with `/catalog/{catnoSlug}` (release pages) without collision.
2. **Dedupe premise in Cowork spec §5.1 step 5 was wrong.** The 9 "digital-only drafts" from the WP migration (Catnip & Claws Halcyon 2011, Rykard Ictis/Artificial Sunshine/Lansallos/Red Venom 2016-2020, Rykard Explorers Vol. 1-4 2019-2023) are post-HMDIGITAL-era work. They don't overlap with HMDIGITAL001-018 (all 2005-2008, different artists). Preserved both sets. Total catalog: 14 (HMR vinyl + CD) + 9 (Rykard digital) + 18 (HMDIGITAL) = 41 releases.
3. **HMDIGITAL015 (Various Artists compilation) and HMDIGITAL018 (Robert G Roy): classified as `format: ["cd"]`** per Cowork's §6.3 default (physical CDr, not pure digital file).
4. **Duo artists:** Cassino & Labèn, Curtis & Dakota, Habersham & Darius Kohanim, Joel Armstrong & Gobo — both members get individual stub artist pages. Release frontmatter: `artist: "<first-slug>"`, `artists_additional: ["<second-slug>"]`.
5. **Disambiguator cleanup from Discogs:** strip `(3)` suffix from "Gobo", `*` from "DJ Thee-O" and "Curtis & Dakota".
6. **Every digital-era artist gets at least a stub artist page** per Cowork §2.2 default and per Evan's prior archive-preservation rule. Existing artists (Habersham, Darius Kohanim, Evan Marcus, Distant Fragment) retain their current pages; only new names get new stubs.

**Open items from Cowork §6 (still awaiting Evan):**
- HMDIGITAL006 "Evan Marcus" — is this Evan himself or a different artist?
- Masters availability for HMDIGITAL releases (determines whether Bandcamp links are viable).
- Discogs API token for the enrichment pass (cover art, tracklists, durations).
- Scrape of the parent Hunya Munya Records Discogs label (different ID) for HMR vinyl/CD enrichment.

**Spec sections affected:** extends main rebuild-v1 §7 (catalog), interacts with SEO spec §2.1 URL structure, adds 15 net-new stub artist pages.

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
