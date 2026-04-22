// Spec: rebuild-v1 §8.5 as revised by hosting-addendum §8.
// Permalink pattern is confirmed by a single unauthenticated `curl -I` against a live
// WordPress URL (no WP_LEGACY_* env vars). Then HEAD-check every external URL in
// migrated content and produce site/migration/dead-links.md for Evan's review.
//
// Not yet implemented.

async function main() {
  throw new Error("wp-verify not yet implemented. See docs/specs/rebuild-v1.md §8.5 and docs/specs/hosting-addendum.md §8.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
