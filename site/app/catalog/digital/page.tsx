import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { CatalogGrid } from "@/components/CatalogGrid";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

const CATALOG_LANES: LaneConfig[] = [
  { shape: "whale",  direction: "rl", top: "78%", width: 280, duration: 110, delay: -40, opacityMod: 0.75 },
  { shape: "oblong", direction: "lr", top: "30%", width: 120, duration: 75,  delay: -10, opacityMod: 0.9 },
  { shape: "narrow", direction: "rl", top: "55%", width: 80,  duration: 65,  delay: -25, opacityMod: 0.8, mobileHide: true },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Digital Catalog"),
    description:
      "Digital catalog from Hunya Munya Records. HMDIGITAL001-HMDIGITAL018 (2005-2008): Tech House, Progressive House, Deep House, Breakbeat, and Tribal EPs. Plus later Rykard digital-only releases in Ambient, Downtempo, and cinematic electronic music.",
    path: "/catalog/digital",
  });
}

export default function DigitalCatalog() {
  const releases = getAllReleases()
    .filter((r) => r.data.format.includes("digital"))
    .sort((a, b) => b.year - a.year);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Catalog", path: "/catalog" },
            { name: "Digital", path: "/catalog/digital" },
          ]),
        ]}
      />
      <UnderwaterLayer zone="wreck" lanes={CATALOG_LANES} flushTop>
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">Digital</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Digital releases on Hunya Munya Records, including the HMDIGITAL sublabel (HMDIGITAL001-HMDIGITAL018, 2005-2008) and later digital-only releases from the main label.
        </p>
        <nav aria-label="Catalog filters" className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/catalog" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">All</Link>
          <Link href="/catalog/vinyl" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">Vinyl</Link>
          <Link href="/catalog/cd" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">CD</Link>
          <Link href="/catalog/digital" className="border border-neutral-700 bg-neutral-900 px-3 py-1 text-neutral-100">Digital</Link>
        </nav>
      </header>
      <CatalogGrid releases={releases} />
      </UnderwaterLayer>
    </>
  );
}
