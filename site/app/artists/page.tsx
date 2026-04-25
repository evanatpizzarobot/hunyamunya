import Link from "next/link";
import type { Metadata } from "next";
import { getAllArtists } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Mid zone, schooling activity. A trio of staggered school-form
// shadows passes shallow-ish, with one deeper oblong cruising opposite.
const ARTISTS_LANES: LaneConfig[] = [
  { shape: "narrow", direction: "lr", top: "30%", width: 90,  duration: 65, delay: -10, opacityMod: 0.9 },
  { shape: "narrow", direction: "lr", top: "36%", width: 70,  duration: 70, delay: -25, opacityMod: 0.8, mobileHide: true },
  { shape: "narrow", direction: "lr", top: "42%", width: 80,  duration: 62, delay: -40, opacityMod: 0.85 },
  { shape: "oblong", direction: "rl", top: "70%", width: 130, duration: 80, delay: -15, opacityMod: 1.0 },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Artists"),
    description:
      "The full Hunya Munya Records roster. Active and archival artists crafting Electronic, Ambient, Breaks, and Chillout music since 2002.",
    path: "/artists",
  });
}

export default function ArtistsIndex() {
  // "various-artists" is a compilation placeholder for the HMDIGITAL015
  // International Soundscapes EP, not a real roster artist. The MDX stays
  // so the release's artist linkage and /artists/various-artists route
  // still resolve; it's just hidden from the roster listing.
  const artists = getAllArtists()
    .filter((a) => a.data.slug !== "various-artists")
    .sort((a, b) => a.data.name.localeCompare(b.data.name));

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
      <UnderwaterLayer zone="mid" lanes={ARTISTS_LANES}>
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">Artists</h1>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {artists.map(({ data }) => {
          // hero_image wins for the listing card so an artist can ship a
          // landscape/action shot that crops well into the aspect-square
          // thumbnail, while keeping a tighter `portrait` for the detail
          // page header. Falls back to portrait when hero_image is unset.
          const img = data.hero_image ?? data.portrait;
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
      </UnderwaterLayer>
    </>
  );
}
