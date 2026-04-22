// Spec §2, §3: MDX loaders for content/{artists,releases,news,pages}.
// Reads MDX files, validates frontmatter via lib/schema.ts, returns typed objects.
// Implementation pending Week 1 wp-import.ts run (first content on disk).

import type { Artist, Release, News, Campaign } from "./schema";

export async function getAllArtists(): Promise<Artist[]> {
  throw new Error("getAllArtists not yet implemented");
}

export async function getArtistBySlug(_slug: string): Promise<Artist | null> {
  throw new Error("getArtistBySlug not yet implemented");
}

export async function getAllReleases(): Promise<Release[]> {
  throw new Error("getAllReleases not yet implemented");
}

export async function getReleaseBySlug(_slug: string): Promise<Release | null> {
  throw new Error("getReleaseBySlug not yet implemented");
}

export async function getAllNews(): Promise<News[]> {
  throw new Error("getAllNews not yet implemented");
}

export async function getNewsBySlug(_slug: string): Promise<News | null> {
  throw new Error("getNewsBySlug not yet implemented");
}

export async function getCurrentCampaign(): Promise<Campaign> {
  throw new Error("getCurrentCampaign not yet implemented");
}
