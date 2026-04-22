import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, contactPageJsonLd } from "@/lib/jsonld";
import { ContactForm } from "@/components/ContactForm";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Contact"),
    description:
      "Get in touch with Hunya Munya Records. Demo submissions, press inquiries, licensing requests, or general questions. We read every message.",
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

      <article className="mx-auto max-w-2xl">
        <header className="mb-8 rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
          <h1 className="font-serif text-4xl text-neutral-50">Contact</h1>

          <div className="prose prose-invert prose-neutral mt-4 max-w-none">
            <p>
              We read every message that comes through here. Whether you&rsquo;re an artist with
              something you think belongs on Hunya Munya Records, press or media with a question,
              someone interested in licensing our catalog for a project, or a listener with
              anything else on your mind, this form goes to us.
            </p>

            <p>
              A quick note: we&rsquo;re a small independent label, which means responses can take
              a few weeks. We always read. We don&rsquo;t always have time to reply. If
              it&rsquo;s urgent, say so in the message and we&rsquo;ll prioritize.
            </p>

            <p>
              <strong>For demo submissions:</strong> please include a link to the music. Bandcamp,
              SoundCloud, private streaming link, Google Drive folder, anything https. We
              don&rsquo;t accept file attachments through the form.
            </p>

            <p>
              <strong>For everything else:</strong> just tell us what&rsquo;s up.
            </p>
          </div>
        </header>

        <section className="rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
          <ContactForm />
        </section>

        <footer className="mt-6 text-center text-sm text-neutral-500">
          You can also reach us at{" "}
          <span className="text-neutral-300">contact [at] hunyamunyarecords [dot] com</span>.
        </footer>
      </article>
    </>
  );
}
