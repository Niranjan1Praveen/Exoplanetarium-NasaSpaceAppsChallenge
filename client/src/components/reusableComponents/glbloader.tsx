"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { AnimationMixer, type Group, LoopOnce, LoopRepeat } from "three";

interface GLBLoaderProps {
  modelPath: string;
  scale?: number;
  cameraPosition?: [number, number, number];
  autoPlay?: boolean;
  loop?: boolean;
  enableZoom?: boolean;
  minDistance?: number;
  maxDistance?: number;
  zoomSpeed?: number;
}

const AnimatedModel: React.FC<{ 
  path: string; 
  scale?: number; 
  autoPlay?: boolean; 
  loop?: boolean;
}> = ({ 
  path, 
  scale = 1, 
  autoPlay = true,
  loop = true 
}) => {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const gltf = useGLTF(path);

  useEffect(() => {
    if (gltf.animations.length > 0 && groupRef.current) {
      console.log(`🎬 Found ${gltf.animations.length} animations:`, 
        gltf.animations.map(anim => anim.name));
      
      // Create animation mixer
      mixerRef.current = new AnimationMixer(groupRef.current);
      
      // Play all animations
      gltf.animations.forEach((clip) => {
        const action = mixerRef.current!.clipAction(clip);
        // Use proper Three.js loop constants
        action.setLoop(loop ? LoopRepeat : LoopOnce, Infinity);
        if (autoPlay) {
          action.play();
          console.log(`▶️ Playing animation: ${clip.name}`);
        }
      });
    } else {
      console.log('❌ No animations found in model');
    }

    return () => {
      if (mixerRef.current) {
        // Use the correct method name: stopAllAction (singular)
        mixerRef.current.stopAllAction();
      }
    };
  }, [gltf.animations, autoPlay, loop]);

  // Update animation mixer every frame
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive ref={groupRef} object={gltf.scene} scale={scale} />;
};

const GLBLoader: React.FC<GLBLoaderProps> = ({
  modelPath,
  scale = 1,
  cameraPosition = [0, 1, 5], // Default to further back
  autoPlay = true,
  loop = true,
  enableZoom = true,
  minDistance = 1,
  maxDistance = 20,
  zoomSpeed = 1,
}) => {
  return (
    <Canvas 
      camera={{ 
        position: cameraPosition, 
        fov: 45, // Slightly wider field of view
        near: 0.1,
        far: 1000 
      }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={5} />
      <Suspense fallback={<Html center>Loading 3D Model...</Html>}>
        <AnimatedModel 
          path={modelPath} 
          scale={scale} 
          autoPlay={autoPlay}
          loop={loop}
        />
      </Suspense>
      <OrbitControls 
        enablePan={true}
        enableZoom={enableZoom}
        enableRotate={true}
        minDistance={minDistance}
        maxDistance={maxDistance}
        zoomSpeed={zoomSpeed}
      />
    </Canvas>
  );
};

export default GLBLoader;