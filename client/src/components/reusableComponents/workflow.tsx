"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function Workflow() {
  const solutions = [
    {
      title: "AI/ML Classification",
      description:
        "Automated models analyze light curves and classify planets rapidly with high accuracy.",
    },
    {
      title: "Feature Extraction Pipeline",
      description:
        "Detrending, folding, and extraction of key features reduces noise and improves signal detection.",
    },
    {
      title: "Habitability & Ranking",
      description:
        "Integrated habitability scoring and follow-up prioritization streamline telescope planning.",
    },
    {
      title: "Interactive Visualizations",
      description:
        "3D simulations and dashboards make exploration intuitive for both researchers and students.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold sm:text-4xl">
          How We Solve It?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Exoplanetarium combines AI, automated pipelines, and immersive
          visualization tools to make exoplanet discovery faster, accurate, and engaging.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {solutions.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
