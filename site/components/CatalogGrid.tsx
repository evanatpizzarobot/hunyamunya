import Link from "next/link";
import type { ReleaseDoc } from "@/lib/content";
import { getArtistBySlug } from "@/lib/content";

function displayArtists(r: ReleaseDoc): string {
  return r.resolvedArtists
    .map((a) => a.name ?? getArtistBySlug(a.slug)?.data.name ?? a.slug)
    .join(" & ");
}

export function CatalogGrid({ releases }: { releases: ReleaseDoc[] }) {
  if (!releases.length) {
    return <p className="text-neutral-400">No releases match this filter.</p>;
  }
  return (
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
            <p className="text-sm text-neutral-400">{displayArtists(r)}</p>
            <p className="mt-1 text-xs text-neutral-500">{r.data.format.join(", ")}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
