"use client";

import { useMemo, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import GLBLoaderTimeline from "@/components/reusableComponents/glbloadertimeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ChangelogData {
  title: string;
  date: string;
  tags?: string[];
  body: string;
  modelPath?: string;
}

interface ChangelogPage {
  url: string;
  data: ChangelogData;
}

const changelogs: ChangelogPage[] = [
  {
    url: "/ariel",
    data: {
      title: "Ariel",
      date: "2029-01-01",
      body: "Performing a chemical census of a large and diverse sample of exoplanets by analysing their atmospheres.",
      modelPath: "/models/ariel.glb",
    },
  },
  {
    url: "/plato",
    data: {
      title: "Plato",
      date: "2026-01-01",
      body: "Studying terrestrial planets in orbits up to the habitable zone of Sun-like stars, and characterising these stars.",
      modelPath: "/models/plato.glb",
    },
  },
  {
    url: "/cheops",
    data: {
      title: "Cheops",
      date: "2019-01-01",
      body: "First step characterisation of known Earth-to-Neptune size exoplanets.",
      modelPath: "/models/cheops.glb",
    },
  },
  {
    url: "/tess",
    data: {
      title: "Tess",
      date: "2018-01-01",
      body: "First all-sky transit survey satellite.",
      modelPath: "/models/tess.glb",
    },
  },
  {
    url: "/kepler-k2",
    data: {
      title: "Kepler/K2",
      date: "2013-01-01",
      body: "A targeted search for terrestrial and larger planets in or near the habitable zone of a wide variety of stars.",
      modelPath: "/models/kepler.glb",
    },
  },
  {
    url: "/corot",
    data: {
      title: "Corot",
      date: "2006-01-01",
      body: "Pioneering stellar seismology and exoplanet hunting mission.",
      modelPath: "/models/corot.glb",
    },
  },
  {
    url: "/spitzer",
    data: {
      title: "Spitzer",
      date: "2003-01-01",
      body: "Studying exoplanet signatures in infrared light.",
      modelPath: "/models/spitzer.glb",
    },
  },
  {
    url: "/hubble",
    data: {
      title: "Hubble",
      date: "1990-01-01",
      body: "Probing the composition of exoplanet atmospheres.",
      modelPath: "/models/hubble.glb",
    },
  },
];

export default function HomePage() {
  const sortedChangelogs = useMemo(() => {
    return changelogs.sort(
      (a, b) =>
        new Date(a.data.date).getTime() - new Date(b.data.date).getTime()
    );
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedTelescope, setSelectedTelescope] =
    useState<ChangelogData | null>(null);

  const handleOpen = (telescope: ChangelogData) => {
    setSelectedTelescope(telescope);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Exoplanet Exploration Timeline
          </h1>
          <AnimatedThemeToggler />
        </div>

      {/* Vertical Timeline */}
      <div className="max-w-5xl mx-auto px-4 py-16 relative">
        {/* Center timeline line with gradient */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-[2px] h-full">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>

        <div className="flex flex-col items-center space-y-20">
          {sortedChangelogs.map((changelog, index) => {
            const { title, date, modelPath } = changelog.data;
            const year = new Date(date).getFullYear();
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={changelog.url}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: "easeOut",
                }}
                className={`relative flex w-full items-center ${
                  isLeft ? "justify-start" : "justify-end"
                }`}
              >
                {/* Side content */}
                <div
                  className={`w-1/2 flex flex-col items-center text-center ${
                    isLeft ? "pr-10" : "pl-10"
                  }`}
                >
                  {/* Telescope model with hover effect */}
                  <div className="w-[220px] h-[220px] mx-auto relative group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <GLBLoaderTimeline
                        modelPath={modelPath!}
                        key={changelog.url}
                      />
                    </div>
                  </div>

                  {/* Telescope name as a button */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="link"
                      className="text-lg font-semibold mt-4 hover:text-primary transition-colors relative group"
                      onClick={() => handleOpen(changelog.data)}
                    >
                      {title}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300" />
                    </Button>
                  </motion.div>
                </div>

                {/* Year marker circle with connecting line */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                >
                  {/* Connecting line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: isLeft ? "100px" : "100px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`absolute top-1/2 h-[2px] bg-border/50 ${
                      isLeft ? "right-full" : "left-full"
                    }`}
                  />

                  {/* Year circle */}
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xs text-background font-semibold shadow-lg relative z-10 cursor-default"
                    >
                      {year}
                    </motion.div>
                    {/* Pulsing ring effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Popup Dialog for telescope details */}
      {selectedTelescope && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-center">
                {selectedTelescope.title}
              </DialogTitle>
              <DialogDescription className="text-center">
                Year: {new Date(selectedTelescope.date).getFullYear()}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-col items-center">
              <div className="w-[400px] h-[400px]">
                <GLBLoaderTimeline
                  modelPath={selectedTelescope.modelPath!}
                  key={selectedTelescope.title}
                />
              </div>

              <p className="mt-6 text-center text-muted-foreground text-sm leading-relaxed">
                {selectedTelescope.body}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
