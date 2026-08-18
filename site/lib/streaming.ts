// Outbound platform links for a release, in display order. One source of
// truth shared by the release page's "Listen on" block and the MusicAlbum
// JSON-LD sameAs array, so the two never drift apart.

import type { Release } from "./schema";

export type PlatformLink = { key: string; label: string; url: string };

// Display order mirrors where listeners actually are: Spotify first, then the
// other majors, then the niche stores.
const STREAMING_ORDER: Array<{ key: keyof Release["streaming"]; label: string }> = [
  { key: "spotify", label: "Spotify" },
  { key: "apple", label: "Apple Music" },
  { key: "amazon", label: "Amazon Music" },
  { key: "tidal", label: "Tidal" },
  { key: "pandora", label: "Pandora" },
  { key: "deezer", label: "Deezer" },
  { key: "youtube", label: "YouTube" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "beatport", label: "Beatport" },
];

const BUY_ORDER: Array<{ key: keyof Release["buy"]; label: string }> = [
  { key: "bandcamp", label: "Bandcamp" },
  { key: "shopify", label: "HMR Store" },
  { key: "discogs", label: "Discogs" },
  { key: "boomkat", label: "Boomkat" },
  { key: "rough_trade", label: "Rough Trade" },
];

export function streamingLinksFor(release: Release): PlatformLink[] {
  // Older frontmatter carries DSP URLs in `embeds` (and Pandora under `buy`);
  // the explicit `streaming` block wins wherever both are set.
  const merged: Partial<Record<keyof Release["streaming"], string>> = {
    spotify: release.embeds.spotify,
    apple: release.embeds.apple,
    youtube: release.embeds.youtube,
    soundcloud: release.embeds.soundcloud,
    pandora: release.buy.pandora,
    ...Object.fromEntries(
      Object.entries(release.streaming).filter(([, v]) => Boolean(v)),
    ),
  };
  return STREAMING_ORDER.flatMap(({ key, label }) => {
    const url = merged[key];
    return url ? [{ key, label, url }] : [];
  });
}

export function buyLinksFor(release: Release): PlatformLink[] {
  return BUY_ORDER.flatMap(({ key, label }) => {
    const url = release.buy[key];
    return url ? [{ key, label, url }] : [];
  });
}
