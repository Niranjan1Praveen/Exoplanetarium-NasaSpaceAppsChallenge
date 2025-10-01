"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface ExoplanetModelProps {
  modelPath: string;
  fov?: number; 
  position?: [number, number, number];
  scale?: number; // scale prop
}

function Model({ modelPath, position = [0, 0, 0], scale = 2 }: ExoplanetModelProps) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  // Rotate planet slowly
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003; 
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      position={new THREE.Vector3(...position)}
      scale={scale} // ✅ apply scale from props
    />
  );
}

export default function ExoplanetModel({ modelPath, fov = 45, position, scale }: ExoplanetModelProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model modelPath={modelPath} position={position} scale={scale} />
      </Suspense>
      <OrbitControls enableZoom={false}/>
    </Canvas>
  );
}
