import { z } from "zod";

const mediaUrl = z.string().refine(
  (s) => s.startsWith("https://") || s.startsWith("/"),
  { message: "Image must be an absolute https:// URL or a site-relative /-path" }
);

const pressQuote = z.object({
  quote: z.string().min(1),
  source: z.string().min(1),
  url: z.string().url().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
});

const seoBlock = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    og_image: mediaUrl.optional(),
    index: z.boolean().default(true),
    follow: z.boolean().default(true),
    in_sitemap: z.boolean().default(true),
  })
  .partial()
  .optional();

export const artistSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(["active", "archived"]).default("archived"),
  tier: z.enum(["anchor", "active", "archived"]).default("archived"),
  genres: z.array(z.string()).default([]),
  // SEO-spec §2.11 canonical bio fields. shortBio drives cards + meta fallback.
  shortBio: z.string().optional(),
  bio_long: z.string().optional(),
  hometown: z.string().optional(),
  yearsActive: z.string().optional(),
  years_on_label: z.tuple([z.number().int(), z.number().int()]).optional(),
  links: z
    .object({
      website: z.string().url().optional(),
      bandcamp: z.string().url().optional(),
      spotify: z.string().url().optional(),
      apple: z.string().url().optional(),
      instagram: z.string().url().optional(),
      discogs: z.string().url().optional(),
      contact: z.string().optional(),
    })
    .partial()
    .default({}),
  hero_image: mediaUrl.optional(),
  portrait: mediaUrl.optional(),
  // A single YouTube video representing this artist's track on HMR. Scraped
  // from each WP artist page embed during the 2026-04-22 export; kept curated
  // so Evan can swap in a better track without a full re-import.
  featured_video: z.string().url().optional(),
  // Explicit Spotify embed for this artist, shown above the YouTube embed in
  // the Listen section. Any open.spotify.com link works (artist profile,
  // album, playlist); it gets normalised to the /embed/ form at render time.
  // Left unset, the artist page falls back to their featured release, then to
  // their newest release that has a Spotify link. Set this on the artists with
  // several releases, where auto-picking one would be arbitrary.
  spotify_embed: z.string().url().optional(),
  press_quotes: z.array(pressQuote).default([]),
  // Catalog number or release slug whose cover art represents this artist at
  // the top of their page. Falls back to their newest release that has real
  // cover art (one that is not just their portrait reused).
  featured_release: z.string().optional(),
  palette_override: z
    .object({
      accent: z.string().optional(),
      bg: z.string().optional(),
    })
    .partial()
    .optional(),
  menu_label: z.string().optional(),
  legacy_slug: z.string().optional(),
  // Editorial masthead block per Claude Design `artist-intro` spec. All fields
  // optional; page template falls back to shortBio + genres + computed year
  // when any piece is missing. `blurb_html` accepts trusted inline HTML
  // (<strong>, <em>) from frontmatter.
  intro: z
    .object({
      heading_line_1: z.string().optional(),
      heading_line_2: z.string().optional(),
      blurb_html: z.string().optional(),
      est_year: z.number().int().min(1900).max(2100).optional(),
      highlights: z
        .array(
          z.object({
            num: z.string().min(1),
            label: z.string().min(1),
          }),
        )
        .default([]),
      tags: z
        .array(
          z.object({
            name: z.string().min(1),
            accent: z.boolean().optional(),
          }),
        )
        .default([]),
    })
    .optional(),
  // SEO-spec §2.2 top-level fields. Prefer these; nested `seo` block is legacy
  // and kept for the initial migrated output until we deprecate it.
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: mediaUrl.optional(),
  seo: seoBlock,
});
export type Artist = z.infer<typeof artistSchema>;

export const releaseFormat = z.enum([
  "vinyl-12",
  "vinyl-7",
  "vinyl-lp",
  "cassette",
  "cd",
  "digital",
]);

export const track = z.object({
  number: z.number().int().min(1),
  title: z.string().min(1),
  duration: z.string().optional(),
  credits: z.string().optional(),
  isrc: z.string().optional(),
  // Tracklist group marker. A single letter (A / B / C / D) renders as
  // "Side A" for vinyl; any other value renders verbatim as its own heading,
  // which is how digital-only bonus mixes ("Digital") sit below the vinyl
  // sides. Stays unset on a release that needs no grouping at all.
  side: z.string().max(16).optional(),
});

export const proofPoint = z.object({
  label: z.string().min(1),
  value: z.number().optional(),
  source: z.string().optional(),
  year_through: z.number().int().min(1900).max(2100).optional(),
});

// Canonical multi-artist shape (HMDIGITAL addendum §2.3.1). Release frontmatter
// may use this OR the legacy single-artist + artists_additional pair; the
// content loader normalizes.
export const releaseArtistRef = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["primary", "featured", "remixer", "producer"]).default("primary"),
});

export const releaseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  catalog_number: z.string().optional(),
  artist: z.string().min(1),
  artists_additional: z.array(z.string()).default([]),
  artists: z.array(releaseArtistRef).optional(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  format: z.array(releaseFormat).default(["digital"]),
  genres: z.array(z.string()).default([]),
  moods: z.array(z.string()).default([]),
  duration_minutes: z.number().optional(),
  tracklist: z.array(track).default([]),
  credits: z
    .object({
      producer: z.string().optional(),
      mastering: z.string().optional(),
      artwork: z.string().optional(),
      photography: z.string().optional(),
      liner_notes: z.string().optional(),
      pressing: z.string().optional(),
      sleeve: z.string().optional(),
    })
    .partial()
    .optional(),
  // Vinyl + pressing metadata
  edition: z.string().optional(),
  rpm: z.number().int().optional(),
  // Shopify integration (per content-drafts §1.3)
  shopify_handle: z.string().optional(),
  shopify_product_id: z.number().int().optional(),
  price_usd: z.number().optional(),
  sold_out: z.boolean().default(false),
  cover_image: mediaUrl.optional(),
  // Photo of the physical pressing, kept alongside `cover_image` on the older
  // vinyl catalog. HMR001-009 were re-arted in 2026 for streaming, but the
  // 12" sleeve is the historical record: the release page shows the new art up
  // top and this below it, while the discography and artist pages keep showing
  // the physical record. Unset on releases that never had a pressing.
  vinyl_image: mediaUrl.optional(),
  gallery: z.array(mediaUrl).default([]),
  embeds: z
    .object({
      bandcamp: z.string().url().optional(),
      spotify: z.string().url().optional(),
      apple: z.string().url().optional(),
      youtube: z.string().url().optional(),
      soundcloud: z.string().url().optional(),
    })
    .partial()
    .default({}),
  buy: z
    .object({
      bandcamp: z.string().url().optional(),
      discogs: z.string().url().optional(),
      shopify: z.string().url().optional(),
      boomkat: z.string().url().optional(),
      rough_trade: z.string().url().optional(),
      pandora: z.string().url().optional(),
    })
    .partial()
    .default({}),
  press_quotes: z.array(pressQuote).default([]),
  sync_available: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived", "oop"]).default("draft"),
  featured: z.boolean().default(false),
  proof_points: z.array(proofPoint).default([]),
  related_news: z.array(z.string()).default([]),
  legacy_slug: z.string().optional(),
  // SEO-spec §2.2 top-level fields.
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: mediaUrl.optional(),
  seo: seoBlock,
});
export type Release = z.infer<typeof releaseSchema>;

export const newsSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  author: z.string().default("Evan Marcus"),
  excerpt: z.string().optional(),
  hero_image: mediaUrl.optional(),
  tags: z.array(z.string()).default([]),
  related_releases: z.array(z.string()).default([]),
  related_artists: z.array(z.string()).default([]),
  legacy_slug: z.string().optional(),
  // SEO-spec §2.2 top-level fields.
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: mediaUrl.optional(),
  seo: seoBlock,
});
export type News = z.infer<typeof newsSchema>;

export const heroMedia = z.object({
  type: z.enum(["image", "video", "loop"]),
  src: mediaUrl,
  poster: mediaUrl.optional(),
});

export const campaignSchema = z.object({
  active: z
    .object({
      id: z.string().min(1),
      type: z.enum(["pre-release", "release", "tour", "reissue", "none"]),
      artist: z.string().min(1),
      release: z.string().nullable().optional(),
      headline: z.string().min(1),
      tagline: z.string().optional(),
      hero_media: heroMedia,
      cta_primary: z.object({ label: z.string(), href: z.string() }).optional(),
      cta_secondary: z.object({ label: z.string(), href: z.string() }).optional(),
      proof_points: z.array(z.string()).default([]),
      active_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      active_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      palette_override: z
        .object({
          accent: z.string().optional(),
          bg: z.string().optional(),
        })
        .partial()
        .optional(),
    })
    .nullable()
    .optional(),
  fallback: z.object({
    headline: z.string().min(1),
    tagline: z.string().optional(),
    hero_media: heroMedia,
  }),
});
export type Campaign = z.infer<typeof campaignSchema>;
