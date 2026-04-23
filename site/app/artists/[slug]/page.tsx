import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
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

export default async function ArtistPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getArtistBySlug(slug);
  if (!doc) notFound();
  const releases = getReleasesByArtistSlug(slug).sort((a, b) => b.year - a.year);

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
      <article>
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            {doc.data.tier === "anchor" ? "Anchor artist" : doc.data.tier === "active" ? "Active" : "Archival"}
          </p>
          <h1 className="font-serif text-5xl text-neutral-50">{doc.data.name}</h1>
          {doc.data.portrait ? (
            <figure className="mt-5 max-w-sm overflow-hidden border border-neutral-800">
              <img
                src={doc.data.portrait}
                alt={doc.data.name}
                className="block h-auto w-full"
                loading="eager"
              />
            </figure>
          ) : null}
          {doc.data.shortBio ? (
            <p className="mt-5 max-w-2xl text-lg text-neutral-300">{doc.data.shortBio}</p>
          ) : null}
        </header>

        <div className="prose prose-invert prose-neutral max-w-3xl">
          <MDXRemote source={doc.body} />
        </div>

        {doc.data.featured_video && youtubeEmbedFrom(doc.data.featured_video) ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Listen</h2>
            <div className="mt-4 aspect-video w-full max-w-3xl overflow-hidden border border-neutral-800 bg-black">
              <iframe
                src={youtubeEmbedFrom(doc.data.featured_video)!}
                title={`${doc.data.name}, featured track`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        ) : null}

        {releases.length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Discography</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {releases.map((r) => (
                <li key={r.catnoSlug}>
                  <Link
                    href={r.urlPath}
                    className="block border border-neutral-800 p-3 text-sm hover:border-neutral-600 hover:bg-neutral-900"
                  >
                    <span className="block font-serif text-neutral-50">{r.data.title}</span>
                    <span className="block text-xs text-neutral-500">
                      {r.data.catalog_number ? `${r.data.catalog_number} · ` : ""}
                      {r.year} · {r.data.format.join(", ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {doc.data.links && Object.keys(doc.data.links).length > 0 ? (
          <section className="mt-12 border-t border-neutral-800 pt-8">
            <h2 className="font-serif text-2xl text-neutral-100">Elsewhere</h2>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-300">
              {Object.entries(doc.data.links).map(([k, v]) =>
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
