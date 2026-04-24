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
        <SEO jsonLd={[orgSchema()]} />
        <Header />
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
