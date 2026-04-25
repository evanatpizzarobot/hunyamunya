import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AmbientBackground } from "@/components/AmbientBackground";
import { orgSchema, LABEL_NAME, SITE_URL } from "@/lib/jsonld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const interSerif = Inter({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const interMono = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${LABEL_NAME} · LA Boutique Label, Electronic Ambient Chillout since 2002`,
    template: `%s · ${LABEL_NAME}`,
  },
  description:
    "LA based boutique label and publisher since 2002. Hunya Munya Records crafts Electronic, Ambient, Breaks, and Chillout for Radio, Film, and TV, plus collectible limited Vinyl and CDs worldwide.",
  openGraph: {
    siteName: LABEL_NAME,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

// Clamp mobile viewport to a fixed zoom. Prevents iOS Safari from letting
// users pinch-zoom-out past 1.0, which exposed side whitespace and felt
// broken on mobile. Horizontal overflow is also locked in globals.css; this
// stops the zoom-gesture path that can produce the same bug state.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interMono.variable} ${interSerif.variable}`}
    >
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="antialiased text-neutral-100">
        <AmbientBackground />
        {/* Underwater ambient layer sprite. Five abstract shadow blobs (varying
            aspect ratios so they read as different unseen creatures passing
            overhead) consumed via <use> in site/app/page.tsx. Pivoted from the
            original anatomical silhouettes — shadows have no front/back, which
            kills the directionality bug, and pure black on near-black water
            registers as a void rather than a same-color blur. */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            {/* large elongated shadow — lane 1, deepest */}
            <symbol id="silShadowLong" viewBox="0 0 240 60">
              <path d="M0 30 Q 18 8, 60 5 Q 130 0, 200 9 Q 228 13, 240 30 Q 228 47, 200 53 Q 130 60, 60 53 Q 18 50, 0 30 Z" />
            </symbol>
            {/* round blob — lane 2, mid-deep */}
            <symbol id="silShadowRound" viewBox="0 0 80 80">
              <path d="M40 4 Q 70 6, 76 36 Q 78 60, 50 76 Q 22 78, 8 56 Q 0 30, 18 12 Q 28 4, 40 4 Z" />
            </symbol>
            {/* mid oblong — lane 3, mid */}
            <symbol id="silShadowOblong" viewBox="0 0 140 50">
              <path d="M0 25 Q 14 4, 50 6 Q 100 8, 130 17 Q 142 22, 140 28 Q 138 36, 120 42 Q 80 49, 40 46 Q 12 44, 0 25 Z" />
            </symbol>
            {/* small narrow — lane 4, mid-shallow */}
            <symbol id="silShadowNarrow" viewBox="0 0 100 32">
              <path d="M0 16 Q 12 4, 40 5 Q 70 7, 92 13 Q 100 16, 92 22 Q 70 28, 40 27 Q 12 26, 0 16 Z" />
            </symbol>
            {/* very long whale-scale shadow — lane 5, near surface, slowest */}
            <symbol id="silShadowWhale" viewBox="0 0 360 80">
              <path d="M0 40 Q 30 10, 100 7 Q 200 3, 290 17 Q 340 23, 358 38 Q 360 40, 358 44 Q 340 56, 290 63 Q 200 70, 100 67 Q 30 64, 0 40 Z" />
            </symbol>
          </defs>
        </svg>
        <SEO jsonLd={[orgSchema()]} />
        <Header />
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
