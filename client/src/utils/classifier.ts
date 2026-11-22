// Slider setup and API call for the exoplanet classifier page.

export type Inputs = Record<"orbital_period" | "transit_depth" | "planet_radius" | "stellar_radius", number>;
export type Result = { label: string; probs: Record<string, number>; saved: boolean; saveError?: string };

// Same ranges as server/classifier/utils/config.py
export const FIELDS: Array<{ key: keyof Inputs; name: string; min: number; max: number; step: number; unit: string; def: number }> = [
  { key: "orbital_period", name: "Orbital Period", min: 0.5, max: 50, step: 0.01, unit: "days", def: 15 },
  { key: "transit_depth", name: "Transit Depth", min: 100, max: 10000, step: 1, unit: "ppm", def: 3269 },
  { key: "planet_radius", name: "Planet Radius", min: 0.5, max: 20, step: 0.01, unit: "R⊕", def: 6 },
  { key: "stellar_radius", name: "Stellar Radius", min: 0.5, max: 2, step: 0.01, unit: "R☉", def: 1.05 },
];

export const DEFAULTS = Object.fromEntries(FIELDS.map((f) => [f.key, f.def])) as Inputs;

// Our own /api/predict route runs the model and saves the result
export async function runPrediction(inputs: Inputs): Promise<Result> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Prediction failed");
  return data;
}

// Bar colour by confidence: green when sure, amber when unsure, red when unlikely
export const barColor = (p: number) => (p > 66 ? "bg-green-500" : p > 33 ? "bg-amber-500" : "bg-red-500");
