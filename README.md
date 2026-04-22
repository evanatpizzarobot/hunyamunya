# hunyamunya

Monorepo for Hunya Munya Records.

## Layout

```
/site       Next.js 14 rebuild of hunyamunyarecords.com (spec: docs/specs/rebuild-v1.md)
/beacon     FastAPI + React SEO/marketing tool for HMR artists (spec pending from Cowork)
/migration  WordPress import scripts + source data (XML is gitignored; see migration/README.md)
/docs       Specs, decisions log, reference material
```

Owner: Evan Rippertoe. Lead implementer: Claude ("Lord Coder"). Specs authored by Cowork.

## First-time setup

```bash
npm install             # installs husky at repo root; registers git hooks
cd site && npm install  # installs Next.js site dependencies
```

Drop the WordPress export at `migration/source/hunyamunyarecords.WordPress.2026-04-22.xml` before running any import script.

## Key commands

| Command | From | Purpose |
|---|---|---|
| `npm run dev` | `/site` | Next.js dev server |
| `npm run build` | `/site` | Production build |
| `npm run import:wp` | `/site` | Parse WP XML, emit MDX under `site/content/` |
| `npm run rehost:media` | `/site` | Download WP media, upload to R2, write manifest |
| `npm run build:redirects` | `/site` | Generate Cloudflare Pages `_redirects` from legacy slugs |
| `npm run verify:wp` | `/site` | Diff migrated content against live WP |

## Secrets

Never commit any `.env` variant. Local work happens in `site/.env.local`. Pre-commit hook scans staged changes for known key patterns (Anthropic, Google, Resend) and blocks any accidental commit.
