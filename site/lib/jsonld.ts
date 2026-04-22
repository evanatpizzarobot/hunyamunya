// Schema.org / JSON-LD factories per SEO spec §2.3.
// Each factory returns a plain JS object that serializes to JSON-LD. The <SEO>
// component JSON.stringify's whatever gets passed in.

import type { Artist, News, Release } from "./schema";

export const SITE_URL = "https://hunyamunyarecords.com";
export const LABEL_NAME = "Hunya Munya Records";
export const ORG_ID = `${SITE_URL}/#organization`;

export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MusicLabel",
    "@id": ORG_ID,
    name: LABEL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`, // 900x600, transparent PNG sourced from hm_transparent.gif
    email: "contact@hunyamunyarecords.com",
    foundingDate: "2002",
    foundingLocation: {
      "@type": "Place",
      name: "Los Angeles, CA, USA",
    },
    // sameAs populated once Evan confirms Discogs + socials (SEO spec §7 open item).
  };
}

function absolute(pathOrUrl: string | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl}`;
}

export function artistJsonLd(artist: Artist, relatedReleases: Release[]) {
  const sameAs: string[] = [];
  const l = artist.links ?? {};
  if (l.website) sameAs.push(l.website);
  if (l.bandcamp) sameAs.push(l.bandcamp);
  if (l.spotify) sameAs.push(l.spotify);
  if (l.apple) sameAs.push(l.apple);
  if (l.instagram) sameAs.push(l.instagram);
  if (l.discogs) sameAs.push(l.discogs);

  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    url: `${SITE_URL}/artists/${artist.slug}`,
    image: absolute(artist.hero_image ?? artist.portrait),
    genre: artist.genres.length ? artist.genres : undefined,
    recordLabel: { "@id": ORG_ID },
    sameAs: sameAs.length ? sameAs : undefined,
    album: relatedReleases.map((r) => ({
      "@type": "MusicAlbum",
      name: r.title,
      url: `${SITE_URL}/catalog/${catnoSlug(r)}`,
    })),
  };
}

function catnoSlug(r: Release): string {
  return r.catalog_number ? `${r.catalog_number.toLowerCase()}-${r.slug}` : r.slug;
}

export function releaseJsonLd(release: Release, artist: Artist | null) {
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: release.title,
    url: `${SITE_URL}/catalog/${catnoSlug(release)}`,
    recordLabel: { "@id": ORG_ID },
    albumReleaseType: "AlbumRelease",
  };
  if (artist) {
    out.byArtist = {
      "@type": "MusicGroup",
      name: artist.name,
      url: `${SITE_URL}/artists/${artist.slug}`,
    };
  } else {
    out.byArtist = { "@type": "MusicGroup", name: release.artist };
  }
  if (release.release_date) out.datePublished = release.release_date;
  if (release.catalog_number) out.catalogNumber = release.catalog_number;
  if (release.tracklist.length) {
    out.numTracks = release.tracklist.length;
    out.track = release.tracklist.map((t) => {
      const track: Record<string, unknown> = {
        "@type": "MusicRecording",
        name: t.title,
        position: t.number,
      };
      if (t.duration) track.duration = isoDuration(t.duration);
      return track;
    });
  }
  if (release.cover_image) out.image = absolute(release.cover_image);
  if (release.genres.length) out.genre = release.genres;
  return out;
}

// Convert "7:42" or "1:02:15" to ISO 8601 duration "PT7M42S" / "PT1H2M15S".
function isoDuration(mmss: string): string | undefined {
  const parts = mmss.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => !Number.isFinite(n))) return undefined;
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else return undefined;
  let out = "PT";
  if (h) out += `${h}H`;
  if (m || h) out += `${m}M`;
  out += `${s}S`;
  return out;
}

export function newsJsonLd(news: News, urlPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: news.title,
    datePublished: news.date,
    dateModified: news.date,
    author: { "@type": "Organization", name: LABEL_NAME },
    publisher: { "@id": ORG_ID },
    image: absolute(news.hero_image),
    mainEntityOfPage: `${SITE_URL}${urlPath}`,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
