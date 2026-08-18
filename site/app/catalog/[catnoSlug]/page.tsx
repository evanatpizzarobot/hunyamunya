import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { PlatformLinks } from "@/components/PlatformLinks";
import { buyLinksFor, streamingLinksFor } from "@/lib/streaming";
import {
  getAllReleases,
  getArtistBySlug,
  getReleaseByCatnoSlug,
  type NormalizedArtistRef,
  type ReleaseDoc,
} from "@/lib/content";
import type { Release } from "@/lib/schema";
import { buildMetadata, releaseTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, releaseJsonLd } from "@/lib/jsonld";

type Params = { catnoSlug: string };

function youtubeEmbedFrom(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

function TrackTitle({ title, credits }: { title: string; credits?: string }) {
  // When per-track credits are set (typical on V/A compilations), surface the
  // artist ahead of the title in the "Artist · Title" shape that Discogs and
  // most label sites use. Keeps the same flex-1 element so duration stays
  // right-aligned.
  if (!credits) return <span className="flex-1 text-neutral-100">{title}</span>;
  return (
    <span className="flex-1 text-neutral-100">
      <span className="text-neutral-300">{credits}</span>
      <span className="mx-2 text-neutral-600">·</span>
      {title}
    </span>
  );
}

function Tracklist({ tracks }: { tracks: Release["tracklist"] }) {
  const hasSides = tracks.some((t) => t.side);
  if (!hasSides) {
    return (
      <ol className="mt-4 text-sm">
        {tracks.map((t) => (
          <li key={t.number} className="flex gap-4 border-b border-neutral-900 py-2">
            <span className="font-mono w-8 text-neutral-500">{t.number}.</span>
            <TrackTitle title={t.title} credits={t.credits} />
            {t.duration ? <span className="font-mono text-neutral-500">{t.duration}</span> : null}
          </li>
        ))}
      </ol>
    );
  }
  const bySide = new Map<string, typeof tracks>();
  for (const t of tracks) {
    const key = t.side ?? "";
    if (!bySide.has(key)) bySide.set(key, []);
    bySide.get(key)!.push(t);
  }
  // A bare letter is a vinyl side and gets the "Side B" prefix. Anything else
  // is a named group ("Digital") and stands on its own, so a 12" that picked
  // up digital-only bonus mixes reads correctly without implying they were
  // ever cut to wax. Map insertion order keeps those groups where the
  // frontmatter put them, below the vinyl sides.
  const headingFor = (side: string) => (/^[A-D]$/i.test(side) ? `Side ${side.toUpperCase()}` : side);
  return (
    <div className="mt-4 space-y-5 text-sm">
      {Array.from(bySide.entries()).map(([side, items]) => (
        <div key={side}>
          {side ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              {headingFor(side)}
            </p>
          ) : null}
          <ol className="mt-2">
            {items.map((t) => (
              <li key={`${side}-${t.number}`} className="flex gap-4 border-b border-neutral-900 py-2">
                <span className="font-mono w-8 text-neutral-500">{t.number}.</span>
                <TrackTitle title={t.title} credits={t.credits} />
                {t.duration ? (
                  <span className="font-mono text-neutral-500">{t.duration}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

// Heading for the sleeve photo that sits below the hero art. HMR001-009 now
// carry two images: the 2026 art the stores show, and the record as it was
// actually pressed. Naming the format keeps the second one from reading as a
// stray duplicate of the first.
function pressingHeading(format: Release["format"]): string {
  if (format.includes("vinyl-12")) return 'Original 12" pressing';
  if (format.includes("vinyl-7")) return 'Original 7" pressing';
  if (format.includes("vinyl-lp")) return "Original LP pressing";
  return "Original pressing";
}

export function generateStaticParams(): Params[] {
  return getAllReleases().map((r) => ({ catnoSlug: r.catnoSlug }));
}

// A release is billed to its primary artist only, the same rule the catalog
// and discography grids use. Remixers stay credited on the page, just not in
// the byline: "Flicker" is a Boom Jinx record whether or not four people
// touched it. Falls back to the first credit when no role is marked primary,
// which covers the older frontmatter shape.
function billedArtists(r: ReleaseDoc): NormalizedArtistRef[] {
  const primaries = r.resolvedArtists.filter((a) => a.role === "primary");
  return primaries.length > 0 ? primaries : r.resolvedArtists.slice(0, 1);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { catnoSlug } = await params;
  const r = getReleaseByCatnoSlug(catnoSlug);
  if (!r) return {};
  const displayArtists = billedArtists(r)
    .map((a) => a.name ?? getArtistBySlug(a.slug)?.data.name ?? a.slug)
    .join(" & ");
  const title = r.data.seoTitle ?? releaseTitle(r.data.title, displayArtists, r.data.catalog_number);
  const description =
    r.data.metaDescription ??
    r.data.seo?.description ??
    `${r.data.title} by ${displayArtists}${r.data.catalog_number ? ` (${r.data.catalog_number})` : ""}, released ${r.year} on Hunya Munya Records.`;
  return buildMetadata({
    title,
    description,
    path: r.urlPath,
    ogImage: r.data.ogImage ?? r.data.cover_image,
    ogType: "music.album",
  });
}

// Surface zone: bigger oblong deeper + small narrow shallow. Two
// lanes so a long release page never feels empty while reading.
const RELEASE_LANES: LaneConfig[] = [
  { shape: "oblong", direction: "lr", top: "70%", width: 130, duration: 75, delay: -10, opacityMod: 0.9 },
  { shape: "narrow", direction: "rl", top: "25%", width: 75,  duration: 55, delay: -25, opacityMod: 0.75 },
];

export default async function ReleasePage({ params }: { params: Promise<Params> }) {
  const { catnoSlug } = await params;
  const r = getReleaseByCatnoSlug(catnoSlug);
  if (!r) notFound();
  const linkable = (a: NormalizedArtistRef) => {
    const doc = getArtistBySlug(a.slug);
    return {
      slug: a.slug,
      name: a.name ?? doc?.data.name ?? a.slug,
      exists: Boolean(doc),
    };
  };
  const resolvedArtists = billedArtists(r).map(linkable);
  // Everyone who is not billed on the byline still gets a credit line of their
  // own below it, so a remixer is one click from the release they worked on.
  const billedSlugs = new Set(billedArtists(r).map((a) => a.slug));
  const remixers = r.resolvedArtists.filter((a) => !billedSlugs.has(a.slug)).map(linkable);
  const primaryArtistDoc = getArtistBySlug(r.resolvedArtists[0]?.slug ?? r.data.artist);
  const streamingLinks = streamingLinksFor(r.data);
  const buyLinks = buyLinksFor(r.data);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Catalog", path: "/catalog" },
            { name: r.data.title, path: r.urlPath },
          ]),
          releaseJsonLd(r.data, primaryArtistDoc?.data ?? null),
        ]}
      />
      <UnderwaterLayer zone="surface" lanes={RELEASE_LANES} flushTop>
      <article>
        <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-start lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {r.data.catalog_number ? `${r.data.catalog_number} · ${r.year}` : `${r.year}`} ·{" "}
              {r.data.format.join(", ")}
            </p>
            <h1 className="mt-2 font-serif text-4xl text-neutral-50 md:text-5xl">{r.data.title}</h1>
            <p className="mt-3 text-lg text-neutral-300">
              {resolvedArtists.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 ? <span className="text-neutral-500"> &amp; </span> : null}
                  {a.exists ? (
                    <Link href={`/artists/${a.slug}`} className="underline-offset-4 hover:underline">
                      {a.name}
                    </Link>
                  ) : (
                    <span>{a.name}</span>
                  )}
                </span>
              ))}
            </p>
            {remixers.length > 0 ? (
              <p className="mt-2 text-sm text-neutral-400">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                  Remixes by
                </span>{" "}
                {remixers.map((a, i) => (
                  <span key={a.slug}>
                    {i > 0 ? <span className="text-neutral-600">, </span> : null}
                    {a.exists ? (
                      <Link href={`/artists/${a.slug}`} className="underline-offset-4 hover:underline">
                        {a.name}
                      </Link>
                    ) : (
                      <span>{a.name}</span>
                    )}
                  </span>
                ))}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {r.data.status === "draft" ? (
                <span className="inline-block border border-amber-700 bg-amber-950 px-2 py-0.5 uppercase tracking-wider text-amber-200">
                  Draft: actively being worked on
                </span>
              ) : null}
              {r.data.sold_out || r.data.status === "oop" ? (
                <span className="inline-block border border-rose-800 bg-rose-950 px-2 py-0.5 uppercase tracking-wider text-rose-200">
                  Sold out
                </span>
              ) : null}
              {r.data.edition ? (
                <span className="inline-block border border-neutral-700 bg-neutral-900 px-2 py-0.5 uppercase tracking-wider text-neutral-300">
                  {r.data.edition}
                </span>
              ) : null}
              {r.data.rpm ? (
                <span className="inline-block border border-neutral-700 bg-neutral-900 px-2 py-0.5 uppercase tracking-wider text-neutral-300">
                  {r.data.rpm} RPM
                </span>
              ) : null}
              {typeof r.data.price_usd === "number" && !r.data.sold_out && r.data.status !== "oop" ? (
                r.data.buy.shopify ? (
                  <a
                    href={r.data.buy.shopify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border border-emerald-600 bg-emerald-950 px-2 py-0.5 uppercase tracking-wider text-emerald-200 hover:bg-emerald-900 hover:text-emerald-100"
                  >
                    ${r.data.price_usd.toFixed(2)} USD · Buy
                  </a>
                ) : (
                  <span className="inline-block border border-emerald-600 bg-emerald-950 px-2 py-0.5 uppercase tracking-wider text-emerald-200">
                    ${r.data.price_usd.toFixed(2)} USD
                  </span>
                )
              ) : null}
            </div>
            {/* Player sits directly under the release badges so it is visible
                without scrolling, with the cover art alongside it. */}
            <SpotifyPlayer
              url={r.data.embeds.spotify}
              title={`${r.data.title}, Spotify player`}
              className="mt-6 max-w-2xl"
            />
            {/* Direct DSP links under the player, so a Tidal or Amazon
                listener is one click away instead of hunting the footer. */}
            {streamingLinks.length > 0 ? (
              <div className="mt-5 max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Listen on
                </p>
                <PlatformLinks
                  links={streamingLinks}
                  ariaLabel={`Listen to ${r.data.title} on streaming platforms`}
                  className="mt-2"
                />
              </div>
            ) : null}
            <div className="prose prose-invert prose-neutral mt-6 max-w-none">
              <MDXRemote source={r.body} components={mdxComponents} />
            </div>
          </div>
          {r.data.cover_image ? (
            <figure className="order-first overflow-hidden border border-neutral-800 md:order-last md:sticky md:top-24">
              <img
                src={r.data.cover_image}
                alt={`${r.data.title} cover`}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </figure>
          ) : null}
        </section>

        {r.data.vinyl_image ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">
              {pressingHeading(r.data.format)}
            </h2>
            <figure className="mt-4 max-w-sm">
              <img
                src={r.data.vinyl_image}
                alt={`${r.data.title}, original vinyl pressing`}
                className="block h-auto w-full border border-neutral-800"
                loading="lazy"
              />
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                {r.data.catalog_number ? `${r.data.catalog_number} · ` : ""}
                {r.year} pressing
              </figcaption>
            </figure>
          </section>
        ) : null}

        {r.data.tracklist.length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Tracklist</h2>
            <Tracklist tracks={r.data.tracklist} />
          </section>
        ) : null}

        {r.data.credits && Object.values(r.data.credits).some(Boolean) ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Credits</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr] max-w-2xl">
              {Object.entries(r.data.credits)
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                      {k.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-neutral-200">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        ) : null}

        {r.data.embeds.youtube && youtubeEmbedFrom(r.data.embeds.youtube) ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Watch</h2>
            <div className="mt-4 aspect-video w-full max-w-3xl overflow-hidden border border-neutral-800 bg-black">
              <iframe
                src={youtubeEmbedFrom(r.data.embeds.youtube)!}
                title={`${r.data.title}, video`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        ) : null}

        {r.data.gallery.length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Gallery</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {r.data.gallery.map((src) => (
                <li key={src} className="overflow-hidden border border-neutral-800 bg-neutral-950">
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {streamingLinks.length > 0 || buyLinks.length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Listen &amp; buy</h2>
            {streamingLinks.length > 0 ? (
              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Stream
                </p>
                <PlatformLinks
                  links={streamingLinks}
                  ariaLabel={`Stream ${r.data.title}`}
                  className="mt-2"
                />
              </div>
            ) : null}
            {buyLinks.length > 0 ? (
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Buy
                </p>
                <PlatformLinks
                  links={buyLinks}
                  ariaLabel={`Buy ${r.data.title}`}
                  className="mt-2"
                />
              </div>
            ) : null}
          </section>
        ) : null}
      </article>
      </UnderwaterLayer>
    </>
  );
}
