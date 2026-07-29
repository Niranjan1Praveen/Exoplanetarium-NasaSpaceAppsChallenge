"use client";

import { useMemo, useState } from "react";
import { MethodShell, toPoints } from "./MethodShell";
import {
  angularSeparationArcsec,
  astrometricSignalMicroarcsec,
  formatNumber,
  impactParameter,
  lensMagnification,
  periodDays,
  radialVelocityAmplitude,
  transitDepthPpm,
  transitDurationHours,
  EARTH_RADII_PER_SOLAR,
} from "./physics";

const W = 400;
const H = 200;

/* ------------------------------------------------------------------ */
/* Transit                                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Radial velocity                                                     */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Astrometry                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Microlensing                                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Direct imaging                                                      */
/* ------------------------------------------------------------------ */

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
