import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAllReleases,
  getArtistBySlug,
  getReleaseByCatnoSlug,
} from "@/lib/content";
import { buildMetadata, releaseTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, releaseJsonLd } from "@/lib/jsonld";

type Params = { catnoSlug: string };

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
      <article>
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            {r.data.catalog_number ? `${r.data.catalog_number} · ${r.year}` : `${r.year}`} ·{" "}
            {r.data.format.join(", ")}
          </p>
          <h1 className="font-serif text-5xl text-neutral-50">{r.data.title}</h1>
          <p className="mt-2 text-lg text-neutral-300">
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
          {r.data.status === "draft" ? (
            <p className="mt-3 inline-block border border-amber-700 bg-amber-950 px-2 py-0.5 text-xs uppercase tracking-wider text-amber-200">
              Draft: awaiting confirmation
            </p>
          ) : null}
        </header>

        <div className="prose prose-invert prose-neutral max-w-3xl">
          <MDXRemote source={r.body} />
        </div>

        {r.data.tracklist.length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Tracklist</h2>
            <ol className="mt-4 space-y-1 text-sm">
              {r.data.tracklist.map((t) => (
                <li key={t.number} className="flex gap-4 border-b border-neutral-900 py-1">
                  <span className="font-mono w-8 text-neutral-500">{t.number}.</span>
                  <span className="flex-1 text-neutral-100">{t.title}</span>
                  {t.duration ? <span className="font-mono text-neutral-500">{t.duration}</span> : null}
                </li>
              ))}
            </ol>
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
    </>
  );
}
