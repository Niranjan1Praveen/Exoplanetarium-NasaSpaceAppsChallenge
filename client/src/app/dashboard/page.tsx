"use client";

import Link from "next/link";
import React from "react";
import GLBLoader from "@/components/reusableComponents/glbloader";

interface ServiceOptionProps {
  title: string;
  description: string;
  modelPath: string; // Path to the .glb file
}

const ServiceOption: React.FC<ServiceOptionProps> = ({
  title,
  description,
  modelPath,
}) => {
  return (
    <Link href={"/"}>
      <div className="flex flex-col items-center justify-center rounded-2xl shadow-lg p-6 w-72 h-80 hover:scale-105 transition-transform duration-300">
        {/* GLB Loader in a circle */}
        <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
          <GLBLoader modelPath={modelPath} scale={1} cameraPosition={[0, 1, 3]} />
        </div>

        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-center text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

const ExoplanetOptions: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        <ServiceOption
          title="Exoplanet Lab"
          description="Dive deep into research and analysis. Explore light curves, stellar wobbles, and data-driven models that reveal hidden exoplanets."
          modelPath="/models/exoplanet_lab.glb" // replace with your actual file path
        />
        <ServiceOption
          title="Exoplanet Play"
          description="A fun, interactive way to discover new worlds. Simulate planetary systems, play with orbital dynamics, and learn through exploration."
          modelPath="/models/exoplanet_play.glb" // replace with your actual file path
        />
      </div>
    </main>
  );
};

export default ExoplanetOptions;
