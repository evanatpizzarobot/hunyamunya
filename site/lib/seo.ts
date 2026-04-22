// Spec §10: SEO helpers for Next.js Metadata API + JSON-LD emission.
// Implementation deferred to Week 2 design pass.

import type { Metadata } from "next";

const siteName = "Hunya Munya Records";
const siteUrl = "https://hunyamunyarecords.com";

export function buildMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  index?: boolean;
  follow?: boolean;
}): Metadata {
  const title = opts.title ? `${opts.title} | ${siteName}` : siteName;
  const url = opts.path ? `${siteUrl}${opts.path}` : siteUrl;
  return {
    title,
    description: opts.description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    robots: {
      index: opts.index ?? true,
      follow: opts.follow ?? true,
    },
    openGraph: {
      type: "website",
      url,
      title,
      description: opts.description,
      siteName,
      images: opts.ogImage ? [{ url: opts.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: opts.description,
      images: opts.ogImage ? [opts.ogImage] : undefined,
    },
  };
}
