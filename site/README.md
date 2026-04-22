# site

Next.js 14 static export for hunyamunyarecords.com. Deploys to NetActuate cPanel Apache.

See `docs/specs/rebuild-v1.md` (main spec) and `docs/specs/hosting-addendum.md` (hosting overrides) at the repo root.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build        # Next.js static export → site/out/
npm run postbuild    # Pagefind index + sitemap (stub)
```

On push to `main`, GitHub Actions runs both, copies `public/.htaccess` into `out/`, and force-pushes `out/` to the `deploy` branch for cPanel Git to pull.

## Content

Lives under `site/content/{artists,releases,news,pages,press,campaigns}`. All MDX frontmatter is validated by the Zod schemas in `lib/schema.ts`. Build fails loudly on schema violations.

## Migration scripts

Run from this directory (`/site`):

| Command | Purpose |
|---|---|
| `npm run import:wp` | Parse `site/migration/hunyamunyarecords.WordPress.2026-04-22.xml` → MDX under `site/content/` |
| `npm run rehost:media` | Download WP originals, transcode via `sharp`, write to `site/public/media/legacy/` |
| `npm run build:redirects` | Populate the BEGIN/END REDIRECTS block in `site/public/.htaccess` |
| `npm run verify:wp` | HEAD-check external URLs; write `site/migration/dead-links.md` |

All four are currently stubs; implementations follow per `docs/specs/` sections.
