# hunyamunya

Monorepo for Hunya Munya Records.

## Layout

```
/site                     Next.js 14 static-export rebuild of hunyamunyarecords.com
  /site/migration         WP XML export + generated import artifacts
  /site/public            static assets and Apache .htaccess for production
  /site/content           MDX for artists, releases, news, pages
/beacon                   FastAPI + React SEO/marketing tool (spec pending from Cowork)
/docs/specs               authoritative project specs (rebuild-v1, migration-dry-run, hosting-addendum)
/docs/decisions.md        append-only log of in-flight decisions and spec deltas
/.github/workflows        deploy workflow (build → force-push deploy branch)
```

Owner: Evan Marcus. Lead implementer: Claude ("Lord Coder"). Specs authored by Cowork.

## First-time setup

```bash
npm install              # installs husky at repo root; registers git hooks
cd site && npm install   # installs Next.js site dependencies
```

The WP XML export is committed at `site/migration/hunyamunyarecords.WordPress.2026-04-22.xml`.

## Hosting

The site is hosted on NetActuate cPanel, Apache, at `/home/hmrecords/public_html/`. Build is a Next.js static export; GitHub Actions force-pushes the `site/out/` tree (plus `.htaccess` from `site/public/.htaccess`) to a `deploy` branch on every push to `main`. cPanel Git Version Control pulls `deploy` into `public_html_new`, then Evan does a folder-rename to cut over (see `docs/specs/hosting-addendum.md §4, §10`).

## Key commands

| Command | From | Purpose |
|---|---|---|
| `npm run dev` | `/site` | Next.js dev server |
| `npm run build` | `/site` | Next.js static export to `site/out/` |
| `npm run postbuild` | `/site` | Pagefind index + sitemap copy (stub for now) |
| `npm run import:wp` | `/site` | Parse WP XML, emit MDX under `site/content/` |
| `npm run rehost:media` | `/site` | Download WP media, transcode via sharp, write to `site/public/media/legacy/` |
| `npm run build:redirects` | `/site` | Generate the 301 map block inside `site/public/.htaccess` |
| `npm run verify:wp` | `/site` | HEAD-check external URLs in migrated content, produce `site/migration/dead-links.md` |

## Secrets

Never commit any `.env` variant. Local work happens in `site/.env.local`. Pre-commit hook scans staged changes for known key patterns (Anthropic, Google, Resend) and blocks any accidental commit.

Runtime secrets for the production PHP contact endpoint live in `/home/hmrecords/.env` on the NetActuate VM, outside `public_html` and `chmod 600` (see `docs/specs/hosting-addendum.md §2`).
