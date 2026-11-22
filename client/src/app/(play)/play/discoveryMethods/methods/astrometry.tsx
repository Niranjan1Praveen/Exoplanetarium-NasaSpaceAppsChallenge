"use client";
// Astrometry method: interactive demo of how this technique finds planets.

import { useState } from "react";
import { MethodShell } from "../MethodShell";
import { astrometricSignalMicroarcsec, formatNumber, periodDays } from "../physics";
import { H, W } from "./size";

export function AstrometryMethod() {
  const [mass, setMass] = useState(5);
  const [distance, setDistance] = useState(2);
  const [starDistance, setStarDistance] = useState(10); // parsecs

  const signal = astrometricSignalMicroarcsec(mass, distance, starDistance);
  const period = periodDays(distance) / 365.25;
  const detectable = signal >= 10; // roughly Gaia-class precision

  const loopR = Math.min(60, Math.max(4, Math.log10(signal + 1) * 26));

  return (
    <MethodShell
      controls={[
        {
          id: "astro-mass",
          label: "Planet mass",
          min: 0.1,
          max: 15,
          step: 0.1,
          value: mass,
          onChange: setMass,
          format: (v) => `${v.toFixed(1)} M♃`,
        },
        {
          id: "astro-distance",
          label: "Orbital distance",
          min: 0.5,
          max: 10,
          step: 0.1,
          value: distance,
          onChange: setDistance,
          format: (v) => `${v.toFixed(1)} AU`,
        },
        {
          id: "astro-stardist",
          label: "Distance to star",
          min: 2,
          max: 100,
          step: 1,
          value: starDistance,
          onChange: setStarDistance,
          format: (v) => `${v.toFixed(0)} pc`,
        },
      ]}
      readouts={[
        { label: "Wobble", value: formatNumber(signal, "µas"), emphasis: true },
        { label: "Period", value: formatNumber(period, "yr") },
        { label: "Star offset", value: formatNumber((mass / 1047.6) * distance, "AU") },
        { label: "Detectable", value: detectable ? "Yes" : "Below limit" },
      ]}
      warning={
        !detectable
          ? "Below roughly 10 µas the wobble is smaller than current astrometric precision. Heavier planets, wider orbits and closer stars all help."
          : null
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
        aria-label="Path of a star on the sky, looping as an unseen planet tugs it">
        <text x={10} y={16} fill="#94a3b8" fontSize={9}>
          Star&apos;s path across the sky
        </text>
        {/* Proper motion straight line, with the orbital loop superimposed */}
        <path
          d={Array.from({ length: 240 }, (_, i) => {
            const t = i / 239;
            const x = 20 + t * 360;
            const y = 120 - t * 30 + Math.sin(t * Math.PI * 4) * loopR * 0.35;
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="#34d399"
          strokeWidth={1.5}
        />
        <line x1={20} y1={120} x2={380} y2={90} stroke="#334155"
          strokeWidth={0.75} strokeDasharray="4 4" />
        <text x={330} y={135} fill="#64748b" fontSize={8}>
          no planet
        </text>
      </svg>
    </MethodShell>
  );
}
