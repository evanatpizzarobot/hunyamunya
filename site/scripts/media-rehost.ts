// Spec §8.3: download the 114 WP attachments from wp-content/uploads, transcode to AVIF + WebP
// via sharp, upload to R2 under media/legacy/{YYYY}/{MM}/{filename}, write migration/media-manifest.json.
// Strip image size suffixes (-150x150 etc.) before manifest lookup.
//
// Not yet implemented.

async function main() {
  throw new Error("media-rehost not yet implemented. See docs/specs/rebuild-v1.md §8.3.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
