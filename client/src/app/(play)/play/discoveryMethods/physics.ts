/**
 * Simplified but physically-grounded relations behind the interactive
 * discovery-method demos. Each function is the real scaling law with a
 * Sun-like host star assumed, so dragging a slider moves the numbers the
 * way it would move them in a real measurement.
 */

export const EARTH_RADII_PER_SOLAR = 109.2; // R_sun / R_earth
export const JUPITER_RADII_IN_EARTH = 11.2;

/** Orbital period from Kepler's third law, in years, for a 1 M_sun host. */
export function periodYears(semiMajorAxisAU: number): number {
  return Math.sqrt(semiMajorAxisAU ** 3);
}

export function periodDays(semiMajorAxisAU: number): number {
  return periodYears(semiMajorAxisAU) * 365.25;
}

/**
 * Transit depth: the fraction of starlight blocked is the ratio of areas.
 * Returned in parts per million.
 */
export function transitDepthPpm(planetRadiusEarth: number): number {
  const ratio = planetRadiusEarth / EARTH_RADII_PER_SOLAR;
  return ratio ** 2 * 1e6;
}

/**
 * Impact parameter: how far from the stellar centre the planet crosses,
 * in stellar radii. b >= 1 means no transit is seen at all.
 */
export function impactParameter(
  semiMajorAxisAU: number,
  inclinationDeg: number
): number {
  const AU_PER_SOLAR_RADIUS = 0.00465;
  const aInStellarRadii = semiMajorAxisAU / AU_PER_SOLAR_RADIUS;
  return Math.abs(aInStellarRadii * Math.cos((inclinationDeg * Math.PI) / 180));
}

/** Approximate transit duration in hours for a central crossing. */
export function transitDurationHours(
  semiMajorAxisAU: number,
  inclinationDeg: number
): number {
  const b = impactParameter(semiMajorAxisAU, inclinationDeg);
  if (b >= 1) return 0;
  const AU_PER_SOLAR_RADIUS = 0.00465;
  const aInStellarRadii = semiMajorAxisAU / AU_PER_SOLAR_RADIUS;
  const p = periodDays(semiMajorAxisAU);
  // T ~ (P/pi) * asin(sqrt(1-b^2)/a), converted to hours.
  const t = (p / Math.PI) * Math.asin(Math.sqrt(1 - b * b) / aInStellarRadii);
  return t * 24;
}

/**
 * Radial-velocity semi-amplitude in m/s. The 28.4 m/s constant is the
 * signal Jupiter induces on the Sun at 1 AU.
 */
export function radialVelocityAmplitude(
  planetMassJupiter: number,
  semiMajorAxisAU: number,
  inclinationDeg: number
): number {
  const sinI = Math.sin((inclinationDeg * Math.PI) / 180);
  return (28.4 * planetMassJupiter * sinI) / Math.sqrt(semiMajorAxisAU);
}

/**
 * Astrometric wobble of the host star, in microarcseconds.
 * The star orbits the barycentre at a radius scaled by the mass ratio.
 */
export function astrometricSignalMicroarcsec(
  planetMassJupiter: number,
  semiMajorAxisAU: number,
  distanceParsec: number
): number {
  const SOLAR_MASSES_PER_JUPITER = 1 / 1047.6;
  const massRatio = planetMassJupiter * SOLAR_MASSES_PER_JUPITER;
  const starOrbitAU = massRatio * semiMajorAxisAU;
  // arcsec = AU / parsec, then to microarcsec.
  return (starOrbitAU / distanceParsec) * 1e6;
}

/** Apparent star-planet separation on the sky, in arcseconds. */
export function angularSeparationArcsec(
  semiMajorAxisAU: number,
  distanceParsec: number
): number {
  return semiMajorAxisAU / distanceParsec;
}

/**
 * Point-lens magnification. u is the source-lens separation in Einstein
 * radii; A -> 1 when u is large, and diverges as u -> 0.
 */
export function lensMagnification(u: number): number {
  const safeU = Math.max(u, 1e-3);
  return (safeU * safeU + 2) / (safeU * Math.sqrt(safeU * safeU + 4));
}

export function formatNumber(value: number, unit: string): string {
  if (!Number.isFinite(value)) return `— ${unit}`;
  if (value === 0) return `0 ${unit}`;
  if (Math.abs(value) >= 1000) return `${Math.round(value).toLocaleString()} ${unit}`;
  if (Math.abs(value) >= 10) return `${value.toFixed(1)} ${unit}`;
  if (Math.abs(value) >= 1) return `${value.toFixed(2)} ${unit}`;
  return `${value.toFixed(3)} ${unit}`;
}
