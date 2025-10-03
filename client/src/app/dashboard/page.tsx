"use client";

import Link from "next/link";
import React from "react";
import GLBLoader from "@/components/reusableComponents/glbloader";
import { Particles } from "@/components/ui/particles";

interface ServiceOptionProps {
  title: string;
  description: string;
  modelPath: string; 
  href: string,
}

const ServiceOption: React.FC<ServiceOptionProps> = ({
  title,
  description,
  modelPath,
  href
}) => {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center rounded-2xl shadow-lg p-6 w-100 hover:scale-105 transition-transform duration-300">
        <div className="h-50 w-full mb-4">
          <GLBLoader
            modelPath={modelPath}
            scale={4.5}
            cameraPosition={[12, 0, 0]}
          />
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold mb-3">{title}</h2>
        <p className="text-xl text-center text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
};

const ExoplanetOptions: React.FC = () => {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4">
      <Particles
        className="absolute inset-0"
        quantity={200}
        size={0.1}
        ease={80}
        refresh
      />
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        <ServiceOption
          title="Exoplanet Lab"
          description="Dive deep into research and analysis. Explore light curves, stellar wobbles, and data-driven models that reveal hidden exoplanets."
          modelPath="/models/lab.glb"
          href="/lab"
        />
        <ServiceOption
          title="Exoplanet Play"
          description="A fun, interactive way to discover new worlds. Simulate planetary systems, play with orbital dynamics, and learn through exploration."
          modelPath="/models/exoplanet_play.glb"
          href="/play"
        />
      </div>
    </main>
  );
};

export default ExoplanetOptions;
