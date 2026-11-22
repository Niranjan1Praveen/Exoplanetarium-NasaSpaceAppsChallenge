"use client";
// Radial Velocity method: interactive demo of how this technique finds planets.

import { useMemo, useState } from "react";
import { MethodShell, toPoints } from "../MethodShell";
import { formatNumber, periodDays, radialVelocityAmplitude } from "../physics";
import { H, W } from "./size";

export function RadialVelocityMethod() {
  const [mass, setMass] = useState(1); // Jupiter masses
  const [distance, setDistance] = useState(1); // AU
  const [inclination, setInclination] = useState(90);

  const k = radialVelocityAmplitude(mass, distance, inclination);
  const period = periodDays(distance);

  const curve = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) =>
        Math.sin((i / 199) * Math.PI * 4)
      ),
    []
  );

  // A rough floor for what current spectrographs can reach.
  const detectable = k >= 0.5;
  const wobble = Math.min(18, Math.max(1, k / 4));

  return (
    <MethodShell
      controls={[
        {
          id: "rv-mass",
          label: "Planet mass",
          min: 0.01,
          max: 10,
          step: 0.01,
          value: mass,
          onChange: setMass,
          format: (v) => `${v.toFixed(2)} M♃`,
        },
        {
          id: "rv-distance",
          label: "Orbital distance",
          min: 0.05,
          max: 5,
          step: 0.05,
          value: distance,
          onChange: setDistance,
          format: (v) => `${v.toFixed(2)} AU`,
        },
        {
          id: "rv-inclination",
          label: "Orbit inclination",
          min: 0,
          max: 90,
          step: 1,
          value: inclination,
          onChange: setInclination,
          format: (v) => `${v.toFixed(0)}°`,
        },
      ]}
      readouts={[
        { label: "Semi-amplitude K", value: formatNumber(k, "m/s"), emphasis: true },
        { label: "Period", value: formatNumber(period, "days") },
        { label: "Mass × sin i", value: formatNumber(mass * Math.sin((inclination * Math.PI) / 180), "M♃") },
        { label: "Detectable", value: detectable ? "Yes" : "Below limit" },
      ]}
      warning={
        !detectable
          ? "A signal under about 0.5 m/s is lost in stellar noise for most instruments. Try a heavier planet or a tighter orbit."
          : inclination < 15
          ? "Seen almost face-on, the star's motion is mostly across the sky rather than towards us, so the Doppler signal nearly vanishes."
          : null
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
        aria-label="Star wobbling around the barycentre and the resulting velocity curve">
        {/* Star wobbling around the barycentre */}
        <ellipse cx={100} cy={100} rx={wobble} ry={wobble * 0.35}
          fill="none" stroke="#475569" strokeWidth={0.5} strokeDasharray="3 3" />
        <circle cx={100 - wobble} cy={100} r={26} fill="#fbbf24" />
        <circle cx={100} cy={100} r={2} fill="#f87171" />
        <text x={100} y={148} fill="#94a3b8" fontSize={9} textAnchor="middle">
          barycentre
        </text>

        {/* Velocity curve, amplitude scaled by K */}
        <g transform="translate(210, 20)">
          <rect width={170} height={160} fill="none" stroke="#1e293b" />
          <line x1={0} y1={80} x2={170} y2={80} stroke="#334155" strokeWidth={0.5} />
          <text x={0} y={-6} fill="#94a3b8" fontSize={9}>
            Radial velocity
          </text>
          <polyline
            points={toPoints(
              curve.map((v) => v * Math.min(1, k / 60)),
              170,
              160,
              -1,
              1
            )}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={1.5}
          />
        </g>
      </svg>
    </MethodShell>
  );
}
