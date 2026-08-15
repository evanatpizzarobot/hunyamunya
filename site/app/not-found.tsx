import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Empty zone: one jellyfish rising through the column, one slow narrow drift
// across it. Nothing hurried, since this page is a dead end being made
// pleasant rather than a page anyone is reading.
const NOT_FOUND_LANES: LaneConfig[] = [
  { shape: "round",  direction: "bt", left: "22%", width: 100, duration: 120, delay: -20, opacityMod: 0.9 },
  { shape: "narrow", direction: "lr", top: "38%",  width: 80,  duration: 95,  delay: -50, opacityMod: 0.6 },
];

export const metadata: Metadata = buildMetadata({
  title: sectionTitle("Page Not Found"),
  description:
    "That page is not here. Browse the Hunya Munya Records catalog, the artist roster, or the news archive instead.",
  // A 404 already tells crawlers not to index via its status code, and it has
  // no canonical URL of its own to point at.
  index: false,
  noCanonical: true,
});

const DESTINATIONS: { href: string; label: string; blurb: string }[] = [
  { href: "/catalog", label: "Catalog", blurb: "Every release, HMR001 forward." },
  { href: "/artists", label: "Artists", blurb: "The full roster, 2002 to now." },
  { href: "/discography", label: "Discography", blurb: "The whole run in one list." },
  { href: "/news", label: "News", blurb: "The archive, oldest to newest." },
];

export default function NotFound() {
  return (
    <UnderwaterLayer zone="empty" lanes={NOT_FOUND_LANES} flushTop>
      <section className="border-b border-rule pb-16 pt-20 md:pb-20 md:pt-28">
        <div
          className="mb-5 flex items-center gap-3 text-[11px] uppercase text-[color:var(--hm-accent)]"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-current" />
          404
        </div>
        <h1 className="text-[clamp(40px,5.5vw,84px)] font-normal leading-[0.98] tracking-tighter text-paper">
          Lost at depth.
        </h1>
        <p className="mt-5 max-w-[62ch] font-serif text-[20px] italic leading-[1.5] text-paper-dim">
          That page is not here. It may have moved when the site was rebuilt, or the link
          that brought you here may have been wrong from the start. Nothing in the archive
          has been removed.
        </p>
      </section>

      <section className="py-20 md:py-28">
        <div
          className="mb-8 flex items-center gap-3 text-[11px] uppercase text-muted"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-[color:var(--hm-accent)]" />
          Try one of these
        </div>
        <ul className="grid grid-cols-1 border-t border-rule sm:grid-cols-2">
          {DESTINATIONS.map((d) => (
            <li key={d.href} className="border-b border-rule sm:[&:nth-child(odd)]:border-r">
              <Link
                href={d.href}
                className="group flex h-full flex-col gap-2 px-6 pb-6 pt-7 transition-colors duration-500 hover:bg-[color:var(--hm-roster-hover,rgba(20,50,79,0.12))]"
              >
                <span className="text-[22px] leading-none tracking-tight text-paper underline-offset-4 group-hover:underline">
                  {d.label}
                </span>
                <span className="font-serif text-[16px] italic leading-[1.5] text-paper-dim">
                  {d.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-12 font-serif text-[18px] italic leading-[1.55] text-paper-dim">
          Looking for something specific from the back catalog?{" "}
          <Link href="/contact" className="text-paper underline underline-offset-4">
            Get in touch
          </Link>
          .
        </p>
      </section>
    </UnderwaterLayer>
  );
}
