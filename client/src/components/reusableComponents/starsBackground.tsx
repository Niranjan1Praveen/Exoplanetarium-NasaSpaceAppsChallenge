"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarsBackground() {
  const starsRef = useRef<THREE.Points>(null);
  const clustersRef = useRef<THREE.Points>(null);

  // Create star field
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    // Create 5000 stars
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  // Create star clusters (nebulas/star clouds)
  const clustersGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const color = new THREE.Color();
    
    // Create 20 clusters
    for (let i = 0; i < 20; i++) {
      const clusterX = (Math.random() - 0.5) * 1500;
      const clusterY = (Math.random() - 0.5) * 1500;
      const clusterZ = (Math.random() - 0.5) * 1500;
      
      // Random cluster color (bluish, purplish, or whitish)
      const hue = Math.random() * 0.2 + (Math.random() > 0.5 ? 0.6 : 0.8); // Blue to purple range
      color.setHSL(hue, 0.7, 0.5 + Math.random() * 0.3);
      
      // Create 200-500 stars per cluster
      const clusterSize = 200 + Math.random() * 300;
      for (let j = 0; j < clusterSize; j++) {
        const radius = Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const x = clusterX + radius * Math.sin(phi) * Math.cos(theta);
        const y = clusterY + radius * Math.sin(phi) * Math.sin(theta);
        const z = clusterZ + radius * Math.cos(phi);
        
        vertices.push(x, y, z);
        colors.push(color.r, color.g, color.b);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);

  // Animate slight movement for parallax effect
  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.x = clock.getElapsedTime() * 0.0001;
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.00005;
    }
    
    if (clustersRef.current) {
      clustersRef.current.rotation.x = clock.getElapsedTime() * 0.00005;
      clustersRef.current.rotation.y = clock.getElapsedTime() * 0.0001;
    }
  });

  return (
    <group>
      {/* Background stars */}
      <points ref={starsRef} geometry={starsGeometry}>
        <pointsMaterial 
          size={1} 
          sizeAttenuation={true} 
          color={0xffffff} 
          transparent 
          opacity={0.8}
        />
      </points>
      
      {/* Star clusters */}
      <points ref={clustersRef} geometry={clustersGeometry}>
        <pointsMaterial 
          size={3} 
          sizeAttenuation={true} 
          vertexColors={true}
          transparent 
          opacity={0.7}
        />
      </points>
    </group>
  );
}