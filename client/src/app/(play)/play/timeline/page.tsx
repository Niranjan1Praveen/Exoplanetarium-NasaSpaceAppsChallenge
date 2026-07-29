"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import LazyVisible from "@/components/reusableComponents/lazyVisible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { missions, type Mission } from "./missions";

// One WebGL canvas per timeline entry: load each only as it scrolls into view.
const GLBLoaderTimeline = dynamic(
  () => import("@/components/reusableComponents/glbloadertimeline"),
  { ssr: false }
);
const Particles = dynamic(
  () => import("@/components/ui/particles").then((m) => m.Particles),
  { ssr: false }
);

const statusVariant: Record<Mission["status"], string> = {
  Operating: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Retired: "bg-muted text-muted-foreground",
  Planned: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

export default function TimelinePage() {
  // Sort a copy: Array.prototype.sort mutates, and the imported array is
  // module-level state shared across renders.
  const sorted = useMemo(
    () =>
      [...missions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    []
  );

  const [selected, setSelected] = useState<Mission | null>(null);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <LazyVisible className="absolute inset-0" rootMargin="0px">
        <Particles
          className="absolute inset-0"
          quantity={200}
          size={0.1}
          ease={80}
          refresh
        />
      </LazyVisible>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-0 size-64 rounded-full bg-primary/5 blur-3xl md:size-96" />
        <div className="absolute bottom-0 right-1/4 size-64 rounded-full bg-primary/5 blur-3xl md:size-96" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 pt-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Exoplanet Exploration Timeline
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Three decades of missions that turned exoplanets from theory into a
          catalogue. Tap any spacecraft to read its profile.
        </p>
        <Link
          href="/play"
          className="inline-flex items-center gap-1 text-sm hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Play
        </Link>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Rail: hard left on mobile, centred once there is room for two columns. */}
        <div className="absolute bottom-0 top-0 left-[27px] w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-1/2 md:-translate-x-1/2" />

        <div className="flex flex-col gap-12 sm:gap-20">
          {sorted.map((mission, index) => {
            const year = new Date(mission.date).getFullYear();
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative flex items-start gap-4 md:items-center md:gap-0"
              >
                {/* Year marker. Sits on the rail at both breakpoints. */}
                <div className="relative z-10 flex size-14 shrink-0 items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary text-xs font-semibold text-background shadow-lg">
                    {year}
                  </div>
                </div>

                <div
                  className={`min-w-0 flex-1 md:w-1/2 md:flex-none ${
                    isLeft ? "md:pr-14" : "md:ml-auto md:pl-14"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(mission)}
                    aria-label={`Open details for ${mission.title}`}
                    className="group w-full cursor-pointer rounded-xl border border-transparent p-2 text-center transition-colors hover:border-border hover:bg-card/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* The model itself is the click target, not just the name. */}
                    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
                      <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative z-10 h-full w-full">
                        <LazyVisible
                          rootMargin="400px"
                          className="h-full w-full"
                          fallback={<div className="h-full w-full" />}
                        >
                          <GLBLoaderTimeline modelPath={mission.modelPath} />
                        </LazyVisible>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col items-center gap-1">
                      <span className="text-lg font-semibold group-hover:text-primary">
                        {mission.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusVariant[mission.status]}
                      >
                        {mission.status}
                      </Badge>
                      <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {mission.body}
                      </span>
                    </div>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader className="space-y-2 border-b p-5 text-left sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl sm:text-2xl">
                    {selected.title}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={statusVariant[selected.status]}
                  >
                    {selected.status}
                  </Badge>
                </div>
                <DialogDescription>
                  {selected.agency} · {new Date(selected.date).getFullYear()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 p-5 sm:p-6">
                <div className="mx-auto aspect-square w-full max-w-[280px]">
                  <GLBLoaderTimeline
                    modelPath={selected.modelPath}
                    key={selected.id}
                  />
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    At a glance
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {selected.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between gap-3 border-b border-border/50 py-2 text-sm"
                      >
                        <dt className="shrink-0 text-muted-foreground">
                          {spec.label}
                        </dt>
                        <dd className="text-right font-medium">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selected.overview}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Key results
                  </h3>
                  <ul className="space-y-2">
                    {selected.discoveries.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
