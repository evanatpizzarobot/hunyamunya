import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Press"),
    description:
      "Press kit, artist coverage, and media resources for Hunya Munya Records and its roster.",
    path: "/press",
  });
}

export default function PressPage() {
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
      <article className="max-w-3xl">
        <h1 className="font-serif text-4xl text-neutral-50">Press</h1>
        <p className="mt-4 text-neutral-300">
          Press kit and coverage aggregation coming soon. For press inquiries, interviews, and review copies, email{" "}
          <a href="mailto:contact@hunyamunyarecords.com" className="underline-offset-4 hover:underline">
            contact@hunyamunyarecords.com
          </a>
          .
        </p>
      </article>
    </>
  );
}
