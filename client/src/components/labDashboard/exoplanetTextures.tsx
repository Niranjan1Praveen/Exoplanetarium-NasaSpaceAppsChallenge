"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const planetTypeTextures: Record<string, string[]> = {
  "Hot Jupiter": ["/textures/hotJupiter/gg4.jpeg", "/textures/hotJupiter/hotjp1.jpeg"],
  "Hot Sub-earth": ["/textures/se1.jpg", "/textures/se2.jpg", "/textures/se3.jpg"],
  "Hot": ["/textures/jupiter/gg1.jpeg", "/textures/jupiter/jp1.jpg"],
  "Jupiter": ["/textures/gg4.jpeg", "/textures/gg5.jpeg", "/textures/blue_gas_giant.png"],
  "Temperate Jupiter": ["/textures/tmjp/gg2.jpeg"],
  "Temperate": ["/textures/temperate/rocky.jpg"],
  "UltraHot Jupiter": ["/textures/uhjp/hjp.jpeg", "/textures/uhjp/uhjp1.jpg", "/textures/uhjp/uhjp2.jpeg"],
  "UltraHot": ["/textures/uhjp/hjp.jpeg", "/textures/uhjp/uhjp1.jpg", "/textures/uhjp/uhjp2.jpeg"],
  "Warm Jupiter": ["/textures/wmjp/gg5.jpeg", "/textures/wmjp/wmjp1.webp"],
  "Warm": ["/textures/wmjp/gg5.jpeg", "/textures/wmjp/wmjp1.webp"],
};

function getRandomTexture(type: string): string {
  const textures = planetTypeTextures[type];
  if (!textures || textures.length === 0) return "/textures/ceres.jpg";
  const randomIndex = Math.floor(Math.random() * textures.length);
  return textures[randomIndex];
}

interface SphereProps {
  textureUrl: string;
  planetName: string;
}

const Sphere: React.FC<SphereProps> = ({ textureUrl, planetName }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

interface ExoplanetTexturesProps {
  planetData: any; // PlanetData | null
  selectedPlanet: string;
  selectedType: string;
  availableTypes: string[];
}

const ExoplanetTextures: React.FC<ExoplanetTexturesProps> = ({ 
  planetData, 
  selectedPlanet, 
  selectedType,
  availableTypes 
}) => {
  const [currentTexture, setCurrentTexture] = useState<string>("");

  // Determine which texture to use based on current selections
  const textureUrl = useMemo(() => {
    if (selectedType && planetTypeTextures[selectedType]) {
      return getRandomTexture(selectedType);
    }
    
    // Fallback: use available types to pick a random texture
    if (availableTypes && availableTypes.length > 0) {
      const cleanTypes = availableTypes.map((type) => type.replaceAll('"', "").trim());
      const validType = cleanTypes.find(type => planetTypeTextures[type]);
      if (validType) {
        return getRandomTexture(validType);
      }
    }
    
    return "/textures/ceres.jpg"; // Ultimate fallback
  }, [selectedType, availableTypes]);

  // Update texture when dependencies change
  useEffect(() => {
    setCurrentTexture(textureUrl);
    console.log('🪐 ExoplanetTextures updated:', {
      planet: selectedPlanet,
      type: selectedType,
      texture: textureUrl
    });
  }, [textureUrl, selectedPlanet, selectedType]);

  // Generate a unique key to force re-render of Canvas
  const canvasKey = useMemo(() => 
    `${selectedPlanet}-${selectedType}-${planetData?.molecules?.length || 0}`,
    [selectedPlanet, selectedType, planetData]
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
        key={canvasKey} // Force re-render when key changes
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