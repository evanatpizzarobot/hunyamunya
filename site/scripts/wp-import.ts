// Spec: rebuild-v1 §8.2, migration-dry-run §1.1.
// Parse site/migration/hunyamunyarecords.WordPress.2026-04-22.xml, classify content,
// emit MDX under site/content/{artists,releases,news,pages}, write site/migration/raw.json
// and site/migration/report.md. Flag ambiguous items to site/content/_review/.
//
// MDX image refs use site-relative paths (/media/legacy/...) per hosting-addendum §3;
// r2:// is not used.
//
// Not yet implemented.

async function main() {
  throw new Error("wp-import not yet implemented. See docs/specs/rebuild-v1.md §8.2.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
