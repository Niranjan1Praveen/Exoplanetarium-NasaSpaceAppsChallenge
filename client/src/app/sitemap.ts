import type { MetadataRoute } from "next";
import { siteUrl } from "./metadata";

/**
 * Only routes that render for signed-out visitors. /play, /lab and /explore
 * sit behind Clerk middleware and redirect to /sign-in, so listing them would
 * feed crawlers a sign-in page under the wrong canonical URL.
 */
const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/team", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
