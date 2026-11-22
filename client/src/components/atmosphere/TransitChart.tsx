"use client";
// Light curve: how the star dims as the planet passes in front of it.

import { useRef } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { PlanetData } from "@/utils/atmosphere";
import { downloadNode } from "@/utils/download";
import { AXIS, axisLabel, DownloadButton, TransitLegend, TransitTip } from "./ChartParts";

export default function TransitChart({ data }: { data: PlanetData["transit"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const rows = data.time.map((time, i) => ({ time, brightness: data.brightness[i], model: data.model_brightness[i] }));

  // Bounds for the shaded "blocked" and "normal" bands
  const tMin = Math.min(...data.time), tMax = Math.max(...data.time);
  const bMin = Math.min(...data.brightness), bMax = Math.max(...data.brightness);

  return (
    <div className="relative" ref={ref}>
      <DownloadButton onClick={() => downloadNode(ref.current, "transit-chart")} title="Transit Chart" />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} stroke={AXIS}
            tickFormatter={(v: number) => v.toFixed(1)} label={axisLabel("Time (hours)")} />
          <YAxis stroke={AXIS} domain={[0.97, 1.01]} tickFormatter={(v) => v.toFixed(2)}
            label={axisLabel("Brightness", true)} />
          <Tooltip content={<TransitTip />} />
          <Legend content={<TransitLegend />} />

          <Line type="monotone" dataKey="brightness" stroke="#60A5FA" strokeWidth={2} dot={false} name="Observed" />
          <Line type="monotone" dataKey="model" stroke="#34D399" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Model" />

          {/* Red band below the dip = starlight blocked by the planet */}
          <ReferenceArea x1={tMin} x2={tMax} y1={0.97} y2={bMin - 0.002} fill="#EF4444" fillOpacity={0.1}
            stroke="#EF4444" strokeOpacity={0.3} strokeDasharray="3 3" />
          {/* Green band above = the star's normal brightness */}
          <ReferenceArea x1={tMin} x2={tMax} y1={bMax + 0.002} y2={1.01} fill="#10B981" fillOpacity={0.1}
            stroke="#10B981" strokeOpacity={0.3} strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
