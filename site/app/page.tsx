import Link from "next/link";
import { getAllArtists, getAllNews, getAllReleases } from "@/lib/content";
import { LABEL_NAME } from "@/lib/jsonld";

export default function Home() {
  const artists = getAllArtists();
  const releases = getAllReleases();
  const news = getAllNews().slice(0, 3);
  const activeArtists = artists.filter((a) => a.data.tier === "anchor" || a.data.tier === "active");

  return (
    <>
      <section className="py-12">
        <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
          Independent ambient electronic label · Los Angeles · since 2003
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight text-neutral-50 md:text-5xl">
          {LABEL_NAME}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-300">
          Hunya Munya Records is an independent ambient electronic music label based in Los Angeles. Since 2003,
          we&rsquo;ve released vinyl records and digital albums from artists including{" "}
          <Link href="/artists/rykard" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            Rykard
          </Link>
          , Blue Room Project, Dirk Bajema, and Yenn — working across ambient, electronic, and experimental music.
          Browse the{" "}
          <Link href="/catalog" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            full catalog
          </Link>
          , meet the{" "}
          <Link href="/artists" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            roster
          </Link>
          , or read about the{" "}
          <Link href="/about" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            label
          </Link>
          .
        </p>
      </section>

      {activeArtists.length ? (
        <section className="mt-8 border-t border-neutral-800 pt-8">
          <h2 className="font-serif text-2xl text-neutral-100">Now</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeArtists.map(({ data }) => (
              <li key={data.slug}>
                <Link
                  href={`/artists/${data.slug}`}
                  className="block border border-neutral-800 p-4 transition-colors hover:border-neutral-600 hover:bg-neutral-900"
                >
                  <p className="font-serif text-lg text-neutral-50">{data.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
                    {data.tier === "anchor" ? "Anchor artist" : "Active"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 border-t border-neutral-800 pt-8">
        <h2 className="font-serif text-2xl text-neutral-100">Latest</h2>
        <ul className="mt-4 space-y-3">
          {news.map((n) => (
            <li key={n.urlPath}>
              <Link href={n.urlPath} className="block text-neutral-300 hover:text-neutral-50">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">{n.data.date} · </span>
                <span className="font-serif">{n.data.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href="/news" className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-50 hover:underline">
            All news →
          </Link>
        </p>
      </section>

      <section className="mt-12 border-t border-neutral-800 pt-8">
        <p className="font-serif text-xl text-neutral-100">
          23 years. {releases.length} releases.{" "}
          <Link href="/catalog" className="underline underline-offset-4">
            Explore the catalog.
          </Link>
        </p>
      </section>
    </>
  );
}
