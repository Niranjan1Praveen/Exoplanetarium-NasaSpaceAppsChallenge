// components/DirectImagingAnimation.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';

// System data for direct imaging animation
const DIRECT_IMAGING_DATA = {
  star: {
    radius: 2,
    color: '#ff6b35',
    temperature: 5800,
    name: 'Host Star',
    glareRadius: 8
  },
  planets: [
    {
      id: 1,
      radius: 0.6,
      distance: 25,
      color: '#4ecdc4',
      period: 20,
      mass: 5.0,
      name: 'HR 8799 b',
      temperature: 900,
      discoveryYear: 2008,
      type: 'Gas Giant'
    },
    {
      id: 2,
      radius: 0.5,
      distance: 18,
      color: '#45b7d1',
      period: 15,
      mass: 7.0,
      name: 'HR 8799 c',
      temperature: 1100,
      discoveryYear: 2008,
      type: 'Gas Giant'
    },
    {
      id: 3,
      radius: 0.4,
      distance: 12,
      color: '#96ceb4',
      period: 10,
      mass: 7.0,
      name: 'HR 8799 d',
      temperature: 1300,
      discoveryYear: 2008,
      type: 'Gas Giant'
    }
  ]
};

// Coronagraph component to block starlight
const Coronagraph: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;

  return (
    <group>
      {/* Coronagraph mask */}
      <mesh position={[0, 0, -1]}>
        <circleGeometry args={[DIRECT_IMAGING_DATA.star.radius * 0.9, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Coronagraph support structure */}
      <mesh position={[0, 0, -1.5]} rotation={[0, 0, 0]}>
        <ringGeometry args={[DIRECT_IMAGING_DATA.star.radius * 0.9, DIRECT_IMAGING_DATA.star.radius * 1.1, 32]} />
        <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
      </mesh>

      <Text position={[0, -DIRECT_IMAGING_DATA.star.radius * 1.3, -1]} fontSize={0.4} color="#666666">
        Coronagraph
      </Text>
    </group>
  );
};

// Star component with glare and light effects
const Star: React.FC = () => {
  const starRef = useRef<THREE.Mesh>(null);
  const glareRef = useRef<THREE.Mesh>(null);
  const lightRaysRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (starRef.current) {
      // Gentle pulsation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1) * 0.03;
      starRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glareRef.current) {
      // Rotate glare effect
      glareRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }

    if (lightRaysRef.current) {
      // Rotate light rays
      lightRaysRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* Star glare effect */}
      <mesh ref={glareRef}>
        <sphereGeometry args={[DIRECT_IMAGING_DATA.star.glareRadius, 16, 16]} />
        <meshBasicMaterial 
          color={DIRECT_IMAGING_DATA.star.color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Light rays */}
      <group ref={lightRaysRef}>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} rotation={[0, 0, angle]}>
              <planeGeometry args={[0.5, DIRECT_IMAGING_DATA.star.glareRadius * 1.5]} />
              <meshBasicMaterial 
                color={DIRECT_IMAGING_DATA.star.color}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* Main star */}
      <mesh ref={starRef}>
        <sphereGeometry args={[DIRECT_IMAGING_DATA.star.radius, 32, 32]} />
        <meshBasicMaterial color={DIRECT_IMAGING_DATA.star.color} />
      </mesh>
      
      {/* Star label */}
      <Text
        position={[0, DIRECT_IMAGING_DATA.star.radius + 1.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {DIRECT_IMAGING_DATA.star.name}
      </Text>
    </group>
  );
};

// Planet component with atmospheric effects
interface PlanetProps {
  data: typeof DIRECT_IMAGING_DATA.planets[0];
  time: number;
  showOrbit: boolean;
  showAtmosphere: boolean;
  isImaged: boolean;
}

const Planet: React.FC<PlanetProps> = ({ data, time, showOrbit, showAtmosphere, isImaged }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const highlightRef = useRef<THREE.Mesh>(null);

  // Calculate planet position
  const angle = (time / data.period) * Math.PI * 2;
  const x = Math.cos(angle) * data.distance;
  const z = Math.sin(angle) * data.distance;

  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.position.x = x;
      planetRef.current.position.z = z;
      
      // Rotate planet
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }

    if (atmosphereRef.current && showAtmosphere) {
      atmosphereRef.current.position.x = x;
      atmosphereRef.current.position.z = z;
      atmosphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }

    if (glowRef.current && isImaged) {
      glowRef.current.position.x = x;
      glowRef.current.position.z = z;
      
      // Pulsing glow when detected
      const glowScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      glowRef.current.scale.set(glowScale, glowScale, glowScale);
    }

    if (highlightRef.current && isImaged) {
      highlightRef.current.position.x = x;
      highlightRef.current.position.z = z;
      highlightRef.current.rotation.y = state.clock.elapsedTime * 2;
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
      {/* Orbit path */}
      {showOrbit && (
        <line>
          <bufferGeometry>
            {/* <bufferAttribute
              attach="attributes-position"
              count={orbitPoints.length}
              array={new Float32Array(orbitPoints.flatMap(v => [v.x, v.y, v.z]))}
              itemSize={3}
            /> */}
          </bufferGeometry>
          <lineBasicMaterial color={data.color} transparent opacity={0.3} />
        </line>
      )}
      
      {/* Planet glow when detected */}
      {isImaged && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[data.radius * 2, 16, 16]} />
          <meshBasicMaterial 
            color={data.color}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Planet atmosphere */}
      {showAtmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[data.radius * 1.2, 16, 16]} />
          <meshBasicMaterial 
            color={data.color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Main planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[data.radius, 32, 32]} />
        <meshStandardMaterial 
          color={data.color}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Detection highlight */}
      {isImaged && (
        <mesh ref={highlightRef}>
          <ringGeometry args={[data.radius * 1.5, data.radius * 1.6, 32]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Planet info */}
      <Text
        position={[x, data.radius + 0.8, z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.name}
      </Text>

      {/* Planet details when imaged */}
      {isImaged && (
        <group position={[x, data.radius + 2, z]}>
          <Text fontSize={0.2} color="#aaaaaa" anchorX="center">
            {data.type}
          </Text>
          <Text position={[0, -0.3, 0]} fontSize={0.15} color="#888888" anchorX="center">
            {data.temperature}K • {data.discoveryYear}
          </Text>
        </group>
      )}
    </group>
  );
};

// Direct image display (what astronomers actually see)
const DirectImageView: React.FC<{ 
  detectedPlanets: number[];
  starBlocked: boolean;
}> = ({ detectedPlanets, starBlocked }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[15, 0, 0]}>
      {/* Image frame */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color="#111111" />
      </mesh>

      {/* Title */}
      <Text position={[0, 4.5, 0]} fontSize={0.5} color="white">
        Direct Image
      </Text>

      {/* Star position (blocked or visible) */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[starBlocked ? 0.5 : 1.5, 32]} />
        <meshBasicMaterial 
          color={starBlocked ? "#333333" : "#ff6b35"}
          transparent
          opacity={starBlocked ? 0.3 : 0.8}
        />
      </mesh>

      {/* Detected planets */}
      {DIRECT_IMAGING_DATA.planets.map((planet, index) => {
        if (!detectedPlanets.includes(planet.id)) return null;
        
        const angle = (index / DIRECT_IMAGING_DATA.planets.length) * Math.PI * 2;
        const radius = 2 + index * 0.5;
        const planetX = Math.cos(angle) * radius;
        const planetY = Math.sin(angle) * radius;

        return (
          <group key={planet.id}>
            {/* Planet dot */}
            <mesh position={[planetX, planetY, 0]}>
              <circleGeometry args={[0.3, 16]} />
              <meshBasicMaterial color={planet.color} />
            </mesh>

            {/* Planet label */}
            <Text 
              position={[planetX, planetY + 0.5, 0]} 
              fontSize={0.25} 
              color="white"
              anchorX="center"
            >
              {planet.name}
            </Text>

            {/* Connection line to star */}
            <mesh>
              <bufferGeometry>
                {/* <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    0, 0, 0,
                    planetX, planetY, 0
                  ])}
                  itemSize={3}
                /> */}
              </bufferGeometry>
              <lineBasicMaterial color="#666666" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Noise/artifacts */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          0
        ]}>
          <circleGeometry args={[Math.random() * 0.1, 8]} />
          <meshBasicMaterial 
            color="#444444"
            transparent
            opacity={Math.random() * 0.3}
          />
        </mesh>
      ))}

      {/* Scale bar */}
      <mesh position={[-3, -3.5, 0]}>
        <boxGeometry args={[2, 0.05, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Text position={[-2, -3.8, 0]} fontSize={0.2} color="white">
        10 AU
      </Text>
    </group>
  );
};

// Contrast ratio and detection info
const DetectionInfo: React.FC<{
  currentPlanet: typeof DIRECT_IMAGING_DATA.planets[0] | null;
  contrastRatio: number;
}> = ({ currentPlanet, contrastRatio }) => {
  if (!currentPlanet) return null;

  return (
    <group position={[-12, 5, 0]}>
      <Text position={[0, 0, 0]} fontSize={0.5} color="white">
        Detection Info
      </Text>
      
      <Text position={[0, -0.7, 0]} fontSize={0.3} color={currentPlanet.color}>
        {currentPlanet.name}
      </Text>
      
      <Text position={[0, -1.2, 0]} fontSize={0.2} color="#aaaaaa">
        Type: {currentPlanet.type}
      </Text>
      
      <Text position={[0, -1.6, 0]} fontSize={0.2} color="#aaaaaa">
        Temperature: {currentPlanet.temperature}K
      </Text>
      
      <Text position={[0, -2.0, 0]} fontSize={0.2} color="#aaaaaa">
        Distance: {currentPlanet.distance} AU
      </Text>
      
      <Text position={[0, -2.4, 0]} fontSize={0.2} color="#aaaaaa">
        Contrast: 1:{contrastRatio.toFixed(0)}
      </Text>

      {/* Contrast meter */}
      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[3, 0.3, 0.1]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      <mesh position={[-1.5 + (contrastRatio / 10000) * 3, -3, 0.1]}>
        <boxGeometry args={[0.1, 0.5, 0.2]} />
        <meshBasicMaterial color={contrastRatio > 1000 ? "#4ecdc4" : "#ff6b35"} />
      </mesh>

      <Text position={[-1.8, -3.5, 0]} fontSize={0.15} color="#666666">
        Hard
      </Text>
      <Text position={[1.8, -3.5, 0]} fontSize={0.15} color="#666666">
        Easy
      </Text>
    </group>
  );
};

// Main Direct Imaging Scene component
const DirectImagingScene: React.FC = () => {
  const [time, setTime] = useState(0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showCoronagraph, setShowCoronagraph] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [detectedPlanets, setDetectedPlanets] = useState<number[]>([]);
  const [currentContrast, setCurrentContrast] = useState(1000);

  const lastDetectionUpdateRef = useRef(0);

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * animationSpeed;
    setTime(currentTime);

    // Simulate planet detection based on position and time
    if (currentTime - lastDetectionUpdateRef.current > 1) {
      const newDetections: number[] = [];
      
      DIRECT_IMAGING_DATA.planets.forEach(planet => {
        const angle = (currentTime / planet.period) * Math.PI * 2;
        const x = Math.cos(angle) * planet.distance;
        const z = Math.sin(angle) * planet.distance;
        
        // Planets are easier to detect when farther from star
        const separation = Math.sqrt(x * x + z * z);
        const detectionProbability = separation > 15 ? 0.8 : separation > 10 ? 0.5 : 0.2;
        
        if (Math.random() < detectionProbability) {
          newDetections.push(planet.id);
        }
      });

      setDetectedPlanets(newDetections);
      
      // Update contrast ratio (simulates observing conditions)
      const baseContrast = 1000;
      const variation = Math.sin(currentTime * 0.5) * 200;
      setCurrentContrast(baseContrast + variation);
      
      lastDetectionUpdateRef.current = currentTime;
    }
  });

  const currentPlanet = detectedPlanets.length > 0 
    ? DIRECT_IMAGING_DATA.planets.find(p => p.id === detectedPlanets[0]) || null
    : null;

  return (
    <group>
      <Stars radius={200} depth={100} count={5000} factor={4} />
      
      <Coronagraph visible={showCoronagraph} />
      <Star />
      
      {DIRECT_IMAGING_DATA.planets.map(planet => (
        <Planet
          key={planet.id}
          data={planet}
          time={time}
          showOrbit={showOrbits}
          showAtmosphere={showAtmosphere}
          isImaged={detectedPlanets.includes(planet.id)}
        />
      ))}
      
      <DirectImageView 
        detectedPlanets={detectedPlanets}
        starBlocked={showCoronagraph}
      />
      
      <DetectionInfo 
        currentPlanet={currentPlanet}
        contrastRatio={currentContrast}
      />
    </group>
  );
};

// Controls component
const DirectImagingControls: React.FC<{
  showOrbits: boolean;
  setShowOrbits: (value: boolean) => void;
  showAtmosphere: boolean;
  setShowAtmosphere: (value: boolean) => void;
  showCoronagraph: boolean;
  setShowCoronagraph: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}> = ({ 
  showOrbits, 
  setShowOrbits, 
  showAtmosphere, 
  setShowAtmosphere,
  showCoronagraph,
  setShowCoronagraph,
  animationSpeed, 
  setAnimationSpeed 
}) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg text-white max-w-md">
      <h3 className="text-lg font-bold mb-2">Direct Imaging Controls</h3>
      
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
            checked={showAtmosphere}
            onChange={(e) => setShowAtmosphere(e.target.checked)}
            className="rounded"
          />
          <span>Show Atmospheres</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showCoronagraph}
            onChange={(e) => setShowCoronagraph(e.target.checked)}
            className="rounded"
          />
          <span>Use Coronagraph</span>
        </label>
        
        <div className="space-y-1">
          <label className="block text-sm">Animation Speed: {animationSpeed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-300">
        <p><strong>Direct Imaging</strong> captures actual pictures of exoplanets by blocking the host star's light and using advanced optics to reveal faint planetary companions.</p>
      </div>
    </div>
  );
};

// Main Direct Imaging Animation Component
const DirectImagingAnimation: React.FC = () => {
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showCoronagraph, setShowCoronagraph] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 10, 30], fov: 40 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000011']} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ff6b35" />
        
        <DirectImagingScene />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={60}
        />
        
        <axesHelper args={[5]} />
      </Canvas>
      
      <DirectImagingControls
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        showAtmosphere={showAtmosphere}
        setShowAtmosphere={setShowAtmosphere}
        showCoronagraph={showCoronagraph}
        setShowCoronagraph={setShowCoronagraph}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
      />
      
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-md">
        <h4 className="font-bold">How Direct Imaging Works:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Coronagraph blocks bright starlight</li>
          <li>Advanced optics reveal faint planets</li>
          <li>Works best for young, hot, distant planets</li>
          <li>Can study planetary atmospheres directly</li>
          <li>Right panel shows actual telescope image</li>
        </ul>
      </div>

      <div className="absolute top-4 right-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-sm">
        <h4 className="font-bold">Challenges & Solutions:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Extreme contrast ratios (1:1,000,000+)</li>
          <li>Angular separation very small</li>
          <li>Adaptive optics corrects turbulence</li>
          <li>Coronagraphs block starlight</li>
          <li>Works in infrared wavelengths</li>
        </ul>
      </div>

      <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-xs">
        <h4 className="font-bold text-green-400">Real Examples:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>HR 8799 system (4 planets)</li>
          <li>Beta Pictoris b</li>
          <li>Fomalhaut b</li>
          <li>James Webb discoveries</li>
        </ul>
      </div>
    </div>
  );
};

export default DirectImagingAnimation;