// components/TTVAnimation.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';

// Planet data for the animation
const PLANET_DATA = {
  star: {
    radius: 2,
    color: '#ffaa00',
    temperature: 5800
  },
  planets: [
    {
      id: 1,
      radius: 0.3,
      distance: 5,
      color: '#4a86e8',
      period: 4,
      mass: 1.2,
      name: 'Kepler-1b'
    },
    {
      id: 2,
      radius: 0.4,
      distance: 8,
      color: '#e69138',
      period: 6,
      mass: 0.8,
      name: 'Kepler-1c'
    }
  ]
};

// Star component
const Star: React.FC = () => {
  const starRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (starRef.current) {
      // Gentle pulsation effect
      starRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      starRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      starRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={starRef}>
      <sphereGeometry args={[PLANET_DATA.star.radius, 32, 32]} />
      <meshBasicMaterial color={PLANET_DATA.star.color} />
    </mesh>
  );
};

// Planet component
interface PlanetProps {
  data: typeof PLANET_DATA.planets[0];
  time: number;
  showOrbit: boolean;
  showTransit: boolean;
}

const Planet: React.FC<PlanetProps> = ({ data, time, showOrbit, showTransit }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Line>(null);
  const transitRef = useRef<THREE.Mesh>(null);

  // Calculate planet position
  const angle = (time / data.period) * Math.PI * 2;
  const x = Math.cos(angle) * data.distance;
  const z = Math.sin(angle) * data.distance;

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.position.x = x;
      planetRef.current.position.z = z;
    }

    // Show transit effect when planet is in front of star
    if (transitRef.current && showTransit) {
      const isTransiting = Math.abs(x) < PLANET_DATA.star.radius + data.radius && z > 0;
      transitRef.current.visible = isTransiting;
      
      if (isTransiting) {
        transitRef.current.position.x = x;
        transitRef.current.position.z = 0.1;
      }
    }
  });

  // Create orbit path
  const orbitPoints = React.useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * data.distance,
        0,
        Math.sin(theta) * data.distance
      ));
    }
    return points;
  }, [data.distance]);

  return (
    <group>
      {/* Orbit path
      {showOrbit && (
        // <line ref={orbitRef}>
        //   <bufferGeometry>
        //     <bufferAttribute
        //       attach="attributes-position"
        //       count={orbitPoints.length}
        //       array={new Float32Array(orbitPoints.flatMap(v => [v.x, v.y, v.z]))}
        //       itemSize={3}
        //     />
        //   </bufferGeometry>
        //   <lineBasicMaterial color="#666666" transparent opacity={0.3} />
        // </line>
      )} */}
      
      {/* Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[data.radius, 16, 16]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Planet label */}
      <Text
        position={[x, data.radius + 0.5, z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.name}
      </Text>

      {/* Transit effect */}
      {showTransit && (
        <mesh ref={transitRef} visible={false}>
          <planeGeometry args={[data.radius * 2, 0.1]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

// Light curve display
const LightCurve: React.FC<{ transits: Array<{ time: number; planetId: number; depth: number }> }> = ({ transits }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      {/* X-axis */}
      <mesh position={[5, 0, 0]}>
        <boxGeometry args={[10, 0.02, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Y-axis */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Light curve baseline */}
      <mesh position={[5, 1, 0]}>
        <boxGeometry args={[10, 0.01, 0.01]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
      </mesh>

      {/* Transit dips */}
      {transits.map((transit, index) => (
        <mesh key={index} position={[transit.time * 2, 1 - transit.depth, 0]}>
          <boxGeometry args={[0.1, transit.depth, 0.02]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[10, -0.3, 0]} fontSize={0.2} color="white">
        Time
      </Text>
      <Text position={[-0.5, 2, 0]} fontSize={0.2} color="white" rotation={[0, 0, Math.PI / 2]}>
        Brightness
      </Text>
    </group>
  );
};

// Main TTV Scene component
const TTVScene: React.FC = () => {
  const [time, setTime] = useState(0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showTransits, setShowTransits] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [transitHistory, setTransitHistory] = useState<Array<{ time: number; planetId: number; depth: number }>>([]);

  useFrame((state) => {
    setTime(state.clock.elapsedTime * animationSpeed);
    
    // Record transits
    PLANET_DATA.planets.forEach(planet => {
      const angle = (time / planet.period) * Math.PI * 2;
      const x = Math.cos(angle) * planet.distance;
      
      // Check if planet is transiting
      if (Math.abs(x) < PLANET_DATA.star.radius + planet.radius * 0.5) {
        const transitTime = Math.floor(time * 10) / 10;
        const existingTransit = transitHistory.find(t => 
          Math.abs(t.time - transitTime) < 0.1 && t.planetId === planet.id
        );
        
        if (!existingTransit) {
          setTransitHistory(prev => [
            ...prev,
            {
              time: transitTime,
              planetId: planet.id,
              depth: planet.radius * 0.3
            }
          ].slice(-20)); // Keep only last 20 transits
        }
      }
    });
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} />
      
      <Star />
      
      {PLANET_DATA.planets.map(planet => (
        <Planet
          key={planet.id}
          data={planet}
          time={time}
          showOrbit={showOrbits}
          showTransit={showTransits}
        />
      ))}
      
      <LightCurve transits={transitHistory} />
    </group>
  );
};

// Controls component
const Controls: React.FC<{
  showOrbits: boolean;
  setShowOrbits: (value: boolean) => void;
  showTransits: boolean;
  setShowTransits: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}> = ({ showOrbits, setShowOrbits, showTransits, setShowTransits, animationSpeed, setAnimationSpeed }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg text-white max-w-md">
      <h3 className="text-lg font-bold mb-2">TTV Animation Controls</h3>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={(e) => setShowOrbits(e.target.checked)}
            className="rounded"
          />
          <span>Show Orbits</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showTransits}
            onChange={(e) => setShowTransits(e.target.checked)}
            className="rounded"
          />
          <span>Show Transits</span>
        </label>
        
        <div className="space-y-1">
          <label className="block text-sm">Animation Speed: {animationSpeed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-300">
        <p><strong>Transit Timing Variations (TTV)</strong> occur when multiple planets gravitationally interact, causing their transit times to vary from perfect periodicity.</p>
      </div>
    </div>
  );
};

// Main TTV Animation Component
const TTVAnimation: React.FC = () => {
  const [showOrbits, setShowOrbits] = useState(true);
  const [showTransits, setShowTransits] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 8, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000011']} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <TTVScene />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
        
        {/* Coordinate axes for reference */}
        <axesHelper args={[5]} />
      </Canvas>
      
      <Controls
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        showTransits={showTransits}
        setShowTransits={setShowTransits}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
      />
      
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 p-3 rounded-lg">
        <h4 className="font-bold">How TTV Works:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Planets periodically transit (pass in front of) their host star</li>
          <li>Gravitational interactions cause timing variations</li>
          <li>These variations reveal additional planets in the system</li>
          <li>Red dips in light curve show planetary transits</li>
        </ul>
      </div>
    </div>
  );
};

export default TTVAnimation;