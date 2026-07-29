"use client";

import { Button } from "@/components/ui/button";
import { BlurFade } from "../ui/blur-fade";
import GlobeWithLabels from "./globeWithLabels";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex w-full overflow-hidden py-10 sm:py-14">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <BlurFade delay={0.25} inView>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Accelerating Discovery. Inspiring Exploration
          </h1>
        </BlurFade>
        <BlurFade delay={0.25 * 2} inView>
          <p className="mt-4 text-base text-muted-foreground sm:mt-6 sm:text-xl">
            An AI/ML-powered platform that revolutionizes exoplanet research
            while making space science interactive and fun for students
            worldwide.
          </p>
        </BlurFade>

        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/explore">
              Start Exploring
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <GlobeWithLabels />
      </div>
    </section>
  );
}
