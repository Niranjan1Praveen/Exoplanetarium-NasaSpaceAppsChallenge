"use client";

import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";

export interface ControlSpec {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
}

export interface ReadoutSpec {
  label: string;
  value: string;
  /** Highlights the headline number for the method. */
  emphasis?: boolean;
}

interface MethodShellProps {
  /** The SVG visualisation. Should be viewBox-based so it scales. */
  children: ReactNode;
  controls: ControlSpec[];
  readouts: ReadoutSpec[];
  /** Shown when the current settings produce no detectable signal. */
  warning?: string | null;
}

/**
 * Shared layout for every discovery-method demo: visualisation on top,
 * sliders and live readouts below. Stacks on mobile, side-by-side from lg.
 */
export function MethodShell({
  children,
  controls,
  readouts,
  warning,
}: MethodShellProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="min-w-0">
        <div className="overflow-hidden rounded-lg border bg-black/40">
          {children}
        </div>
        {warning && (
          <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            {warning}
          </p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="space-y-5">
          {controls.map((control) => (
            <div key={control.id}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <label
                  htmlFor={control.id}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {control.label}
                </label>
                <span className="text-sm font-semibold tabular-nums">
                  {control.format(control.value)}
                </span>
              </div>
              <Slider
                id={control.id}
                min={control.min}
                max={control.max}
                step={control.step}
                value={[control.value]}
                onValueChange={([v]) => control.onChange(v)}
                aria-label={control.label}
              />
            </div>
          ))}
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t pt-4">
          {readouts.map((readout) => (
            <div key={readout.label}>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {readout.label}
              </dt>
              <dd
                className={
                  readout.emphasis
                    ? "text-lg font-bold tabular-nums text-primary"
                    : "text-sm font-medium tabular-nums"
                }
              >
                {readout.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** Builds an SVG polyline `points` string from sampled values. */
export function toPoints(
  values: number[],
  width: number,
  height: number,
  min: number,
  max: number
): string {
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
