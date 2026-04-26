import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, contactPageJsonLd } from "@/lib/jsonld";
import { ContactEmail } from "@/components/ContactEmail";
import { UnderwaterLayer, type LaneConfig } from "@/components/UnderwaterLayer";

// Empty zone: jellyfish-form pulsing up the column + a small fast
// surface drift so the "send us a message" page never feels static
// while you scroll.
const CONTACT_LANES: LaneConfig[] = [
  { shape: "round",  direction: "bt", left: "30%", width: 90, duration: 110, delay: -30, opacityMod: 1.0 },
  { shape: "narrow", direction: "rl", top: "30%",  width: 70, duration: 90,  delay: -45, opacityMod: 0.7 },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Contact"),
    description:
      "Email Hunya Munya Records. General enquiries, demo submissions, press, sync and licensing.",
    path: "/contact",
  });
}

export default function ContactPage() {
  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          contactPageJsonLd(),
        ]}
      />

      <UnderwaterLayer zone="empty" lanes={CONTACT_LANES} flushTop>
      <section className="border-b border-rule pb-16 pt-20 md:pb-20 md:pt-28">
        <div
          className="mb-5 flex items-center gap-3 text-[11px] uppercase text-[color:var(--hm-accent)]"
          style={{ letterSpacing: "0.22em" }}
        >
          <span className="block h-px w-6 bg-current" />
          Contact
        </div>
        <h1 className="text-[clamp(40px,5.5vw,84px)] font-normal leading-[0.98] tracking-tighter text-paper">
          Get in touch.
        </h1>
        <p className="mt-5 max-w-[62ch] font-serif text-[20px] italic leading-[1.5] text-paper-dim">
          General enquiries, demo submissions, press, sync and licensing. Email is the best
          way to reach us.
        </p>
      </section>

      <section className="py-20 md:py-28">
        <div className="flex flex-col items-start gap-8">
          <ContactEmail className="text-[clamp(26px,4.2vw,52px)] font-normal leading-none tracking-tight text-paper tabular-nums" />
        </div>

        <div className="mt-20 border-t border-rule pt-12">
          <div
            className="mb-6 flex items-center gap-3 text-[11px] uppercase text-muted"
            style={{ letterSpacing: "0.22em" }}
          >
            <span className="block h-px w-6 bg-[color:var(--hm-accent)]" />
            What to include
          </div>
          <ul className="max-w-[62ch] space-y-5 font-serif text-[18px] italic leading-[1.55] text-paper-dim">
            <li>
              <strong className="not-italic font-normal text-paper">
                Demo submissions:
              </strong>{" "}
              a short note about your project plus a link to listen (Bandcamp, SoundCloud,
              private stream).
            </li>
            <li>
              <strong className="not-italic font-normal text-paper">
                Press and interviews:
              </strong>{" "}
              your outlet, a rough angle, a deadline if one applies.
            </li>
            <li>
              <strong className="not-italic font-normal text-paper">
                Sync and licensing:
              </strong>{" "}
              the project, the placement type, and a timeline.
            </li>
          </ul>
        </div>
      </section>
      </UnderwaterLayer>
    </>
  );
}
