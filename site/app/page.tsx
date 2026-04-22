import Link from "next/link";
import { getAllArtists, getAllNews, getAllReleases, getCurrentCampaign } from "@/lib/content";
import { LABEL_NAME } from "@/lib/jsonld";
import { HomeHeroBackground } from "@/components/HomeHeroBackground";

export default function Home() {
  const artists = getAllArtists();
  const releases = getAllReleases();
  const news = getAllNews().slice(0, 3);
  const activeArtists = artists.filter((a) => a.data.tier === "anchor" || a.data.tier === "active");
  const campaign = getCurrentCampaign();
  const activeCampaign = campaign.active ?? null;

  return (
    <>
      <HomeHeroBackground campaign={campaign} />

      {/* Hero: when a campaign is active, lead with the campaign headline over the
          full-bleed background image. When inactive, lead with the label name. */}
      <section className="flex min-h-[60vh] flex-col justify-end py-10 md:min-h-[70vh] md:py-14 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
        {activeCampaign ? (
          <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,520px)] md:gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-300">
                {activeCampaign.type === "release" ? "Out Now" : activeCampaign.type.replace("-", " ")}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight text-white md:text-6xl">
                {activeCampaign.headline}
              </h1>
              {activeCampaign.tagline ? (
                <p className="mt-3 text-lg text-neutral-200">{activeCampaign.tagline}</p>
              ) : null}
              <div className="mt-7 flex flex-wrap gap-3">
                {activeCampaign.cta_primary ? (
                  <Link
                    href={activeCampaign.cta_primary.href}
                    className="border border-neutral-100 bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-white"
                  >
                    {activeCampaign.cta_primary.label}
                  </Link>
                ) : null}
                {activeCampaign.cta_secondary ? (
                  <Link
                    href={activeCampaign.cta_secondary.href}
                    className="border border-neutral-400 px-5 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-200 hover:text-white"
                  >
                    {activeCampaign.cta_secondary.label}
                  </Link>
                ) : null}
              </div>
            </div>
            <figure className="[text-shadow:none]">
              <img
                src="/campaigns/rykard-nco-spread.jpg"
                alt="Rykard — NCO 12&quot; Vinyl, front and back cover spread"
                width={1024}
                height={511}
                className="block w-full border border-neutral-800/80 shadow-2xl"
                loading="eager"
              />
            </figure>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-300">
              LA based boutique label &amp; publisher · Electronic · Ambient · Chillout · since 2002
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight text-white md:text-6xl">
              {LABEL_NAME}
            </h1>
          </>
        )}
      </section>

      <section className="mt-2 rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
        <p className="max-w-2xl text-lg text-neutral-300">
          LA based boutique label and publisher since 2002. Crafting Electronic, Ambient, and Chillout for Radio, Film, and TV, plus collectible limited Vinyl and CDs worldwide. Artists include{" "}
          <Link href="/artists/rykard" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            Rykard
          </Link>
          , Blue Room Project,{" "}
          <Link href="/artists/darius-kohanim" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            Darius Kohanim
          </Link>
          ,{" "}
          <Link href="/artists/habersham" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            Habersham
          </Link>
          ,{" "}
          <Link href="/artists/shiloh" className="text-neutral-100 underline underline-offset-4 hover:text-white">
            Shiloh
          </Link>
          , and more. Browse the{" "}
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
        <section className="mt-8 rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
          <h2 className="font-serif text-2xl text-neutral-100">Now</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeArtists.map(({ data }) => (
              <li key={data.slug}>
                <Link
                  href={`/artists/${data.slug}`}
                  className="block border border-neutral-800 p-4 transition-colors hover:border-neutral-600 hover:bg-neutral-900"
                >
                  <p className="font-serif text-lg text-neutral-50">{data.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
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

      <section className="mt-8 rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
        <p className="font-serif text-xl text-neutral-100">
          24 years. {releases.length} releases.{" "}
          <Link href="/catalog" className="underline underline-offset-4">
            Explore the catalog.
          </Link>
        </p>
      </section>
    </>
  );
}
