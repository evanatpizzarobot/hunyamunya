import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("Message sent"),
    description: "Thanks for writing Hunya Munya Records. We read every message.",
    path: "/contact/sent",
    index: false,
    follow: true,
  });
}

// No-JS fallback destination for /contact-submit.php. The PHP endpoint
// redirects here on successful submit when X-Requested-With != fetch.
// The ?id=... query string is not rendered in static HTML (we can't read
// it at build time); for users who need their submission ID, the
// acknowledgment email they just received carries it.
export default function ContactSentPage() {
  return (
    <>
      <SEO
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
            { name: "Message sent", path: "/contact/sent" },
          ]),
        ]}
      />
      <article className="mx-auto max-w-2xl rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
        <h1 className="font-serif text-3xl text-neutral-50">Message received.</h1>
        <p className="mt-4 text-neutral-300">
          Thanks for writing. We read every submission ourselves; if you&rsquo;re hoping for a
          response, it might take a few weeks. Check your inbox for a quick acknowledgment with
          your submission ID.
        </p>
        <p className="mt-3 text-neutral-300">
          In the meantime, the{" "}
          <Link href="/catalog" className="underline underline-offset-4">
            catalog
          </Link>{" "}
          is open, and new releases go out through the{" "}
          <Link href="/news" className="underline underline-offset-4">
            news
          </Link>{" "}
          feed.
        </p>
        <p className="mt-8 text-sm">
          <Link href="/contact" className="text-neutral-400 underline-offset-4 hover:text-neutral-100 hover:underline">
            ← Send another message
          </Link>
        </p>
      </article>
    </>
  );
}
