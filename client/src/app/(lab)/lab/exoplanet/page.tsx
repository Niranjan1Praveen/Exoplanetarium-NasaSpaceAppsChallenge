"use client";
// 3D Exoplanet Viewer: pick a planet type and fly in to a spinning model of it.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { StarsBackground } from "@/components/reusableComponents/starsBackground";
import { PLANET_TYPES } from "@/utils/planetTypes";

const SIZE = 2.6; // every model is scaled so its widest side is this many units
const DROP = -0.35; // nudge planets down a little so they clear the title text

// Loads one model, centres it, scales it to a common size and spins it slowly
function Planet({ url, spin }: { url: string; spin: boolean }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  // Clone so switching back and forth never shares (or re-scales) the cached scene
  const model = useMemo(() => {
    const obj = scene.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    obj.position.sub(box.getCenter(new THREE.Vector3()));
    const wrap = new THREE.Group();
    wrap.add(obj);
    wrap.scale.setScalar(SIZE / Math.max(size.x, size.y, size.z, 1e-6));
    return wrap;
  }, [scene]);

  useFrame((_, dt) => {
    if (spin && ref.current) ref.current.rotation.y += dt * 0.1;
  });

  return <group ref={ref} position={[0, DROP, 0]}><primitive object={model} /></group>;
}

// One-time camera fly-in: pull back and narrow the field of view over ~3 seconds
function CameraIntro({ onDone }: { onDone: () => void }) {
  const { camera } = useThree();
  const t = useRef(0);
  const start = useRef(camera.position.clone());
  const done = useRef(false);

  useFrame((_, dt) => {
    if (done.current) return;
    t.current = Math.min(t.current + dt / 3, 1);
    const ease = 1 - Math.pow(1 - t.current, 3);
    camera.position.lerpVectors(start.current, new THREE.Vector3(0, 0, 10), ease);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 50 - 20 * ease;
      camera.updateProjectionMatrix();
    }
    if (t.current >= 1) {
      done.current = true;
      onDone();
    }
  });
  return null;
}

export default function ExoplanetViewer() {
  const [typeId, setTypeId] = useState(PLANET_TYPES[0].id);
  const [ready, setReady] = useState(false);
  const type = PLANET_TYPES.find((p) => p.id === typeId) ?? PLANET_TYPES[0];

  // Start fetching the other models in the background so switching feels instant
  useEffect(() => {
    PLANET_TYPES.forEach((p) => useGLTF.preload(p.model));
  }, []);

  return (
    // Fill the window below the site header and lab toolbar instead of overflowing it
    <div className="relative h-[calc(100vh-7.5rem)] min-h-[420px] overflow-hidden rounded-lg bg-black">
      <Canvas>
        <StarsBackground />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <CameraIntro onDone={() => setReady(true)} />
        <Suspense fallback={null}>
          <Planet key={type.model} url={type.model} spin={ready} />
        </Suspense>
      </Canvas>

      {/* Type picker floats over the scene */}
      <div className="absolute left-0 right-0 top-5 flex flex-col items-center gap-3 px-4 text-center text-white">
        <Select value={typeId} onValueChange={setTypeId}>
          <SelectTrigger className="w-64 bg-black/60 backdrop-blur" aria-label="Exoplanet type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLANET_TYPES.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {ready && (
          <>
            {/* key restarts the typing effect for each new type */}
            <TypingAnimation key={type.id} className="text-3xl font-extralight italic drop-shadow-lg">
              {type.name}
            </TypingAnimation>
            <p className="max-w-xl text-sm text-white/70">{type.blurb}</p>
          </>
        )}
      </div>
    </div>
  );
}
