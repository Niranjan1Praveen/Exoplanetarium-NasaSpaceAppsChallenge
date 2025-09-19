"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

function Model() {
  const { scene, animations } = useGLTF("/models/orbit.glb") as GLTFResult;
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixer.current!.clipAction(clip);
        action.play();
      });
    }
  }, [animations, scene]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive object={scene} scale={1} />;
}

export default function Page() {
  return (
    <Canvas
      style={{ height: "100vh" }}
      camera={{ position: [0, 2, 5], fov: 100 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Model />
      <OrbitControls />
    </Canvas>
  );
}
