"use client";
// Little building blocks shared by the transit and spectra charts.

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type TipItem = { value: number; color: string; name: string };
type TipProps = { active?: boolean; payload?: TipItem[]; label?: string | number };

// Hover box for the light curve: observed and model brightness
export function TransitTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
      <p className="font-medium">Time: {label}h</p>
      <p className="text-sm text-blue-400">Brightness: {payload[0].value.toFixed(4)}</p>
      {payload[1] && <p className="text-sm text-green-400">Model: {payload[1].value.toFixed(4)}</p>}
    </div>
  );
}

// Hover box for the spectra: one line per series, in its own colour
export function SpectraTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
      <p className="font-medium">Wavelength: {label}μm</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(4)}
        </p>
      ))}
    </div>
  );
}

// Molecule symbol with its full name underneath, drawn inside the SVG chart
export function MoleculeLabel({ x, y, name, symbol }: { x?: number; y?: number; name: string; symbol: string }) {
  if (!x || !y) return null;
  return (
    <g>
      <text x={x} y={y - 10} textAnchor="middle" className="text-xs fill-foreground font-medium">{symbol}</text>
      <text x={x} y={y} textAnchor="middle" className="text-[10px] fill-muted-foreground">{name}</text>
    </g>
  );
}

// Legend entries for the light curve
const LEGEND = [
  { label: "Observed", cls: "w-4 h-3 bg-blue-500 rounded-sm" },
  { label: "Model", cls: "w-4 h-0.5 bg-green-500 border border-green-500 border-dashed" },
  { label: "Blocked Starlight", cls: "w-4 h-3 bg-red-400/20 border border-red-400/30 border-dashed" },
  { label: "Normal Starlight", cls: "w-4 h-3 bg-green-400/20 border border-green-400/30 border-dashed" },
];

export function TransitLegend() {
  return (
    <div className="flex justify-center gap-6 mb-2 mt-4">
      {LEGEND.map((l) => (
        <div key={l.label} className="flex items-center gap-2">
          <div className={l.cls} />
          <span className="text-xs text-muted-foreground">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

// Floating "Download ..." button pinned to a card's corner
export function DownloadButton({ onClick, title, disabled = false }: { onClick: () => void; title: string; disabled?: boolean }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}
      className="absolute top-3 right-4 z-10 bg-background/80 backdrop-blur-sm">
      <Download className="w-4 h-4 mr-2" />
      Download {title}
    </Button>
  );
}

// Shared axis styling so both charts look alike
export const AXIS = "#9CA3AF";
export const axisLabel = (value: string, vertical = false) =>
  vertical
    ? { value, angle: -90, position: "insideLeft" as const, offset: 10, fill: AXIS }
    : { value, position: "insideBottom" as const, offset: -10, fill: AXIS };
