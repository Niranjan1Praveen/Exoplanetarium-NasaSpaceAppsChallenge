"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyVisibleProps {
  children: ReactNode;
  /** Rendered until the element scrolls near the viewport. */
  fallback?: ReactNode;
  /** How far ahead of the viewport to start mounting. */
  rootMargin?: string;
  className?: string;
  /** Keep children mounted once shown. WebGL contexts are costly to rebuild. */
  once?: boolean;
}

/**
 * Defers mounting of expensive subtrees (WebGL canvases, animation scenes)
 * until they are close to the viewport. Combined with next/dynamic this keeps
 * both the JS chunk and the GPU context off the initial page load.
 */
export default function LazyVisible({
  children,
  fallback = null,
  rootMargin = "200px",
  className,
  once = true,
}: LazyVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without IntersectionObserver, render immediately rather than never.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
