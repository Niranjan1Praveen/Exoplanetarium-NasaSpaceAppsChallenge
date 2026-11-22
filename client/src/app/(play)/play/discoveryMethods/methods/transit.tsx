"use client";
// Transit method: interactive demo of how this technique finds planets.

import { useMemo, useState } from "react";
import { MethodShell, toPoints } from "../MethodShell";
import { formatNumber, impactParameter, periodDays, transitDepthPpm, transitDurationHours, EARTH_RADII_PER_SOLAR } from "../physics";
import { H, W } from "./size";

export function TransitMethod() {
  const [radius, setRadius] = useState(11); // Earth radii (~Jupiter)
  const [distance, setDistance] = useState(0.1); // AU
  const [inclination, setInclination] = useState(90); // degrees

  const depth = transitDepthPpm(radius);
  const b = impactParameter(distance, inclination);
  const duration = transitDurationHours(distance, inclination);
  const period = periodDays(distance);
  const transits = b < 1;

  // Light curve: flat, then a dip whose depth and width follow the physics.
  const curve = useMemo(() => {
    const n = 200;
    const depthFrac = depth / 1e6;
    // Wider orbit -> longer transit relative to the plotted window.
    const halfWidth = transits ? Math.max(0.04, Math.min(0.3, duration / 60)) : 0;
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const d = Math.abs(t - 0.5);
      if (!transits || d > halfWidth) return 1;
      // Soften the ingress/egress so the shape reads as a real transit.
      const edge = halfWidth * 0.25;
      const ramp = d > halfWidth - edge ? (halfWidth - d) / edge : 1;
      return 1 - depthFrac * ramp;
    });
  }, [depth, duration, transits]);

  const minY = 1 - Math.max(depth / 1e6, 1e-4) * 1.6;
  const planetPx = (radius / EARTH_RADII_PER_SOLAR) * 60;

  return (
    <MethodShell
      controls={[
        {
          id: "transit-radius",
          label: "Planet radius",
          min: 0.5,
          max: 20,
          step: 0.1,
          value: radius,
          onChange: setRadius,
          format: (v) => `${v.toFixed(1)} R⊕`,
        },
        {
          id: "transit-distance",
          label: "Orbital distance",
          min: 0.02,
          max: 1,
          step: 0.01,
          value: distance,
          onChange: setDistance,
          format: (v) => `${v.toFixed(2)} AU`,
        },
        {
          id: "transit-inclination",
          label: "Orbit inclination",
          min: 80,
          max: 90,
          step: 0.1,
          value: inclination,
          onChange: setInclination,
          format: (v) => `${v.toFixed(1)}°`,
        },
      ]}
      readouts={[
        { label: "Transit depth", value: formatNumber(depth, "ppm"), emphasis: true },
        { label: "Duration", value: transits ? formatNumber(duration, "h") : "—" },
        { label: "Period", value: formatNumber(period, "days") },
        { label: "Impact param.", value: b.toFixed(2) },
      ]}
      warning={
        !transits
          ? "At this inclination the planet passes above or below the stellar disc, so no transit is visible. Push the inclination closer to 90°."
          : null
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
        aria-label="Star with transiting planet and the resulting light curve">
        {/* Star and planet */}
        <circle cx={100} cy={55} r={38} fill="#fbbf24" opacity={0.95} />
        <circle cx={100} cy={55} r={44} fill="#fbbf24" opacity={0.15} />
        {transits && (
          <circle
            cx={100 + (b < 1 ? 14 : 0)}
            cy={55 + b * 38}
            r={Math.max(2, planetPx)}
            fill="#0f172a"
            stroke="#64748b"
            strokeWidth={0.5}
          />
        )}
        {!transits && (
          <circle cx={114} cy={55 - 46} r={Math.max(2, planetPx)} fill="#0f172a"
            stroke="#64748b" strokeWidth={0.5} />
        )}
        {/* Orbit path indicator */}
        <line x1={40} y1={55 + Math.min(b, 1.6) * 38} x2={200}
          y2={55 + Math.min(b, 1.6) * 38} stroke="#475569" strokeWidth={0.5}
          strokeDasharray="3 3" />

        {/* Light curve */}
        <g transform={`translate(210, 20)`}>
          <rect width={170} height={160} fill="none" stroke="#1e293b" />
          <text x={0} y={-6} fill="#94a3b8" fontSize={9}>
            Brightness
          </text>
          <polyline
            points={toPoints(curve, 170, 160, minY, 1.00002)}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1.5}
          />
        </g>
      </svg>
    </MethodShell>
  );
}
