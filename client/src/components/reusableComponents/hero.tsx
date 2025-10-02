"use client";

import { Button } from "@/components/ui/button";
import { BlurFade } from "../ui/blur-fade";
import GlobeWithLabels from "./globeWithLabels";
import Link from "next/link";

export function Hero() {
  return (
    <section className="py-14 relative flex w-full overflow-hidden">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <BlurFade delay={0.25} inView>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Accelerating Discovery. Inspiring Exploration
          </h1>
        </BlurFade>
        <BlurFade delay={0.25 * 2} inView>
          <p className="mt-4 text-lg text-muted-foreground sm:mt-6 sm:text-xl">
            An AI/ML-powered platform that revolutionizes exoplanet research
            while making space science interactive and fun for students
            worldwide.
          </p>
        </BlurFade>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg">Start for Free</Button>
          <Link href={"/contact"}>
            <Button variant="ghost" size="lg">
              Talk to Us →
            </Button>
          </Link>
        </div>
        <GlobeWithLabels />
      </div>
    </section>
  );
}
