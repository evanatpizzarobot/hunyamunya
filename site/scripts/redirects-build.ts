// Spec: rebuild-v1 §8.4 as revised by hosting-addendum §5.
// Populate the BEGIN REDIRECTS / END REDIRECTS marker block in
// site/public/.htaccess with Apache RewriteRule lines derived from:
// - `legacy_slug` frontmatter across content/{artists,releases,news,pages}
// - `_wp_old_slug` postmeta entries from site/migration/raw.json
// - category/tag archive URLs (→ /news?tag=...)
// - feed URLs (/feed/, /comments/feed/) → 410 already in baseline .htaccess
// - media URLs via site/migration/media-manifest.json
// Unmapped legacy paths get [R=410,L] rather than 404 so Google de-indexes.
//
// Not yet implemented.

async function main() {
  throw new Error("redirects-build not yet implemented. See docs/specs/hosting-addendum.md §5.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
