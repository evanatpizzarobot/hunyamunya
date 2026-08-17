import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import {
  archiveCoverFor,
  getAllArtists,
  getArtistBySlug,
  getReleasesByArtistSlug,
} from "@/lib/content";
import { buildMetadata, artistTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { artistJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

type Params = { slug: string };

function youtubeEmbedFrom(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

// Converts `*asterisk-wrapped*` runs in a plaintext shortBio into italic
// <em> elements so release titles and press names read as properly emphasized
// inside the Highlights pill. Everything else passes through as text.
function renderEmphasis(text: string): React.ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).map((part, i) => {
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// First 4-digit year inside a `yearsActive` string like "2005", "2005-2008",
// or "1989-present". Used to populate the "Est. YEAR" kicker when the artist
// hasn't set an explicit `intro.est_year`.
function parseFirstYear(yearsActive: string | undefined): number | undefined {
  if (!yearsActive) return undefined;
  const m = yearsActive.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : undefined;
}

// When an artist has no curated `shortBio` in frontmatter, extract a serviceable
// highlight from the first paragraph of the MDX body. Strips WP-imported HTML
// tags, markdown links, and common entities, then trims to one or two sentences.
// Returns null if the body is a stub with no usable prose.
function deriveFallbackHighlight(body: string): string | null {
  const firstPara = body.trim().split(/\n\s*\n/)[0] ?? "";
  if (!firstPara) return null;
  const clean = firstPara
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Skip if this looks like the stub banner ("Full bio pending...") rather than real bio prose.
  if (/^>?\s*Full bio pending/i.test(clean) || /enrichment pass will populate/i.test(clean)) {
    return null;
  }
  if (clean.length < 20) return null;
  const match = clean.match(/^(.{40,260}?[.!?])(\s|$)/);
  return match ? match[1] : clean.slice(0, 260);
}

export function generateStaticParams(): Params[] {
  return getAllArtists().map((a) => ({ slug: a.data.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getArtistBySlug(slug);
  if (!doc) return {};
  const title = doc.data.seoTitle ?? artistTitle(doc.data.name);
  const description =
    doc.data.metaDescription ??
    doc.data.seo?.description ??
    doc.data.shortBio;
  return buildMetadata({
    title,
    description,
    path: `/artists/${slug}`,
    ogImage: doc.data.ogImage ?? doc.data.hero_image ?? doc.data.portrait,
  });
}

// Surface zone: bigger oblong deeper + small narrow shallow. Detail
// pages get a quieter layer so the focus stays on the article content,
// but two lanes guarantee something is always crossing.
const ARTIST_LANES: LaneConfig[] = [
  { shape: "oblong", direction: "lr", top: "70%", width: 130, duration: 75, delay: -10, opacityMod: 0.9 },
  { shape: "narrow", direction: "rl", top: "25%", width: 75,  duration: 55, delay: -25, opacityMod: 0.75 },
];

export default async function ArtistPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getArtistBySlug(slug);
  if (!doc) notFound();
  const releases = getReleasesByArtistSlug(slug).sort((a, b) => b.year - a.year);

  // One player per artist, always. Stacking a player per release was tried and
  // reverted: Spotify themes each embed from that release's cover art, and the
  // iframe is cross-origin so the colour cannot be overridden, which turned an
  // artist with four releases into four clashing colour blocks down the page.
  // An artist with a deep catalog therefore needs an explicit `spotify_embed`,
  // an artist profile or a curated playlist, to be represented by more than one
  // record. Without one the page falls back to a single release: the featured
  // one if it has a Spotify link, otherwise the newest that does.
  const spotifyFallback = doc.data.spotify_embed
    ? null
    : (releases.find(
        (r) =>
          Boolean(r.data.embeds.spotify) &&
          (r.data.catalog_number === doc.data.featured_release ||
            r.data.slug === doc.data.featured_release),
      ) ?? releases.find((r) => Boolean(r.data.embeds.spotify)));
  const spotifyUrl = doc.data.spotify_embed ?? spotifyFallback?.data.embeds.spotify ?? null;
  // Name the record when it was auto-picked, so it is clear which of their
  // releases is playing. An explicit embed speaks for itself.
  const spotifyCaption = spotifyFallback
    ? [spotifyFallback.data.catalog_number, spotifyFallback.data.title].filter(Boolean).join(" · ")
    : undefined;

  // The discography sits directly under the portrait rather than at the foot of
  // the page. On artists with a long bio it was below the fold entirely, so
  // their releases read as missing even when every one of them was rendered.
  const discography =
    releases.length > 0 ? (
      <section className="mt-6" aria-label={`${doc.data.name} releases`}>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          Releases
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {releases.map((r) => (
            <li key={r.catnoSlug}>
              <Link
                href={r.urlPath}
                className="group flex items-center gap-3 border border-neutral-800 p-3 text-sm hover:border-neutral-600 hover:bg-neutral-900"
              >
                <span className="block h-14 w-14 shrink-0 overflow-hidden bg-neutral-950">
                  {archiveCoverFor(r) ? (
                    <img
                      src={archiveCoverFor(r)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 p-1 text-center font-mono text-[8px] uppercase leading-tight tracking-wider text-neutral-600">
                      {r.data.catalog_number ?? r.data.title}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-neutral-50">{r.data.title}</span>
                  <span className="block text-xs text-neutral-500">
                    {r.data.catalog_number ? `${r.data.catalog_number} · ` : ""}
                    {r.year} · {r.data.format.join(", ")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Artists", path: "/artists" },
            { name: doc.data.name, path: `/artists/${slug}` },
          ]),
          artistJsonLd(
            doc.data,
            releases.map((r) => r.data),
          ),
        ]}
      />
      <UnderwaterLayer zone="surface" lanes={ARTIST_LANES} flushTop>
      <article>
        <header>
          <h1 className="font-serif text-5xl text-neutral-50">{doc.data.name}</h1>
        </header>

        {/* Two columns from lg up, one column below it in the same order. The
            page used to be a single narrow column inside a 1440px container,
            so most of the width sat empty at every scroll position on a wide
            screen. */}
        <div className="mt-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-12">
          {/* Identity rail: who they are and how to hear them. Sticky so the
              player stays reachable while the reading column scrolls. */}
          <aside className="lg:sticky lg:top-24">
            {doc.data.portrait ? (
              <figure className="max-w-sm overflow-hidden border border-neutral-800 lg:max-w-none">
                <img
                  src={doc.data.portrait}
                  alt={doc.data.name}
                  className="block h-auto w-full"
                  loading="eager"
                />
              </figure>
            ) : null}

            {/* Player sits directly under the portrait, stacking with it as one
                block, so an artist is audible before any scrolling. */}
            <SpotifyPlayer
              url={spotifyUrl}
              title={`${doc.data.name} on Spotify`}
              caption={spotifyCaption}
              className="mt-4 max-w-sm lg:max-w-none"
            />

            {doc.data.links && Object.keys(doc.data.links).length > 0 ? (
              <div className="mt-6">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Elsewhere
                </h2>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-300">
                  {Object.entries(doc.data.links).map(([k, v]) => {
                    if (!v) return null;
                    let label = k;
                    try {
                      label = new URL(v).hostname.replace(/^www\./, "");
                    } catch {}
                    return (
                      <li key={k}>
                        <a
                          href={v}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 hover:text-neutral-50 hover:underline"
                        >
                          {label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </aside>

          {/* Reading column: profile, releases, biography, video. */}
          <div className="mt-10 lg:mt-0">
          {(() => {
            const intro = doc.data.intro;
            const h1 = intro?.heading_line_1;
            const h2 = intro?.heading_line_2;
            const showHeading = Boolean(h1 || h2);

            const blurbHtml = intro?.blurb_html;
            const blurbText = !blurbHtml
              ? doc.data.shortBio ?? deriveFallbackHighlight(doc.body)
              : null;

            const estYear = intro?.est_year ?? parseFirstYear(doc.data.yearsActive);

            const highlights = intro?.highlights ?? [];
            const tags =
              intro?.tags && intro.tags.length > 0
                ? intro.tags
                : (doc.data.genres ?? []).map((name) => ({
                    name,
                    accent: false,
                  }));

            if (
              !showHeading &&
              !blurbHtml &&
              !blurbText &&
              highlights.length === 0 &&
              tags.length === 0
            ) {
              return null;
            }

            return (
              <section
                className="artist-intro"
                aria-label={`${doc.data.name} profile`}
              >
                <div className="ai-accent" />
                <div className="ai-top">
                  <span className="ai-kicker">Profile · HMR</span>
                  {doc.data.tier === "anchor" ? (
                    <>
                      <span className="ai-dot" aria-hidden="true" />
                      <span className="ai-kicker ai-kicker-accent">Anchor artist</span>
                    </>
                  ) : null}
                  {estYear ? (
                    <>
                      <span className="ai-dot" aria-hidden="true" />
                      <span className="ai-kicker">Est. {estYear}</span>
                    </>
                  ) : null}
                </div>
                {showHeading ? (
                  <h2 className="ai-heading">
                    {h1 ? <span className="ai-heading-line">{h1}</span> : null}
                    {h2 ? (
                      <span className="ai-heading-line ai-heading-italic">
                        {h2}
                      </span>
                    ) : null}
                  </h2>
                ) : null}
                {blurbHtml ? (
                  <p
                    className="ai-blurb"
                    dangerouslySetInnerHTML={{ __html: blurbHtml }}
                  />
                ) : blurbText ? (
                  <p className="ai-blurb">{renderEmphasis(blurbText)}</p>
                ) : null}
                {highlights.length > 0 ? (
                  <div className="ai-highlights">
                    {highlights.map((h, i) => (
                      <div key={`${h.label}-${i}`} className="ai-stat">
                        <span className="ai-stat-num">{h.num}</span>
                        <span className="ai-stat-label">{h.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {tags.length > 0 ? (
                  <div className="ai-tags">
                    {tags.map((t, i) => (
                      <span
                        key={`${t.name}-${i}`}
                        className={`ai-tag${t.accent ? " ai-tag-accent" : ""}`}
                      >
                        {t.accent ? "★ " : ""}
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })()}

          {/* Stations that have played this artist. Sits under the profile
              block because it is evidence for the claims made there. */}
          {doc.data.radio_support.length > 0 ? (
            <section className="mt-2" aria-label={`${doc.data.name} radio support`}>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                Radio support
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {doc.data.radio_support.map((station) => (
                  <span
                    key={station}
                    className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-300"
                  >
                    {station}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {discography}

          <div className="prose prose-invert prose-neutral mt-10 max-w-3xl">
            <MDXRemote source={doc.body} components={mdxComponents} />
          </div>

        {(() => {
          const youtubeSrc = doc.data.featured_video
            ? youtubeEmbedFrom(doc.data.featured_video)
            : null;
          if (!youtubeSrc) return null;

          return (
            <section className="mt-12 border-t border-neutral-800 pt-8">
              <h2 className="font-serif text-2xl text-neutral-100">Watch</h2>

              {youtubeSrc ? (
                <div className="mt-4 aspect-video w-full max-w-3xl overflow-hidden border border-neutral-800 bg-black">
                  <iframe
                    src={youtubeSrc}
                    title={`${doc.data.name}, featured track`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : null}
            </section>
          );
        })()}
          </div>
        </div>
      </article>
      </UnderwaterLayer>
    </>
  );
}
