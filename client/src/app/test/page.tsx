"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  scene: THREE.Group;
  cameras: THREE.Camera[];
  animations: THREE.AnimationClip[];
};

function Model() {
  const { scene, animations, cameras } = useGLTF(
    "/models/rocky.glb"
  ) as GLTFResult;
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const { set } = useThree();

  // Use Blender camera as the active one
  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const cam = cameras[0] as THREE.PerspectiveCamera; // cast for TS
      set({ camera: cam });
      cam.updateProjectionMatrix();
    }
  }, [cameras, set]);

  // Handle animations if they exist
  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixer.current!.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 0); 
        action.clampWhenFinished = true; 
        action.play();
      });
    }
  }, [animations, scene]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive object={scene} />;
}

export default function Page() {
  return (
    <Canvas style={{ height: "100vh" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Model />
    </Canvas>
  );
}
