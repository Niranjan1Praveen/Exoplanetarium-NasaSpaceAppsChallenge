"use client";
// Transmission spectra: morning vs evening side of the planet, with molecule markers.

import { useRef } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { PlanetData } from "@/utils/atmosphere";
import { downloadNode } from "@/utils/download";
import { AXIS, axisLabel, DownloadButton, MoleculeLabel, SpectraTip } from "./ChartParts";

export default function SpectraChart({ data }: { data: PlanetData["spectra"] }) {
  const ref = useRef<HTMLDivElement>(null);

  // Line the two series up by wavelength and drop points missing either side
  const rows = data.wavelength
    .map((wavelength, i) => ({ wavelength, morning: data.morning[i] || null, evening: data.evening[i] || null }))
    .filter((p) => p.morning !== null && p.evening !== null);
  const fileName = `spectra-chart-${data.labels[0]?.name || "exoplanet"}`;

  return (
    <div className="relative" ref={ref}>
      <DownloadButton onClick={() => downloadNode(ref.current, fileName)} title="Spectra Chart" />
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={rows} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="wavelength" type="number" domain={["dataMin", "dataMax"]} stroke={AXIS}
            tickFormatter={(v: number) => v.toFixed(1)} label={axisLabel("Wavelength (μm)")} />
          <YAxis stroke={AXIS} label={axisLabel("Transmission", true)} />
          <Tooltip content={<SpectraTip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px", color: AXIS }}
            iconType="plainline" iconSize={8} />

          <Line type="monotone" dataKey="morning" stroke="#F59E0B" strokeWidth={2} dot={false} name="Morning" legendType="plainline" />
          <Line type="monotone" dataKey="evening" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Evening" legendType="plainline" />

          {/* A dashed line and label at every detected molecule's wavelength */}
          {data.labels.map((m, i) => (
            <ReferenceLine key={`l${i}`} x={m.x} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
          ))}
          {data.labels.map((m, i) => (
            <MoleculeLabel key={`t${i}`} x={m.x} y={m.y} name={m.name} symbol={m.symbol} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
