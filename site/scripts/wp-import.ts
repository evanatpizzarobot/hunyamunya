// Spec §8.2: Parse WP XML export at migration/source/hunyamunyarecords.WordPress.2026-04-22.xml,
// classify content per dry-run §1.1, emit MDX under site/content/{artists,releases,news,pages}.
// Write migration/raw.json, migration/report.md, and flag ambiguous items to content/_review/.
//
// Not yet implemented. See docs/specs/migration-dry-run.md and docs/specs/rebuild-v1.md §8.2.

async function main() {
  throw new Error("wp-import not yet implemented. See docs/specs/rebuild-v1.md §8.2.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
