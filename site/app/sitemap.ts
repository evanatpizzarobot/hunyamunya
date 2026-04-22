import type { MetadataRoute } from "next";
import { getAllArtists, getAllNews, getAllReleases } from "@/lib/content";
import { SITE_URL } from "@/lib/jsonld";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/artists`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const artistRoutes: MetadataRoute.Sitemap = getAllArtists().map((a) => ({
    url: `${SITE_URL}/artists/${a.data.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: a.data.tier === "anchor" ? 0.9 : 0.8,
  }));

  const releaseRoutes: MetadataRoute.Sitemap = getAllReleases().map((r) => ({
    url: `${SITE_URL}${r.urlPath}`,
    lastModified: r.data.release_date ? new Date(r.data.release_date) : now,
    changeFrequency: "monthly",
    priority: r.data.featured ? 0.9 : 0.8,
  }));

  const newsRoutes: MetadataRoute.Sitemap = getAllNews().map((n) => ({
    url: `${SITE_URL}${n.urlPath}`,
    lastModified: new Date(n.data.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...artistRoutes, ...releaseRoutes, ...newsRoutes];
}
