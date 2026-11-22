// Shared types and API calls for the Atmospheric Analysis lab page.

// Base URL of the Atmosphere Flask service (set NEXT_PUBLIC_ATMOSPHERE_URL; inlined at build time)
const API = process.env.NEXT_PUBLIC_ATMOSPHERE_URL;

export type Molecule = { symbol: string; name: string };

export interface PlanetData {
  transit: {
    time: number[];
    brightness: number[];
    model_brightness: number[];
    labels: Array<{ x: number; y: number; text: string }>;
  };
  spectra: {
    wavelength_morning: number[];
    morning: number[];
    wavelength_evening: number[];
    evening: number[];
    wavelength: number[];
    labels: Array<Molecule & { x: number; y: number }>;
  };
  molecules: Molecule[];
  molecules_raw: string;
  planet: string;
  success: boolean;
}

export type TypeMap = Record<string, string[]>;

// All planet types, plus which planets sit under each one
export async function fetchTypes(): Promise<{ types: string[]; type_planet_map: TypeMap }> {
  const res = await fetch(`${API}/api/types`);
  return res.json();
}

// Transit curve, spectra and molecules for a single planet
export async function fetchPlanet(name: string): Promise<PlanetData> {
  const res = await fetch(`${API}/api/data?planet=${encodeURIComponent(name)}`);
  return res.json();
}
