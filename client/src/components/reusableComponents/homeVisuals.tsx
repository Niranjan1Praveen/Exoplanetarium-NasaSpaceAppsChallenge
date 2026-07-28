"use client";

import dynamic from "next/dynamic";

/**
 * Client-only decorative visuals for the landing page.
 *
 * All of these paint to a canvas (cobe / WebGL) and contribute nothing to the
 * server-rendered HTML, so keeping them out of the initial bundle costs no SEO
 * and removes the largest chunks from first load. The page's text sections stay
 * server-rendered so crawlers still see the full content.
 */
export const ScrollGlobe = dynamic(() => import("./scrollGlobe"), {
  ssr: false,
});

export const Meteors = dynamic(
  () => import("../ui/meteors").then((m) => m.Meteors),
  { ssr: false }
);
