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
    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {releases.map((r) => {
        const cover = r.data.cover_image;
        return (
          <li key={r.catnoSlug}>
            <Link
              href={r.urlPath}
              className="group block overflow-hidden border border-neutral-800 transition-colors hover:border-neutral-500"
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
                      className="h-1/2 w-auto opacity-30"
                    />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {r.data.catalog_number ? `${r.data.catalog_number} · ${r.year}` : `${r.year}`}
                </p>
                <p className="mt-1 font-serif text-base leading-snug text-neutral-50">{r.data.title}</p>
                <p className="text-xs text-neutral-400">{displayArtists(r)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
