import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { CatalogGrid } from "@/components/CatalogGrid";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("CD Catalog"),
    description:
      "CD releases from Hunya Munya Records: full-length albums and limited CDr releases spanning ambient, electronic, and experimental music since 2003.",
    path: "/catalog/cd",
  });
}

export default function CDCatalog() {
  const releases = getAllReleases()
    .filter((r) => r.data.format.includes("cd"))
    .sort((a, b) => b.year - a.year);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Catalog", path: "/catalog" },
            { name: "CD", path: "/catalog/cd" },
          ]),
        ]}
      />
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-neutral-50">CD</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Full-length albums and limited CDr releases on Hunya Munya Records.
        </p>
        <nav aria-label="Catalog filters" className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/catalog" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">All</Link>
          <Link href="/catalog/vinyl" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">Vinyl</Link>
          <Link href="/catalog/cd" className="border border-neutral-700 bg-neutral-900 px-3 py-1 text-neutral-100">CD</Link>
          <Link href="/catalog/digital" className="border border-neutral-800 px-3 py-1 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100">Digital</Link>
        </nav>
      </header>
      <CatalogGrid releases={releases} />
    </>
  );
}
