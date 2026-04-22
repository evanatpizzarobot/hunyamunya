// Spec §8.4: generate public/_redirects (Cloudflare Pages format) from:
// - legacy_slug frontmatter across all content
// - _wp_old_slug postmeta entries from the WP export
// - category/tag archive URLs
// - feed URLs (/feed/, /comments/feed/)
// - media URLs via migration/media-manifest.json
// Unmapped paths get 410 so Google de-indexes.
//
// Not yet implemented.

async function main() {
  throw new Error("redirects-build not yet implemented. See docs/specs/rebuild-v1.md §8.4.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
