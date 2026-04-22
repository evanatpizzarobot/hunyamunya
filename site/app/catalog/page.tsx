import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { CatalogGrid } from "@/components/CatalogGrid";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Catalog"),
    description:
      "The complete release catalog of Hunya Munya Records: limited vinyl, CD, and digital releases since 2002 across Electronic, Ambient, and Chillout music.",
    path: "/catalog",
  });
}

export default function CatalogIndex() {
  const releases = getAllReleases().sort((a, b) => b.year - a.year);

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
    </>
  );
}
