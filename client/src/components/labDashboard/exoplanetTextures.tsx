"use client";
import React, { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Randomized assignment of multiple textures to each exoplanet type
// The component will select a random texture from the list for the chosen type
const planetTypeTextures: Record<string, string[]> = {
  "Hot Jupiter": ["/textures/gg1.jpeg", "/textures/gg2.jpeg", "/textures/gg3.jpeg", "/textures/blue_gas_giant.jpeg"],
  "Hot Sub-earth": ["/textures/se1.jpg", "/textures/se2.jpg", "/textures/se3.jpg"],
  "Hot": ["/textures/tr1.jpg", "/textures/tr2.jpg", "/textures/tr3.jpg"],
  "Jupiter": ["/textures/gg4.jpeg", "/textures/gg5.jpeg", "/textures/blue_gas_giant.png"],
  "Temperate Jupiter": ["/textures/tr4.jpg", "/textures/tr5.jpg", "/textures/gg2.jpeg"],
  "Temperate": ["/textures/np1.jpeg", "/textures/np2.jpeg", "/textures/ceres.jpg"],
  "UltraHot Jupiter": ["/textures/gg1.jpeg", "/textures/gg3.jpeg", "/textures/sun.jpg"],
  "UltraHot": ["/textures/gg5.jpeg", "/textures/blue_gas_giant.jpeg", "/textures/tr1.jpg"],
  "Warm Jupiter": ["/textures/gg2.jpeg", "/textures/gg4.jpeg", "/textures/tr2.png"],
  "Warm": ["/textures/se4.jpg", "/textures/se5.jpg", "/textures/rocky jpg"],
};

function getRandomTexture(type: string): string {
  const textures = planetTypeTextures[type];
  if (!textures || textures.length === 0) return "/textures/ceres.jpg"; // fallback
  const randomIndex = Math.floor(Math.random() * textures.length);
  return textures[randomIndex];
}

interface SphereProps {
  textureUrl: string;
}

const Sphere: React.FC<SphereProps> = ({ textureUrl }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const ExoplanetTextures: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("Hot Jupiter");
  const [currentTexture, setCurrentTexture] = useState<string>(getRandomTexture("Hot Jupiter"));

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentTexture(getRandomTexture(type));
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Dropdown for exoplanet type selection */}
      <div className="p-4 bg-gray-900 text-white z-10">
        <label className="mr-2">Select Exoplanet Type:</label>
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="text-black p-1 rounded"
        >
          {Object.keys(planetTypeTextures).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 3D Scene */}
      <div className="flex-1">
        <Canvas camera={{ position: [3, 3, 3] }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          {/* Sphere with randomly selected texture */}
          <Sphere textureUrl={currentTexture} />

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
};

export default ExoplanetTextures;