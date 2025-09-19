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

function Model({ currentAction }: { currentAction: string | null }) {
    const { scene, animations } = useGLTF("/models/earth-moon.glb") as GLTFResult;
    const mixer = useRef<THREE.AnimationMixer | null>(null);
    const actions = useRef<{ [key: string]: THREE.AnimationAction }>({});


    // Initialize mixer & actions
    useEffect(() => {
        if (animations.length > 0) {
            mixer.current = new THREE.AnimationMixer(scene);
            animations.forEach((clip) => {
                actions.current[clip.name] = mixer.current!.clipAction(clip);
            });
        }
    }, [animations, scene]);


    // Switch animations when currentAction changes
    useEffect(() => {
        if (!mixer.current || !currentAction) return;

        // Stop all actions
        Object.values(actions.current).forEach((a) => a.stop());

        // Play the selected one
        const action = actions.current[currentAction];
        if (action) {
            action.reset().play();
        }
    }, [currentAction]);

    // Update mixer every frame
    useFrame((_, delta) => {
        mixer.current?.update(delta);
    });


    return <primitive object={scene} scale={1} />;
}

export default function Page() {
    const [currentAction, setCurrentAction] = useState<string | null>(null);

    return (
        <>
            {/* 3D Scene */}
            <Canvas
                style={{ width: "100vw", height: "100vh" }}
                camera={{ position: [0, 2, 5], fov: 70 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Model currentAction={currentAction} />
                <OrbitControls enableZoom={false} />
            </Canvas>

            {/* UI Controls */}
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
                <button onClick={() => setCurrentAction("orbit")}>Play Orbit</button>
                <button onClick={() => setCurrentAction("rotation")}>Play Rotation</button>
                <button onClick={() => setCurrentAction(null)}>Stop</button>
            </div>
        </>
    );
}
