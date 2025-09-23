"use client";

import { motion, useScroll } from "motion/react";
import { useRef } from "react";

function Item({
  title,
  description,
  reverse = false,
}: {
  title: string;
  description: string;
  reverse?: boolean;
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
        className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center`}
      >
        <div
          className={`w-full h-48 md:h-64 bg-muted-foreground rounded-lg ${
            reverse ? "md:order-2" : ""
          }`}
        ></div>

        <div
          className={`flex items-start gap-4 ${reverse ? "md:order-1" : ""}`}
        >
          <figure className="sticky top-0 w-16 h-16 shrink-0">
            <svg
              className="-rotate-90"
              width="75"
              height="75"
              viewBox="0 0 100 100"
            >
              <circle
                className="opacity-20 stroke-pink-500"
                cx="50"
                cy="50"
                r="30"
                pathLength="1"
                strokeWidth="5"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="30"
                pathLength="1"
                style={{ pathLength: scrollYProgress }}
                strokeWidth="5"
                fill="none"
                className="stroke-pink-500"
              />
            </svg>
          </figure>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ExoplanetProblem() {
  return (
    <section className="py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold leading-snug text-center mb-12">
          Why is it so hard to classify Exoplanets?
        </h2>
      </div>

      {/* 1st - normal */}
      <Item
        title="Vast Distances & Weak Signals"
        description="Exoplanets are light-years away, making their signals extremely faint and often lost in the glare of their host stars."
      />
      {/* 2nd - reversed */}
      <Item
        title="Overlapping Planet Types"
        description="Many exoplanets blur categories—like super-Earths and mini-Neptunes—making strict classification difficult."
        reverse
      />
      {/* 3rd - normal */}
      <Item
        title="Limited Observational Data"
        description="We usually detect exoplanets indirectly through light dips or stellar wobbles, leaving gaps in our understanding."
      />
      {/* 4th - reversed */}
      <Item
        title="Atmospheric Challenges"
        description="Studying atmospheres requires detecting tiny spectral signatures, which are easily distorted by noise and interference."
        reverse
      />
    </section>
  );
}
