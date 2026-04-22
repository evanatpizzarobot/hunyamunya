import Link from "next/link";
import type { Metadata } from "next";
import { getAllReleases } from "@/lib/content";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Catalog"),
    description:
      "The complete release catalog of Hunya Munya Records: vinyl and digital releases since 2003 across ambient, electronic, and experimental music.",
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
          Every Hunya Munya release, newest first. {releases.length} titles and counting.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {releases.map((r) => (
          <li key={r.catnoSlug}>
            <Link
              href={r.urlPath}
              className="block border border-neutral-800 p-4 transition-colors hover:border-neutral-600 hover:bg-neutral-900"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                {r.data.catalog_number ? `${r.data.catalog_number} · ${r.year}` : `${r.year}`}
              </p>
              <p className="mt-1 font-serif text-lg text-neutral-50">{r.data.title}</p>
              <p className="text-sm text-neutral-400">{r.data.artist}</p>
              <p className="mt-1 text-xs text-neutral-500">{r.data.format.join(", ")}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
