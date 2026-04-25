import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";
import {
  getAllReleases,
  getArtistBySlug,
  getReleaseByCatnoSlug,
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

function spotifyEmbedFrom(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(?:embed\/)?(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
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
  return (
    <div className="mt-4 space-y-5 text-sm">
      {Array.from(bySide.entries()).map(([side, items]) => (
        <div key={side}>
          {side ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              Side {side}
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

export function generateStaticParams(): Params[] {
  return getAllReleases().map((r) => ({ catnoSlug: r.catnoSlug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { catnoSlug } = await params;
  const r = getReleaseByCatnoSlug(catnoSlug);
  if (!r) return {};
  const displayArtists = r.resolvedArtists
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

// Surface zone, single drift. Detail-page calm.
const RELEASE_LANES: LaneConfig[] = [
  { shape: "oblong", direction: "lr", top: "55%", width: 110, duration: 70, delay: -10, opacityMod: 0.9 },
];

export default async function ReleasePage({ params }: { params: Promise<Params> }) {
  const { catnoSlug } = await params;
  const r = getReleaseByCatnoSlug(catnoSlug);
  if (!r) notFound();
  const resolvedArtists = r.resolvedArtists.map((a) => {
    const doc = getArtistBySlug(a.slug);
    return {
      slug: a.slug,
      name: a.name ?? doc?.data.name ?? a.slug,
      exists: Boolean(doc),
    };
  });
  const primaryArtistDoc = getArtistBySlug(r.resolvedArtists[0]?.slug ?? r.data.artist);

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
      <UnderwaterLayer zone="surface" lanes={RELEASE_LANES}>
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

        {r.data.embeds.spotify && spotifyEmbedFrom(r.data.embeds.spotify) ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Listen</h2>
            <div className="mt-4 w-full max-w-3xl overflow-hidden rounded-xl">
              <iframe
                src={spotifyEmbedFrom(r.data.embeds.spotify)!}
                title={`${r.data.title}, Spotify player`}
                width="100%"
                height={352}
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                className="block border-0"
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

        {Object.keys(r.data.buy).length > 0 || Object.keys(r.data.embeds).length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Listen &amp; buy</h2>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-300">
              {Object.entries({ ...r.data.embeds, ...r.data.buy }).map(([k, v]) =>
                v ? (
                  <li key={k}>
                    <a
                      href={v}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:text-neutral-50 hover:underline"
                    >
                      {k}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}
      </article>
      </UnderwaterLayer>
    </>
  );
}
