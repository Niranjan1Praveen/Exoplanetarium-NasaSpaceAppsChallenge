// Three short explainer cards about how atmospheres are studied.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INFO = [
  {
    title: "Transit Photometry",
    text: "Measures the dip in stellar brightness when a planet transits its host star. The depth and shape of the light curve reveal planetary radius and orbital parameters.",
    key: "Key Metrics:", note: "Transit depth, duration, ingress/egress timing",
  },
  {
    title: "Transmission Spectroscopy",
    text: "Analyzes wavelength-dependent absorption during transit. Atmospheric molecules create characteristic absorption features in the transmission spectrum.",
    key: "Terminator Analysis:", note: "Morning/evening atmospheric differences",
  },
  {
    title: "Molecular Signatures",
    text: "Identifies chemical species through their unique infrared absorption features. Different molecules absorb at specific wavelengths, creating spectral fingerprints.",
    key: "Common Biosignatures:", note: "N₂O, CO₂, CH₄, O₃",
  },
];

export default function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {INFO.map((c) => (
        <Card key={c.title}>
          <CardHeader>
            <CardTitle className="text-lg">{c.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{c.text}</p>
            <div className="text-xs text-muted-foreground">
              <strong>{c.key}</strong> {c.note}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
