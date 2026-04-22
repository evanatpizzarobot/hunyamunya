// Shared SEO component per SEO spec §2.2-§2.3.
// Emits JSON-LD script tags for the provided schema.org objects. Head-level
// meta tags (title, description, OG, Twitter) are set via Next.js `generateMetadata`
// in each route; this component handles the structured-data side only, since
// Next's Metadata API does not expose a way to inject JSON-LD directly.

type JsonLdObject = Record<string, unknown>;

type Props = {
  jsonLd: JsonLdObject[];
};

export function SEO({ jsonLd }: Props) {
  return (
    <>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Server-rendered into the static HTML; no XSS vector because obj
          // is always a controlled object we built from our own content.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
