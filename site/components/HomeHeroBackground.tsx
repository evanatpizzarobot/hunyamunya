// Server component. Layers the active campaign's hero image behind the home
// page at z-index -10 (above the site-wide ambient gradient at -z-20, below
// all content at default z). Dark overlay keeps text legible. If the image
// 404s (file not yet on disk), the ambient gradient below stays visible.

import type { Campaign } from "@/lib/schema";

export function HomeHeroBackground({ campaign }: { campaign: Campaign }) {
  const active = campaign.active;
  if (!active?.hero_media?.src) return null;

  const type = active.hero_media.type;
  if (type !== "image" && type !== "loop") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <img
        src={active.hero_media.src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/70 to-neutral-950" />
    </div>
  );
}
