import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { CatalogGrid } from "@/components/CatalogGrid";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Vinyl Catalog"),
    description:
      "Vinyl catalog from Hunya Munya Records: 12\" HMR001 to HMR010 and collectible limited vinyl since 2002, on an LA-based boutique label crafting Electronic, Ambient, Breaks, and Chillout.",
    path: "/catalog/vinyl",
  });
}

export default function VinylCatalog() {
  const releases = getAllReleases()
    .filter((r) => r.data.format.some((f) => f.startsWith("vinyl")))
    .sort((a, b) => b.year - a.year);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Catalog", path: "/catalog" },
            { name: "Vinyl", path: "/catalog/vinyl" },
          ]),
        ]}
      />
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">Vinyl</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Vinyl releases on Hunya Munya Records, HMR001 through HMR010.
        </p>
        <nav aria-label="Catalog filters" className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/catalog" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">All</Link>
          <Link href="/catalog/vinyl" className="border border-neutral-700 bg-neutral-900 px-3 py-1 text-neutral-100">Vinyl</Link>
          <Link href="/catalog/cd" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">CD</Link>
          <Link href="/catalog/digital" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">Digital</Link>
        </nav>
      </header>
      <CatalogGrid releases={releases} />
    </>
  );
}
