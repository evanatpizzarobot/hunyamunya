/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // `next dev` and `next build` both own .next, so a verification build run
  // while the dev server is up wipes the chunks the browser is asking for and
  // the page renders with no CSS until webpack recompiles. Builds that set
  // NEXT_DIST_DIR write somewhere else and leave the dev server alone.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The repo root has its own lockfile (husky only), which makes Turbopack
  // guess the wrong workspace root. The app lives entirely in site/.
  turbopack: { root: import.meta.dirname },
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
