"use client";
// Microlensing method: interactive demo of how this technique finds planets.

import { useMemo, useState } from "react";
import { MethodShell, toPoints } from "../MethodShell";
import { lensMagnification } from "../physics";
import { H, W } from "./size";

export function MicrolensingMethod() {
  const [impact, setImpact] = useState(0.3); // Einstein radii
  const [planetMass, setPlanetMass] = useState(1);
  const [spikePos, setSpikePos] = useState(0.62);

  const peak = lensMagnification(impact);

  const curve = useMemo(() => {
    const n = 240;
    const spikeAmp = Math.min(3, 0.4 + planetMass * 0.5);
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const u = Math.hypot(impact, (t - 0.5) * 4);
      let a = lensMagnification(u);
      // Short, sharp perturbation from the planet.
      const d = Math.abs(t - spikePos);
      if (d < 0.02) a += spikeAmp * (1 - d / 0.02);
      return a;
    });
  }, [impact, planetMass, spikePos]);

  const maxA = Math.max(...curve);

  return (
    <MethodShell
      controls={[
        {
          id: "lens-impact",
          label: "Impact parameter",
          min: 0.05,
          max: 1.5,
          step: 0.01,
          value: impact,
          onChange: setImpact,
          format: (v) => `${v.toFixed(2)} θE`,
        },
        {
          id: "lens-mass",
          label: "Planet mass",
          min: 0.1,
          max: 5,
          step: 0.1,
          value: planetMass,
          onChange: setPlanetMass,
          format: (v) => `${v.toFixed(1)} M♃`,
        },
        {
          id: "lens-spike",
          label: "Planet position in event",
          min: 0.2,
          max: 0.85,
          step: 0.01,
          value: spikePos,
          onChange: setSpikePos,
          format: (v) => `${(v * 100).toFixed(0)}%`,
        },
      ]}
      readouts={[
        { label: "Peak magnification", value: `${peak.toFixed(2)}×`, emphasis: true },
        { label: "Curve maximum", value: `${maxA.toFixed(2)}×` },
        { label: "Planet spike", value: `+${(maxA - peak).toFixed(2)}×` },
        { label: "Repeatable", value: "No — one-off" },
      ]}
      warning={
        impact > 1.1
          ? "With the alignment this far off, the background star is barely magnified and the planet's brief spike is easy to miss entirely."
          : null
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
        aria-label="Microlensing magnification curve with a short planetary spike">
        {/* Alignment diagram */}
        <circle cx={45} cy={100} r={7} fill="#fbbf24" />
        <text x={45} y={124} fill="#94a3b8" fontSize={8} textAnchor="middle">
          source
        </text>
        <circle cx={130} cy={100} r={5} fill="#94a3b8" />
        <circle cx={130} cy={100} r={26} fill="none" stroke="#475569"
          strokeWidth={0.5} strokeDasharray="3 3" />
        <circle cx={130 + impact * 26} cy={100 - impact * 10} r={2.5} fill="#38bdf8" />
        <text x={130} y={146} fill="#94a3b8" fontSize={8} textAnchor="middle">
          lens + planet
        </text>

        <g transform="translate(200, 20)">
          <rect width={180} height={160} fill="none" stroke="#1e293b" />
          <text x={0} y={-6} fill="#94a3b8" fontSize={9}>
            Magnification
          </text>
          <polyline
            points={toPoints(curve, 180, 160, 1, Math.max(maxA * 1.1, 1.5))}
            fill="none"
            stroke="#fb923c"
            strokeWidth={1.5}
          />
        </g>
      </svg>
    </MethodShell>
  );
}
