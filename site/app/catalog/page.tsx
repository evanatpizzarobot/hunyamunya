import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases, compareReleasesForCatalog } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { CatalogGrid } from "@/components/CatalogGrid";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Wreck zone: big whale-form deepest + an oblong mid-shallow + a small
// narrow at mid for variety. Bigger creature lives in darker water.
const CATALOG_LANES: LaneConfig[] = [
  { shape: "whale",  direction: "rl", top: "78%", width: 280, duration: 110, delay: -40, opacityMod: 0.75 },
  { shape: "oblong", direction: "lr", top: "30%", width: 120, duration: 75,  delay: -10, opacityMod: 0.9 },
  { shape: "narrow", direction: "rl", top: "55%", width: 80,  duration: 65,  delay: -25, opacityMod: 0.8, mobileHide: true },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Catalog"),
    description:
      "Hunya Munya Records release catalog. 38 limited vinyl, CD, and digital releases since 2002 across Ambient, Downtempo, Chillout, Breakbeat, IDM, Tech House, Progressive House, and cinematic electronic. From HMR001 (2003) through HMR010 NCO (2025).",
    path: "/catalog",
  });
}

export default function CatalogIndex() {
  const releases = getAllReleases().sort(compareReleasesForCatalog);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Catalog", path: "/catalog" },
          ]),
        ]}
      />
      <UnderwaterLayer zone="wreck" lanes={CATALOG_LANES} flushTop>
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">Catalog</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Every Hunya Munya release, newest first. {releases.length} titles across vinyl, CD, and digital.
        </p>
        <nav aria-label="Catalog filters" className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/catalog"
            className="border border-neutral-700 bg-neutral-900 px-3 py-1 text-neutral-100"
          >
            All
          </Link>
          <Link href="/catalog/vinyl" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">
            Vinyl
          </Link>
          <Link href="/catalog/cd" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">
            CD
          </Link>
          <Link href="/catalog/digital" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">
            Digital
          </Link>
        </nav>
      </header>
      <CatalogGrid releases={releases} />
      </UnderwaterLayer>
    </>
  );
}
