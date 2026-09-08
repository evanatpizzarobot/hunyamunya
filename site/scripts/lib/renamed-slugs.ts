// Shared by redirects-build.ts (Apache) and redirects-build-nginx.ts (nginx),
// which both read post_name straight out of migration/classified.json. When a
// slug is renamed in content/news, the generators would otherwise keep pointing
// their WordPress query redirects at a URL that no longer exists, so the map
// has to live somewhere both of them read.
//
// Keyed by the ORIGINAL WordPress post_name, valued by the current slug.

export const RENAMED_NEWS_SLUGS: Record<string, string> = {
  // Arrived from the WP export with percent-escapes baked into the slug itself.
  // The static export then wrote a file whose NAME contained literal percent
  // characters, so nginx decoded an incoming request back to the curly quotes
  // and found nothing: the page 404'd at its own sitemap URL and was reachable
  // only double-encoded. Renamed to ASCII 2026-09-07.
  "rykard-track-on-twoism%e2%80%99s-%e2%80%9cone-on-twoism-vol-4%e2%80%b3":
    "rykard-track-on-twoisms-one-on-twoism-vol-4",
};

export function newsSlugFor(postName: string): string {
  return RENAMED_NEWS_SLUGS[postName] ?? postName;
}
