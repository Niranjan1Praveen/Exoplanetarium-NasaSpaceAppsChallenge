// components/AstrometryAnimation.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';

// System data for astrometry animation
const ASTROMETRY_DATA = {
  star: {
    radius: 1.5,
    color: '#ff8c42',
    mass: 1.0,
    name: 'Host Star'
  },
  planets: [
    {
      id: 1,
      radius: 0.5,
      distance: 8,
      color: '#4ecdc4',
      period: 10,
      mass: 2.5,
      name: 'Gas Giant',
      inclination: 0.1
    },
    {
      id: 2,
      radius: 0.3,
      distance: 12,
      color: '#45b7d1',
      period: 15,
      mass: 1.2,
      name: 'Ice Giant',
      inclination: 0.2
    },
    {
      id: 3,
      radius: 0.15,
      distance: 4,
      color: '#96ceb4',
      period: 6,
      mass: 0.5,
      name: 'Super-Earth',
      inclination: 0.3
    }
  ],
  backgroundStars: [
    { id: 1, position: [20, 5, 30], brightness: 0.8 },
    { id: 2, position: [-15, 8, 25], brightness: 0.6 },
    { id: 3, position: [10, -3, 35], brightness: 0.9 },
    { id: 4, position: [-25, -2, 28], brightness: 0.7 },
    { id: 5, position: [18, -8, 32], brightness: 0.5 },
    { id: 6, position: [-8, 12, 26], brightness: 0.8 }
  ]
};

// Background reference stars
const BackgroundStars: React.FC = () => {
  return (
    <group>
      {ASTROMETRY_DATA.backgroundStars.map((star) => (
        <mesh key={star.id} position={star.position as [number, number, number]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={star.brightness * 0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Star component with proper motion and wobble
const Star: React.FC<{ wobbleOffset: THREE.Vector3; time: number }> = ({ wobbleOffset, time }) => {
  const starRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  
  useFrame(() => {
    if (starRef.current) {
      // Apply wobble motion to star (astrometric wobble)
      starRef.current.position.x = wobbleOffset.x;
      starRef.current.position.y = wobbleOffset.y;
      starRef.current.position.z = wobbleOffset.z;
    }
  });

  return (
    <group>
      {/* Main star */}
      <mesh ref={starRef}>
        <sphereGeometry args={[ASTROMETRY_DATA.star.radius, 32, 32]} />
        <meshBasicMaterial color={ASTROMETRY_DATA.star.color} />
      </mesh>
      
      {/* Star label */}
      <Text
        position={[wobbleOffset.x, ASTROMETRY_DATA.star.radius + 0.8, wobbleOffset.z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {ASTROMETRY_DATA.star.name}
      </Text>

      {/* Coordinate crosshair */}
      <mesh position={[wobbleOffset.x, wobbleOffset.y, wobbleOffset.z]}>
        <boxGeometry args={[0.02, 3, 0.02]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
      </mesh>
      <mesh position={[wobbleOffset.x, wobbleOffset.y, wobbleOffset.z]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.02, 3, 0.02]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

// Planet component with inclined orbits
interface PlanetProps {
  data: typeof ASTROMETRY_DATA.planets[0];
  time: number;
  showOrbit: boolean;
  showInfluence: boolean;
}

const Planet: React.FC<PlanetProps> = ({ data, time, showOrbit, showInfluence }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const influenceRef = useRef<THREE.Mesh>(null);

  // Calculate planet position with inclination
  const angle = (time / data.period) * Math.PI * 2;
  const x = Math.cos(angle) * data.distance;
  const z = Math.sin(angle) * data.distance;
  const y = Math.sin(angle) * data.distance * data.inclination; // Inclination effect

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.position.x = x;
      planetRef.current.position.y = y;
      planetRef.current.position.z = z;
    }

    if (influenceRef.current && showInfluence) {
      // Show gravitational influence zone
      influenceRef.current.position.x = x;
      influenceRef.current.position.y = y;
      influenceRef.current.position.z = z;
    }
  });

  // Create elliptical orbit path with inclination
  const orbitPoints = React.useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const orbitX = Math.cos(theta) * data.distance;
      const orbitZ = Math.sin(theta) * data.distance;
      const orbitY = Math.sin(theta) * data.distance * data.inclination;
      points.push(new THREE.Vector3(orbitX, orbitY, orbitZ));
    }
    return points;
  }, [data.distance, data.inclination]);

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
          <lineBasicMaterial color={data.color} transparent opacity={0.4} />
        </line>
      )}
      
      {/* Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[data.radius, 16, 16]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Planet label */}
      <Text
        position={[x, y + data.radius + 0.4, z]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.name}
      </Text>

      {/* Gravitational influence visualization */}
      {showInfluence && (
        <mesh ref={influenceRef}>
          <sphereGeometry args={[data.mass * 0.3, 8, 8]} />
          <meshBasicMaterial 
            color={data.color} 
            transparent 
            opacity={0.2}
            wireframe={true}
          />
        </mesh>
      )}
    </group>
  );
};

// Astrometric wobble plot (sky plane motion)
const AstrometricPlot: React.FC<{ 
  measurements: Array<{ time: number; x: number; y: number; planetId: number }> 
}> = ({ measurements }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[0, -8, 0]}>
      {/* Coordinate grid */}
      <gridHelper args={[10, 10, '#444444', '#222222']} rotation={[-Math.PI / 2, 0, 0]} />
      
      {/* Center reference */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.1]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Star's path */}
      {measurements.map((measurement, index) => {
        if (index === 0) return null;
        const prevMeasurement = measurements[index - 1];
        
        return (
          <mesh key={index}>
            <bufferGeometry>
              {/* <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  prevMeasurement.x * 20, 0.02, prevMeasurement.y * 20,
                  measurement.x * 20, 0.02, measurement.y * 20
                ])}
                itemSize={3}
              /> */}
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" linewidth={2} transparent opacity={0.7} />
          </mesh>
        );
      })}

      {/* Measurement points */}
      {measurements.map((measurement, index) => (
        <mesh key={index} position={[measurement.x * 20, 0.03, measurement.y * 20]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={
            measurement.planetId === 1 ? '#4ecdc4' : 
            measurement.planetId === 2 ? '#45b7d1' : '#96ceb4'
          } />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[6, 0.5, 0]} fontSize={0.3} color="white">
        Right Ascension
      </Text>
      <Text position={[0, 0.5, 6]} fontSize={0.3} color="white" rotation={[0, Math.PI / 2, 0]}>
        Declination
      </Text>

      <Text position={[0, 0.5, -7]} fontSize={0.4} color="white">
        Astrometric Wobble (mas)
      </Text>

      {/* Scale indicators */}
      <Text position={[2, 0.1, -0.3]} fontSize={0.2} color="#666666">
        2 mas
      </Text>
      <Text position={[-2, 0.1, -0.3]} fontSize={0.2} color="#666666">
        -2 mas
      </Text>
    </group>
  );
};

// Proper motion trail
const ProperMotionTrail: React.FC<{ 
  positions: Array<THREE.Vector3> 
}> = ({ positions }) => {
  return (
    <group>
      {positions.map((pos, index) => {
        if (index === 0) return null;
        const prevPos = positions[index - 1];
        
        return (
          <mesh key={index}>
            <bufferGeometry>
              {/* <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  prevPos.x, prevPos.y, prevPos.z,
                  pos.x, pos.y, pos.z
                ])}
                itemSize={3}
              /> */}
            </bufferGeometry>
            <lineBasicMaterial color="#ff4444" linewidth={1} transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// Parallax effect visualization
const ParallaxEffect: React.FC<{ 
  time: number;
  showParallax: boolean;
}> = ({ time, showParallax }) => {
  if (!showParallax) return null;

  return (
    <group>
      {/* Earth's orbit around Sun (for parallax reference) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.82, 32]} />
        <meshBasicMaterial color="#4444ff" transparent opacity={0.3} />
      </mesh>

      {/* Earth position */}
      <mesh position={[Math.cos(time * 0.5) * 0.8, 0, Math.sin(time * 0.5) * 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#4a86e8" />
      </mesh>

      <Text position={[1, 0.5, 1]} fontSize={0.3} color="#4a86e8">
        Earth's Orbit
      </Text>

      {/* Parallax lines */}
      <mesh>
        <bufferGeometry>
          {/* <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              Math.cos(time * 0.5) * 0.8, 0, Math.sin(time * 0.5) * 0.8,
              0, 0, 0
            ])}
            itemSize={3}
          /> */}
        </bufferGeometry>
        <lineBasicMaterial color="#4a86e8" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// Main Astrometry Scene component
const AstrometryScene: React.FC = () => {
  const [time, setTime] = useState(0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showInfluence, setShowInfluence] = useState(true);
  const [showParallax, setShowParallax] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.8);
  const [astrometricMeasurements, setAstrometricMeasurements] = useState<Array<{ 
    time: number; 
    x: number; 
    y: number;
    z: number;
    planetId: number 
  }>>([]);

  const [properMotionTrail, setProperMotionTrail] = useState<THREE.Vector3[]>([]);
  
  const starWobbleRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastMeasurementTimeRef = useRef(0);
  const lastTrailUpdateRef = useRef(0);

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * animationSpeed;
    setTime(currentTime);

    // Calculate star wobble around barycenter due to all planets
    let totalWobbleX = 0;
    let totalWobbleY = 0;
    let totalWobbleZ = 0;

    ASTROMETRY_DATA.planets.forEach(planet => {
      const angle = (currentTime / planet.period) * Math.PI * 2;
      
      // Astrometric wobble calculation (star moves around system barycenter)
      const wobbleScale = planet.mass * 0.8;
      const wobbleX = -Math.cos(angle) * wobbleScale;
      const wobbleZ = -Math.sin(angle) * wobbleScale;
      const wobbleY = -Math.sin(angle) * wobbleScale * planet.inclination;
      
      totalWobbleX += wobbleX;
      totalWobbleY += wobbleY;
      totalWobbleZ += wobbleZ;
    });

    // Add proper motion (slow drift across sky)
    const properMotionX = currentTime * 0.02;
    const properMotionY = currentTime * 0.01;

    // Update star position with wobble and proper motion
    starWobbleRef.current.set(
      totalWobbleX + properMotionX,
      totalWobbleY + properMotionY,
      totalWobbleZ
    );

    // Record astrometric measurements (throttled)
    if (currentTime - lastMeasurementTimeRef.current > 0.5) {
      // Determine which planet is currently dominant in the wobble
      let dominantPlanetId = 1;
      let maxInfluence = 0;
      
      ASTROMETRY_DATA.planets.forEach(planet => {
        const angle = (currentTime / planet.period) * Math.PI * 2;
        const influence = Math.abs(Math.sin(angle)) * planet.mass;
        if (influence > maxInfluence) {
          maxInfluence = influence;
          dominantPlanetId = planet.id;
        }
      });

      setAstrometricMeasurements(prev => {
        const newMeasurement = {
          time: currentTime,
          x: totalWobbleX,
          y: totalWobbleY,
          z: totalWobbleZ,
          planetId: dominantPlanetId
        };
        const newMeasurements = [...prev, newMeasurement];
        return newMeasurements.length > 50 ? newMeasurements.slice(-50) : newMeasurements;
      });

      // Update proper motion trail
      if (currentTime - lastTrailUpdateRef.current > 0.2) {
        setProperMotionTrail(prev => {
          const newTrail = [...prev, starWobbleRef.current.clone()];
          return newTrail.length > 100 ? newTrail.slice(-100) : newTrail;
        });
        lastTrailUpdateRef.current = currentTime;
      }
      
      lastMeasurementTimeRef.current = currentTime;
    }
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={3000} factor={4} />
      <BackgroundStars />
      
      <ProperMotionTrail positions={properMotionTrail} />
      <Star wobbleOffset={starWobbleRef.current} time={time} />
      
      {ASTROMETRY_DATA.planets.map(planet => (
        <Planet
          key={planet.id}
          data={planet}
          time={time}
          showOrbit={showOrbits}
          showInfluence={showInfluence}
        />
      ))}
      
      <AstrometricPlot measurements={astrometricMeasurements} />
      <ParallaxEffect time={time} showParallax={showParallax} />
    </group>
  );
};

// Controls component
const AstrometryControls: React.FC<{
  showOrbits: boolean;
  setShowOrbits: (value: boolean) => void;
  showInfluence: boolean;
  setShowInfluence: (value: boolean) => void;
  showParallax: boolean;
  setShowParallax: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}> = ({ 
  showOrbits, 
  setShowOrbits, 
  showInfluence, 
  setShowInfluence,
  showParallax,
  setShowParallax,
  animationSpeed, 
  setAnimationSpeed 
}) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg text-white max-w-md">
      <h3 className="text-lg font-bold mb-2">Astrometry Controls</h3>
      
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
            checked={showInfluence}
            onChange={(e) => setShowInfluence(e.target.checked)}
            className="rounded"
          />
          <span>Show Gravitational Influence</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showParallax}
            onChange={(e) => setShowParallax(e.target.checked)}
            className="rounded"
          />
          <span>Show Parallax Effect</span>
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
      
      {/* <div className="mt-3 text-sm text-gray-300">
        <p><strong>Astrometry Method</strong> detects exoplanets by precisely measuring the star's position changes on the sky plane caused by gravitational tug from orbiting planets.</p>
      </div> */}
    </div>
  );
};

// Main Astrometry Animation Component
const AstrometryAnimation: React.FC = () => {
  const [showOrbits, setShowOrbits] = useState(true);
  const [showInfluence, setShowInfluence] = useState(true);
  const [showParallax, setShowParallax] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.8);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 15, 25], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <AstrometryScene />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={50}
        />
        
        <axesHelper args={[5]} />
      </Canvas>
      
      <AstrometryControls
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        showInfluence={showInfluence}
        setShowInfluence={setShowInfluence}
        showParallax={showParallax}
        setShowParallax={setShowParallax}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
      />
      
      <div className="absolute bottom-0 left-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-md">
        <h4 className="font-bold">How Astrometry Works:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Planets cause star to wobble around system barycenter</li>
          <li>Precise position measurements detect tiny motions</li>
          <li>Motion pattern reveals planet mass and orbit</li>
          <li>Different colors show different planet influences</li>
          <li>Grid shows milliarcsecond scale precision needed</li>
        </ul>
      </div>

      {/* <div className="absolute top-4 right-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-sm">
        <h4 className="font-bold">Key Features:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Measures planet masses directly</li>
          <li>Sensitive to wide-orbit planets</li>
          <li>Works for face-on orbital systems</li>
          <li>Gaia mission uses this method</li>
          <li>Can detect Earth-like planets</li>
        </ul>
      </div> */}
    </div>
  );
};

export default AstrometryAnimation;