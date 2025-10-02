"use client";

import Link from "next/link";
import React from "react";

interface ServiceOptionProps {
  title: string;
  description: string;
  imageAlt: string;
}

const ServiceOption: React.FC<ServiceOptionProps> = ({
  title,
  description,
  imageAlt,
}) => {
  return (
    <Link href={"/"}>
      <div className="flex flex-col items-center justify-center rounded-2xl shadow-lg p-6 w-72 h-80 hover:scale-105 transition-transform duration-300">
        {/* Placeholder for image */}
        <div className="h-32 w-32 bg-muted-foreground/20 rounded-full mb-4 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">[Image]</span>
        </div>

        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-center text-muted-foreground">
          {description}
        </p>
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
          imageAlt="Exoplanet Lab image"
        />
        <ServiceOption
          title="Exoplanet Play"
          description="A fun, interactive way to discover new worlds. Simulate planetary systems, play with orbital dynamics, and learn through exploration."
          imageAlt="Exoplanet Play image"
        />
      </div>
    </main>
  );
};

export default ExoplanetOptions;
