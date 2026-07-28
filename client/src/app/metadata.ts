import type { Metadata, Viewport } from "next";

/**
 * Absolute base for canonical/OG URLs. Vercel injects VERCEL_PROJECT_PRODUCTION_URL
 * on production builds; set NEXT_PUBLIC_SITE_URL to pin a custom domain.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const siteName = "Exoplanetarium";
const description =
  "Explore, draw and visualise exoplanets with interactive 3D tools. Classify planets by colour pattern, analyse atmospheres, and walk the timeline of exoplanet discovery.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Interactive 3D Exoplanet Explorer`,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: [
    "exoplanet",
    "exoplanet explorer",
    "3D exoplanet",
    "astronomy",
    "NASA Space Apps Challenge",
    "transit method",
    "radial velocity",
    "habitability",
    "atmospheric analysis",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    url: siteUrl,
    title: `${siteName} — Interactive 3D Exoplanet Explorer`,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Interactive 3D Exoplanet Explorer`,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};
