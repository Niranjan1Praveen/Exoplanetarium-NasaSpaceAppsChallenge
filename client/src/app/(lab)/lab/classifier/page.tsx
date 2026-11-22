"use client";
// Exoplanet Classifier: set four transit measurements and get False Positive / Candidate / Confirmed.

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { barColor, DEFAULTS, FIELDS, runPrediction, type Inputs, type Result } from "@/utils/classifier";

export default function ClassifierPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Keep the slider and number box in sync for a field
  const set = (key: keyof Inputs, val: number) => setInputs((s) => ({ ...s, [key]: val }));

  const predict = async () => {
    setBusy(true);
    setError("");
    try {
      setResult(await runPrediction(inputs));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Exoplanet Classifier</h1>
        <p className="text-muted-foreground">Ensemble of LightGBM and XGBoost trained on Kepler, K2 and TESS detections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transit measurements</CardTitle>
          <CardDescription>Drag a slider or type a value, then predict</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-3">
              <Label htmlFor={f.key}>{f.name} ({f.unit})</Label>
              <Slider min={f.min} max={f.max} step={f.step} value={[inputs[f.key]]} onValueChange={([v]) => set(f.key, v)} />
              <Input id={f.key} type="number" min={f.min} max={f.max} step={f.step} value={inputs[f.key]}
                onChange={(e) => set(f.key, Number(e.target.value))} />
            </div>
          ))}
          <Button className="md:col-span-2" onClick={predict} disabled={busy}>
            {busy ? "Predicting..." : "Predict"}
          </Button>
          {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Predicted class: {result.label}</CardTitle>
            <CardDescription>
              {result.saved ? "Saved to your history." : `Not saved to history${result.saveError ? `: ${result.saveError}` : "."}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.probs).map(([name, p]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{name}</span><span>{p}%</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${barColor(p)} transition-all`} style={{ width: `${p}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
