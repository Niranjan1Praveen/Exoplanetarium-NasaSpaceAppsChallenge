"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Globe } from "../ui/globe";


const ScrollGlobe = () => {


  return (
    <div className="fixed bottom-6 right-6 w-24 h-24 pointer-events-none">
        <Globe/>
      
    </div>
  );
};

export default ScrollGlobe;
