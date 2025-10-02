"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";

interface GLBLoaderProps {
  modelPath: string;
  scale?: number;
  cameraPosition?: [number, number, number];
}

const Model: React.FC<{ path: string; scale?: number }> = ({ path, scale = 1 }) => {
  const gltf = useGLTF(path) as any;
  return <primitive object={gltf.scene} scale={scale} />;
};

const GLBLoader: React.FC<GLBLoaderProps> = ({
  modelPath,
  scale = 1,
  cameraPosition = [0, 1, 3],
}) => {
  return (
    <Canvas camera={{ position: cameraPosition, fov: 50 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={<Html center>Loading...</Html>}>
        <Model path={modelPath} scale={scale} />
      </Suspense>
      <OrbitControls enablePan enableZoom={false} enableRotate />
    </Canvas>
  );
};

export default GLBLoader;
