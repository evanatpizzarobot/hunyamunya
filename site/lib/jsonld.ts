// Schema.org / JSON-LD factories per SEO spec §2.3.
// Each factory returns a plain JS object that serializes to JSON-LD. The <SEO>
// component JSON.stringify's whatever gets passed in.

import type { Artist, News, Release } from "./schema";
import { streamingLinksFor } from "./streaming";

export const SITE_URL = "https://hunyamunyarecords.com";
export const LABEL_NAME = "Hunya Munya Records";
export const ORG_ID = `${SITE_URL}/#organization`;

// Genres the label has released across its 24-year catalog. Surfaced on the
// Organization JSON-LD's `genre` array so search engines can associate the
// org entity with these terms without depending on per-page text alone.
// Pulled from the union of release/artist `genres` frontmatter. Keep in sync
// when a release introduces a genre that isn't already on this list.
const LABEL_GENRES = [
  "Electronic",
  "Ambient",
  "Downtempo",
  "Chillout",
  "Breakbeat",
  "Breaks",
  "Progressive Breaks",
  "Progressive House",
  "Progressive Trance",
  "Tech House",
  "Deep House",
  "House",
  "Techno",
  "Melodic Techno",
  "Trance",
  "IDM",
  "Experimental",
  "Dark Ambient",
  "Cinematic Electronic",
  "Drum and Bass",
];

// Confirmed external profiles for the LABEL (not individual artists). Keep
// this list to entries that point at the Hunya Munya entity itself. The two
// Discogs pages are the vinyl-era label and its digital imprint; Discogs
// models HM Digital as a sub-label with HMR as parent, and both belong to
// this one org entity. MusicBrainz label id confirmed 2026-08-18.
const LABEL_SAME_AS = [
  "https://ra.co/labels/385",
  "https://www.allmusic.com/artist/hunya-munya-mn0002854507",
  "https://www.discogs.com/label/17736-Hunya-Munya-Records",
  "https://www.discogs.com/label/79509-Hunya-Munya-Digital",
  "https://musicbrainz.org/label/19259b9b-fce6-406d-94a1-8f2949feb58d",
  // Deliberately NOT listing the Complete Catalog Spotify playlist here.
  // sameAs means "a page that unambiguously identifies this item", and a
  // playlist page identifies a playlist, not the label. Spotify exposes no
  // label entity to point at, so the org simply has no Spotify sameAs. The
  // footer links to the playlist, which is the right place for it.
];

export function orgSchema() {
  return {
    "@context": "https://schema.org",
    // Organization, not MusicLabel. schema.org has never defined MusicLabel,
    // so the whole brand node failed to resolve: the logo, email, foundingDate
    // and the sameAs profiles below were hanging off a class Google cannot map,
    // and every recordLabel / publisher reference to @id resolved to nothing.
    "@type": "Organization",
    additionalType: "https://www.wikidata.org/wiki/Q18127",
    "@id": ORG_ID,
    name: LABEL_NAME,
    alternateName: ["Hunya Munya", "HMR", "Hunya Munya Digital", "HM Digital"],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`, // 900x600, transparent PNG sourced from hm_transparent.gif
    image: `${SITE_URL}/logo.png`,
    email: "contact@hunyamunyarecords.com",
    description:
      "LA-based independent electronic music label and publisher. Ambient, Downtempo, Chillout, Breakbeat, IDM, Tech House, and Progressive across 38 releases since 2002. Home to Rykard, Darius Kohanim, Habersham, Distant Fragment, and Blue Room Project.",
    slogan: "Boutique electronic music label · LA · since 2002",
    foundingDate: "2002",
    foundingLocation: {
      "@type": "Place",
      name: "Los Angeles, CA, USA",
    },
    areaServed: "Worldwide",
    genre: LABEL_GENRES,
    sameAs: LABEL_SAME_AS,
  };
}

// WebSite entity. Gives search engines a clean root entity for the site
// (separate from the org). Not adding `potentialAction` SearchAction yet
// because Google requires a working search endpoint for it and we don't
// have one. WebSite alone still helps disambiguate the brand entity.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: LABEL_NAME,
    inLanguage: "en-US",
    publisher: { "@id": ORG_ID },
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
  if (l.musicbrainz) sameAs.push(l.musicbrainz);

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

// schema.org offers four MusicAlbumReleaseType values and this catalog is not
// all albums: it is mostly singles and EPs. Read the label's own naming first
// ("... EP", "... Single"), which is the most reliable signal we have.
//
// The fallback counts DISTINCT COMPOSITIONS, not rows. The dominant shape here
// is one track pressed with its remixes, where row count says nothing about
// release type: HMR004 is seven versions of "Circular" and HMR006 is four of
// "Flicker", and counting rows would file those as an album and an EP while
// filing the identical product with two mixes as a single. Stripping the
// trailing "(Some Mix)" collapses each of those back to one composition, so
// the nine-record vinyl run lands on SingleRelease as a family instead of
// scattering across all three values.
function distinctCompositions(release: Release): number {
  const base = release.tracklist.map((t) =>
    t.title
      .toLowerCase()
      .replace(/\s*[([][^)\]]*[)\]]\s*$/, "")
      .trim(),
  );
  return new Set(base.filter(Boolean)).size;
}

function albumReleaseTypeFor(release: Release): string {
  const title = release.title.toLowerCase();
  if (/\bep\b/.test(title)) return "https://schema.org/EPRelease";
  if (/\bsingle\b/.test(title)) return "https://schema.org/SingleRelease";
  const n = distinctCompositions(release);
  if (n === 0) return "https://schema.org/AlbumRelease";
  if (n <= 2) return "https://schema.org/SingleRelease";
  if (n <= 6) return "https://schema.org/EPRelease";
  return "https://schema.org/AlbumRelease";
}

export function releaseJsonLd(release: Release, artist: Artist | null) {
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: release.title,
    url: `${SITE_URL}/catalog/${catnoSlug(release)}`,
    recordLabel: { "@id": ORG_ID },
    albumReleaseType: albumReleaseTypeFor(release),
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
  // Tie the album entity to the same release on each store, so search engines
  // connect the catalog page to its Spotify/Apple/etc. counterparts. Bandcamp
  // and Discogs point at the same release too, just on shop-shaped sites.
  const sameAs = [
    ...streamingLinksFor(release).map((l) => l.url),
    ...[release.buy.bandcamp, release.buy.discogs].filter(
      (u): u is string => Boolean(u),
    ),
  ];
  if (sameAs.length) out.sameAs = sameAs;
  // A purchasable physical release also gets an Offer, attached to the album
  // entity rather than emitted as a second standalone Product node. Two nodes
  // for one SKU on one page compete with each other; nesting keeps a single
  // subject. Only shipped when there is a price and somewhere to spend it.
  const offerUrl = release.buy.shopify ?? release.buy.bandcamp;
  if (
    typeof release.price_usd === "number" &&
    offerUrl &&
    release.status !== "upcoming" &&
    release.status !== "draft"
  ) {
    const soldOut = release.sold_out || release.status === "oop";
    out.offers = {
      "@type": "Offer",
      url: offerUrl,
      price: release.price_usd.toFixed(2),
      priceCurrency: "USD",
      availability: soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
    };
  }
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

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${LABEL_NAME}`,
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: LABEL_NAME,
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@hunyamunyarecords.com",
        contactType: "customer service",
        areaServed: "Worldwide",
        availableLanguage: "English",
      },
    },
  };
}
