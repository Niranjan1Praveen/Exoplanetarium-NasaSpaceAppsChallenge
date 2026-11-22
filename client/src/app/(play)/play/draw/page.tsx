"use client";
// Draw a planet in 2D, watch it wrap onto a 3D sphere, and let Gemini guess its type.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import LazyVisible from "@/components/reusableComponents/lazyVisible";
import Toolbar from "@/components/draw/Toolbar";
import { createPlanetScene, type PlanetScene } from "@/utils/draw/scene";
import { circleTexture, colorShares, loadImage } from "@/utils/draw/colors";
import { classifyPlanet, ERROR_LABEL, messageFor } from "@/utils/draw/classify";
import { saveRow, useSupabase } from "@/utils/supabase";

const Particles = dynamic(() => import("@/components/ui/particles").then((m) => m.Particles), { ssr: false });

const BOX = "aspect-square w-full max-w-[min(400px,80vw)] overflow-hidden border-4 shadow-2xl";

export default function Page() {
  const sketch = useRef<ReactSketchCanvasRef>(null);
  const hidden = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const planet = useRef<PlanetScene | null>(null);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);
  const [eraser, setEraser] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const db = useSupabase();

  // Build the 3D scene once and tear it down on unmount
  useEffect(() => {
    if (!box.current) return;
    planet.current = createPlanetScene(box.current);
    return () => planet.current?.dispose();
  }, []);

  // Grab the current sketch as an image
  const snapshot = async () => (sketch.current ? loadImage(await sketch.current.exportImage("png")) : null);

  // Copy the sketch onto the sphere
  const refreshTexture = async () => {
    try {
      const img = await snapshot();
      if (img) planet.current?.setTexture(circleTexture(img));
    } catch (err) {
      console.error("Error updating planet texture:", err);
    }
  };

  // Count colours, update the planet, then ask Gemini what it looks like
  const analyze = async () => {
    const img = await snapshot();
    if (!img || !hidden.current) return;
    const stats = colorShares(img, hidden.current);
    await refreshTexture();
    const result = await classifyPlanet(stats);
    setLabel(result);
    if (result !== ERROR_LABEL) saveRow(db, "drawings", { colors: stats, label: result }); // keep a history of creations
  };

  const clear = () => {
    sketch.current?.clearCanvas();
    setLabel(null);
    setTimeout(refreshTexture, 100);
  };

  // Eraser is just painting white
  const toggleEraser = () => {
    setColor(eraser ? "#000000" : "white");
    setEraser(!eraser);
  };

  const info = label ? messageFor(label) : null;
  const retry = label === "Unknown" || label === ERROR_LABEL;

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-clip bg-background px-4 pb-16">
      <LazyVisible className="absolute inset-0" rootMargin="0px">
        <Particles className="absolute inset-0" quantity={150} size={0.1} ease={80} refresh />
      </LazyVisible>

      <h1 className="relative mt-6 mb-3 text-center text-2xl font-bold sm:text-3xl">Color Your 3D Exoplanet</h1>
      <p className="relative mb-4 max-w-md text-center text-sm text-muted-foreground">
        Draw on the 2D canvas and watch your creation come to life on the 3D planet.
      </p>
      <Link href="/play" className="relative mb-4 inline-flex items-center gap-1 text-sm hover:underline">
        <ArrowLeft className="size-4" /> Back to Play
      </Link>

      <Toolbar color={color} size={size} eraser={eraser} onColor={setColor} onSize={setSize}
        onAnalyze={analyze} onClear={clear} onToggleEraser={toggleEraser} />

      <div className="relative flex w-full max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row">
        <div className="flex w-full flex-col items-center">
          <h3 className="mb-2 text-lg font-semibold">Draw Here</h3>
          <div className={`${BOX} rounded-full`}>
            {/* Small delay after each stroke so we don't rebuild the texture constantly */}
            <ReactSketchCanvas ref={sketch} strokeColor={color} strokeWidth={size}
              onStroke={() => setTimeout(refreshTexture, 100)} width="100%" height="100%" style={{ cursor: "crosshair" }} />
          </div>
        </div>
        <div className="flex w-full flex-col items-center">
          <h3 className="mb-2 text-lg font-semibold">Your 3D Planet</h3>
          <div ref={box} className={`${BOX} rounded-lg`} />
          <p className="mt-2 text-center text-xs text-muted-foreground">Drag to rotate · Scroll or pinch to zoom</p>
        </div>
      </div>

      <canvas ref={hidden} style={{ display: "none" }} />

      {info && (
        <div className="relative mt-6 w-full max-w-2xl rounded-2xl border bg-card/80 p-5 text-center shadow-lg backdrop-blur sm:p-6">
          <h2 className="mb-3 text-xl font-bold text-primary sm:text-2xl">{info.title}</h2>
          <p className="mb-4 text-muted-foreground sm:text-lg">{info.message}</p>
          {retry && (
            <button onClick={clear}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90">
              Try Creating Another Planet
            </button>
          )}
          <div className="mt-4 text-sm text-muted-foreground">Keep drawing to update your 3D planet in real time.</div>
        </div>
      )}
    </div>
  );
}
