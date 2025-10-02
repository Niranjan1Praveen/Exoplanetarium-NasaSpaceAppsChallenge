"use client";

import {
  Rocket,
  Brain,
  LineChart,
  BarChart3,
  FileText,
  Globe,
  Layers,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "AI/ML Classifier",
    description: "Automated exoplanet detection using LightGBM + XGBoost ensemble models.",
    icon: Brain,
  },
  {
    title: "Light Curve Pipeline",
    description: "Detrending, folding, and feature extraction for large-scale datasets.",
    icon: LineChart,
  },
  {
    title: "Research Dashboard",
    description: "Visualize accuracy, error bars, and model interpretability in one place.",
    icon: BarChart3,
  },
  {
    title: "Downloadable Vetting Reports",
    description: "Generate telescope-ready reports with validation metrics.",
    icon: FileText,
  },
  {
    title: "Habitability Tools",
    description: "Rank planets by priority with climate zone classifiers and detectability scores.",
    icon: Globe,
  },
  {
    title: "Unsupervised Discovery",
    description: "Clustering and anomaly detection to uncover novel or rare exoplanets.",
    icon: Layers,
  },
  {
    title: "Feature Correlation Explorer",
    description: "Interactive heatmaps and scatterplots for scientific data insights.",
    icon: Zap,
  },
  {
    title: "Interactive Feature Tuning",
    description: "Adjust model inputs and hyperparameters with live feedback.",
    icon: Rocket,
  },
];

export default function Features() {
  return (
    <section className="flex items-center justify-center py-16 sm:px-6 lg:px-8">
      <div className="relative max-w-5xl px-4 border-l border-r py-2">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-start space-y-2"
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/40 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/20 bg-gradient-to-l from-background"></div>
      </div>
    </section>
  );
}
