import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, LABEL_NAME } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("About"),
    description:
      "Hunya Munya Records is an independent Los Angeles record label since 2002. Progressive house, breaks, and tech house in the early years; ambient, chillout, and cinematic electronic from 2010 onward. Home to Rykard, Darius Kohanim, Distant Fragment, and others.",
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
      <article className="prose prose-invert prose-neutral max-w-3xl rounded-sm border border-neutral-900/70 bg-neutral-950/75 p-6 backdrop-blur-sm md:p-8">
        <h1 className="font-serif text-4xl text-neutral-50">About</h1>

        <p>
          {LABEL_NAME} is an independent Los Angeles record label founded in 2002. We started out putting out progressive house, breaks, and tech house vinyl across HMR001 through HMR009, released between 2004 and 2008. From 2010 onward the label grew into ambient, chillout, and the cinematic electronic territory where most of the recent catalog lives. That makes 2026 our twenty-fourth year; the music has moved, the approach hasn&rsquo;t.
        </p>

        <p>
          The label has always been vinyl-first for the records that earn it. Ten numbered HMR 12&rdquo; releases, four CD full-lengths, and eighteen digital releases from our 2005 to 2008 Hunya Munya Digital sublabel: a catalog that rewards repeat listening more than it chases attention. Some of these records are twenty years old and still finding new listeners; a few of them we lost track of in previous website migrations and are only now putting back where they belong.
        </p>

        <p>
          Our best-known lineage runs through{" "}
          <Link href="/artists/rykard">Rykard</Link>, whose album &ldquo;Arrive the Radio Beacon&rdquo; remains one of the records we&rsquo;re proudest to have put out. A new Rykard album is in the works for 2026.
        </p>

        <p>
          Beyond Rykard, the roster threads through artists like{" "}
          <Link href="/artists/darius-kohanim">Darius Kohanim</Link>,{" "}
          <Link href="/artists/habersham">Habersham</Link>,{" "}
          <Link href="/artists/distant-fragment">Distant Fragment</Link>, and a range of collaborators who have contributed to the label&rsquo;s sound over the years. The complete{" "}
          <Link href="/artists">roster</Link> and{" "}
          <Link href="/catalog">catalog</Link> are both a few clicks away.
        </p>

        <p>
          We work slow. We put out records we actually want to put out. We like physical media, clean mastering, real liner notes, and artwork you can hold in your hands. We&rsquo;ve never chased trends and we&rsquo;ve never faked engagement. If the music doesn&rsquo;t earn a release on its own merits, it doesn&rsquo;t get one. That&rsquo;s an uncommercial principle, but it&rsquo;s the one we&rsquo;ve stuck with.
        </p>

        <p>
          Los Angeles has been our home since day one. Every record on the label came together here: the rooms, the collaborators, the scenes that hold them up. We&rsquo;ve watched the city&rsquo;s scenes reshape themselves many times over the years, from the progressive and breaks era through today&rsquo;s ambient and electronic work, and we&rsquo;re still glad to be part of whatever it&rsquo;s becoming next.
        </p>

        <p>
          If you&rsquo;re an artist working in ambient, drone, electronic, or adjacent territory and you&rsquo;ve got something you think belongs here, the door is open. We read every submission, though we can&rsquo;t always respond. If you&rsquo;re a listener, the{" "}
          <Link href="/catalog">catalog</Link> is the best way in. Start anywhere and let it lead you outward.
        </p>

        <p className="text-neutral-400">
          <em>Evan Rippertoe, founder</em>
        </p>

        <h2 className="font-serif text-2xl text-neutral-100">Contact</h2>
        <p>
          General enquiries, demo submissions, press, sync and licensing:{" "}
          <a href="mailto:contact@hunyamunyarecords.com">contact@hunyamunyarecords.com</a>.
        </p>
      </article>
    </>
  );
}
