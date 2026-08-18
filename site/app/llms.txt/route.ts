// /llms.txt per the llms.txt convention: a compact, plain-text map of the
// site for AI assistants and answer engines, generated from the same content
// files that build the pages so it never drifts from the catalog.

import {
  compareReleasesForCatalog,
  getAllArtists,
  getAllNews,
  getAllReleases,
} from "@/lib/content";
import { LABEL_NAME, SITE_URL } from "@/lib/jsonld";

export const dynamic = "force-static";

export async function GET() {
  const artists = getAllArtists();
  const releases = getAllReleases()
    .filter((r) => r.data.status !== "draft")
    .sort(compareReleasesForCatalog);
  const news = getAllNews().slice(0, 10);
  const artistName = (slug: string) => artists.find((a) => a.data.slug === slug)?.data.name ?? slug;

  const artistLines = artists.map((a) => {
    const genres = a.data.genres.length ? ` (${a.data.genres.join(", ")})` : "";
    return `- [${a.data.name}](${SITE_URL}/artists/${a.data.slug})${genres}`;
  });

  const releaseLines = releases.map((r) => {
    const primaries = r.resolvedArtists.filter((x) => x.role === "primary");
    const by = (primaries.length ? primaries : r.resolvedArtists.slice(0, 1))
      .map((x) => x.name ?? artistName(x.slug))
      .join(" & ");
    const catno = r.data.catalog_number ? `${r.data.catalog_number}, ` : "";
    return `- [${by} · ${r.data.title}](${SITE_URL}${r.urlPath}) (${catno}${r.year})`;
  });

  const newsLines = news.map(
    (n) => `- [${n.data.title}](${SITE_URL}${n.urlPath}) (${n.data.date})`,
  );

  const body = `# ${LABEL_NAME}

> ${LABEL_NAME} (HMR) is an independent boutique electronic music label and publisher founded in 2002, based in Los Angeles. The catalog spans Ambient, Downtempo, Chillout, Breakbeat, IDM, Tech House, and Progressive across ${releases.length} releases, including limited 12" vinyl, CDs, and digital. The full catalog, much of it originally vinyl-only, is available on Spotify, Apple Music, Amazon Music, Tidal, Pandora, and other streaming platforms. The label also handles sync licensing for film, TV, and radio.

Key facts:
- Founded 2002; Los Angeles based since 2008.
- Anchor artist: Rykard (25M+ streams, KCRW airplay).
- Catalog numbers use the HMR (vinyl) and HMB (digital-era) prefixes.
- Contact: contact@hunyamunyarecords.com

## Main pages

- [Catalog](${SITE_URL}/catalog): every release, filterable by vinyl, CD, and digital.
- [Artists](${SITE_URL}/artists): the label roster.
- [Discography](${SITE_URL}/discography): the full release list in one table.
- [News](${SITE_URL}/news): label news since 2002.
- [About](${SITE_URL}/about): label history.
- [Press](${SITE_URL}/press): press resources, including the [Rykard press kit](${SITE_URL}/press/rykard).
- [Contact](${SITE_URL}/contact)
- [RSS feed](${SITE_URL}/feed.xml)

## Artists

${artistLines.join("\n")}

## Releases

${releaseLines.join("\n")}

## Recent news

${newsLines.join("\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
