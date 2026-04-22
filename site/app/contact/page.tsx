import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Contact"),
    description:
      "Contact Hunya Munya Records. Demo submissions, sync and licensing, press and interview requests.",
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
        ]}
      />
      <article className="max-w-2xl">
        <h1 className="font-serif text-4xl text-neutral-50">Contact</h1>
        <p className="mt-4 text-neutral-300">
          If you&rsquo;re submitting a demo, please include contact info and a direct link. Thank you.
        </p>
        <p className="mt-4 text-neutral-400">
          Email{" "}
          <a href="mailto:evan@hunyamunyarecords.com" className="text-neutral-100 underline-offset-4 hover:underline">
            evan@hunyamunyarecords.com
          </a>
          .
        </p>
        <p className="mt-6 text-xs uppercase tracking-wider text-neutral-500">
          The /submit form (demo / sync / press) will be wired in a follow-up via the PHP endpoint at
          <code className="ml-1 font-mono text-neutral-400">/api/contact.php</code> per hosting-addendum §6.
        </p>
      </article>
    </>
  );
}
