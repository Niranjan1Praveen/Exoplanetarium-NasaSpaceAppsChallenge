"use client";

import { cn } from "@/lib/utils";
import { Particles } from "../ui/particles";
import { Globe } from "../ui/globe";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function About() {
  return (
    <section className="flex relative items-center justify-center py-10 overflow-hidden">
      <section className="container flex max-w-7xl flex-col items-center justify-center text-center ">
        {/* Background Particles */}
        <Particles
          className="absolute inset-0"
          quantity={100}
          size={0.1}
          ease={80}
          refresh
        />

        {/* Content */}
        <div className="z-10 max-w-2xl space-y-4 px-4">
          <Badge variant="secondary">About</Badge>

          <h2 className="text-4xl font-bold sm:text-5xl">
            We&apos;re an indie team dotted across the globe
          </h2>
          <p className="text-muted-foreground">
            Our mission is to improve the way people think by making a jolly
            good note-taking app.
          </p>
          <Button className="mt-4 px-4 py-2 text-sm">See our values</Button>
        </div>

        <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden px-40 pb-40 pt-8 md:pb-60">
          <Globe className="opacity-70" />
          <div className="pointer-events-none absolute bottom-0 h-40 w-full bg-gradient-to-b from-transparent to-background" />
        </div>
      </section>
    </section>
  );
}
