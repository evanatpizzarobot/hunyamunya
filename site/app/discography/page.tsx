import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases, getArtistBySlug, type ReleaseDoc } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Wreck zone same as catalog — the discography page is the catalog
// reorganized by format, so the mood matches.
const DISCOGRAPHY_LANES: LaneConfig[] = [
  { shape: "long",   direction: "rl", top: "75%", width: 240, duration: 100, delay: -40, opacityMod: 0.8 },
  { shape: "oblong", direction: "lr", top: "30%", width: 120, duration: 75,  delay: -10, opacityMod: 0.9 },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Discography"),
    description:
      'The full Hunya Munya Records discography, HMR001 through HMR010 on 12" vinyl, HMB CD releases, and the HMDIGITAL series. An LA-based boutique label and publisher since 2002.',
    path: "/discography",
  });
}

function displayArtists(r: ReleaseDoc): string {
  return r.resolvedArtists
    .map((a) => a.name ?? getArtistBySlug(a.slug)?.data.name ?? a.slug)
    .join(" & ");
}

function byCatalogAsc(a: ReleaseDoc, b: ReleaseDoc): number {
  const ac = a.data.catalog_number ?? "";
  const bc = b.data.catalog_number ?? "";
  if (ac && bc) return ac.localeCompare(bc, "en", { numeric: true });
  if (ac) return -1;
  if (bc) return 1;
  return a.year - b.year;
}

function DiscographyCard({ r }: { r: ReleaseDoc }) {
  const cover = r.data.cover_image;
  return (
    <li>
      <Link
        href={r.urlPath}
        className="group flex h-full flex-col overflow-hidden border border-neutral-800 bg-neutral-950/40 transition-colors hover:border-neutral-500 hover:bg-neutral-900/60"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
          {cover ? (
            <img
              src={cover}
              alt={`${r.data.title} cover`}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <img
                src="/logo.gif"
                alt=""
                aria-hidden="true"
                className="h-1/3 w-auto opacity-25"
              />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
            {r.data.catalog_number ? `${r.data.catalog_number} · ${r.year}` : `${r.year}`}
          </p>
          <p className="font-serif text-lg leading-snug text-neutral-50">{r.data.title}</p>
          <p className="text-sm text-neutral-400">{displayArtists(r)}</p>
        </div>
      </Link>
    </li>
  );
}

function DiscographySection({
  title,
  subtitle,
  releases,
}: {
  title: string;
  subtitle: string;
  releases: ReleaseDoc[];
}) {
  if (!releases.length) return null;
  return (
    <section className="mt-14 first:mt-0">
      <header className="mb-5 border-b border-neutral-900 pb-3">
        <h2 className="font-serif text-3xl text-neutral-50">{title}</h2>
        <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
      </header>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {releases.map((r) => (
          <DiscographyCard key={r.catnoSlug} r={r} />
        ))}
      </ul>
    </section>
  );
}

export default function Discography() {
  const all = getAllReleases();
  const vinyl = all.filter((r) => r.data.format.some((f) => f.startsWith("vinyl"))).sort(byCatalogAsc);
  const cd = all
    .filter((r) => r.data.format.includes("cd") && !r.data.format.some((f) => f.startsWith("vinyl")))
    .sort(byCatalogAsc);
  const digital = all
    .filter((r) => !r.data.format.some((f) => f.startsWith("vinyl") || f === "cd"))
    .sort(byCatalogAsc);

  const total = vinyl.length + cd.length + digital.length;

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Discography", path: "/discography" },
          ]),
        ]}
      />
      <UnderwaterLayer zone="wreck" lanes={DISCOGRAPHY_LANES}>
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">Since 2002</p>
        <h1 className="mt-2 font-serif text-5xl text-neutral-50">Discography</h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-300">
          {total} releases across 12&quot; vinyl, CD, and digital. HMR001 through HMR010 on limited vinyl, the HMB
          full-length series on CD, and the HMDIGITAL EP series. Click any cover for tracklist, credits, and buy links.
        </p>
      </header>

      <DiscographySection
        title={'12" Vinyl'}
        subtitle={'HMR series, 12" 45rpm limited pressings.'}
        releases={vinyl}
      />
      <DiscographySection
        title="CD"
        subtitle="HMB series, full-length albums and CD EPs."
        releases={cd}
      />
      <DiscographySection
        title="Digital"
        subtitle="HMDIGITAL series, EPs and singles."
        releases={digital}
      />
      </UnderwaterLayer>
    </>
  );
}
