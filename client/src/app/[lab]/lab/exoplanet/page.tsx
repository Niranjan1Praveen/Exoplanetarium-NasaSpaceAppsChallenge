"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { StarsBackground } from "@/components/reusableComponents/starsBackground";

type GLTFResult = GLTF & {
  scene: THREE.Group;
  cameras: THREE.Camera[];
  animations: THREE.AnimationClip[];
};

function Model({
  onCameraAnimFinished,
  enableSpin,
}: {
  onCameraAnimFinished: () => void;
  enableSpin: boolean;
}) {
  const { scene } = useGLTF("/models/rocky.glb") as GLTFResult;
  const planetRef = useRef<THREE.Object3D | null>(null);
  const { camera } = useThree();
  const animationFinished = useRef(false);
  const animationProgress = useRef(0);
  const initialCameraPosition = useRef(new THREE.Vector3());
  const initialCameraRotation = useRef(new THREE.Euler());

  // Store initial camera position and rotation
  useEffect(() => {
    initialCameraPosition.current.copy(camera.position);
    initialCameraRotation.current.copy(camera.rotation);
  }, [camera]);

  // Handle camera animation
  useEffect(() => {
    if (!animationFinished.current) {
      // Start the camera animation after a brief delay
      const timer = setTimeout(() => {
        animationFinished.current = true;
        onCameraAnimFinished();
      }, 3000); // 3 second animation

      return () => clearTimeout(timer);
    }
  }, [onCameraAnimFinished]);

  // Update camera animation
  useFrame((_, delta) => {
    if (!animationFinished.current) {
      // Animate the camera moving back and scaling up
      animationProgress.current = Math.min(animationProgress.current + delta / 3, 1);
      
      // Smooth easing function
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const progress = easeOutCubic(animationProgress.current);
      
      // Move camera back to about 10 meters
      const targetPosition = new THREE.Vector3(0, 0, 10);
      camera.position.lerpVectors(initialCameraPosition.current, targetPosition, progress);
      
      // Scale the camera view (by adjusting FOV)
      if (camera instanceof THREE.PerspectiveCamera) {
        const initialFov = 50; // Default FOV
        const targetFov = 30; // Wider view to see more of the planet
        camera.fov = initialFov + (targetFov - initialFov) * progress;
        camera.updateProjectionMatrix();
      }
    }

    // Rotate the planet after animation completes
    if (enableSpin && planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }
  });

  // Find the planet mesh in the scene
  useEffect(() => {
    // Try common names for planets/meshes
    const planetNames = ["Sphere", "planet", "Planet", "mesh", "Mesh", "object"];
    for (const name of planetNames) {
      const planetNode = scene.getObjectByName(name);
      if (planetNode) {
        planetRef.current = planetNode;
        break;
      }
    }
    
    // If no named object found, try to find by geometry type
    if (!planetRef.current) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          planetRef.current = child;
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} />;
}

export default function Page() {
  const [showText, setShowText] = useState(false);
  const [enableSpin, setEnableSpin] = useState(false);

  return (
    <div style={{ position: "relative", height: "100vh", background: "black" }}>
      <Canvas>
        {/* Stars and space clusters in the background */}
        <StarsBackground />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Model
          onCameraAnimFinished={() => {
            setShowText(true);
            setEnableSpin(true);
          }}
          enableSpin={enableSpin}
        />
      </Canvas>

      {showText && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "white",
            fontSize: "2rem",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          <TypingAnimation className="italic font-extralight">Exoplanet Name</TypingAnimation>
        </div>
      )}
    </div>
  );
}