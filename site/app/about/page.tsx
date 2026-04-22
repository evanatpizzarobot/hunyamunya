import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, LABEL_NAME } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("About"),
    description:
      "Hunya Munya Records is an LA-based boutique record label and publisher founded in Los Angeles in 2002, working across Electronic, Ambient, and Chillout for Radio, Film, and TV, plus limited Vinyl and CD releases worldwide.",
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      <article className="prose prose-invert prose-neutral max-w-3xl">
        <h1 className="font-serif text-4xl text-neutral-50">About</h1>
        <p className="text-neutral-300">
          {LABEL_NAME} is an LA-based boutique record label and publisher, founded in 2002. We craft Electronic, Ambient, and Chillout music for Radio, Film, and TV, and release collectible limited Vinyl and CDs worldwide. The catalog spans two decades across vinyl, CD, and digital, with Rykard&rsquo;s <em>Arrive the Radio Beacon</em> anchoring the early era; a deep roster of roughly three dozen artists has contributed to the label&rsquo;s archive.
        </p>
        <p className="text-neutral-500 text-sm">
          This page is a placeholder. A longer label history, origin story, and musical identity essay are planned for launch.
        </p>
        <h2 className="font-serif text-2xl text-neutral-100">Contact</h2>
        <p className="text-neutral-300">
          General enquiries, demo submissions, press, sync and licensing:{" "}
          <a
            href="mailto:contact@hunyamunyarecords.com"
            className="text-neutral-100 underline-offset-4 hover:underline"
          >
            contact@hunyamunyarecords.com
          </a>
          .
        </p>
      </article>
    </>
  );
}
