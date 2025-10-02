"use client";

import { motion, useScroll } from "motion/react";
import { useRef, ReactNode } from "react";
import { Particles } from "../ui/particles";
import VastDistanceSignal from "./vastDistanceSignal";
import OverlappingPlanets from "./overlappingPlanets";
import AtmosphericChallenges from "./atmopshericChallenges";
import LimitedObservationalData from "./limitedObservationalData";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";

function Item({
  title,
  description,
  reverse = false,
  content,
}: {
  title: string;
  description: string;
  reverse?: boolean;
  content?: ReactNode;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  return (
    <section className="h-screen max-h-[400px] flex items-center justify-center px-4">
      <div
        ref={ref}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div
          className={`w-full h-48 md:h-64 rounded-lg flex items-center justify-center ${
            reverse ? "md:order-2" : ""
          }`}
        >
          {content ? (
            content
          ) : (
            <div className="relative flex w-full items-center justify-center">
              <div className="absolute z-[-10] h-32 w-32 rounded-full bg-muted" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 fill-primary/30"
                viewBox="0 0 24 24"
              >
                <path d="M12 0L24 6v12l-12 6-12-6V6z" />
              </svg>
            </div>
          )}
        </div>

        <div
          className={`flex items-start gap-4 ${reverse ? "md:order-1" : ""}`}
        >
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-md text-muted-foreground mt-2">{description}</p>
            <Link href={"/"} className="flex gap-1 items-center mt-2 hover:underline">Read More<ArrowRight className="size-4"/></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ExoplanetProblem() {
  return (
    <section className="relative py-16 sm:px-6 lg:px-8">
      <Particles
        className="absolute inset-0"
        quantity={100}
        size={0.1}
        ease={80}
        refresh
      />
      <div className="max-w-7xl mx-auto text-center">
        <Badge variant={"secondary"}>Problem</Badge>
        <h2 className="text-4xl md:text-5xl font-bold leading-snug text-center mb-12">
          Why is it so hard to classify Exoplanets?
        </h2>
      </div>

      <Item
        title="Vast Distances & Weak Signals"
        description="Exoplanets are light-years away, making their signals extremely faint and often lost in the glare of their host stars."
        content={<VastDistanceSignal />}
      />

      <Item
        title="Overlapping Planet Types"
        description="Many exoplanets blur categories—like super-Earths and mini-Neptunes—making strict classification difficult."
        reverse
        content={<OverlappingPlanets />}
      />

      <Item
        title="Limited Observational Data"
        description="We usually detect exoplanets indirectly through light dips or stellar wobbles, leaving gaps in our understanding."
        content={
          <LimitedObservationalData/>
        }
      />

      <Item
        title="Atmospheric Challenges"
        description="Studying atmospheres requires detecting tiny spectral signatures, which are easily distorted by noise and interference."
        reverse
        content={<AtmosphericChallenges />}
      />
    </section>
  );
}
