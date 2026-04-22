import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Inter,
  Source_Serif_4,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Space_Grotesk,
  Fraunces,
  Space_Mono,
} from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AmbientBackground } from "@/components/AmbientBackground";
import dynamic from "next/dynamic";
import { orgSchema, LABEL_NAME, SITE_URL } from "@/lib/jsonld";

// Dev-only switcher. In a prod build, NODE_ENV becomes "production" and the
// import() branch is DCE'd — the switcher code never ships nor loads.
const FontExperimentSwitcher =
  process.env.NODE_ENV === "production"
    ? (() => null) as unknown as React.ComponentType
    : dynamic(
        () =>
          import("@/components/dev/FontExperimentSwitcher").then(
            (m) => m.FontExperimentSwitcher,
          ),
        { ssr: false },
      );

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${LABEL_NAME} · LA Boutique Label, Electronic Ambient Chillout since 2002`,
    template: `%s · ${LABEL_NAME}`,
  },
  description:
    "LA based boutique label and publisher since 2002. Hunya Munya Records crafts Electronic, Ambient, and Chillout for Radio, Film, and TV, plus collectible limited Vinyl and CDs worldwide.",
  openGraph: {
    siteName: LABEL_NAME,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

const fontVars = [
  geistSans.variable,
  geistMono.variable,
  inter.variable,
  sourceSerif.variable,
  jetbrainsMono.variable,
  plexMono.variable,
  spaceGrotesk.variable,
  fraunces.variable,
  spaceMono.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-font-set="a" className={fontVars}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="antialiased text-neutral-100">
        <AmbientBackground />
        <SEO jsonLd={[orgSchema()]} />
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <Footer />
        <FontExperimentSwitcher />
      </body>
    </html>
  );
}
