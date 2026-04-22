import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, LABEL_NAME } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("About"),
    description:
      "Hunya Munya Records is an independent ambient electronic music label founded in Los Angeles in 2003.",
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
          {LABEL_NAME} is an independent ambient electronic music label based in Los Angeles. Founded in 2003, the catalog spans vinyl and digital releases across ambient, electronic, and experimental music. Rykard&rsquo;s <em>Arrive the Radio Beacon</em> anchors the early catalog; a deep roster of roughly two dozen artists has contributed to the label&rsquo;s twenty-plus-year archive.
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
