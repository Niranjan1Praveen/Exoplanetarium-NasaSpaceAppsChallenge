"use client";

import { Button } from "@/components/ui/button";
import { BlurFade } from "../ui/blur-fade";
import GlobeWithLabels from "./globeWithLabels";

export function Hero() {
  return (
    <section className="py-14 relative flex w-full overflow-hidden">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <BlurFade delay={0.25} inView>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Ship faster with Postgres
          </h1>
        </BlurFade>
        <BlurFade delay={0.25 * 2} inView>
          <p className="mt-4 text-lg text-muted-foreground sm:mt-6 sm:text-xl">
            The database developers trust, on a serverless platform designed to
            help you build reliable and scalable applications faster.
          </p>
        </BlurFade>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg">Start for Free</Button>
          <Button variant="ghost" size="lg">
            Talk to Us →
          </Button>
        </div>
        <GlobeWithLabels/>
      </div>
    </section>
  );
}
