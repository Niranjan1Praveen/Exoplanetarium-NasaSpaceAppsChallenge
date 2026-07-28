"use client";

import dynamic from "next/dynamic";
import LazyVisible from "../lazyVisible";
import type { ComponentType } from "react";

/**
 * The discovery-method animations are react-three-fiber scenes. They are the
 * heaviest chunks on the page and none of them render anything on the server,
 * so each is code-split and mounted only when its card nears the viewport.
 *
 * `dynamic(..., { ssr: false })` must be called from a client module, which is
 * why these wrappers live here rather than in the page itself.
 */
const placeholder = (
  <div className="h-[300px] w-full animate-pulse bg-muted/30" />
);

function lazyScene(loader: () => Promise<{ default: ComponentType }>) {
  const Scene = dynamic(loader, { ssr: false, loading: () => placeholder });
  return function LazyScene() {
    return (
      <LazyVisible rootMargin="300px" fallback={placeholder}>
        <Scene />
      </LazyVisible>
    );
  };
}

export const TTVAnimation = lazyScene(() => import("./ttvAnimation"));
export const RadialVelocityAnimation = lazyScene(() => import("./radialVelocity"));
export const MicrolensingAnimation = lazyScene(() => import("./microlensing"));
export const DirectImagingAnimation = lazyScene(() => import("./directImaging"));
export const AstrometryAnimation = lazyScene(() => import("./astrometry"));
