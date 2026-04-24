import Link from "next/link";
import { getAllArtists, getAllNews, getAllReleases, getCurrentCampaign } from "@/lib/content";
import { Reveal } from "@/components/home/Reveal";
import { CountUp } from "@/components/home/CountUp";
import { HeroParallax } from "@/components/home/HeroParallax";

function spotifyEmbedFrom(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(?:embed\/)?(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

// Home-page catalog preview sort. Starts as year-descending, then collapses
// multi-volume series that share a catalog-number root (currently HMB005a/b/c/d,
// Rykard's Explorers series spanning 2019 to 2023) into a contiguous group
// sorted ascending by volume letter. Prevents the preview from showing
// Explorers Vol. 4, 2, 3, 1 out of sequence; instead groups them 1, 2, 3, 4.
function seriesSortKey(r: { data: { catalog_number?: string }; year: number }) {
  const cat = r.data.catalog_number ?? "";
  const exp = cat.match(/^HMB005([a-z])$/i);
  if (exp) {
    // Anchor the whole Explorers series to Vol. 4's year so the group sits
    // where the latest volume would have sat in a year-DESC sort.
    const letterIdx = exp[1].toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
    return { year: 2023, subOrder: letterIdx };
  }
  return { year: r.year, subOrder: 0 };
}

export default function Home() {
  const releases = getAllReleases().sort((a, b) => {
    const aKey = seriesSortKey(a);
    const bKey = seriesSortKey(b);
    if (aKey.year !== bKey.year) return bKey.year - aKey.year;
    return bKey.subOrder - aKey.subOrder;
  });
  const artists = getAllArtists();
  const news = getAllNews().slice(0, 5);
  const campaign = getCurrentCampaign();
  const active = campaign.active ?? null;

  const featured =
    (active?.release && releases.find((r) => r.catnoSlug === active.release)) ||
    releases[0];

  const featuredArtistSlug = featured.resolvedArtists[0]?.slug ?? featured.data.artist;
  const featuredArtistDoc = artists.find((a) => a.data.slug === featuredArtistSlug);
  const featuredArtistName = featuredArtistDoc?.data.name ?? featuredArtistSlug;
  const featuredSpotify = featured.data.embeds?.spotify ?? null;

  const [featuredTitleMain, ...featuredTitleRest] = featured.data.title.split(" (");
  const featuredTitleSuffix = featuredTitleRest.length
    ? `(${featuredTitleRest.join(" (")}`
    : "";

  const yearsOperating = new Date().getFullYear() - 2002;
  const totalReleases = releases.length;
  const totalArtists = artists.length;

  const previewCatalog = releases.slice(0, 8);
  const previewRoster = artists.slice(0, 8);

  const formatLabel = (r: (typeof releases)[number]) => {
    const f = r.data.format;
    if (f.includes("vinyl-12")) return '12" Vinyl';
    if (f.includes("vinyl-7")) return '7" Vinyl';
    if (f.includes("vinyl-lp")) return "LP";
    if (f.includes("cd") && f.includes("digital")) return "CD · Digital";
    if (f.includes("cd")) return "CD";
    if (f.includes("cassette")) return "Cassette";
    return "Digital";
  };

  const artistName = (r: (typeof releases)[number]) =>
    r.resolvedArtists
      .map((a) => a.name ?? artists.find((x) => x.data.slug === a.slug)?.data.name ?? a.slug)
      .join(" & ");

  return (
    <>
      <HeroParallax />

      {/* ===================== HERO ===================== */}
      <section
        id="hm-hero"
        className="relative isolate -mt-8 w-screen overflow-hidden bg-ink"
        style={{ minHeight: "92vh", marginLeft: "calc(50% - 50vw)" }}
      >
        <div className="absolute inset-0">
          <div
            data-hm-hero-photo
            className="absolute inset-0 animate-hm-ken-burns bg-cover bg-center"
            style={{
              backgroundImage: "url(/campaigns/hm-hero-pano.jpg)",
              backgroundPosition: "center 58%",
            }}
            role="img"
            aria-label={`Hero image for ${featuredArtistName}, ${featured.data.title}`}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,9,13,0.55) 0%, rgba(5,12,22,0.15) 30%, rgba(5,9,13,0.05) 55%, rgba(5,9,13,0.85) 100%), linear-gradient(180deg, rgba(10,30,55,0.15), rgba(5,9,13,0.10))",
            }}
          />
          <div
            className="pointer-events-none absolute left-0 right-0 top-[76%] h-px opacity-60"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--hm-accent) 20%, var(--hm-accent) 80%, transparent)",
              filter: "blur(0.4px)",
            }}
          />
          <div
            className="pointer-events-none absolute top-1/2 h-[3px] w-1/5 animate-hm-scan mix-blend-screen"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--hm-accent) 70%, white 20%), transparent)",
              filter: "blur(1.5px)",
            }}
          />
          <div
            className="pointer-events-none absolute right-[4vw] top-1/2 z-[3] hidden flex-col items-end gap-1.5 text-[10px] font-light uppercase text-paper/85 mix-blend-screen md:flex"
            style={{
              writingMode: "vertical-rl",
              transform: "translateY(-50%) rotate(180deg)",
              letterSpacing: "0.32em",
            }}
          >
            <span>{featured.data.catalog_number ?? ""}</span>
            <span>{featuredArtistName.toUpperCase()}</span>
            <span>{featured.data.title.split(" (")[0].toUpperCase()}</span>
            <span style={{ color: "var(--hm-accent)", letterSpacing: 0 }}>{"//"}</span>
            <span>PACIFIC · 0547 HRS</span>
          </div>
          <div className="hm-hero-crt" aria-hidden="true" />
          <div className="hm-hero-signal" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 hm-noise opacity-[0.08] mix-blend-overlay" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 35%, transparent 0%, rgba(5,9,13,0.35) 85%), linear-gradient(180deg, rgba(5,9,13,0) 0%, rgba(5,9,13,0) 72%, #05090d 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-[140px] pb-[120px] md:px-10">
          <div
            className="flex flex-col items-center gap-12 md:flex-row md:items-center md:justify-center md:gap-10 lg:gap-14"
            style={{ minHeight: "58vh" }}
          >
            {featured.catnoSlug === "hmr010-nco" ? (
              <div
                aria-hidden="true"
                className="hidden shrink-0 -rotate-[3deg] opacity-90 lg:block lg:w-[230px] xl:w-[270px] 2xl:w-[300px]"
              >
                <div className="hm-transmission">
                  <img
                    src="/campaigns/nco-bookmark.jpg"
                    alt=""
                    className="block h-auto w-full"
                    loading="lazy"
                  />
                  <span className="hm-transmission-roll" />
                </div>
              </div>
            ) : null}
            <div className="md:max-w-[560px] md:shrink lg:ml-6 xl:ml-10 2xl:ml-14">
              <Reveal>
                <span
                  className="inline-flex items-center gap-2.5 text-[11px] uppercase text-[color:var(--hm-accent)]"
                  style={{ letterSpacing: "0.24em" }}
                >
                  <span className="block h-px w-6 bg-current" />
                  Out Now · {featured.data.catalog_number ?? featured.catnoSlug.toUpperCase()}
                </span>
              </Reveal>
              <Reveal delay={1}>
                <h1
                  className="mt-6 text-[clamp(40px,5vw,78px)] font-normal leading-[0.98] text-paper"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {featuredArtistName}{" "}
                  <span className="text-muted">·</span>
                  <br />
                  {featuredTitleMain}
                  {featuredTitleSuffix ? (
                    <span
                      className="mt-3 block text-[0.38em] font-normal leading-[1.15] text-paper-dim"
                      style={{ letterSpacing: "0" }}
                    >
                      {featuredTitleSuffix}
                    </span>
                  ) : null}
                </h1>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-7 max-w-[34ch] text-lg italic leading-relaxed text-paper-dim md:text-xl">
                  {active?.tagline ?? "Now available from Hunya Munya Records."}
                </p>
              </Reveal>
              <Reveal delay={3}>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href={active?.cta_primary?.href ?? featured.urlPath}
                    className="inline-flex items-center gap-2.5 border border-paper bg-paper px-6 py-3.5 text-xs font-medium uppercase text-ink transition-all duration-300 hover:border-[color:var(--hm-accent)] hover:bg-[color:var(--hm-accent)] hover:text-ink"
                    style={{ letterSpacing: "0.14em" }}
                  >
                    <span>{active?.cta_primary?.label ?? "Listen & buy"}</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href={active?.cta_secondary?.href ?? `/artists/${featuredArtistSlug}`}
                    className="inline-flex items-center gap-2.5 border border-paper/25 bg-paper/[0.02] px-6 py-3.5 text-xs font-medium uppercase text-paper transition-all duration-300 hover:border-paper hover:bg-paper hover:text-ink"
                    style={{ letterSpacing: "0.14em" }}
                  >
                    <span>{active?.cta_secondary?.label ?? `About ${featuredArtistName}`}</span>
                    <span>→</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={2} className="w-full shrink-0 md:w-[360px]">
              <Link
                href={featured.urlPath}
                className="group block border border-paper/20 bg-ink/55 p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[color:var(--hm-accent)] hover:bg-ink/70"
              >
                <div className="flex items-baseline justify-between text-[11px] uppercase text-paper-dim" style={{ letterSpacing: "0.2em" }}>
                  <span className="text-[color:var(--hm-accent)]">{featured.data.catalog_number ?? featured.catnoSlug.toUpperCase()}</span>
                  <span>{featured.year}</span>
                </div>
                <div className="my-[18px] h-px bg-paper/20" />
                <div className="mb-4 text-sm uppercase text-paper" style={{ letterSpacing: "0.16em" }}>
                  {featuredArtistName}
                </div>
                <div className="relative mb-5 aspect-[2/1] w-full overflow-hidden">
                  <img
                    src="/campaigns/rykard-nco-spread.jpg"
                    alt={`${featuredArtistName}, ${featured.data.title}, cover spread`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    loading="eager"
                  />
                </div>
                <div className="mb-6 text-2xl italic leading-tight text-paper md:text-[32px]">
                  {featured.data.title}
                </div>
                <div className="flex items-baseline justify-between border-t border-paper/10 pt-4 text-[11px] uppercase text-paper-dim" style={{ letterSpacing: "0.14em" }}>
                  <span>{formatLabel(featured)}</span>
                  <span className="text-[color:var(--hm-accent)] transition-[letter-spacing] duration-300">Listen & buy →</span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-7 left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-2.5 text-[10px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          <span>Scroll</span>
          <span className="hm-scroll-line" />
        </div>
      </section>

      {/* ===================== §01 LABEL ===================== */}
      <section className="border-t border-rule py-24 md:py-32">
        <div className="mx-auto flex max-w-[68ch] flex-col items-center gap-8 text-center">
          <Reveal>
            <div className="text-[11px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
              Label
            </div>
          </Reveal>
          <div>
            <Reveal delay={1}>
              <p className="text-xl leading-relaxed text-paper md:text-2xl">
                Hunya Munya Records is an independent boutique label and publisher, founded
                in 2002. Los Angeles since 2008. Crafting Electronic, Ambient, and Chillout
                for Radio, Film, and TV, plus collectible limited Vinyl and CDs worldwide.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-4 text-xl leading-relaxed text-paper md:text-2xl">
                Artists include{" "}
                <Link href="/artists/rykard" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  Rykard
                </Link>
                ,{" "}
                <Link href="/artists/darius-kohanim" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  Darius Kohanim
                </Link>
                ,{" "}
                <Link href="/artists/habersham" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  Habersham
                </Link>
                ,{" "}
                <Link href="/artists/shiloh" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  Shiloh
                </Link>
                , and{" "}
                <Link href="/artists/blue-room-project" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  Blue Room Project
                </Link>
                . Browse the{" "}
                <Link href="/catalog" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  full catalog
                </Link>
                , meet the{" "}
                <Link href="/artists" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  roster
                </Link>
                , or read about the{" "}
                <Link href="/about" className="border-b border-paper/25 hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]">
                  label
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== §02 FEATURED RELEASE (Spotify) ===================== */}
      {featuredSpotify && spotifyEmbedFrom(featuredSpotify) ? (
        <section className="border-t border-rule py-24 md:py-32">
          <div className="mb-14 flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-3 text-[11px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
              <span className="block h-px w-[18px] bg-[color:var(--hm-accent)]" />
              Featured release
            </div>
            <Reveal as="h2" className="text-[clamp(28px,3.6vw,52px)] font-normal leading-none" delay={0}>
              <span style={{ letterSpacing: "-0.015em" }}>
                Side A. &ldquo;North Cormorant Obscurity.&rdquo;
              </span>
            </Reveal>
            <Link
              href={featured.urlPath}
              className="mt-2 border-b border-paper/25 pb-0.5 text-[11px] uppercase text-paper-dim transition-colors hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]"
              style={{ letterSpacing: "0.18em" }}
            >
              Release page →
            </Link>
          </div>
          <Reveal className="overflow-hidden rounded-xl border border-rule-strong">
            <iframe
              src={spotifyEmbedFrom(featuredSpotify)!}
              title={`${featured.data.title} Spotify player`}
              width="100%"
              height={352}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              className="block w-full border-0"
            />
          </Reveal>
        </section>
      ) : null}

      {/* ===================== §03 CATALOG PREVIEW ===================== */}
      <section className="border-t border-rule py-24 md:py-32">
        <div className="mb-14 flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3 text-[11px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
            <span className="block h-px w-[18px] bg-[color:var(--hm-accent)]" />
            Catalog
          </div>
          <Reveal as="h2" className="text-[clamp(28px,3.6vw,52px)] font-normal leading-none" delay={0}>
            <span style={{ letterSpacing: "-0.015em" }}>
              {totalReleases} records,
              <br />
              counting.
            </span>
          </Reveal>
          <Link
            href="/catalog"
            className="mt-2 border-b border-paper/25 pb-0.5 text-[11px] uppercase text-paper-dim transition-colors hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]"
            style={{ letterSpacing: "0.18em" }}
          >
            Full catalog →
          </Link>
        </div>

        <div
          className="grid gap-6 pb-3.5 text-[10px] uppercase text-muted"
          style={{ gridTemplateColumns: "64px 2fr 3fr 1fr 80px 100px", letterSpacing: "0.2em" }}
        >
          <span>№</span>
          <span>Artist</span>
          <span>Title</span>
          <span />
          <span>Format</span>
          <span>Year</span>
        </div>
        <div className="flex flex-col border-t border-rule">
          {previewCatalog.map((r) => (
            <Link
              key={r.catnoSlug}
              href={r.urlPath}
              className="group relative grid items-center gap-6 border-b border-rule py-5 px-1 text-[13px] text-paper-dim transition-all duration-500 ease-hm hover:bg-[linear-gradient(90deg,rgba(20,70,105,0.18),transparent_60%)] hover:pl-[22px] hover:text-paper"
              style={{ gridTemplateColumns: "64px 2fr 3fr 1fr 80px 100px", letterSpacing: "0.02em" }}
            >
              <span className="text-[11px] text-muted" style={{ letterSpacing: "0.1em" }}>
                {r.data.catalog_number ?? "—"}
              </span>
              <span className="uppercase" style={{ letterSpacing: "0.08em" }}>
                {artistName(r)}
              </span>
              <span className="text-base italic text-paper">{r.data.title}</span>
              <span className="text-[color:var(--hm-accent)] opacity-0 transition-all duration-300 group-hover:opacity-100">
                →
              </span>
              <span className="text-[10px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
                {formatLabel(r)}
              </span>
              <span className="text-right text-[11px] text-muted">{r.year}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== §04 ROSTER PREVIEW ===================== */}
      <section className="border-t border-rule py-24 md:py-32">
        <div className="mb-14 flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3 text-[11px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
            <span className="block h-px w-[18px] bg-[color:var(--hm-accent)]" />
            Roster
          </div>
          <Reveal as="h2" className="text-[clamp(28px,3.6vw,52px)] font-normal leading-none" delay={0}>
            <span style={{ letterSpacing: "-0.015em" }}>
              The people
              <br />
              on the label.
            </span>
          </Reveal>
          <Link
            href="/artists"
            className="mt-2 border-b border-paper/25 pb-0.5 text-[11px] uppercase text-paper-dim transition-colors hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]"
            style={{ letterSpacing: "0.18em" }}
          >
            All artists →
          </Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] border-l border-t border-rule">
          {previewRoster.map((a, i) => {
            const released = releases.filter((r) =>
              r.resolvedArtists.some((x) => x.slug === a.data.slug),
            ).length;
            return (
              <Link
                key={a.data.slug}
                href={`/artists/${a.data.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden border-b border-r border-rule px-6 pb-6 pt-7 transition-colors duration-500 hover:bg-[color:var(--hm-roster-hover,rgba(20,50,79,0.12))]"
                style={{ aspectRatio: "1 / 1.15", ["--hm-roster-hover" as string]: "rgba(20,50,79,0.12)" } as React.CSSProperties}
              >
                <div className="text-[10px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
                  № {String(i + 1).padStart(2, "0")}
                </div>
                <div className="z-10 text-xl leading-tight text-paper transition-transform duration-500 group-hover:-translate-y-0.5">
                  {a.data.name}
                </div>
                <div className="flex justify-between text-[10px] uppercase text-muted" style={{ letterSpacing: "0.18em" }}>
                  <span>{a.data.yearsActive ? `Since ${a.data.yearsActive.split(/[–-]/)[0]}` : "On label"}</span>
                  <span>{released} rel.</span>
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-5 -right-5 block h-36 w-36 rounded-full border border-paper/25 opacity-40 transition-all duration-700 group-hover:-translate-x-5 group-hover:-translate-y-5 group-hover:rotate-[40deg] group-hover:border-[color:var(--hm-accent)] group-hover:opacity-80"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===================== §05 NEWS ===================== */}
      <section className="border-t border-rule py-24 md:py-32">
        <div className="mb-14 flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3 text-[11px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
            <span className="block h-px w-[18px] bg-[color:var(--hm-accent)]" />
            News
          </div>
          <Reveal as="h2" className="text-[clamp(28px,3.6vw,52px)] font-normal leading-none" delay={0}>
            <span style={{ letterSpacing: "-0.015em" }}>Latest.</span>
          </Reveal>
          <Link
            href="/news"
            className="mt-2 border-b border-paper/25 pb-0.5 text-[11px] uppercase text-paper-dim transition-colors hover:border-[color:var(--hm-accent)] hover:text-[color:var(--hm-accent)]"
            style={{ letterSpacing: "0.18em" }}
          >
            All news →
          </Link>
        </div>
        <div className="flex flex-col">
          {news.map((n) => {
            const tag = (n.data.tags?.[0] ?? "News").toUpperCase();
            return (
              <Link
                key={n.urlPath}
                href={n.urlPath}
                className="group grid items-baseline gap-8 border-b border-rule py-5 transition-all duration-500 hover:pl-3 md:grid-cols-[120px_1fr_100px]"
              >
                <span className="text-[11px] text-muted" style={{ letterSpacing: "0.14em" }}>
                  {n.data.date.replaceAll("-", ".")}
                </span>
                <span className="text-lg italic text-paper transition-colors duration-300 group-hover:text-[color:var(--hm-accent)]">
                  {n.data.title}
                </span>
                <span className="text-right text-[10px] uppercase text-muted" style={{ letterSpacing: "0.2em" }}>
                  {tag}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="mt-24 grid grid-cols-2 border-y border-rule md:grid-cols-4">
        <div className="flex flex-col items-center gap-2.5 border-b border-r border-rule p-12 text-center md:border-b-0">
          <div
            className="text-[clamp(44px,5.5vw,84px)] leading-none tracking-[-0.02em] tabular-nums text-paper"
          >
            <CountUp target={yearsOperating} />
          </div>
          <div className="text-[10px] uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
            Years operating
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5 border-b border-rule p-12 text-center md:border-b-0 md:border-r">
          <div className="text-[clamp(44px,5.5vw,84px)] leading-none tracking-[-0.02em] tabular-nums text-paper">
            <CountUp target={totalReleases} />
          </div>
          <div className="text-[10px] uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
            Releases
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5 border-r border-rule p-12 text-center">
          <div className="text-[clamp(44px,5.5vw,84px)] leading-none tracking-[-0.02em] tabular-nums text-paper">
            <CountUp target={totalArtists} />
          </div>
          <div className="text-[10px] uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
            Artists on roster
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5 p-12 text-center">
          <div className="text-[clamp(44px,5.5vw,84px)] leading-none tracking-[-0.02em] tabular-nums text-paper">
            25M<span className="text-muted">+</span>
          </div>
          <div className="text-[10px] uppercase text-muted" style={{ letterSpacing: "0.22em" }}>
            Streams, Rykard · NCO
          </div>
        </div>
      </section>

      {/* ===================== WORDMARK ===================== */}
      <div aria-hidden="true" className="my-16 flex w-full justify-center">
        <span
          className="hm-wordmark-wave inline-block select-none whitespace-nowrap px-6 text-[clamp(64px,10.5vw,170px)] font-normal leading-[0.95]"
          style={{ letterSpacing: "-0.02em" }}
        >
          HUNYA&nbsp;MUNYA
        </span>
      </div>
    </>
  );
}
