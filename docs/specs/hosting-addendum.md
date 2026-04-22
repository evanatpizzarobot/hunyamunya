# Hosting Addendum — NetActuate-only path

**Supersedes:** all Cloudflare-related sections of `hunyamunyarecords-rebuild-v1.md`
**Applies to:** site build only (Beacon is unaffected; it stays local-first per its own spec)
**Date:** 2026-04-22
**Status:** Drop-in; replaces the referenced sections verbatim

---

## 0. Why this exists

The original spec assumed Cloudflare Pages + R2 + Turnstile + Resend. **Cancel all of that.** Evan's music-related domains (including hunyamunyarecords.com) stay on NetActuate. This is not a migration to a new host; the new static site *replaces* the WordPress install on the same cPanel account at the same IP (162.223.15.199). The content work (MDX migration, components, design, SEO) is unchanged. Only deploy target, media location, forms, and anti-spam change.

**Consequence:** cutover becomes trivial. DNS, MX, SPF, DMARC, Google Workspace email are all untouched. Flip day is one folder rename inside cPanel.

## 1. Infrastructure (replaces §1 stack table entries)

| Concern | New target | Notes |
|---|---|---|
| Hosting | NetActuate cPanel, Apache, shared server | Home dir `/home/hmrecords/`, docroot `/home/hmrecords/public_html/` (confirm on first SSH) |
| Build output | Next.js **static export** (`output: 'export'`) | Fully static HTML + assets; no Node runtime on the server |
| Deploy | GitHub Actions builds → pushes `deploy` branch → cPanel Git™ Version Control pulls → serves from `public_html` | See §4 |
| Media | Local filesystem at `/home/hmrecords/public_html/media/legacy/{YYYY}/{MM}/{filename}.{avif,webp,jpg}` | Apache serves directly. No R2, no CDN. |
| Image optimization | Done at build time via `sharp`; all sizes pre-generated and committed to `deploy` branch | Next.js `next/image` with static export uses the pre-generated variants |
| Forms | PHP endpoint at `/api/contact.php` on the same VM | Validates, runs honeypot, sends via PHP `mail()` to `evan@hunyamunyarecords.com` + logs JSON to `/home/hmrecords/submissions/` |
| Anti-spam | Honeypot field + timing check + basic rate-limit in PHP | No Turnstile. Optional hCaptcha later if spam slips through. |
| Newsletter | **Skipped in v1** | Evan will add later if and when |
| Analytics | **Skipped in v1** | Revisit with Plausible or Umami after launch if needed |
| Search | Pagefind (unchanged; it's client-side static) | No change from main spec |
| TLS | AutoSSL / Let's Encrypt via cPanel SSL/TLS Status | Already provisioning for the WP site; same cert covers static site |

## 2. Environment (replaces §13)

The only runtime env needed is for the PHP form endpoint:

```
# /home/hmrecords/.env  (server-side only, outside public_html, chmod 600)
CONTACT_TO=evan@hunyamunyarecords.com
CONTACT_FROM=website@hunyamunyarecords.com     # or reuse CONTACT_TO
CONTACT_SUBJECT_PREFIX=[hunyamunya]
SUBMISSIONS_DIR=/home/hmrecords/submissions
RATE_LIMIT_WINDOW_SECONDS=300
RATE_LIMIT_MAX_PER_WINDOW=3
```

**Delete from the main spec's env list:** `R2_*`, `RESEND_API_KEY`, `TURNSTILE_*`, `BUTTONDOWN_API_KEY`, `CONVERTKIT_API_KEY`, `WP_LEGACY_*`.

## 3. Media rehost — revised approach (replaces §8.3 of main spec)

The rehost script no longer uploads to R2. Instead:

1. `scripts/media-rehost.ts` downloads each of the 114 WP originals from `https://www.hunyamunyarecords.com/wp-content/uploads/{YYYY}/{MM}/{file}`
2. For each file, `sharp` generates: AVIF (primary), WebP (fallback), and preserves the original JPG/PNG; also pre-generates size variants the site actually uses (e.g. 240, 480, 960, 1440 widths)
3. Output tree goes to `site/public/media/legacy/{YYYY}/{MM}/{basename}.{width}.{format}`
4. `migration/media-manifest.json` maps every old URL (including the sized variants like `-150x150`, `-300x300`, `-1024x605`) to a site-relative path like `/media/legacy/2010/04/Rykard_960x.960.avif`
5. MDX frontmatter and body references use site-relative paths (`/media/legacy/...`), not `r2://...`
6. The entire `site/public/media/` tree is committed to the `deploy` branch during build; Apache serves it natively

**Why this works:** 114 images × ~500KB average × 3 formats × ~4 sizes ≈ ~250MB. Well within the 5GB cPanel disk quota (currently 22% used). Cacheable via `.htaccess` below.

## 4. Deploy pipeline — revised (replaces §8.6 of main spec)

**Branches:**
- `main` — source code. TypeScript, MDX, scripts, everything that gets committed by humans and Claude Code.
- `deploy` — build output. Never edited by hand. Force-updated by CI on every push to `main`.

**GitHub Actions workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Build & publish deploy branch
on:
  push: { branches: [main] }
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: site/package-lock.json }
      - working-directory: site
        run: npm ci
      - working-directory: site
        run: npm run build          # Next.js static export → site/out/
      - working-directory: site
        run: npm run postbuild      # Pagefind index, sitemap copy, .htaccess copy
      - name: Publish to deploy branch
        run: |
          cd site/out
          cp ../public/.htaccess .htaccess
          git init -b deploy
          git config user.email "ci@hunyamunyarecords.com"
          git config user.name "HMR CI"
          git remote add origin "https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git"
          git add -A
          git commit -m "build: ${{ github.sha }}"
          git push -f origin deploy
```

**cPanel side** (one-time setup, walked through in §10):
1. cPanel → Files → Git™ Version Control → Create repository
2. Clone URL: `https://github.com/evanatpizzarobot/hunyamunya.git`, Branch: `deploy`, Path: `/home/hmrecords/public_html_new/`
3. After first clone succeeds: pause, rename `public_html` → `wp_backup`, rename `public_html_new` → `public_html`
4. Apache now serves the new static site. WordPress sits in `wp_backup/` untouched.
5. For subsequent deploys: cPanel → Git Version Control → "Pull or Deploy" → "Update from Remote" → done. (Can be scripted via cron if fully hands-off is wanted later.)

**Rollback** (if anything is wrong): rename `public_html` → `public_html_broken`, rename `wp_backup` → `public_html`. 30 seconds, we're back on WordPress.

## 5. Apache config (`.htaccess` at docroot)

Committed to `site/public/.htaccess`; ends up at `/home/hmrecords/public_html/.htaccess` via the deploy branch.

```apache
RewriteEngine On

# -- 1. Legacy WP → new URLs (generated from scripts/redirects-build.ts) --
# Example rules; full map produced by the importer:
RewriteRule ^releases/?$        /catalog                        [R=301,L]
RewriteRule ^releases-2/?$      /catalog                        [R=301,L]
RewriteRule ^discography/?$     /catalog                        [R=301,L]
RewriteRule ^shop/?$            /catalog                        [R=301,L]
# ... (continued from redirects-build.ts output)

# -- 2. Clean URLs for Next.js static export --
# Map /about → /about.html, /artists/rykard → /artists/rykard/index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.*)$ $1/index.html [L]

# -- 3. Strip trailing .html from visible URLs --
RewriteCond %{THE_REQUEST} \s/+(.+?)\.html[\s?] [NC]
RewriteRule ^ /%1 [R=301,L,NE]

# -- 4. 410 Gone for feeds/comments that shouldn't exist --
RewriteRule ^(feed|comments/feed)/?$ - [R=410,L]

# -- 5. Caching for immutable static assets --
<FilesMatch "\.(avif|webp|jpg|jpeg|png|svg|ico|woff2|css|js)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# -- 6. Compression --
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml
</IfModule>

# -- 7. Security headers --
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" env=HTTPS

# -- 8. Block access to dotfiles and manifests --
<FilesMatch "^\.(?!well-known)">
  Require all denied
</FilesMatch>
RewriteRule ^migration/ - [F,L]
```

## 6. Contact form — PHP endpoint

File: `site/public/api/contact.php` (ships via `deploy` branch to `/home/hmrecords/public_html/api/contact.php`).

Behavior:
- Accepts POST JSON `{ intent: 'demo'|'sync'|'press', name, email, message, ... }`
- Validates required fields per intent (see main spec §9)
- Checks honeypot field (`_website_` hidden input; if populated, silently drop)
- Timing check: reject if form submitted < 2s after page load (JS puts a timestamp in a hidden field)
- Rate limit: simple file-based counter keyed by IP in `/home/hmrecords/tmp/rate/{ip}.json`
- On accept:
  - Write `/home/hmrecords/submissions/{intent}/{YYYY}/{MM}/{uuid}.json`
  - Send email via PHP `mail()` to `CONTACT_TO` with subject `{PREFIX} [{intent}] from {name}`
  - Return `{ ok: true }`
- On reject: `{ ok: false, reason: '...' }` (generic reason string, no enumeration)

~60 lines of PHP. Self-contained. No composer, no dependencies.

## 7. Next.js config adjustments

`site/next.config.mjs`:

```js
const config = {
  output: 'export',                    // Static export
  trailingSlash: false,
  images: {
    unoptimized: true,                 // Required for static export
    // We pre-generate sizes in media-rehost.ts, so Next's optimizer is unused
  },
  // No rewrites / redirects here; all redirects handled by Apache .htaccess
};
export default config;
```

All previous references to Cloudflare Pages adapter, Pages Functions, and edge runtime are removed.

## 8. Direct answers to CC's four blockers

1. **WP Application Password** — not needed. The export has everything material; permalink pattern can be probed once by `curl -I https://www.hunyamunyarecords.com/rykard-nco-is-live-12-12-2025/` and confirmed against the new redirect map. No login required.

2. **R2 bucket + credentials** — **not needed. R2 is not used.** Media lives at `site/public/media/legacy/` in the repo (optimized by `media-rehost.ts`) and deploys to the NetActuate VM alongside the HTML. Update `media-rehost.ts` per §3 above.

3. **DNS for media.hunyamunyarecords.com** — **not needed.** Media is served from the root domain at `/media/...`. No subdomain, no CNAME.

4. **Cloudflare Pages project** — **not needed.** Deploy pipeline is the GitHub Actions → `deploy` branch → cPanel Git pattern documented in §4 above. Staging is done locally (`npm run dev`) or by pushing a PR branch and having CI also push a `deploy-preview/{branch}` branch that CC can diff against the current `deploy` branch.

**Green light on `wp-import.ts` immediately.** It only needs the XML and the export is already in-repo (or will be; commit it to `site/migration/hunyamunyarecords.WordPress.2026-04-22.xml`). Nothing in this addendum changes the importer's logic; it still produces MDX with site-relative image paths, `/media/legacy/...` rewrites, and the redirect map.

## 9. Minor spec cleanup

Delete / no-op these sections of the main spec: §13's R2/Resend/Turnstile/Buttondown env vars, §8.3's R2 upload step (replaced by §3 above), §8.6's "DNS cutover" section (replaced by §4's folder-rename), §9's Turnstile reference (replaced by honeypot + timing check in §6). Everything else (content model, frontmatter schemas, release catalog, artist tiers, design system, SEO, a11y, performance budget, testing) stands unchanged.

## 10. What Evan does in cPanel when CC is ready to ship

Walked through in real-time when we get there, but for reference:

1. Files → Git™ Version Control → Create → `https://github.com/evanatpizzarobot/hunyamunya.git`, branch `deploy`, path `/home/hmrecords/public_html_new/`
2. After first successful pull, via File Manager: rename `public_html` → `wp_backup`, rename `public_html_new` → `public_html`
3. Visit https://hunyamunyarecords.com; confirm new site loads
4. Walk 15 old URLs from redirect map; confirm 301s land
5. Done. Keep `wp_backup/` for 30 days, then delete via File Manager.
