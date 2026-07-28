import type { MetadataRoute } from "next";
import { siteUrl } from "./metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // These all redirect to /sign-in for anonymous visitors, so there is
        // nothing indexable behind them.
        disallow: ["/dashboard", "/sign-in", "/sign-up", "/lab", "/play"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
