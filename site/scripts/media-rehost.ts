// Spec: rebuild-v1 §8.3 as revised by hosting-addendum §3.
// Download 114 WP originals from hunyamunyarecords.com/wp-content/uploads,
// transcode with sharp to AVIF + WebP + original at widths 240/480/960/1440,
// write to site/public/media/legacy/{YYYY}/{MM}/{basename}.{width}.{format},
// produce site/migration/media-manifest.json mapping old URLs (incl. -150x150
// and -1024x605 suffixed variants) to new site-relative paths.
//
// No R2. Apache serves the files directly from /media/legacy/ on the docroot.
//
// Not yet implemented. Requires `sharp` dep (not yet installed).

async function main() {
  throw new Error("media-rehost not yet implemented. See docs/specs/hosting-addendum.md §3.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
