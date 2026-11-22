"use client";
// Lab home: one card per working lab tool.

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe2, Orbit, Target } from "lucide-react";

const TOOLS = [
  {
    href: "/lab/classifier",
    name: "Exoplanet Classifier",
    icon: Target,
    text: "Enter orbital period, transit depth, planet radius and stellar radius. A LightGBM + XGBoost ensemble labels the signal as a False Positive, Candidate or Confirmed planet.",
    tag: "Saves to your history",
  },
  {
    href: "/lab/atmosphericAnalysis",
    name: "Atmospheric Analysis",
    icon: Orbit,
    text: "Pick a planet to see its transit light curve, morning vs evening transmission spectra and the molecules detected in its atmosphere.",
    tag: "IAC exoplanet atmospheres catalogue",
  },
  {
    href: "/lab/exoplanet",
    name: "3D Exoplanet Viewer",
    icon: Globe2,
    text: "Fly in to an interactive 3D rocky exoplanet and spin it around to explore its surface.",
    tag: "Interactive 3D model",
  },
];

export default function LabHome() {
  return (
    <div className="relative min-h-screen overflow-hidden p-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold">Exoplanet Lab</h1>
          <p className="text-xl text-muted-foreground">Classify and analyze exoplanets with AI models and real catalogue data</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TOOLS.map(({ href, name, icon: Icon, text, tag }, i) => (
            // Each card fades up one after another
            <motion.div key={href} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}>
              <Link href={href}
                className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 group-hover:rotate-[360deg]">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">{name}</h3>
                <p className="mb-6 flex-1 leading-relaxed text-muted-foreground">{text}</p>
                <div className="flex items-center justify-between border-t border-white/10 pt-6 text-sm">
                  <span className="text-muted-foreground">{tag}</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
