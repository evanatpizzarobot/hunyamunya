// Chip row of outbound platform links (DSPs or shops) for a release page.
// Inner-page neutral styling to match the tracklist/credits sections.

import type { PlatformLink } from "@/lib/streaming";

export function PlatformLinks({
  links,
  ariaLabel,
  className = "",
}: {
  links: PlatformLink[];
  ariaLabel: string;
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <ul aria-label={ariaLabel} className={`flex flex-wrap gap-2 text-xs ${className}`}>
      {links.map((l) => (
        <li key={l.key}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-neutral-700 bg-neutral-900 px-3 py-1.5 uppercase tracking-wider text-neutral-300 transition-colors hover:border-neutral-500 hover:bg-neutral-800 hover:text-neutral-50"
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
