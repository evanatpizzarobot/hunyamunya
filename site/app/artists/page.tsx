import Link from "next/link";
import type { Metadata } from "next";
import { getAllArtists } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Artists"),
    description:
      "The full Hunya Munya Records roster — active and archival artists crafting Electronic, Ambient, and Chillout music since 2002.",
    path: "/artists",
  });
}

export default function ArtistsIndex() {
  const artists = getAllArtists().sort((a, b) => a.data.name.localeCompare(b.data.name));

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Artists", path: "/artists" },
          ]),
        ]}
      />
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">Artists</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          The Hunya Munya Records roster. Every artist who has released on the label stays on the site.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {artists.map(({ data }) => {
          const img = data.portrait ?? data.hero_image;
          return (
            <li key={data.slug}>
              <Link
                href={`/artists/${data.slug}`}
                className="group block overflow-hidden border border-neutral-800 transition-colors hover:border-neutral-600"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
                  {img ? (
                    <img
                      src={img}
                      alt={data.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <img
                        src="/logo.gif"
                        alt=""
                        aria-hidden="true"
                        className="h-1/2 w-auto opacity-40"
                      />
                    </div>
                  )}
                </div>
                <p className="p-3 text-center font-serif text-base text-neutral-100 group-hover:text-white">
                  {data.name}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
