# site/migration

Migration staging for the WordPress-to-Next.js rebuild. The WP XML export is committed here (private repo, 6.2 MB); everything else in this directory is generated output and is gitignored.

## Files

| File | Committed | Purpose |
|---|---|---|
| `hunyamunyarecords.WordPress.2026-04-22.xml` | yes | source of truth for all migrated content |
| `raw.json` | no | intermediate XML → JSON dump written by `wp-import.ts` |
| `report.md` | no | per-run migration report (counts, flagged items, classification breakdown) |
| `dead-links.md` | no | external link health report from `wp-verify.ts` |
| `media-manifest.json` | no | old URL → new `/media/legacy/...` path map, written by `media-rehost.ts` |

## Scripts (run from `/site`)

| Command | Purpose |
|---|---|
| `npm run import:wp` | Parse the WP XML, emit MDX under `site/content/`, produce `raw.json` and `report.md` |
| `npm run rehost:media` | Download WP uploads, transcode to AVIF+WebP+original at widths 240/480/960/1440, write to `site/public/media/legacy/`, produce `media-manifest.json` |
| `npm run build:redirects` | Populate the `BEGIN REDIRECTS` / `END REDIRECTS` block in `site/public/.htaccess` from legacy slugs |
| `npm run verify:wp` | HEAD-check every external URL in migrated content; produce `dead-links.md` |

See `docs/specs/migration-dry-run.md` for classification rules, `docs/specs/rebuild-v1.md §8` for per-script intent, and `docs/specs/hosting-addendum.md §3` for the filesystem-based media output (replacing the original R2 plan).
