// RSS 2.0 feed of news posts and release announcements. Statically generated
// at build time (the site is output: "export") and served as /feed.xml.

import { getAllArtists, getAllNews, getAllReleases, isUpcoming } from "@/lib/content";
import { LABEL_NAME, SITE_URL } from "@/lib/jsonld";

export const dynamic = "force-static";

const MAX_ITEMS = 50;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Frontmatter dates are bare YYYY-MM-DD; pin them to a fixed morning-Pacific
// hour so the pubDate is stable across builds and time zones.
function rfc822(dateStr: string): string {
  return new Date(`${dateStr}T16:00:00Z`).toUTCString();
}

type FeedItem = { title: string; link: string; date: string; description: string };

export async function GET() {
  const artists = getAllArtists();
  const artistName = (slug: string) => artists.find((a) => a.data.slug === slug)?.data.name ?? slug;

  const newsItems: FeedItem[] = getAllNews().map((n) => ({
    title: n.data.title,
    link: `${SITE_URL}${n.urlPath}`,
    date: n.data.date,
    description:
      n.data.excerpt ?? n.data.metaDescription ?? `${n.data.title}, from ${LABEL_NAME}.`,
  }));

  // `upcoming` releases whose date has passed count as published (the
  // frontmatter may not be flipped yet); genuinely future ones stay out, since
  // a future pubDate confuses feed readers.
  const releaseItems: FeedItem[] = getAllReleases()
    .filter(
      (r) =>
        (r.data.status === "published" || r.data.status === "upcoming") &&
        r.data.release_date &&
        !isUpcoming(r),
    )
    .map((r) => {
      const by = r.resolvedArtists
        .filter((a) => a.role === "primary")
        .map((a) => a.name ?? artistName(a.slug));
      const byline = (by.length ? by : [artistName(r.data.artist)]).join(" & ");
      const catno = r.data.catalog_number ? ` (${r.data.catalog_number})` : "";
      return {
        title: `${byline} · ${r.data.title}${catno}`,
        link: `${SITE_URL}${r.urlPath}`,
        date: r.data.release_date!,
        description:
          r.data.metaDescription ??
          `${r.data.title} by ${byline}${catno}, released on ${LABEL_NAME}.`,
      };
    });

  const items = [...newsItems, ...releaseItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_ITEMS);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(LABEL_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>News and releases from ${esc(LABEL_NAME)}, an LA-based independent electronic music label founded in 2002.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (it) => `    <item>
      <title>${esc(it.title)}</title>
      <link>${esc(it.link)}</link>
      <guid isPermaLink="true">${esc(it.link)}</guid>
      <pubDate>${rfc822(it.date)}</pubDate>
      <description>${esc(it.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
