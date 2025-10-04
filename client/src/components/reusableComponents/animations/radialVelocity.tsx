// components/RadialVelocityAnimation.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';

// System data for radial velocity animation
const RADIAL_VELOCITY_DATA = {
  star: {
    radius: 2,
    color: '#ff6b35',
    mass: 1.0,
    name: 'Host Star'
  },
  planets: [
    {
      id: 1,
      radius: 0.4,
      distance: 6,
      color: '#4ecdc4',
      period: 5,
      mass: 0.8,
      name: 'Hot Jupiter',
      spectralColor: '#ff4444'
    },
    {
      id: 2,
      radius: 0.2,
      distance: 10,
      color: '#45b7d1',
      period: 8,
      mass: 0.2,
      name: 'Super-Earth',
      spectralColor: '#4444ff'
    }
  ]
};

// Star component with radial velocity wobble
const Star: React.FC<{ wobbleOffset: THREE.Vector3; time: number }> = ({ wobbleOffset, time }) => {
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (starRef.current) {
      // Apply wobble motion to star
      starRef.current.position.x = wobbleOffset.x;
      starRef.current.position.y = wobbleOffset.y;
      
      // Gentle pulsation effect
      const pulse = 1 + Math.sin(time * 2) * 0.02;
      starRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glowRef.current) {
      // Make glow follow star
      glowRef.current.position.x = wobbleOffset.x;
      glowRef.current.position.y = wobbleOffset.y;
    }
  });

  return (
    <group>
      {/* Star glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[RADIAL_VELOCITY_DATA.star.radius * 1.3, 32, 32]} />
        <meshBasicMaterial 
          color={RADIAL_VELOCITY_DATA.star.color} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Main star */}
      <mesh ref={starRef}>
        <sphereGeometry args={[RADIAL_VELOCITY_DATA.star.radius, 32, 32]} />
        <meshBasicMaterial color={RADIAL_VELOCITY_DATA.star.color} />
      </mesh>
      
      {/* Star label */}
      <Text
        position={[wobbleOffset.x, RADIAL_VELOCITY_DATA.star.radius + 1, wobbleOffset.y]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {RADIAL_VELOCITY_DATA.star.name}
      </Text>
    </group>
  );
};

// Planet component
interface PlanetProps {
  data: typeof RADIAL_VELOCITY_DATA.planets[0];
  time: number;
  showOrbit: boolean;
  showSpectralLine: boolean;
}

const Planet: React.FC<PlanetProps> = ({ data, time, showOrbit, showSpectralLine }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const spectralLineRef = useRef<THREE.Mesh>(null);

  // Calculate planet position (circular orbit)
  const angle = (time / data.period) * Math.PI * 2;
  const x = Math.cos(angle) * data.distance;
  const z = Math.sin(angle) * data.distance;

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.position.x = x;
      planetRef.current.position.z = z;
    }

    // Update spectral line effect
    if (spectralLineRef.current && showSpectralLine) {
      // Spectral line moves with radial velocity component
      const radialVelocity = -Math.sin(angle) * (data.mass * 2); // Simplified RV calculation
      spectralLineRef.current.position.x = radialVelocity;
      spectralLineRef.current.visible = true;
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
          <lineBasicMaterial color="#666666" transparent opacity={0.3} />
        </line>
      )}
      
      {/* Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[data.radius, 16, 16]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Planet label */}
      <Text
        position={[x, data.radius + 0.5, z]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.name}
      </Text>

      {/* Spectral line effect */}
      {showSpectralLine && (
        <mesh ref={spectralLineRef} visible={false}>
          <boxGeometry args={[0.1, 3, 0.02]} />
          <meshBasicMaterial color={data.spectralColor} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// Radial Velocity Curve display
const RadialVelocityCurve: React.FC<{ 
  measurements: Array<{ time: number; velocity: number; planetId: number }> 
}> = ({ measurements }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[0, -6, 0]}>
      {/* Coordinate system */}
      <mesh position={[6, 0, 0]}>
        <boxGeometry args={[12, 0.02, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.02, 4, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Zero velocity line */}
      <mesh position={[6, 0, 0]}>
        <boxGeometry args={[12, 0.01, 0.01]} />
        <meshBasicMaterial color="#666666" transparent opacity={0.3} />
      </mesh>

      {/* Velocity curve - connect measurements with lines */}
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
                  prevMeasurement.time * 1.5, prevMeasurement.velocity, 0,
                  measurement.time * 1.5, measurement.velocity, 0
                ])}
                itemSize={3}
              /> */}
            </bufferGeometry>
            <lineBasicMaterial 
              color={measurement.planetId === 1 ? '#ff4444' : '#4444ff'} 
              linewidth={2}
            />
          </mesh>
        );
      })}

      {/* Measurement points */}
      {measurements.map((measurement, index) => (
        <mesh key={index} position={[measurement.time * 1.5, measurement.velocity, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={measurement.planetId === 1 ? '#ff4444' : '#4444ff'} />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[12, -0.5, 0]} fontSize={0.3} color="white">
        Time
      </Text>
      <Text position={[-1.5, 4, 0]} fontSize={0.3} color="white" rotation={[0, 0, Math.PI / 2]}>
        Radial Velocity (m/s)
      </Text>

      {/* Velocity scale labels */}
      <Text position={[-0.8, 2, 0]} fontSize={0.2} color="#ff4444">
        +50
      </Text>
      <Text position={[-0.8, -2, 0]} fontSize={0.2} color="#4444ff">
        -50
      </Text>
    </group>
  );
};

// Spectral lines display
const SpectralLines: React.FC<{ 
  dopplerShift: number;
  planetContributions: Array<{ planetId: number; shift: number; color: string }>
}> = ({ dopplerShift, planetContributions }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[8, 3, 0]}>
      {/* Title */}
      <Text position={[0, 2.5, 0]} fontSize={0.4} color="white">
        Spectral Lines
      </Text>

      {/* Reference line (no shift) */}
      <mesh position={[dopplerShift * 10, 1.5, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      <Text position={[dopplerShift * 10, 3.5, 0]} fontSize={0.2} color="#00ff00">
        Rest Frame
      </Text>

      {/* Shifted lines for each planet */}
      {planetContributions.map((planet, index) => (
        <group key={planet.planetId}>
          <mesh position={[planet.shift * 10, 1 - index * 0.5, 0]}>
            <boxGeometry args={[0.05, 0.3, 0.02]} />
            <meshBasicMaterial color={planet.color} />
          </mesh>
          
          {/* Arrow showing shift direction */}
          <mesh position={[planet.shift * 5, 1 - index * 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshBasicMaterial color={planet.color} />
          </mesh>
        </group>
      ))}

      <Text position={[-2, 0, 0]} fontSize={0.25} color="white" rotation={[0, 0, Math.PI / 2]}>
        Blueshift →
      </Text>
      
      <Text position={[2, 0, 0]} fontSize={0.25} color="white" rotation={[0, 0, -Math.PI / 2]}>
        ← Redshift
      </Text>
    </group>
  );
};

// Main Radial Velocity Scene component
const RadialVelocityScene: React.FC = () => {
  const [time, setTime] = useState(0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showSpectralLines, setShowSpectralLines] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [velocityMeasurements, setVelocityMeasurements] = useState<Array<{ 
    time: number; 
    velocity: number; 
    planetId: number 
  }>>([]);

  const starWobbleRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastMeasurementTimeRef = useRef(0);

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * animationSpeed;
    setTime(currentTime);

    // Calculate star wobble due to planetary gravitational pull
    let totalWobbleX = 0;
    let totalWobbleY = 0;
    let totalRadialVelocity = 0;
    const planetContributions: Array<{ planetId: number; shift: number; color: string }> = [];

    RADIAL_VELOCITY_DATA.planets.forEach(planet => {
      const angle = (currentTime / planet.period) * Math.PI * 2;
      
      // Simplified wobble calculation (star moves opposite to planet)
      const wobbleScale = planet.mass * 0.5;
      const wobbleX = -Math.cos(angle) * wobbleScale;
      const wobbleY = -Math.sin(angle) * wobbleScale;
      
      totalWobbleX += wobbleX;
      totalWobbleY += wobbleY;

      // Radial velocity component (simplified)
      const radialVelocity = -Math.sin(angle) * planet.mass * 20;
      totalRadialVelocity += radialVelocity;

      planetContributions.push({
        planetId: planet.id,
        shift: radialVelocity / 100,
        color: planet.spectralColor
      });
    });

    // Update star wobble position
    starWobbleRef.current.set(totalWobbleX, totalWobbleY, 0);

    // Record velocity measurements (throttled)
    if (currentTime - lastMeasurementTimeRef.current > 0.3) {
      RADIAL_VELOCITY_DATA.planets.forEach(planet => {
        const angle = (currentTime / planet.period) * Math.PI * 2;
        const radialVelocity = -Math.sin(angle) * planet.mass * 20;
        
        setVelocityMeasurements(prev => {
          const newMeasurement = {
            time: currentTime,
            velocity: radialVelocity,
            planetId: planet.id
          };
          const newMeasurements = [...prev, newMeasurement];
          // Keep only last 40 measurements
          return newMeasurements.length > 40 ? newMeasurements.slice(-40) : newMeasurements;
        });
      });
      
      lastMeasurementTimeRef.current = currentTime;
    }
  });

  const totalDopplerShift = velocityMeasurements.length > 0 
    ? velocityMeasurements[velocityMeasurements.length - 1].velocity / 100 
    : 0;

  const planetContributions = RADIAL_VELOCITY_DATA.planets.map(planet => ({
    planetId: planet.id,
    shift: -Math.sin((time / planet.period) * Math.PI * 2) * planet.mass * 0.2,
    color: planet.spectralColor
  }));

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} />
      
      <Star wobbleOffset={starWobbleRef.current} time={time} />
      
      {RADIAL_VELOCITY_DATA.planets.map(planet => (
        <Planet
          key={planet.id}
          data={planet}
          time={time}
          showOrbit={showOrbits}
          showSpectralLine={showSpectralLines}
        />
      ))}
      
      <RadialVelocityCurve measurements={velocityMeasurements} />
      <SpectralLines 
        dopplerShift={totalDopplerShift} 
        planetContributions={planetContributions}
      />
    </group>
  );
};

// Controls component
const RadialVelocityControls: React.FC<{
  showOrbits: boolean;
  setShowOrbits: (value: boolean) => void;
  showSpectralLines: boolean;
  setShowSpectralLines: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}> = ({ 
  showOrbits, 
  setShowOrbits, 
  showSpectralLines, 
  setShowSpectralLines, 
  animationSpeed, 
  setAnimationSpeed 
}) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg text-white max-w-md">
      <h3 className="text-lg font-bold mb-2">Radial Velocity Controls</h3>
      
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
            checked={showSpectralLines}
            onChange={(e) => setShowSpectralLines(e.target.checked)}
            className="rounded"
          />
          <span>Show Spectral Lines</span>
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
      
      {/* <div className="mt-3 text-sm text-gray-300">
        <p><strong>Radial Velocity Method</strong> detects exoplanets by measuring the star's wobble caused by planetary gravitational pull, observed through Doppler shifts in spectral lines.</p>
      </div> */}
    </div>
  );
};

// Main Radial Velocity Animation Component
const RadialVelocityAnimation: React.FC = () => {
  const [showOrbits, setShowOrbits] = useState(true);
  const [showSpectralLines, setShowSpectralLines] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 8, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#001122']} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <RadialVelocityScene />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
        
        <axesHelper args={[5]} />
      </Canvas>
      
      <RadialVelocityControls
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        showSpectralLines={showSpectralLines}
        setShowSpectralLines={setShowSpectralLines}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
      />
      
      <div className="absolute bottom-0 left-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-md">
        <h4 className="font-bold">How Radial Velocity Works:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Planets gravitationally pull on their host star</li>
          <li>Star wobbles around the system's center of mass</li>
          <li>Wobble causes Doppler shifts in spectral lines</li>
          <li>Red curve: Hot Jupiter, Blue curve: Super-Earth</li>
          <li>Amplitude reveals planet mass, period reveals orbit size</li>
        </ul>
      </div>

      {/* <div className="absolute top-4 right-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-sm">
        <h4 className="font-bold">Key Features:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Measures planetary masses directly</li>
          <li>Works for non-transiting planets</li>
          <li>Sensitive to massive, close-in planets</li>
          <li>Can detect multiple planets in system</li>
        </ul>
      </div> */}
    </div>
  );
};

export default RadialVelocityAnimation;