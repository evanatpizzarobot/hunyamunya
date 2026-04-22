// Spec §8.5: crawl live WP sitemap using WP_LEGACY_APP_PASSWORD, diff titles/dates/slugs
// against migrated MDX. Run before cutover.
//
// Also (per dry-run §4 and rebuild-v1 §17.8): HEAD-check every external URL, produce
// migration/dead-links.md for Evan's review.
//
// Not yet implemented.

async function main() {
  throw new Error("wp-verify not yet implemented. See docs/specs/rebuild-v1.md §8.5.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
