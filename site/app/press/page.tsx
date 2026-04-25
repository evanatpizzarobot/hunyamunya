import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import pandoraStats from "@/data/pandora-stats.json";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Lookup zone: looking up at hulls passing overhead. Higher opacity
// override (--uw-opacity 0.30) gives a more solid, looming presence.
// Two slow shadows near the surface, no deeper drifters.
const PRESS_LANES: LaneConfig[] = [
  { shape: "round", direction: "lr", top: "8%",  width: 90,  duration: 95, delay: -25, opacityMod: 1.0 },
  { shape: "long",  direction: "rl", top: "16%", width: 220, duration: 130, delay: -55, opacityMod: 0.85, mobileHide: true },
];

function formatThousands(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${Math.floor(n / 1000)}k`;
  const m = n / 1_000_000;
  return `${m >= 10 ? Math.floor(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
}

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Press"),
    description:
      "Press coverage and broadcast support for Hunya Munya Records: BBC Radio 1, 3, and 6 Music, KCRW, KEXP, KALX, BBC Bristol, CBC Radio 2, Fourculture, I Heart Noise, Darkfloor, and more.",
    path: "/press",
  });
}

type Quote = {
  quote: string;
  source: string;
  date: string;
  release: string;
  releasePath?: string;
  url?: string;
};

type Play = {
  date: string;
  host?: string;
  artist: string;
  track?: string;
  note?: string;
  url?: string;
};

type Station = {
  name: string;
  location: string;
  sourcePath?: string;
  plays: Play[];
};

type DJSupportPlay = {
  date: string;
  track: string;
  artist: string;
  note?: string;
  releasePath?: string;
  url?: string;
};

type DJSupportEntry = {
  dj: string;
  venue: string;
  plays: DJSupportPlay[];
};

type Listing = {
  label: string;
  url: string;
};

const PRESS_QUOTES: Quote[] = [
  {
    quote:
      "A heady trip into the deepest and warmest electronic bliss-core. Rykard has created a record of sublime electronic exploration.",
    source: "I Heart Noise",
    date: "February 2020",
    release: "Explorers Vol. 2",
    releasePath: "/catalog/hmb005b-explorers-vol-2",
    url: "https://ihrtn.net/review-rykard-explorers-vol-2/",
  },
  {
    quote:
      "Signature vibration combining hip-hop instrumental rhythms with atmospheric melodies.",
    source: "Pirate!Pirate!",
    date: "Artist feature",
    release: "Rykard artist profile",
    url: "https://piratepirate.com/rykard/",
  },
  {
    quote:
      "Rykard is back with a new form of electronic bliss on The Explorers Vol. 1.",
    source: "Fourculture Magazine",
    date: "July 2019",
    release: "Explorers Vol. 1",
    releasePath: "/catalog/hmb005a-explorers-vol-1",
    url: "https://fourculture.com/rykard-is-back-with-a-new-form-of-electronic-bliss-on-the-explorers-vol-1/",
  },
  {
    quote:
      "Recommended: Rykard, Hell Bent (dedpop).",
    source: "Darkfloor",
    date: "2009",
    release: "Pre-HMR Dedpop release",
    url: "https://darkfloor.co.uk/recommended-rykard-hell-bent-dedpop/",
  },
];

const STATIONS: Station[] = [
  {
    name: "BBC Radio 1",
    location: "UK, national",
    sourcePath: "/news/2010/rykard-accepted-into-pandora-radio",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        note: "Arrive the Radio Beacon release window",
      },
    ],
  },
  {
    name: "BBC Radio 3",
    location: "UK, national",
    sourcePath: "/news/2010/rykard-accepted-into-pandora-radio",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        note: "Arrive the Radio Beacon release window",
      },
    ],
  },
  {
    name: "BBC Radio 6 Music",
    location: "UK, national",
    sourcePath:
      "/news/2010/rykard-featured-on-bbc-radio-6-with-tom-robinson",
    plays: [
      {
        date: "Apr 14, 2010",
        host: "Tom Robinson",
        artist: "Rykard",
        track: "North Cormorant Obscurity",
        url: "https://www.youtube.com/watch?v=WPjQrGViQk4",
      },
    ],
  },
  {
    name: "89.9 FM KCRW",
    location: "Los Angeles / Santa Monica, CA",
    sourcePath:
      "/news/2010/anne-litt-kcrw-hammers-rykard-down-with-ginny-on-air",
    plays: [
      {
        date: "Apr 24, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&date_from=2010-04-24&host=Anne%20Litt&search_type=2",
      },
      {
        date: "May 22, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&date_from=2010-05-22&host=Anne%20Litt&search_type=2",
      },
      {
        date: "May 23, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Monolithic",
        url: "http://newmedia.kcrw.org/tracklists/?channel=Live&host=Anne%20Litt&date_from=2010-05-23",
      },
      {
        date: "May 27, 2010",
        host: "Morning Becomes Eclectic",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.org/tracklists/?channel=Live&host=Morning%20Becomes%20Eclectic&date_from=2010-05-27",
      },
      {
        date: "Jun 5, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&date_from=2010-06-05&host=Anne%20Litt&search_type=2",
      },
      {
        date: "Aug 7, 2010",
        host: "Anne Litt",
        artist: "Rykard",
        track: "Down with Ginny",
        url: "http://newmedia.kcrw.com/tracklists/index.php?channel=Live&host=Anne%20Litt&date_from=2010-08-07",
      },
    ],
  },
  {
    name: "KEXP",
    location: "Seattle, USA",
    sourcePath: "/news/2010/rykard-accepted-into-pandora-radio",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        note: "Arrive the Radio Beacon release window",
      },
    ],
  },
  {
    name: "90.7 FM KALX",
    location: "Berkeley, USA",
    sourcePath:
      "/news/2010/rykard-featured-on-kalx-90-7-berkeley-california-usa",
    plays: [
      {
        date: "Jul 12, 2010",
        artist: "Rykard",
        track: "North Cormorant Obscurity",
      },
      {
        date: "Jul 12, 2010",
        artist: "Rykard",
        track: "The Rock Hewn",
      },
    ],
  },
  {
    name: "BBC Radio Bristol",
    location: "Bristol, UK",
    sourcePath: "/news/2010/rykard-featured-on-bbc-radio-bristol",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        track: "The Rock Hewn",
        url: "https://www.youtube.com/watch?v=fkKHBO-gUeA",
      },
    ],
  },
  {
    name: "CBC Radio 2",
    location: "Canada, national music channel",
    sourcePath: "/news/2010/rykard-accepted-into-pandora-radio",
    plays: [
      {
        date: "2010",
        artist: "Rykard",
        note: "Arrive the Radio Beacon release window",
      },
    ],
  },
  {
    name: "BBC Radio Norfolk",
    location: "Norfolk, UK",
    sourcePath:
      "/news/2011/catnip-claws-featured-on-legendary-bbc-radio-norfolk",
    plays: [
      {
        date: "Jul 22, 2011",
        artist: "Catnip & Claws",
        track: "Old Shoes",
        url: "https://www.youtube.com/watch?v=-GeMZ9N09us",
      },
    ],
  },
  {
    name: "Fourculture Radio",
    location: "UK / online",
    plays: [
      {
        date: "Oct 25, 2018",
        host: "The Jupiter Room Transmissions",
        artist: "Rykard",
        track: "Guest mix + interview",
        note: "60-minute slot with unreleased Rykard material",
        url: "https://fourculture.com/the-jupiter-room-transmissions-october-2018-rykard/",
      },
    ],
  },
];

const DJ_SUPPORT: DJSupportEntry[] = [
  {
    dj: "John Digweed",
    venue: "Kiss 100, London",
    plays: [
      {
        date: "2003",
        artist: "Evan Marcus",
        track: "Ten Feet From Heaven",
        note: "White-label era, ahead of the official HMR003 release",
        releasePath: "/catalog/hmr003-ten-feet-from-heaven",
      },
      {
        date: "Jul 31, 2005",
        artist: "Darius Kohanim",
        track: "Revitalized (Habersham Remix)",
        note: "Habersham guest hour, track 10 of the set (HMR005 remix)",
        releasePath: "/catalog/hmr005-revitalized-ep",
        url: "https://www.buenosaliens.com/foros/mensajes.cfm/id.20432.t.transitions-by-john-digweed-ii.htm",
      },
    ],
  },
  {
    dj: "Sasha",
    venue: "Warung Beach Club, Brazil",
    plays: [
      {
        date: "Feb 28, 2006",
        artist: "Habersham & Darius Kohanim",
        track: "Dune In Erf Minor",
        releasePath: "/catalog/hmdigital004-dune-in-erf-minor",
        url: "https://www.1001tracklists.com/tracklist/dvlb69/sasha-warung-beach-club-brazil-2006-02-28.html",
      },
    ],
  },
];

const LISTINGS: Listing[] = [
  { label: "Resident Advisor artist", url: "https://ra.co/dj/rykard" },
  { label: "Resident Advisor label", url: "https://ra.co/labels/385" },
  {
    label: "AllMusic, Arrive the Radio Beacon",
    url: "https://www.allmusic.com/album/release/arrive-the-radio-beacon-mr0004948967",
  },
  {
    label: "AllMusic, Luminosity",
    url: "https://www.allmusic.com/album/luminosity-mw0003211182",
  },
  {
    label: "AllMusic, HMR label",
    url: "https://www.allmusic.com/artist/hunya-munya-mn0002854507",
  },
  { label: "Last.fm", url: "https://www.last.fm/music/RYKARD" },
  { label: "Rate Your Music", url: "https://rateyourmusic.com/artist/rykard" },
];

const PRESS_EMAIL = "contact@hunyamunyarecords.com";

export default function PressPage() {
  const totalStations = STATIONS.length;
  const rykardMonthly = pandoraStats.rykard?.monthlyListeners ?? 60000;
  const rykardMonthlyDisplay = formatThousands(rykardMonthly);

  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Press", path: "/press" },
          ]),
        ]}
      />

      <UnderwaterLayer zone="lookup" lanes={PRESS_LANES} flushTop>
      <section className="border-b border-rule pb-16 pt-20 md:pb-20 md:pt-28">
        <div
          className="mb-5 flex items-center gap-3 text-[11px] uppercase text-[color:var(--hm-accent)]"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-current" />
          Press
        </div>
        <h1 className="text-[clamp(40px,5.5vw,84px)] font-normal leading-[0.98] tracking-tighter text-paper">
          On the air.
        </h1>
        <p className="mt-5 max-w-[62ch] font-serif text-[20px] italic leading-[1.5] text-paper-dim">
          Selected press coverage and broadcast support for Hunya Munya Records and its artists.
          Rykard&rsquo;s catalog has been played across BBC Radio 1, 3, and 6 Music,
          KCRW, KEXP, KALX, BBC Bristol, and CBC Radio 2, with &ldquo;North Cormorant
          Obscurity&rdquo; surpassing 25 million streams. For press inquiries, review
          copies, or interview requests, reach us at{" "}
          <a
            href={`mailto:${PRESS_EMAIL}`}
            className="not-italic text-paper underline-offset-4 hover:text-[color:var(--hm-accent)] hover:underline"
          >
            {PRESS_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="grid grid-cols-1 border-b border-rule sm:grid-cols-3">
        <div className="flex flex-col gap-2 border-b border-rule p-8 sm:border-b-0 sm:border-r md:p-10">
          <div
            className="text-[clamp(32px,3.6vw,56px)] leading-none tracking-[-0.02em] tabular-nums text-paper"
          >
            {totalStations}
          </div>
          <div
            className="text-[10px] uppercase text-muted"
            style={{ letterSpacing: "0.22em" }}
          >
            Radio stations, UK, US &amp; Canada
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b border-rule p-8 sm:border-b-0 sm:border-r md:p-10">
          <div
            className="text-[clamp(32px,3.6vw,56px)] leading-none tracking-[-0.02em] tabular-nums text-paper"
          >
            25M<span className="text-muted">+</span>
          </div>
          <div
            className="text-[10px] uppercase text-muted"
            style={{ letterSpacing: "0.22em" }}
          >
            Streams, Rykard &middot; NCO
          </div>
        </div>
        <div className="flex flex-col gap-2 p-8 md:p-10">
          <a
            href="https://www.pandora.com/artist/rykard/ARp9n26Jhk4qq72"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 transition-colors hover:text-[color:var(--hm-accent)]"
          >
            <div
              className="text-[clamp(32px,3.6vw,56px)] leading-none tracking-[-0.02em] tabular-nums text-paper group-hover:text-[color:var(--hm-accent)]"
            >
              {rykardMonthlyDisplay}
              <span className="text-muted">+</span>
            </div>
            <div
              className="text-[10px] uppercase text-muted"
              style={{ letterSpacing: "0.22em" }}
            >
              Rykard &middot; Pandora monthly listeners &rarr;
            </div>
          </a>
        </div>
      </section>

      <section className="border-b border-rule py-20 md:py-28">
        <div
          className="mb-10 flex items-center gap-3 text-[11px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-[color:var(--hm-accent)]" />
          Words
        </div>
        <ul className="grid gap-10 md:grid-cols-2 md:gap-14">
          {PRESS_QUOTES.map((q) => (
            <li
              key={`${q.source}-${q.release}`}
              className="group relative border-l border-rule-strong pl-8 transition-colors duration-300 ease-hm hover:border-[color:var(--hm-accent)]"
            >
              <blockquote className="font-serif text-[clamp(20px,2.2vw,30px)] italic leading-[1.35] text-paper">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <cite
                className="mt-6 block not-italic text-[11px] uppercase text-paper-dim"
                style={{ letterSpacing: "0.22em" }}
              >
                {q.source} &middot; {q.date}
              </cite>
              <p className="mt-1.5 text-[12px] text-muted">
                on{" "}
                {q.releasePath ? (
                  <Link
                    href={q.releasePath}
                    className="italic text-paper-dim underline-offset-4 hover:text-[color:var(--hm-accent)] hover:underline"
                  >
                    {q.release}
                  </Link>
                ) : (
                  <em className="text-paper-dim">{q.release}</em>
                )}
              </p>
              {q.url ? (
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-[10px] uppercase text-[color:var(--hm-accent)] underline-offset-4 transition-colors hover:underline"
                  style={{ letterSpacing: "0.2em" }}
                >
                  Read the review &rarr;
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-b border-rule py-20 md:py-28">
        <div
          className="mb-5 flex items-center gap-3 text-[11px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-[color:var(--hm-accent)]" />
          On the dial
        </div>
        <p className="mb-12 max-w-[62ch] font-serif text-[18px] italic leading-[1.5] text-paper-dim">
          By July 2010, three months after release,{" "}
          <em className="not-italic">
            <Link
              href="/catalog/hmb001-arrive-the-radio-beacon"
              className="underline-offset-4 hover:text-[color:var(--hm-accent)] hover:underline"
            >
              Arrive the Radio Beacon
            </Link>
          </em>{" "}
          had picked up airplay across the UK, US, and Canada, then was formally{" "}
          <Link
            href="/news/2010/rykard-accepted-into-pandora-radio"
            className="not-italic underline-offset-4 hover:text-[color:var(--hm-accent)] hover:underline"
          >
            accepted into Pandora&rsquo;s rotation
          </Link>
          . The roster below pulls from that moment and the years on either side of it.
        </p>
        <div className="space-y-16">
          {STATIONS.map((st) => (
            <div key={st.name}>
              <div className="mb-5 flex items-baseline justify-between gap-6 border-b border-rule pb-3">
                <div>
                  <h3 className="font-serif text-[clamp(22px,2.4vw,34px)] leading-none text-paper">
                    {st.name}
                  </h3>
                  <p
                    className="mt-2 text-[10px] uppercase text-muted"
                    style={{ letterSpacing: "0.22em" }}
                  >
                    {st.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p
                    className="text-[10px] uppercase text-muted tabular-nums"
                    style={{ letterSpacing: "0.18em" }}
                  >
                    {st.plays.length} {st.plays.length === 1 ? "play" : "plays"}
                  </p>
                  {st.sourcePath ? (
                    <Link
                      href={st.sourcePath}
                      className="text-[10px] uppercase text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
                      style={{ letterSpacing: "0.18em" }}
                    >
                      Source &rarr;
                    </Link>
                  ) : null}
                </div>
              </div>
              <ul className="divide-y divide-rule">
                {st.plays.map((p, i) => (
                  <li
                    key={`${st.name}-${i}`}
                    className="grid grid-cols-[90px_1fr_auto] items-baseline gap-5 py-4 text-[14px] md:grid-cols-[110px_1fr_auto]"
                  >
                    <span
                      className="text-[10px] uppercase text-muted tabular-nums"
                      style={{ letterSpacing: "0.12em" }}
                    >
                      {p.date}
                    </span>
                    <span className="text-paper">
                      {p.host ? (
                        <span className="text-paper-dim">{p.host}: </span>
                      ) : null}
                      {p.track ? (
                        <>
                          <em className="font-serif italic text-paper">
                            &ldquo;{p.track}&rdquo;
                          </em>{" "}
                          <span className="text-paper-dim">by</span>{" "}
                        </>
                      ) : null}
                      <span className="uppercase" style={{ letterSpacing: "0.06em" }}>
                        {p.artist}
                      </span>
                      {p.note ? (
                        <span className="mt-1 block text-[11px] text-paper-dim">
                          {p.note}
                        </span>
                      ) : null}
                    </span>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
                        style={{ letterSpacing: "0.2em" }}
                      >
                        Listen &rarr;
                      </a>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-rule py-20 md:py-28">
        <div
          className="mb-5 flex items-center gap-3 text-[11px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-[color:var(--hm-accent)]" />
          Support
        </div>
        <h2 className="text-[clamp(32px,4vw,60px)] font-normal leading-[0.98] tracking-tighter text-paper">
          DJ support.
        </h2>
        <p className="mt-4 max-w-[60ch] font-serif text-[18px] italic leading-[1.5] text-paper-dim">
          Plays in tastemaker sets that pre-date the Explorers era, back when HMR was a
          progressive and tech house label.
        </p>

        <div className="mt-14 space-y-16">
          {DJ_SUPPORT.map((d) => (
            <div key={d.dj}>
              <div className="mb-5 flex items-baseline justify-between gap-6 border-b border-rule pb-3">
                <div>
                  <h3 className="font-serif text-[clamp(22px,2.4vw,34px)] leading-none text-paper">
                    {d.dj}
                  </h3>
                  <p
                    className="mt-2 text-[10px] uppercase text-muted"
                    style={{ letterSpacing: "0.22em" }}
                  >
                    {d.venue}
                  </p>
                </div>
                <p
                  className="text-[10px] uppercase text-muted tabular-nums"
                  style={{ letterSpacing: "0.18em" }}
                >
                  {d.plays.length}{" "}
                  {d.plays.length === 1 ? "documented play" : "documented plays"}
                </p>
              </div>
              <ul className="divide-y divide-rule">
                {d.plays.map((p, i) => (
                  <li
                    key={`${d.dj}-${i}`}
                    className="grid grid-cols-[90px_1fr_auto] items-baseline gap-5 py-4 text-[14px] md:grid-cols-[110px_1fr_auto]"
                  >
                    <span
                      className="text-[10px] uppercase text-muted tabular-nums"
                      style={{ letterSpacing: "0.12em" }}
                    >
                      {p.date}
                    </span>
                    <span className="text-paper">
                      <em className="font-serif italic text-paper">
                        &ldquo;{p.track}&rdquo;
                      </em>{" "}
                      <span className="text-paper-dim">by</span>{" "}
                      {p.releasePath ? (
                        <Link
                          href={p.releasePath}
                          className="uppercase underline-offset-4 hover:text-[color:var(--hm-accent)] hover:underline"
                          style={{ letterSpacing: "0.06em" }}
                        >
                          {p.artist}
                        </Link>
                      ) : (
                        <span
                          className="uppercase"
                          style={{ letterSpacing: "0.06em" }}
                        >
                          {p.artist}
                        </span>
                      )}
                      {p.note ? (
                        <span className="mt-1 block text-[11px] text-paper-dim">
                          {p.note}
                        </span>
                      ) : null}
                    </span>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
                        style={{ letterSpacing: "0.2em" }}
                      >
                        Tracklist &rarr;
                      </a>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-[66ch] text-[13px] leading-relaxed text-muted">
          Historical DJ support from the 2004 to 2008 era predates systematic archiving.
          If you played an HMR record back then, reach out at{" "}
          <a
            href={`mailto:${PRESS_EMAIL}`}
            className="underline-offset-4 hover:text-paper-dim hover:underline"
          >
            {PRESS_EMAIL}
          </a>{" "}
          and we&rsquo;ll credit it here.
        </p>
      </section>

      <section className="border-b border-rule py-10 md:py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-6">
          <span
            className="text-[10px] uppercase text-muted"
            style={{ letterSpacing: "0.22em" }}
          >
            Listed on
          </span>
          <p className="text-[12px] leading-relaxed text-paper-dim">
            {LISTINGS.map((l, i) => (
              <span key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-paper hover:underline"
                >
                  {l.label}
                </a>
                {i < LISTINGS.length - 1 ? (
                  <span className="mx-2 text-muted">&middot;</span>
                ) : null}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div
          className="mb-8 flex items-center gap-3 text-[11px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-[color:var(--hm-accent)]" />
          Inquiries
        </div>
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="text-[clamp(28px,3.4vw,48px)] font-normal leading-[1.05] tracking-tighter text-paper">
              Press, interviews, review copies.
            </h2>
            <p className="mt-4 max-w-[54ch] font-serif text-[18px] italic leading-[1.55] text-paper-dim">
              We read every message. For promos, release assets, artist bios, or hi-res covers,
              say what you need and we&rsquo;ll send what we have.
            </p>
          </div>
          <a
            href={`mailto:${PRESS_EMAIL}`}
            className="inline-flex items-center gap-2.5 border border-paper bg-paper px-6 py-3.5 text-[11px] font-medium uppercase text-ink transition-all duration-300 hover:border-[color:var(--hm-accent)] hover:bg-[color:var(--hm-accent)]"
            style={{ letterSpacing: "0.18em" }}
          >
            <span>{PRESS_EMAIL}</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>
      </UnderwaterLayer>
    </>
  );
}
