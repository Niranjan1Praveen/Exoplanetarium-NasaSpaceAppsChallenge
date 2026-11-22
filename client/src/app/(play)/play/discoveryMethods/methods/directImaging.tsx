"use client";
// Direct Imaging method: interactive demo of how this technique finds planets.

import { useState } from "react";
import { MethodShell } from "../MethodShell";
import { angularSeparationArcsec, formatNumber } from "../physics";
import { H, W } from "./size";

export function DirectImagingMethod() {
  const [distance, setDistance] = useState(30); // AU
  const [starDistance, setStarDistance] = useState(15); // parsecs
  const [contrast, setContrast] = useState(7); // log10 star/planet flux

  const sep = angularSeparationArcsec(distance, starDistance);
  const innerWorkingAngle = 0.1; // arcsec, a typical coronagraph limit
  const contrastLimit = 9; // log10
  const resolved = sep >= innerWorkingAngle;
  const brightEnough = contrast <= contrastLimit;
  const detectable = resolved && brightEnough;

  const rPx = Math.min(85, (sep / 0.6) * 85);
  const planetOpacity = Math.max(0.08, 1 - (contrast - 4) / 6);

  return (
    <MethodShell
      controls={[
        {
          id: "img-distance",
          label: "Orbital distance",
          min: 1,
          max: 120,
          step: 1,
          value: distance,
          onChange: setDistance,
          format: (v) => `${v.toFixed(0)} AU`,
        },
        {
          id: "img-stardist",
          label: "Distance to star",
          min: 3,
          max: 100,
          step: 1,
          value: starDistance,
          onChange: setStarDistance,
          format: (v) => `${v.toFixed(0)} pc`,
        },
        {
          id: "img-contrast",
          label: "Star / planet contrast",
          min: 4,
          max: 11,
          step: 0.1,
          value: contrast,
          onChange: setContrast,
          format: (v) => `10^${v.toFixed(1)}`,
        },
      ]}
      readouts={[
        { label: "Separation", value: formatNumber(sep, "arcsec"), emphasis: true },
        { label: "Coronagraph limit", value: `${innerWorkingAngle} arcsec` },
        { label: "Resolved", value: resolved ? "Yes" : "No" },
        { label: "Detectable", value: detectable ? "Yes" : "No" },
      ]}
      warning={
        !resolved
          ? "The planet falls inside the coronagraph's inner working angle, so it is buried in the star's glare. Wider orbits or nearer stars separate the two."
          : !brightEnough
          ? "The planet is too faint relative to its star. Direct imaging favours young, hot, self-luminous giants."
          : null
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
        aria-label="Coronagraph view with a masked star and an orbiting planet">
        <defs>
          <radialGradient id="glare">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="#020617" />
        <circle cx={200} cy={100} r={70} fill="url(#glare)" />
        {/* Coronagraph mask */}
        <circle cx={200} cy={100} r={(innerWorkingAngle / 0.6) * 85}
          fill="#020617" stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
        <text x={200} y={100} fill="#475569" fontSize={8} textAnchor="middle"
          dominantBaseline="middle">
          masked
        </text>
        {/* Orbit and planet */}
        <circle cx={200} cy={100} r={rPx} fill="none" stroke="#1e293b" strokeWidth={0.75} />
        <circle
          cx={200 + rPx * 0.85}
          cy={100 - rPx * 0.5}
          r={4}
          fill="#38bdf8"
          opacity={planetOpacity}
        />
        <text x={10} y={16} fill="#94a3b8" fontSize={9}>
          Coronagraph view
        </text>
      </svg>
    </MethodShell>
  );
}
