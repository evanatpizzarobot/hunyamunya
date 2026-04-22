// Server component. Renders the always-on animated gradient wash behind every
// page. Home page additionally layers the campaign hero image on top via
// HomeHeroBackground (rendered from app/page.tsx), so that gets server-rendered
// per-route without a client pathname check.

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-neutral-950"
    >
      <div className="ambient-gradient absolute inset-0" />
    </div>
  );
}
