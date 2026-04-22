# site/migration

Migration staging for the WordPress-to-Next.js rebuild. The WP XML export is committed here (private repo, 6.2 MB); everything else in this directory is generated output and is gitignored.

## Files

| File | Committed | Purpose |
|---|---|---|
| `hunyamunyarecords.WordPress.2026-04-22.xml` | yes | source of truth for all migrated content |
| `raw.json` | no | intermediate XML → JSON dump written by `wp-import.ts` |
| `classified.json` | no | per-item classification + review flags written by `wp-import.ts` |
| `report.md` | no | per-run migration report (counts, flagged items, classification breakdown) |
| `dead-links.md` | no | external link health report from `wp-verify.ts` |
| `media-manifest.json` | no | old URL → new `/media/legacy/...` path map, written by `media-rehost.ts` |

## Scripts (run from `/site`)

| Command | Purpose |
|---|---|
| `npm run import:wp` | Parse the WP XML, emit MDX under `site/content/`, produce `raw.json`, `classified.json`, and `report.md` |
| `npm run rehost:media` | Download WP uploads, transcode to AVIF+WebP+original at widths 240/480/960/1440, write to `site/public/media/legacy/`, produce `media-manifest.json` |
| `npm run build:redirects` | Populate the `BEGIN REDIRECTS` / `END REDIRECTS` block in `site/public/.htaccess` from legacy slugs |
| `npm run verify:wp` | HEAD-check every external URL in migrated content; produce `dead-links.md` |

## wp-import is one-shot

`wp-import.ts` wholesale rewrites `site/content/{artists,news,releases,pages,_review}` on every run. This is correct during the migration prep phase: you run it, you review the output, you iterate on the importer or on the source data, you re-run, you get a clean state.

Once the review phase is over and Evan has started editing MDX directly (filling in bios, adding press quotes, curating catalog metadata), **re-running wp-import will destroy those edits.** That's rarely what you want.

Safety: `wp-import.ts` checks the target directories before touching them. If any of them contain files that aren't `.gitkeep`, it aborts with a clear error unless you pass `--force`:

```bash
npm run import:wp                # aborts if content is present
npm run import:wp -- --force     # actually runs, wipes and regenerates
```

Use the flag deliberately:
- Fresh migration pass after a fix to the importer → `--force` is correct.
- Coming back to tweak one artist's bio → don't run wp-import at all; edit the MDX directly.
- Unclear which mode you're in → err toward editing MDX directly. If you genuinely need to re-import, commit first so the manual edits are recoverable via git.

## Resolved review flags

The importer tracks items that previously needed Evan's review but have since been decided. These are logged in `RESOLVED_REVIEW_FLAGS` inside `scripts/wp-import.ts` and show up as `resolved` in the report rather than generating new `_review/` files on subsequent runs. If a new edge case needs review, the classifier emits to `_review/` as usual; once Evan decides, add an entry to `RESOLVED_REVIEW_FLAGS` with the resolution text and the `_review/` emission stops.

See `docs/decisions.md` for the full decision history, `docs/specs/migration-dry-run.md` for classification rules, `docs/specs/rebuild-v1.md §8` for per-script intent, and `docs/specs/hosting-addendum.md §3` for the filesystem-based media output (replacing the original R2 plan).
