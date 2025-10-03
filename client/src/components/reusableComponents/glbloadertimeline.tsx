"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, Stage } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

interface GLBLoaderTimelineProps {
  modelPath: string
  autoRotate?: boolean
  scale?: number
}

function Model({ modelPath, scale = 1 }: { modelPath: string; scale?: number }) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef<THREE.Object3D>(null)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material.side = THREE.DoubleSide
        // Ensure material is properly initialized
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial()
        }
      }
    })
    return clone
  }, [scene])

  return <primitive ref={modelRef} object={clonedScene} scale={scale} />
}

export default function GLBLoaderTimeline({
  modelPath,
  autoRotate = true,
  scale = 1.5,
}: GLBLoaderTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Cleanup WebGL context on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        const gl = canvasRef.current.getContext("webgl")
        if (gl) {
          const ext = gl.getExtension("WEBGL_lose_context")
          if (ext) {
            ext.loseContext()
          }
        }
      }
    }
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ position: [0, 0, 4], fov: 50}}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0) 
        }}
      >
        <Suspense fallback={null}>
          <Stage
            environment="city"
            intensity={0.6}
            shadows={{ type: "contact", opacity: 0.5, blur: 2 }}
          >
            <Model modelPath={modelPath} scale={scale} />
          </Stage>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload models if necessary
useGLTF.preload