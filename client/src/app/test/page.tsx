"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

function Model({ activeActions, setAvailableActions }: { 
  activeActions: string[]; 
  setAvailableActions: (names: string[]) => void;
}) {
  const { scene, animations } = useGLTF("/models/earth-moon.glb") as GLTFResult;
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const actions = useRef<{ [key: string]: THREE.AnimationAction }>({});

  // Initialize mixer & actions
  useEffect(() => {
    if (animations.length > 0 && !mixer.current) {
      mixer.current = new THREE.AnimationMixer(scene);

      animations.forEach((clip) => {
        actions.current[clip.name] = mixer.current!.clipAction(clip);
      });

      // Pass available names to parent
      setAvailableActions(animations.map((a) => a.name));
      console.log("Animations available:", animations.map((a) => a.name));
    }
  }, [animations, scene, setAvailableActions]);

  // React when activeActions changes
  useEffect(() => {
    if (!mixer.current) return;

    Object.entries(actions.current).forEach(([name, action]) => {
      if (activeActions.includes(name)) {
        if (!action.isRunning()) {
          action.reset().play();
        }
        action.paused = false;
      } else {
        action.paused = true;
      }
    });
  }, [activeActions]);

  // Update mixer every frame
  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive object={scene} scale={1} />;
}

export default function Page() {
  const [activeActions, setActiveActions] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  const toggleAction = (name: string) => {
    setActiveActions((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  return (
    <>
      {/* 3D Scene */}
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{ position: [0, 2, 5], fov: 70 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Model activeActions={activeActions} setAvailableActions={setAvailableActions} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* UI Controls (same styling as before) */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 20,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {availableActions.map((name) => (
          <button key={name} onClick={() => toggleAction(name)}>
            {activeActions.includes(name) ? `Pause ${name}` : `Play ${name}`}
          </button>
        ))}
      </div>
    </>
  );
}
