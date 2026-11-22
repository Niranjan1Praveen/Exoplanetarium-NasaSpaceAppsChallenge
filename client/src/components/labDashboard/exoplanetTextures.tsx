"use client";
// Spinning 3D planet whose surface texture matches the selected planet type.

import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/utils/atmosphere";

type Props = {
  planetData: PlanetData | null;
  selectedPlanet: string;
  selectedType: string;
  availableTypes: string[];
};

const UHJ = ["/textures/uhjp/hjp.jpeg", "/textures/uhjp/uhjp1.jpg", "/textures/uhjp/uhjp2.jpeg"];
const WARM = ["/textures/wmjp/gg5.jpeg", "/textures/wmjp/wmjp1.webp"];

// Planet type -> candidate surface textures
const TEXTURES: Record<string, string[]> = {
  "Hot Jupiter": ["/textures/hotJupiter/gg4.jpeg", "/textures/hotJupiter/hotjp1.jpeg"],
  "Hot Sub-earth": ["/textures/se1.jpg", "/textures/se2.jpg", "/textures/se3.jpg"],
  Hot: ["/textures/jupiter/gg1.jpeg", "/textures/jupiter/jp1.jpg"],
  Jupiter: ["/textures/blue_gas_giant.png"],
  "Temperate Jupiter": ["/textures/tmjp/gg2.jpeg"],
  Temperate: ["/textures/temperate/rocky.jpg", "/textures/temperate/ceres.jpg", "/textures/temperate/eris.jpg", "/textures/temperate/haumea.jpg"],
  "UltraHot Jupiter": UHJ,
  UltraHot: UHJ,
  "Warm Jupiter": WARM,
  Warm: WARM,
};
const FALLBACK = "/textures/ceres.jpg";

// Older API responses wrapped names in quotes; strip them just in case
const clean = (s: string) => s.replace(/^"+|"+$/g, "").trim();

// Pick the same texture for the same planet every time (a stable hash, not Math.random)
function pickTexture(kind: string, planet: string, fallbackTypes: string[]) {
  const type = TEXTURES[clean(kind)] ? clean(kind) : fallbackTypes.map(clean).find((t) => TEXTURES[t]);
  const list = type ? TEXTURES[type] : [FALLBACK];
  const hash = [...planet].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0);
  return list[hash % list.length];
}

function Sphere({ url }: { url: string }) {
  const map = useLoader(THREE.TextureLoader, url);
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

export default function ExoplanetTextures({ selectedPlanet, selectedType, availableTypes }: Props) {
  const url = useMemo(
    () => pickTexture(selectedType, selectedPlanet, availableTypes),
    [selectedType, selectedPlanet, availableTypes]
  );

  // One Canvas for the component's lifetime: only the texture changes, so no extra WebGL contexts
  return (
    <div className="relative h-[300px] w-full sm:h-[350px] md:h-[300px]">
      <Canvas camera={{ position: [3, 3, 3], fov: 30 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Sphere url={url} />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
