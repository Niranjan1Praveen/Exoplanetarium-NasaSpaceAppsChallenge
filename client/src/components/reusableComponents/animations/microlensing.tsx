// components/MicrolensingAnimation.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';

// Microlensing system data
const MICROLENSING_DATA = {
  backgroundStar: {
    radius: 1.5,
    color: '#ff6b35',
    distance: 50,
    name: 'Source Star'
  },
  lensStar: {
    radius: 1.2,
    color: '#4ecdc4',
    distance: 25,
    name: 'Lens Star',
    hasPlanet: true
  },
  planet: {
    radius: 0.3,
    distance: 3,
    color: '#45b7d1',
    name: 'Exoplanet',
    orbitPeriod: 8
  },
  EinsteinRing: {
    radius: 2.5,
    color: '#ffffff'
  }
};

// Background Source Star component
const SourceStar: React.FC<{ time: number; isMagnified: boolean }> = ({ time, isMagnified }) => {
  const starRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (starRef.current) {
      // Source star moves across the background
      starRef.current.position.x = Math.sin(time * 0.1) * MICROLENSING_DATA.backgroundStar.distance;
      starRef.current.position.z = Math.cos(time * 0.1) * MICROLENSING_DATA.backgroundStar.distance;
      
      // Magnification effect during lensing
      if (isMagnified) {
        const scale = 1 + Math.sin(time * 5) * 0.3;
        starRef.current.scale.set(scale, scale, scale);
      } else {
        starRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group>
      <mesh ref={starRef}>
        <sphereGeometry args={[MICROLENSING_DATA.backgroundStar.radius, 32, 32]} />
        <meshBasicMaterial color={MICROLENSING_DATA.backgroundStar.color} />
      </mesh>
      
      <Text
        position={[0, MICROLENSING_DATA.backgroundStar.radius + 0.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {MICROLENSING_DATA.backgroundStar.name}
      </Text>
    </group>
  );
};

// Lens Star with Planet system
const LensSystem: React.FC<{ time: number }> = ({ time }) => {
  const lensRef = useRef<THREE.Mesh>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const einsteinRingRef = useRef<THREE.Mesh>(null);

  // Planet orbit calculation
  const planetAngle = (time / MICROLENSING_DATA.planet.orbitPeriod) * Math.PI * 2;
  const planetX = Math.cos(planetAngle) * MICROLENSING_DATA.planet.distance;
  const planetZ = Math.sin(planetAngle) * MICROLENSING_DATA.planet.distance;

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.position.x = planetX;
      planetRef.current.position.z = planetZ;
    }

    // Einstein ring pulsation
    if (einsteinRingRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      einsteinRingRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Lens Star */}
      <mesh ref={lensRef}>
        <sphereGeometry args={[MICROLENSING_DATA.lensStar.radius, 32, 32]} />
        <meshBasicMaterial color={MICROLENSING_DATA.lensStar.color} />
      </mesh>

      {/* Einstein Ring */}
      <mesh ref={einsteinRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry 
          args={[
            MICROLENSING_DATA.EinsteinRing.radius - 0.1, 
            MICROLENSING_DATA.EinsteinRing.radius + 0.1, 
            64
          ]} 
        />
        <meshBasicMaterial 
          color={MICROLENSING_DATA.EinsteinRing.color} 
          transparent 
          opacity={0.6}
        />
      </mesh>

      {/* Planet */}
      {MICROLENSING_DATA.lensStar.hasPlanet && (
        <>
          <mesh ref={planetRef}>
            <sphereGeometry args={[MICROLENSING_DATA.planet.radius, 16, 16]} />
            <meshStandardMaterial color={MICROLENSING_DATA.planet.color} />
          </mesh>

          {/* Planet label */}
          <Text
            position={[planetX, MICROLENSING_DATA.planet.radius + 0.3, planetZ]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {MICROLENSING_DATA.planet.name}
          </Text>

          {/* Planet orbit path */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry 
              args={[
                MICROLENSING_DATA.planet.distance - 0.02, 
                MICROLENSING_DATA.planet.distance + 0.02, 
                64
              ]} 
            />
            <meshBasicMaterial color="#666666" transparent opacity={0.3} />
          </mesh>
        </>
      )}

      {/* Lens Star label */}
      <Text
        position={[0, MICROLENSING_DATA.lensStar.radius + 0.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {MICROLENSING_DATA.lensStar.name}
      </Text>
    </group>
  );
};

// Light curve display for microlensing events
const MicrolensingLightCurve: React.FC<{ 
  events: Array<{ time: number; magnification: number; type: 'star' | 'planet' }> 
}> = ({ events }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef} position={[0, -8, 0]}>
      {/* Coordinate system */}
      <mesh position={[6, 0, 0]}>
        <boxGeometry args={[12, 0.02, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.02, 5, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Baseline magnification (1x) */}
      <mesh position={[6, 1, 0]}>
        <boxGeometry args={[12, 0.01, 0.01]} />
        <meshBasicMaterial color="#666666" transparent opacity={0.3} />
      </mesh>

      {/* Magnification curve */}
      {events.map((event, index) => {
        if (index === 0) return null;
        const prevEvent = events[index - 1];
        
        return (
          <mesh key={index}>
            <bufferGeometry>
              {/* <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  prevEvent.time * 0.5, prevEvent.magnification, 0,
                  event.time * 0.5, event.magnification, 0
                ])}
                itemSize={3}
              /> */}
            </bufferGeometry>
            <lineBasicMaterial 
              color={event.type === 'planet' ? '#ff4444' : '#44ff44'} 
              linewidth={2}
            />
          </mesh>
        );
      })}

      {/* Peak markers */}
      {events.filter(event => event.magnification > 2).map((event, index) => (
        <mesh key={index} position={[event.time * 0.5, event.magnification, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={event.type === 'planet' ? '#ff4444' : '#44ff44'} />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[12, -0.5, 0]} fontSize={0.3} color="white">
        Time
      </Text>
      <Text position={[-1.5, 5, 0]} fontSize={0.3} color="white" rotation={[0, 0, Math.PI / 2]}>
        Magnification
      </Text>
    </group>
  );
};

// Gravitational lensing effect visualization
const LensingEffect: React.FC<{ 
  sourcePosition: THREE.Vector3; 
  lensPosition: THREE.Vector3;
  isLensing: boolean;
}> = ({ sourcePosition, lensPosition, isLensing }) => {
  const linesRef = useRef<THREE.Group>(null);
  
  const createLightBeams = () => {
    const beams = [];
    const segments = 8;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const startPos = new THREE.Vector3(
        sourcePosition.x + Math.cos(angle) * 0.5,
        sourcePosition.y,
        sourcePosition.z + Math.sin(angle) * 0.5
      );
      
      beams.push({ start: startPos, angle });
    }
    
    return beams;
  };

  const beams = createLightBeams();

  return (
    <group ref={linesRef}>
      {beams.map((beam, index) => {
        // Calculate bent path due to gravitational lensing
        const lensDirection = new THREE.Vector3().subVectors(lensPosition, beam.start).normalize();
        const bendAmount = isLensing ? 0.3 : 0;
        
        const controlPoint = new THREE.Vector3()
          .addVectors(beam.start, lensDirection.multiplyScalar(2))
          .add(new THREE.Vector3(0, bendAmount, 0));
        
        const endPoint = new THREE.Vector3(
          -beam.start.x * 2,
          beam.start.y,
          -beam.start.z * 2
        );

        const curve = new THREE.QuadraticBezierCurve3(
          beam.start,
          controlPoint,
          endPoint
        );

        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={index}>
            <lineBasicMaterial 
              color={isLensing ? "#ffff00" : "#444444"} 
              transparent 
              opacity={isLensing ? 0.6 : 0.2}
            />
          </line>
        );
      })}
    </group>
  );
};

// Main Microlensing Scene component
// Corrected version of the problematic section
const MicrolensingScene: React.FC = () => {
  const [time, setTime] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [showEinsteinRing, setShowEinsteinRing] = useState(true);
  const [showLightPaths, setShowLightPaths] = useState(true);
  const [lensingEvents, setLensingEvents] = useState<Array<{ 
    time: number; 
    magnification: number; 
    type: 'star' | 'planet' 
  }>>([]);

  // Use ref to track last event time to throttle updates
  const lastEventTimeRef = useRef<number>(0);
  const lastPlanetEventTimeRef = useRef<number>(0);

  const sourcePosRef = useRef(new THREE.Vector3());
  const lensPosRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * animationSpeed;
    setTime(currentTime);

    // Calculate source star position
    sourcePosRef.current.x = Math.sin(currentTime * 0.1) * MICROLENSING_DATA.backgroundStar.distance;
    sourcePosRef.current.z = Math.cos(currentTime * 0.1) * MICROLENSING_DATA.backgroundStar.distance;

    // Calculate distance between source and lens for lensing effect
    const distance = sourcePosRef.current.distanceTo(lensPosRef.current);
    const isLensingActive = distance < MICROLENSING_DATA.EinsteinRing.radius * 2;

    // Record lensing events with throttling
    if (isLensingActive && currentTime - lastEventTimeRef.current > 0.5) {
      const magnification = 1 + (MICROLENSING_DATA.EinsteinRing.radius * 2 - distance) / 2;
      const eventTime = Math.floor(currentTime * 10) / 10;
      
      // Check for planetary signature
      const planetAngle = (currentTime / MICROLENSING_DATA.planet.orbitPeriod) * Math.PI * 2;
      const planetX = Math.cos(planetAngle) * MICROLENSING_DATA.planet.distance;
      const planetZ = Math.sin(planetAngle) * MICROLENSING_DATA.planet.distance;
      const planetPos = new THREE.Vector3(planetX, 0, planetZ);
      const planetDistance = sourcePosRef.current.distanceTo(planetPos);
      
      const isPlanetLensing = planetDistance < MICROLENSING_DATA.planet.radius * 3;
      
      // Additional throttle for planet events
      let eventType: 'star' | 'planet' = 'star';
      let finalMagnification = magnification;
      
      if (isPlanetLensing && currentTime - lastPlanetEventTimeRef.current > 0.2) {
        eventType = 'planet';
        finalMagnification = magnification * 1.5;
        lastPlanetEventTimeRef.current = currentTime;
      }

      const existingEvent = lensingEvents.find(e => 
        Math.abs(e.time - eventTime) < 0.5 && e.type === eventType
      );

      if (!existingEvent) {
        setLensingEvents(prev => {
          const newEvents = [
            ...prev,
            {
              time: eventTime,
              magnification: finalMagnification,
              type: eventType
            }
          ];
          // Keep only last 50 events
          return newEvents.length > 50 ? newEvents.slice(-50) : newEvents;
        });
        
        lastEventTimeRef.current = currentTime;
      }
    }
  });

  const isLensingActive = sourcePosRef.current.distanceTo(lensPosRef.current) < 
                         MICROLENSING_DATA.EinsteinRing.radius * 2;

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} />
      
      <LensSystem time={time} />
      <SourceStar time={time} isMagnified={isLensingActive} />
      
      {showLightPaths && (
        <LensingEffect 
          sourcePosition={sourcePosRef.current}
          lensPosition={lensPosRef.current}
          isLensing={isLensingActive}
        />
      )}
      
      <MicrolensingLightCurve events={lensingEvents} />
    </group>
  );
};

// Controls component
const MicrolensingControls: React.FC<{
  showEinsteinRing: boolean;
  setShowEinsteinRing: (value: boolean) => void;
  showLightPaths: boolean;
  setShowLightPaths: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}> = ({ 
  showEinsteinRing, 
  setShowEinsteinRing, 
  showLightPaths, 
  setShowLightPaths, 
  animationSpeed, 
  setAnimationSpeed 
}) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg text-white max-w-md">
      <h3 className="text-lg font-bold mb-2">Microlensing Animation Controls</h3>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showEinsteinRing}
            onChange={(e) => setShowEinsteinRing(e.target.checked)}
            className="rounded"
          />
          <span>Show Einstein Ring</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showLightPaths}
            onChange={(e) => setShowLightPaths(e.target.checked)}
            className="rounded"
          />
          <span>Show Light Paths</span>
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
        <p><strong>Gravitational Microlensing</strong> occurs when a foreground star (lens) magnifies the light of a background star (source) due to gravitational bending of light.</p>
      </div> */}
    </div>
  );
};

// Main Microlensing Animation Component
const MicrolensingAnimation: React.FC = () => {
  const [showEinsteinRing, setShowEinsteinRing] = useState(true);
  const [showLightPaths, setShowLightPaths] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 12, 20], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a2a']} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <MicrolensingScene />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={40}
        />
        
        <axesHelper args={[5]} />
      </Canvas>
      
      <MicrolensingControls
        showEinsteinRing={showEinsteinRing}
        setShowEinsteinRing={setShowEinsteinRing}
        showLightPaths={showLightPaths}
        setShowLightPaths={setShowLightPaths}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
      />
      
      <div className="absolute bottom-0 left-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-md">
        <h4 className="font-bold">How Microlensing Works:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Foreground star acts as gravitational lens</li>
          <li>Background star light is magnified and distorted</li>
          <li>Planets cause brief, sharp magnification spikes</li>
          <li>Green curve: stellar lensing, Red spikes: planetary signatures</li>
          <li>Einstein ring shows region of maximum lensing effect</li>
        </ul>
      </div>

      {/* <div className="absolute top-4 right-4 text-white bg-black bg-opacity-70 p-3 rounded-lg max-w-sm">
        <h4 className="font-bold">Key Features:</h4>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>Detects planets at large distances</li>
          <li>Sensitive to low-mass planets</li>
          <li>One-time events (non-repeatable)</li>
          <li>Can detect free-floating planets</li>
        </ul>
      </div> */}
    </div>
  );
};

export default MicrolensingAnimation;