"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Text,
  Legend,
  ReferenceArea,
} from "recharts";
import ExoplanetTextures from "@/components/labDashboard/exoplanetTextures";
import { Particles } from "@/components/ui/particles";

// Types
interface PlanetData {
  transit: {
    time: number[];
    brightness: number[];
    model_brightness: number[];
    labels: Array<{ x: number; y: number; text: string }>;
  };
  spectra: {
    wavelength_morning: number[];
    morning: number[];
    wavelength_evening: number[];
    evening: number[];
    wavelength: number[];
    labels: Array<{ name: string; symbol: string; x: number; y: number }>;
  };
  molecules: Array<{ symbol: string; name: string }>;
  molecules_raw: string;
  planet: string;
  success: boolean;
}

interface TypePlanetMap {
  [key: string]: string[];
}

// Custom tooltip for transit chart
const TransitTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-medium">Time: {label}h</p>
        <p className="text-sm text-blue-400">
          Brightness: {payload[0].value.toFixed(4)}
        </p>
        <p className="text-sm text-green-400">
          Model: {payload[1].value.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for spectra chart
const SpectraTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-medium">Wavelength: {label}μm</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(4)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label for molecule annotations
const MoleculeLabel = (props: any) => {
  const { x, y, name, symbol } = props;
  if (!x || !y) return null;

  return (
    <g>
      <text
        x={x}
        y={y - 10}
        textAnchor="middle"
        className="text-xs fill-foreground font-medium"
      >
        {symbol}
      </text>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        className="text-[10px] fill-muted-foreground"
      >
        {name}
      </text>
    </g>
  );
};

// Transit Chart Component
// Custom Legend Component for Transit Chart
const TransitLegend = () => {
  return (
    <div className="flex justify-center gap-6 mb-2 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 bg-blue-500 rounded-sm" />
        <span className="text-xs text-muted-foreground">Observed</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 bg-green-500 border border-green-500 border-dashed" />
        <span className="text-xs text-muted-foreground">Model</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 bg-red-400/20 border border-red-400/30 border-dashed" />
        <span className="text-xs text-muted-foreground">Blocked Starlight</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-3 bg-green-400/20 border border-green-400/30 border-dashed" />
        <span className="text-xs text-muted-foreground">Normal Starlight</span>
      </div>
    </div>
  );
};

const TransitChart = ({ data }: { data: PlanetData["transit"] }) => {
  const chartData = data.time.map((time, index) => ({
    time,
    brightness: data.brightness[index],
    model: data.model_brightness[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="#9CA3AF"
          label={{
            value: "Time (hours)",
            position: "insideBottom",
            offset: -10,
            fill: "#9CA3AF",
          }}
        />
        <YAxis
          stroke="#9CA3AF"
          domain={[0.97, 1.01]}
          tickFormatter={(value) => value.toFixed(2)}
          label={{
            value: "Brightness",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            fill: "#9CA3AF",
          }}
        />
        <Tooltip
          content={<TransitTooltip />}
          formatter={(value: number) => value.toFixed(4)}
        />

        {/* Custom Legend */}
        <Legend content={<TransitLegend />} />

        {/* Data Lines */}
        <Line
          type="monotone"
          dataKey="brightness"
          stroke="#60A5FA"
          strokeWidth={2}
          dot={false}
          name="Observed"
        />
        <Line
          type="monotone"
          dataKey="model"
          stroke="#34D399"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Model"
        />

        {/* Area highlighting for blocked starlight */}
        <ReferenceArea
          x1={Math.min(...data.time)}
          x2={Math.max(...data.time)}
          y1={0.97}
          y2={Math.min(...data.brightness) - 0.002}
          fill="#EF4444"
          fillOpacity={0.1}
          stroke="#EF4444"
          strokeOpacity={0.3}
          strokeDasharray="3 3"
        />

        {/* Area highlighting for normal starlight */}
        <ReferenceArea
          x1={Math.min(...data.time)}
          x2={Math.max(...data.time)}
          y1={Math.max(...data.brightness) + 0.002}
          y2={1.01}
          fill="#10B981"
          fillOpacity={0.1}
          stroke="#10B981"
          strokeOpacity={0.3}
          strokeDasharray="3 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Spectra Chart Component - Fixed version
const SpectraChart = ({ data }: { data: PlanetData["spectra"] }) => {
  // Create properly aligned data for both series
  const chartData = data.wavelength.map((wavelength, index) => ({
    wavelength,
    morning: data.morning[index] || null,
    evening: data.evening[index] || null,
  }));

  // Filter out any null values to ensure clean data
  const filteredData = chartData.filter(
    (point) => point.morning !== null && point.evening !== null
  );

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="wavelength"
          stroke="#9CA3AF"
          label={{
            value: "Wavelength (μm)",
            position: "insideBottom",
            offset: -10,
            fill: "#9CA3AF",
          }}
        />
        <YAxis
          stroke="#9CA3AF"
          label={{
            value: "Transmission",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            fill: "#9CA3AF",
          }}
        />
        <Tooltip content={<SpectraTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            fontSize: "12px",
            color: "#9CA3AF",
          }}
          iconType="plainline"
          iconSize={8}
        />

        {/* Morning data */}
        <Line
          type="monotone"
          dataKey="morning"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          name="Morning"
          legendType="plainline"
        />

        {/* Evening data */}
        <Line
          type="monotone"
          dataKey="evening"
          stroke="#8B5CF6"
          strokeWidth={2}
          dot={false}
          name="Evening"
          legendType="plainline"
        />

        {/* Molecule reference lines */}
        {data.labels.map((molecule, index) => (
          <ReferenceLine
            key={index}
            x={molecule.x}
            stroke="#EF4444"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        ))}

        {/* Molecule annotations */}
        {data.labels.map((molecule, index) => (
          <MoleculeLabel
            key={index}
            x={molecule.x}
            y={molecule.y}
            name={molecule.name}
            symbol={molecule.symbol}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default function Page() {
  const [types, setTypes] = useState<string[]>([]);
  const [planets, setPlanets] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedPlanet, setSelectedPlanet] = useState<string>("");
  const [planetData, setPlanetData] = useState<PlanetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [typePlanetMap, setTypePlanetMap] = useState<TypePlanetMap>({});

  // Fetch initial types and mapping
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/types");
        const data = await response.json();
        setTypes(data.types);
        console.log(data.types);

        setTypePlanetMap(data.type_planet_map);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };

    fetchTypes();
  }, []);

  // Update planets when type changes
  useEffect(() => {
    if (selectedType && typePlanetMap[selectedType]) {
      setPlanets(typePlanetMap[selectedType]);
      setSelectedPlanet("");
      setPlanetData(null);
    } else {
      setPlanets([]);
      setSelectedPlanet("");
      setPlanetData(null);
    }
  }, [selectedType, typePlanetMap]);

  // Fetch planet data when planet is selected
  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!selectedPlanet) return;

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/data?planet=${encodeURIComponent(
            selectedPlanet
          )}`
        );
        const data = await response.json();
        console.log(data);
        setPlanetData(data);
      } catch (error) {
        console.error("Error fetching planet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetData();
  }, [selectedPlanet]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Exoplanet Atmospheres
        </h1>
        <p className="text-muted-foreground">
          Interactive Transit Light Curve & Transmission Spectra
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="type-select">Type of Exoplanet</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger id="type-select">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <Label htmlFor="planet-select">Classified Exoplanet</Label>
          <Select
            value={selectedPlanet}
            onValueChange={setSelectedPlanet}
            disabled={!selectedType || planets.length === 0}
          >
            <SelectTrigger id="planet-select">
              <SelectValue placeholder="Select planet..." />
            </SelectTrigger>
            <SelectContent>
              {planets.map((planet) => (
                <SelectItem key={planet} value={planet}>
                  {planet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Scientific Context Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Transit Methodology */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transit Photometry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Measures the dip in stellar brightness when a planet transits its
              host star. The depth and shape of the light curve reveal planetary
              radius and orbital parameters.
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Key Metrics:</strong> Transit depth, duration,
              ingress/egress timing
            </div>
          </CardContent>
        </Card>

        {/* Transmission Spectroscopy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transmission Spectroscopy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Analyzes wavelength-dependent absorption during transit.
              Atmospheric molecules create characteristic absorption features in
              the transmission spectrum.
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Terminator Analysis:</strong> Morning/evening atmospheric
              differences
            </div>
          </CardContent>
        </Card>

        {/* Molecular Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Molecular Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Identifies chemical species through their unique infrared
              absorption features. Different molecules absorb at specific
              wavelengths, creating spectral fingerprints.
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Common Biosignatures:</strong> N₂O, CO₂, CH₄, O₃
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transit Light Curve */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transit Light Curve</CardTitle>
            <CardDescription>
              Observed brightness vs model prediction during planetary transit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : planetData ? (
              <TransitChart data={planetData.transit} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Select a planet to view transit data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blank Card - Reserved for future use */}
        {/* 3D Visualization */}
        <Card className="col-span-1 relative">
          <Particles
            className="absolute inset-0"
            quantity={100}
            size={0.1}
            ease={80}
            refresh
          />
          <CardHeader>
            <CardTitle>3D Visualization</CardTitle>
            <CardDescription>
              Atmospheric rendering based on spectral data and molecular
              composition
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-transparent">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ExoplanetTextures
                planetData={planetData}
                selectedPlanet={selectedPlanet}
                selectedType={selectedType}
                availableTypes={types}
                key={`exoplanet-3d-${selectedPlanet}-${selectedType}`}
              />
            )}
          </CardContent>
        </Card>

        {/* Detected Molecules */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Detected Molecules</CardTitle>
            <CardDescription>
              Chemical compounds identified in the atmosphere
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : planetData ? (
              <div className="flex flex-wrap gap-2">
                {planetData.molecules.length > 0 ? (
                  planetData.molecules.map((molecule) => (
                    <Badge
                      key={molecule.symbol}
                      variant="secondary"
                      className="text-sm p-3"
                    >
                      {molecule.name} ({molecule.symbol})
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No molecules detected</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Select a planet to view molecules
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transmission Spectra */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transmission Spectra: Morning vs Evening</CardTitle>
            <CardDescription>
              Atmospheric transmission differences between morning and evening
              terminators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : planetData ? (
              <SpectraChart data={planetData.spectra} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Select a planet to view spectra data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
