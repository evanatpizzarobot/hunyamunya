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

## 2026-04-22 — Media CDN on subdomain

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
