import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, sectionTitle } from "@/lib/seo";
import { SEO } from "@/components/SEO";
import { breadcrumbJsonLd, LABEL_NAME } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: sectionTitle("About"),
    description:
      "Hunya Munya Records is an independent label and publisher. Started in the early 2000s between Seattle and Vancouver with CDR promos in 2002 and 2003, HMR001 released in 2004, Hunya Munya Publishing running 2005 to 2007, based in Los Angeles since 2008/2009. Progressive house, breaks, and tech house in the early years; ambient, chillout, and cinematic electronic from 2010 onward. Home to Rykard, Darius Kohanim, Distant Fragment, and more.",
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
          {LABEL_NAME} is an independent label and publisher. We started in the early 2000s, going back and forth between Seattle, WA and Vancouver, B.C., sending out our first promos on CDRs in 2002 and 2003, then white-label promos, leading to the eventual official release of HMR001 in 2004. The first era, HMR001 through HMR009 (2004 to 2008), was a run of progressive house, breaks, and tech house 12&rdquo;s. Alongside the label, from 2005 to 2007, Hunya Munya Publishing ran with Colin Moreh, Justin Moreh, Marcus Zuhr, and Evan Marcus pitching to commercials and landing sync placements on television. The move to Los Angeles came in 2008 and 2009, where the label has been based ever since. From 2010 onward we shifted into ambient, chillout, and cinematic electronic, where most of the recent catalog lives, and licensing work for radio, film, and television has continued through this era. That makes 2026 our twenty-fourth year. The music has moved. The approach hasn&rsquo;t.
        </p>

        <p>
          The label has always been vinyl-first for the records that earn it. Ten numbered HMR 12&rdquo;s, four CD full-lengths, and eighteen digital releases from our 2005 to 2008 Hunya Munya Digital sublabel: a catalog that rewards repeat listening more than it chases attention. Some of these records are twenty years old and still finding new listeners; a few we lost track of in previous site migrations and are only now putting back where they belong.
        </p>

        <p>
          Our best-known lineage runs through{" "}
          <Link href="/artists/rykard">Rykard</Link>, a.k.a. Richard Wearing, working from the Lancashire countryside in the north of England. His 2010 debut <em>Arrive the Radio Beacon</em> brought the label its widest international reach, with &ldquo;North Cormorant Obscurity&rdquo; surpassing twenty-five million streams and support from BBC Radio, KCRW, and CBC along the way. The full-lengths <em>Luminosity</em> (2016) and <em>Night Towers</em> (2018) followed. Our newest release, HMR010, is the fifteen-year anniversary 12&rdquo; vinyl reissue of &ldquo;North Cormorant Obscurity,&rdquo; re-edited and mixed for vinyl, with an unreleased B Side called &ldquo;Troup Head.&rdquo; Pressed by Vinyl Ceremony and mastered in LA. A new Rykard album is also in the works.
        </p>

        <p>
          Beyond Rykard, the roster runs through artists like{" "}
          <Link href="/artists/darius-kohanim">Darius Kohanim</Link>,{" "}
          <Link href="/artists/habersham">Habersham</Link>,{" "}
          <Link href="/artists/distant-fragment">Distant Fragment</Link>, and a long list of collaborators whose work has shaped the label&rsquo;s sound. The complete{" "}
          <Link href="/artists">roster</Link> and{" "}
          <Link href="/catalog">catalog</Link> are a few clicks away.
        </p>

        <p>
          We work slow. We put out records we actually want to put out. We like physical media, clean mastering, real liner notes, and artwork you can hold in your hands. We&rsquo;ve never chased trends and we&rsquo;ve never faked engagement.
        </p>

        <p>
          Every record on the label came together somewhere, with someone: rooms, collaborators, scenes that held them up. That&rsquo;s been true across Vancouver, Seattle, and Los Angeles, across two decades of genres reshaping themselves. We&rsquo;re still glad to be part of whatever&rsquo;s next.
        </p>

        <p>
          If you&rsquo;re an artist working in ambient, electronic, cinematic, or adjacent territory, and you&rsquo;ve got something for release or for sync that you think belongs here, the door is open. We read every submission, though we can&rsquo;t always respond. If you&rsquo;re a listener, the{" "}
          <Link href="/catalog">catalog</Link> is the best way in. Start anywhere and let it lead you outward.
        </p>

        <p className="text-neutral-400">
          <em>Evan Marcus, founder</em>
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
