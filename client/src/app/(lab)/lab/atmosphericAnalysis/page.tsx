"use client";
// Atmospheric Analysis: pick a planet, see its light curve, spectra and molecules.

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import InfoCards from "@/components/atmosphere/InfoCards";
import PickerSelect from "@/components/atmosphere/PickerSelect";
import TransitChart from "@/components/atmosphere/TransitChart";
import SpectraChart from "@/components/atmosphere/SpectraChart";
import { DownloadButton } from "@/components/atmosphere/ChartParts";
import { fetchPlanet, fetchTypes, type PlanetData, type TypeMap } from "@/utils/atmosphere";
import { downloadText } from "@/utils/download";
import { saveRow, useSupabase } from "@/utils/supabase";

// Heavy 3D/canvas pieces load in the browser only
const ExoplanetTextures = dynamic(() => import("@/components/labDashboard/exoplanetTextures"), { ssr: false });
const Particles = dynamic(() => import("@/components/ui/particles").then((m) => m.Particles), { ssr: false });
const GLBLoader = dynamic(() => import("@/components/reusableComponents/glbloader"), { ssr: false });

// Placeholder shown before a planet is chosen
const Empty = ({ text }: { text: string }) => (
  <div className="h-64 flex items-center justify-center text-muted-foreground">{text}</div>
);

// Card wrapper so every dashboard panel shares the same header layout
function Panel({ title, desc, children, className = "" }: { title: string; desc: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`col-span-1 ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="bg-transparent">{children}</CardContent>
    </Card>
  );
}

export default function Page() {
  const [types, setTypes] = useState<string[]>([]);
  const [typeMap, setTypeMap] = useState<TypeMap>({});
  const [kind, setKind] = useState("");
  const [planet, setPlanet] = useState("");
  const [data, setData] = useState<PlanetData | null>(null);
  const [loading, setLoading] = useState(false);
  const db = useSupabase();

  const planets = typeMap[kind] ?? [];

  // Load the type list once
  useEffect(() => {
    fetchTypes()
      .then((d) => { setTypes(d.types); setTypeMap(d.type_planet_map); })
      .catch((e) => console.error("Error fetching types:", e));
  }, []);

  // Changing the type resets the planet choice
  useEffect(() => { setPlanet(""); setData(null); }, [kind, typeMap]);

  // Fetch data whenever a planet is picked
  useEffect(() => {
    if (!planet) return;
    setLoading(true);
    fetchPlanet(planet)
      .then((d) => {
        setData(d);
        saveRow(db, "planet_views", { planet, kind }); // remember what the user explored
      })
      .catch((e) => console.error("Error fetching planet data:", e))
      .finally(() => setLoading(false));
    // Only a new planet should refetch; a refreshed db client or type alone shouldn't log another view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planet]);

  // Save detected molecules as a small text report
  const saveMolecules = () => {
    if (!data) return;
    const list = data.molecules.map((m) => `${m.name} (${m.symbol})`).join("\n");
    downloadText(`Detected Molecules for ${data.planet}\n\n${list}\n\nGenerated on: ${new Date().toLocaleString()}`,
      `molecules-${data.planet}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exoplanet Atmospheres</h1>
        <p className="text-muted-foreground">Interactive Transit Light Curve & Transmission Spectra</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <PickerSelect id="type-select" label="Type of Exoplanet" value={kind} options={types}
          onChange={setKind} placeholder="Select type..." />
        <PickerSelect id="planet-select" label="Classified Exoplanet" value={planet} options={planets}
          onChange={setPlanet} placeholder="Select planet..." disabled={!kind || planets.length === 0} />
      </div>

      <InfoCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Transit Light Curve" desc="Observed brightness vs model prediction during planetary transit">
          {/* Once a planet is shown, keep the 3D model mounted while the next one loads */}
          {loading && !data ? <Skeleton className="h-64 w-full" /> : data ? (
            <div className="space-y-4">
              <div className="w-full h-64 overflow-hidden rounded-lg border border-border bg-black">
                <GLBLoader modelPath="/models/transitLightCurve.glb" cameraPosition={[0, 0, 2]} scale={0.8} autoPlay loop />
              </div>
              <div className="h-64"><TransitChart data={data.transit} /></div>
            </div>
          ) : <Empty text="Select a planet to view transit data" />}
        </Panel>

        <Card className="col-span-1 relative">
          <Particles className="absolute inset-0" quantity={100} size={0.1} ease={80} refresh />
          <CardHeader>
            <CardTitle>3D Visualization</CardTitle>
            <CardDescription>Atmospheric rendering based on spectral data and molecular composition</CardDescription>
          </CardHeader>
          <CardContent className="bg-transparent">
            {/* Stays mounted: recreating the 3D canvas each time leaks WebGL contexts until the browser drops them */}
            <ExoplanetTextures planetData={data} selectedPlanet={planet} selectedType={kind} availableTypes={types} />

          </CardContent>
        </Card>

        <Panel title="Detected Molecules" desc="Chemical compounds identified in the atmosphere" className="relative">
          {data && <DownloadButton onClick={saveMolecules} title="Molecules List" disabled={!data.molecules.length} />}
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-3/4" /></div>
          ) : data ? (
            <div className="flex flex-wrap gap-2">
              {data.molecules.length ? data.molecules.map((m) => (
                <Badge key={m.symbol} variant="secondary" className="text-sm p-3">{m.name} ({m.symbol})</Badge>
              )) : <p className="text-muted-foreground">No molecules detected</p>}
            </div>
          ) : <p className="text-muted-foreground">Select a planet to view molecules</p>}
        </Panel>

        <Panel title="Transmission Spectra: Morning vs Evening"
          desc="Atmospheric transmission differences between morning and evening terminators">
          {loading ? <Skeleton className="h-64 w-full" /> : data ? <SpectraChart data={data.spectra} />
            : <Empty text="Select a planet to view spectra data" />}
        </Panel>
      </div>
    </div>
  );
}
