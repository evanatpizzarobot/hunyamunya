import Link from "next/link";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { PlatformLinks } from "@/components/PlatformLinks";
import { buyLinksFor, streamingLinksFor } from "@/lib/streaming";
import { formatReleaseDate, type ReleaseDoc } from "@/lib/content";
import { PRESS_EMAIL } from "@/lib/press-data";

/**
 * Long-form landing page for HMR010, "North Cormorant Obscurity".
 *
 * Ported from a design handoff (7 Sep 2026) that arrived as standalone HTML.
 * Selected into the catalog route by `landing_layout: nco` in the release
 * frontmatter, so the record keeps one URL: /catalog/hmr010-nco. The route
 * still owns metadata, canonical, breadcrumbs and JSON-LD.
 *
 * Why this page exists: the track does most of its listening on Pandora and
 * Spotify, where a play is worth a fraction of a cent, while 250-odd copies of
 * the 12" sit in the studio. The traffic already arrives. This page is the
 * conversion asset it was missing, not a discovery play, so every section
 * ends up pointing at the record.
 *
 * Editorial rule carried over from the handoff and worth keeping: nothing here
 * claims Richard Wearing intended the North Sea references. The sleeve shows a
 * platform and the names belong to real places. Both observable. Do not add a
 * line asserting intent unless he confirms it.
 *
 * No time-sensitive numbers. This is a static export, so anything that moves
 * month to month (monthly listeners, copies remaining, current chart position)
 * freezes at deploy and quietly goes stale on the page. Cumulative and
 * historical figures are fine, because they do not decay: total streams, the
 * pressing size, the 2010 release date. If a live number is ever genuinely
 * needed here it has to come with a mechanism that keeps it honest.
 *
 * What is derived and what is typed, so the next editor does not have to guess:
 *   derived from frontmatter  price, edition, catalogue number, rpm, both
 *                             sides and their durations, sleeve, mastering,
 *                             pressing, release date, streaming and buy links
 *   typed here                the hero copy, the editorial prose, the 2010
 *                             recording sheet, the artist sheet, and the two
 *                             location sheets, none of which exist in the
 *                             content schema
 *
 * The release's MDX body is deliberately NOT rendered: this layout replaces
 * the template body wholesale, which is the whole point of landing_layout.
 * See the note in content/releases/2025-rykard-nco.mdx before editing that file.
 */

type Row = { term: string; detail: string };

// Web-sized derivatives built by scripts/nco-landing-assets.ts. Named here
// rather than picked out of `gallery` because that array holds the 5000px
// archive masters, and images.unoptimized means whatever this points at is
// exactly what ships. Re-run the script if the masters are ever replaced.
const IMG = {
  front: "/media/releases/hmr010-nco-front.webp",
  back: "/media/releases/hmr010-nco-back.webp",
  disc: "/media/releases/hmr010-nco-vinyl-a.webp",
} as const;

// North Cormorant, Block 211/21a UKCS. Verified against Energy Voice and the
// NSTA Energy Pathfinder. The cessation timestamp is the load-bearing fact on
// this page, so it is quoted exactly as reported.
const PLATFORM_ROWS: Row[] = [
  { term: "Block", detail: "211/21a UKCS" },
  { term: "Distance", detail: "~500 km NE of Aberdeen" },
  { term: "Water depth", detail: "161 m" },
  { term: "Discovered", detail: "May 1974" },
  { term: "Installed", detail: "1981" },
  { term: "First oil", detail: "14 Feb 1982" },
  { term: "Produced", detail: "641 M barrels" },
  { term: "Ceased", detail: "22 Jun 2024, 07:45" },
  { term: "Status", detail: "Decommissioning" },
];

// Troup Head, Aberdeenshire. Verified against the RSPB reserve page.
const HEADLAND_ROWS: Row[] = [
  { term: "Location", detail: "Aberdeenshire" },
  { term: "Between", detail: "Fraserburgh and Banff" },
  { term: "Cliff height", detail: "90+ m" },
  { term: "Reserve", detail: "29 hectares" },
  { term: "Seabirds", detail: "50,000+ per year" },
  { term: "Colony", detail: "Largest on the mainland" },
  { term: "Managed by", detail: "RSPB" },
];

/**
 * Drop a leading "Mastered in / by / at" from a credit value, so the sheet
 * reads "Mastered / Los Angeles" rather than "Mastered / Mastered in Los
 * Angeles". Frontmatter keeps the full sentence, because the catalog template
 * renders these credits standalone where the verb is doing real work.
 *
 * A fixed literal rather than an interpolated term: the only caller is the
 * mastering row, and building a RegExp out of a caller-supplied string would
 * mean escaping it for no benefit.
 */
function stripMasteredPrefix(value: string): string {
  const trimmed = value.replace(/^mastered\s+(?:in|by|at)\s+/i, "");
  return trimmed.length > 0 ? trimmed : value;
}

function DataSheet({ rows, caption }: { rows: Row[]; caption: string }) {
  return (
    <div className="border-t border-[color:var(--hm-accent)] pt-3.5">
      {/* The accessible name goes on the <dl> itself. A <caption> is only
          valid inside a <table>: the parser hoists it out of a <dl>, which
          makes the server HTML and the client tree disagree and drops the
          whole page to client rendering on hydration. */}
      <dl
        aria-label={caption}
        className="grid grid-cols-[auto_1fr] font-mono text-[12px] leading-relaxed"
      >
        {rows.map((r) => (
          <div key={r.term} className="contents">
            <dt className="whitespace-nowrap border-b border-neutral-800 py-2 pr-5 uppercase tracking-[0.1em] text-muted">
              {r.term}
            </dt>
            <dd className="border-b border-neutral-800 py-2 text-right tabular-nums text-paper">
              {r.detail}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Section eyebrow. A <p>, not a heading, so the document outline stays
 *  h1 -> h2 rather than skipping a level the way the prototype did. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--hm-accent)]">
      {children}
    </p>
  );
}

function Section({
  eyebrow,
  heading,
  children,
  sheet,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
  sheet?: React.ReactNode;
}) {
  return (
    <section
      aria-label={heading}
      className="border-t border-neutral-800 py-12 md:py-16"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-12 lg:gap-16">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mb-5 max-w-[20ch] text-balance text-2xl font-bold leading-tight tracking-tight text-paper md:text-[2rem]">
            {heading}
          </h2>
          <div className="max-w-[34rem] space-y-4 text-[15px] leading-relaxed text-neutral-300">
            {children}
          </div>
        </div>
        {sheet ? <div>{sheet}</div> : null}
      </div>
    </section>
  );
}

export function NcoLanding({ release }: { release: ReleaseDoc }) {
  const d = release.data;
  const streaming = streamingLinksFor(d);
  // A 500-copy pressing is meant to run out, so the page has to survive the
  // flip. Once it does, the Buy chips have to go with the Order button: a
  // "HMR Store" link into a sold-out product page next to a live price reads
  // as a bug. Matches the template's own rule at app/catalog/[catnoSlug].
  const soldOut = d.sold_out || d.status === "oop";
  const buy = soldOut ? [] : buyLinksFor(d);
  const sideA = d.tracklist.find((t) => t.side === "A");
  const sideB = d.tracklist.find((t) => t.side === "B");

  // Everything in the record sheet comes from frontmatter so this block and
  // the catalog entry can never disagree about what was pressed.
  const recordRows: Row[] = [
    ...(d.catalog_number ? [{ term: "Catalogue", detail: d.catalog_number }] : []),
    { term: "Format", detail: d.rpm ? `12" / ${d.rpm} RPM` : '12"' },
    ...(sideA
      ? [{ term: "Side A", detail: `${sideA.title}${sideA.duration ? ` ${sideA.duration}` : ""}` }]
      : []),
    ...(sideB
      ? [{ term: "Side B", detail: `${sideB.title}${sideB.duration ? ` ${sideB.duration}` : ""}` }]
      : []),
    // `edition` is deliberately absent here: it is already the accent line
    // directly above this sheet, and repeating it reads as a mistake.
    ...(d.credits?.sleeve ? [{ term: "Sleeve", detail: d.credits.sleeve }] : []),
    ...(d.credits?.mastering
      ? [{ term: "Mastered", detail: stripMasteredPrefix(d.credits.mastering) }]
      : []),
    ...(d.credits?.pressing ? [{ term: "Pressed by", detail: d.credits.pressing }] : []),
    ...(d.release_date
      ? [{ term: "Released", detail: formatReleaseDate(d.release_date) }]
      : []),
  ];

  return (
    <article>
      {/* ---------- hero ---------- */}
      <header className="grid items-center gap-8 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 md:pb-16 lg:gap-16">
        <img
            src={IMG.front}
            alt="North Cormorant Obscurity sleeve: an offshore platform lit at dusk on open water, with RYKARD NCO set in white"
            width={1200}
            height={1200}
            className="block w-full border border-neutral-800 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]"
            loading="eager"
          />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Hunya Munya Records
            {d.catalog_number ? ` · ${d.catalog_number}` : ""}
          </p>
          <h1 className="mt-3 text-balance text-[2.25rem] font-extrabold leading-[0.98] tracking-[-0.032em] text-paper sm:text-5xl lg:text-[4rem]">
            North Cormorant Obscurity
          </h1>
          <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
            Rykard · 2010 · Reissued on 12&Prime; vinyl ·{" "}
            <strong className="font-medium text-[color:var(--hm-accent)]">
              limited to 500 copies
            </strong>
          </p>
        </div>
      </header>

      {/* ---------- the track ---------- */}
      <Section
        eyebrow="The track"
        heading="Fifteen years underwater"
        sheet={
          <DataSheet
            caption="Recording details"
            rows={[
              { term: "Artist", detail: "Rykard" },
              { term: "Released", detail: "10 Mar 2010" },
              { term: "Album", detail: "Arrive the Radio Beacon" },
              { term: "Position", detail: "Track 8" },
              { term: "Duration", detail: sideA?.duration ?? "3:20" },
              { term: "Label", detail: "Hunya Munya" },
            ]}
          />
        }
      >
        <p>
          Rykard released <em>North Cormorant Obscurity</em> in March 2010, as the
          eighth track on{" "}
          <Link
            href="/catalog/hmb001-arrive-the-radio-beacon"
            className="text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
          >
            <em>Arrive the Radio Beacon</em>
          </Link>
          . Slow, tidal electronica from a producer working out of the Lancashire
          countryside.
        </p>
        <p>
          It has since passed twenty five million streams, the widest reach of
          anything on the label. Pandora accepted the album in 2010 and has kept
          it in rotation ever since. It found its audience sideways, through
          algorithms rather than press, and it has never really stopped.
        </p>
        <p>
          In December 2025 it was cut to 12&Prime; vinyl for the first time,
          paired with a previously unreleased companion piece on the B-side.
        </p>
      </Section>

      {/* ---------- side A ---------- */}
      <Section
        eyebrow="Side A · the name"
        heading="A platform 500km off Aberdeen"
        sheet={<DataSheet caption="North Cormorant platform facts" rows={PLATFORM_ROWS} />}
      >
        <p>
          The sleeve shows a platform at dusk, lights burning, alone in open
          water. The name belongs to a real one.
        </p>
        <p>
          North Cormorant stood in Block 211/21a of the UK Continental Shelf,
          roughly five hundred kilometres north east of Aberdeen, anchored in a
          hundred and sixty one metres of northern North Sea. The field was found
          by Shell and Esso in May 1974. The platform went in during 1981 and took
          its first oil on 14 February 1982.
        </p>
        <p>
          Over the next four decades it processed six hundred and forty one
          million barrels, its own and imports from Causeway, Fionn, Otter and
          Eider, sending everything down the Brent System pipeline to Sullom Voe.
        </p>
        <p className="text-paper">
          It stopped at 07:45 on Saturday 22 June 2024, after forty two years. It
          is now the largest platform ever brought into Lerwick Harbour to be
          taken apart.
        </p>
      </Section>

      {/* ---------- side B ---------- */}
      <Section
        eyebrow="Side B · Troup Head"
        heading="Ninety metres of cliff and fifty thousand birds"
        sheet={<DataSheet caption="Troup Head facts" rows={HEADLAND_ROWS} />}
      >
        <p>
          The B-side is <em>Troup Head</em>, and it shares its name with the
          nearest thing to North Cormorant that people can actually reach.
        </p>
        <p>
          Troup Head is a headland on the north east coast of Scotland, between
          Fraserburgh and Banff, an hour or so out of Aberdeen. Twenty nine
          hectares of cliff face rise to more than ninety metres. It holds
          Scotland&rsquo;s largest mainland gannet colony, over fifty thousand
          seabirds each year, with kittiwakes, guillemots, razorbills and puffins
          packed into the same rock. Porpoises, minke whales and dolphins pass
          below it.
        </p>
        <p>
          One name belongs to a structure being dismantled offshore. The other
          belongs to a cliff that fills with birds every April. They face the
          same water.
        </p>
      </Section>

      {/* ---------- the record ---------- */}
      <section aria-label="The record" className="border-t border-neutral-800 py-12 md:py-16">
        <Eyebrow>The record</Eyebrow>
        <h2 className="mb-8 text-2xl font-bold leading-tight tracking-tight text-paper md:text-[2rem]">
          Limited 12&Prime; vinyl{d.rpm ? `, ${d.rpm} RPM` : ""}
        </h2>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <img
              src={IMG.disc}
              alt="The NCO 12 inch record, black vinyl with the platform artwork on the label"
              width={900}
              height={900}
              className="mx-auto block w-full max-w-sm"
              loading="lazy"
            />
          <div>
            {typeof d.price_usd === "number" ? (
              <p className="text-[2.75rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-paper">
                ${d.price_usd.toFixed(2)}
              </p>
            ) : null}
            {/* Deliberately not a live stock count. This is a static export, so
                a number would freeze at deploy while copies keep selling, and a
                visibly wrong scarcity claim is worse than none. `edition` is
                true indefinitely. */}
            {d.edition ? (
              <p className="mt-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--hm-accent)]">
                {d.edition}
              </p>
            ) : null}
            <div className="mt-6">
              <DataSheet caption="Pressing details" rows={recordRows} />
            </div>
            {soldOut ? (
              <p className="mt-7 inline-block border border-neutral-700 px-9 py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-muted">
                Sold out
              </p>
            ) : d.buy.shopify ? (
              <a
                href={d.buy.shopify}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block border border-[color:var(--hm-accent)] bg-[color:var(--hm-accent)] px-9 py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-ink transition-colors duration-300 ease-hm hover:bg-transparent hover:text-[color:var(--hm-accent)]"
              >
                Order the record
              </a>
            ) : null}
          </div>
        </div>
        <div className="mt-9 grid gap-px border border-neutral-800 bg-neutral-800 sm:grid-cols-2">
              <img
                src={IMG.front}
                alt="NCO sleeve, front"
                width={1200}
                height={1200}
                className="block w-full"
                loading="lazy"
              />
              <img
                src={IMG.back}
                alt="NCO sleeve, reverse, listing Side A North Cormorant Obscurity and Side B Troup Head with credits"
                width={1200}
                height={1200}
                className="block w-full"
                loading="lazy"
              />
          </div>
      </section>

      {/* ---------- listen ---------- */}
      <section aria-label="Listen" className="border-t border-neutral-800 py-12 md:py-16">
        <Eyebrow>Listen</Eyebrow>
        <h2 className="mb-6 text-2xl font-bold leading-tight tracking-tight text-paper md:text-[2rem]">
          Hear it first
        </h2>
        <SpotifyPlayer
          url={d.embeds.spotify}
          title={`${d.title}, Spotify player`}
          className="max-w-2xl"
        />
        {streaming.length > 0 ? (
          <div className="mt-6 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Stream this release
            </p>
            <PlatformLinks
              links={streaming}
              ariaLabel={`Stream ${d.title}`}
              className="mt-2.5"
            />
          </div>
        ) : null}
        {buy.length > 0 ? (
          <div className="mt-6 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Buy
            </p>
            <PlatformLinks links={buy} ariaLabel={`Buy ${d.title}`} className="mt-2.5" />
          </div>
        ) : null}
      </section>

      {/* ---------- artist ---------- */}
      <Section
        eyebrow="The artist"
        heading="Rykard"
        sheet={
          <DataSheet
            caption="Artist facts"
            rows={[
              { term: "Real name", detail: "Richard Wearing" },
              { term: "Based", detail: "Lancashire, England" },
              { term: "Label since", detail: "2010" },
              { term: "Genre", detail: "Ambient / downtempo" },
              { term: "NCO streams", detail: "25,000,000+" },
            ]}
          />
        }
      >
        <p>
          Rykard is the ambient electronic project of Richard Wearing, working
          from the Lancashire countryside in the north of England. He has recorded
          for Hunya Munya Records since 2010, across the albums{" "}
          <em>Arrive the Radio Beacon</em> (2010), <em>Luminosity</em> (2016) and{" "}
          <em>Night Towers</em> (2018), and the four-volume{" "}
          <em>Explorers</em> series.
        </p>
        <p>
          His records have been played on BBC 6 Music, KCRW in Los Angeles, KEXP,
          KALX, BBC Radio Bristol and CBC Radio 2. Listeners reach for Boards of
          Canada, Brian Eno and Aphex Twin when describing the work, though the
          north of England sits under all of it: estuary light, industrial coast,
          weather coming in off the water.
        </p>
        <p>
          <Link
            href="/artists/rykard"
            className="text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
          >
            More on Rykard
          </Link>
          <span className="mx-2.5 text-neutral-600">·</span>
          <Link
            href="/press/rykard"
            className="text-[color:var(--hm-accent)] underline-offset-4 hover:underline"
          >
            Press kit
          </Link>
        </p>
      </Section>

      {/* ---------- mailing list ----------
          The handoff shipped a styled form with no backend. This is a static
          export with no API routes, so a real form is not possible in-app and
          a dead one is worse than none. The storefront already runs a working
          list, so this points there instead of faking it. */}
      <section
        aria-label="Mailing list"
        className="border-t border-neutral-800 py-12 md:py-16"
      >
        <Eyebrow>Mailing list</Eyebrow>
        <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight text-paper md:text-[2rem]">
          New records, first
        </h2>
        <p className="max-w-[34rem] text-[15px] leading-relaxed text-neutral-300">
          Hunya Munya presses in small numbers. The list is how you hear about a
          record before it is gone.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://hunyamunya.myshopify.com/products/rykard-nco-12-vinyl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[color:var(--hm-accent)] px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--hm-accent)] transition-colors duration-300 ease-hm hover:bg-[color:var(--hm-accent)] hover:text-ink"
          >
            Join the list
          </a>
          <a
            href={`mailto:${PRESS_EMAIL}`}
            className="inline-block border border-neutral-700 px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-neutral-300 transition-colors duration-300 ease-hm hover:border-neutral-500 hover:text-paper"
          >
            Press enquiries
          </a>
        </div>
      </section>
    </article>
  );
}
