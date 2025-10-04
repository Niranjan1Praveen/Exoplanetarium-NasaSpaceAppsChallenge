"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Define proper interfaces
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

interface ExoplanetTexturesProps {
  planetData: PlanetData | null;
  selectedPlanet: string;
  selectedType: string;
  availableTypes: string[];
}

interface SphereProps {
  textureUrl: string;
  planetName: string;
}

// Planet type textures mapping
const planetTypeTextures: Record<string, string[]> = {
  "Hot Jupiter": [
    "/textures/hotJupiter/gg4.jpeg",
    "/textures/hotJupiter/hotjp1.jpeg",
  ],
  "Hot Sub-earth": ["/textures/se1.jpg", "/textures/se2.jpg", "/textures/se3.jpg"],
  "Hot": ["/textures/jupiter/gg1.jpeg", "/textures/jupiter/jp1.jpg"],
  "Jupiter": ["/textures/blue_gas_giant.png"],
  "Temperate Jupiter": ["/textures/tmjp/gg2.jpeg"],
  "Temperate": ["/textures/temperate/rocky.jpg", "/textures/temperate/ceres.jpg", "/textures/temperate/eris.jpg", "/textures/temperate/haumea.jpg"],
  "UltraHot Jupiter": [
    "/textures/uhjp/hjp.jpeg", 
    "/textures/uhjp/uhjp1.jpg", 
    "/textures/uhjp/uhjp2.jpeg"
  ],
  "UltraHot": [
    "/textures/uhjp/hjp.jpeg", 
    "/textures/uhjp/uhjp1.jpg", 
    "/textures/uhjp/uhjp2.jpeg"
  ],
  "Warm Jupiter": ["/textures/wmjp/gg5.jpeg", "/textures/wmjp/wmjp1.webp"],
  "Warm": ["/textures/wmjp/gg5.jpeg", "/textures/wmjp/wmjp1.webp"],
};

// Helper function to get random texture
function getRandomTexture(type: string): string {
  const textures = planetTypeTextures[type];
  if (!textures || textures.length === 0) return "/textures/ceres.jpg";
  const randomIndex = Math.floor(Math.random() * textures.length);
  return textures[randomIndex];
}

// Helper function to clean the type string
function cleanTypeString(type: string): string {
  return type.replace(/^"+|"+$/g, '').trim();
}

// Sphere component with proper typing
const Sphere: React.FC<SphereProps> = ({ textureUrl, planetName }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const ExoplanetTextures: React.FC<ExoplanetTexturesProps> = ({ 
  planetData, 
  selectedPlanet, 
  selectedType,
  availableTypes 
}) => {
  const [currentTexture, setCurrentTexture] = useState<string>("");

  // Clean the selected type to remove extra quotes
  const cleanedSelectedType = useMemo(() => {
    return cleanTypeString(selectedType);
  }, [selectedType]);

  // Determine which texture to use based on current selections
  const textureUrl = useMemo(() => {
    console.log("🔍 Texture selection debug:", {
      rawSelectedType: selectedType,
      cleanedSelectedType: cleanedSelectedType,
      availableTypes: Object.keys(planetTypeTextures)
    });

    if (cleanedSelectedType && planetTypeTextures[cleanedSelectedType]) {
      const texture = getRandomTexture(cleanedSelectedType);
      console.log(`✅ Selected texture for ${cleanedSelectedType}:`, texture);
      return texture;
    }
    
    // Fallback: use available types to pick a random texture
    if (availableTypes && availableTypes.length > 0) {
      const cleanTypes = availableTypes.map(cleanTypeString);
      const validType = cleanTypes.find(type => planetTypeTextures[type]);
      if (validType) {
        const texture = getRandomTexture(validType);
        console.log(`🔄 Fallback texture from available types:`, texture);
        return texture;
      }
    }
    
    console.log("❌ No valid texture found, using fallback");
    return "/textures/ceres.jpg";
  }, [cleanedSelectedType, availableTypes, selectedType]);

  // Update texture when dependencies change
  useEffect(() => {
    setCurrentTexture(textureUrl);
    console.log('🪐 ExoplanetTextures updated:', {
      planet: selectedPlanet,
      rawType: selectedType,
      cleanedType: cleanedSelectedType,
      texture: textureUrl
    });
  }, [textureUrl, selectedPlanet, selectedType, cleanedSelectedType]);

  // Generate a unique key to force re-render of Canvas
  const canvasKey = useMemo(() => 
    `${selectedPlanet}-${cleanedSelectedType}-${planetData?.molecules?.length || 0}`,
    [selectedPlanet, cleanedSelectedType, planetData]
  );

  if (!currentTexture) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading exoplanet visualization...
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[300px] lg:h-[300px] relative">
      <Canvas 
        key={canvasKey}
        camera={{ position: [3, 3, 3], fov: 30 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Sphere 
          textureUrl={currentTexture} 
          planetName={selectedPlanet || "Unknown Planet"}
        />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default ExoplanetTextures;