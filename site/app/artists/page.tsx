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
      "The full Hunya Munya Records roster — active and archival artists across ambient, electronic, and experimental music since 2003.",
    path: "/artists",
  });
}

const TIER_ORDER = { anchor: 0, active: 1, archived: 2 } as const;

export default function ArtistsIndex() {
  const artists = getAllArtists().sort((a, b) => {
    const ta = TIER_ORDER[a.data.tier];
    const tb = TIER_ORDER[b.data.tier];
    if (ta !== tb) return ta - tb;
    return a.data.name.localeCompare(b.data.name);
  });

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
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map(({ data }) => (
          <li key={data.slug}>
            <Link
              href={`/artists/${data.slug}`}
              className="group block border border-neutral-800 p-5 transition-colors hover:border-neutral-600 hover:bg-neutral-900"
            >
              <p className="font-serif text-xl text-neutral-50">{data.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
                {data.tier === "anchor" ? "Anchor artist" : data.tier === "active" ? "Active" : "Archival"}
              </p>
              {data.shortBio ? (
                <p className="mt-3 text-sm text-neutral-300">{data.shortBio}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
