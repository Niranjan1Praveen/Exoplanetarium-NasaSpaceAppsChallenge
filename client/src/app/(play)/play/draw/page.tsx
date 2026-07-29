"use client";

import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as THREE from "three";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import LazyVisible from "@/components/reusableComponents/lazyVisible";

const Particles = dynamic(
  () => import("@/components/ui/particles").then((m) => m.Particles),
  { ssr: false }
);

interface ColorStats {
  [color: string]: number;
}

const Page = () => {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [colorStats, setColorStats] = useState<ColorStats | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
  );

  // Three.js initialization
  useEffect(() => {
    if (!threeContainerRef.current) return;

    const container = threeContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene. Left transparent (the renderer has alpha) so the page's dark
    // background shows through instead of a light grey square.
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Orbit Controls - Using simple mouse controls instead of OrbitControls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };

      if (scene) {
        const sphere = scene.children.find(
          (child) => child instanceof THREE.Mesh
        );
        if (sphere) {
          sphere.rotation.y += deltaMove.x * 0.01;
          sphere.rotation.x += deltaMove.y * 0.01;
        }
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (camera) {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(3, Math.min(10, camera.position.z));
      }
    };

    // Touch equivalents, so the planet can be rotated on a phone.
    const rotateBy = (dx: number, dy: number) => {
      const sphere = scene.children.find((child) => child instanceof THREE.Mesh);
      if (sphere) {
        sphere.rotation.y += dx * 0.01;
        sphere.rotation.x += dy * 0.01;
      }
    };

    let lastTouch: { x: number; y: number } | null = null;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) lastTouch = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || !lastTouch) return;
      // Dragging the planet should rotate it, not scroll the page.
      e.preventDefault();
      rotateBy(t.clientX - lastTouch.x, t.clientY - lastTouch.y);
      lastTouch = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = () => {
      lastTouch = null;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    // Create initial canvas for texture
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 512;
    tempCanvas.height = 512;
    const ctx = tempCanvas.getContext("2d");
    if (ctx) {
      // Create a default blue planet texture
      ctx.fillStyle = "#4F46E5";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Create texture from canvas
    const initialTexture = new THREE.CanvasTexture(tempCanvas);
    setTexture(initialTexture);

    // Sphere geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // Material with canvas texture
    const material = new THREE.MeshPhongMaterial({
      map: initialTexture,
      shininess: 30,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Animation loop. The frame id is tracked so the loop actually stops on
    // unmount instead of rendering into a disposed context forever.
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    setScene(scene);
    setRenderer(renderer);
    setCamera(camera);

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mouseleave", onMouseUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      initialTexture.dispose();
    };
  }, []);

  // Update texture when canvas changes
  const updatePlanetTexture = async () => {
    if (!canvasRef.current || !scene) return;

    try {
      const dataUrl = await canvasRef.current.exportImage("png");
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        // Create a square canvas for the texture
        const textureCanvas = document.createElement("canvas");
        const size = 512;
        textureCanvas.width = size;
        textureCanvas.height = size;
        const ctx = textureCanvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);

          // Draw the sketch canvas content in a circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();
        }

        // Update texture
        if (texture) {
          texture.dispose();
        }
        const newTexture = new THREE.CanvasTexture(textureCanvas);
        setTexture(newTexture);

        // Update sphere material
        const sphere = scene.children.find(
          (child) => child instanceof THREE.Mesh
        );
        if (sphere && sphere instanceof THREE.Mesh) {
          (sphere.material as THREE.MeshPhongMaterial).map = newTexture;
          (sphere.material as THREE.MeshPhongMaterial).needsUpdate = true;
        }
      };
    } catch (error) {
      console.error("Error updating planet texture:", error);
    }
  };

  // Kid-friendly messages for each classification
  const getClassificationMessage = (classification: string) => {
    const messages: { [key: string]: { title: string; message: string } } = {
      Terrestrial: {
        title: "🌍 Rocky Planet Explorer!",
        message:
          "Wow! You've created a rocky planet just like Earth! This could be home to alien mountains, valleys, and maybe even space creatures! Perfect for future space explorers to visit!",
      },
      "Super Earth": {
        title: "🪐 Super Earth Discovered!",
        message:
          "Amazing! You've discovered a Super Earth - a giant rocky planet with super cool landscapes! It might have enormous canyons and mega volcanoes. What an incredible find!",
      },
      "Neptune-like": {
        title: "🔮 Ice Giant Wizard!",
        message:
          "Brilliant! You've painted a beautiful ice giant with swirling blue magic! This planet has super winds and mysterious deep oceans. You're a cosmic artist!",
      },
      "Gas Giants": {
        title: "🎨 Gas Giant Masterpiece!",
        message:
          "Spectacular! You've created a majestic gas giant with colorful swirling storms! This giant planet has no solid ground - it's like a giant space cloud painting!",
      },
      Unknown: {
        title: "🚀 Mysterious Space Object!",
        message:
          "Whoa! You've discovered something completely new and mysterious! Even our smartest space scientists haven't seen anything like this before. You're a true space pioneer! Want to try creating a different kind of planet?",
      },
      "Error classifying planet.": {
        title: "🛰️ Signal Lost!",
        message:
          "Oops! Our space scanners are having trouble reading your amazing creation. The cosmic dust might be interfering! Please try again, space artist!",
      },
    };

    return (
      messages[classification] || {
        title: "🌌 Cosmic Creation!",
        message:
          "You've made something truly special in space! Keep exploring and creating amazing planets!",
      }
    );
  };

  // Save & Analyze
  const handleSaveAndAnalyze = async () => {
    if (canvasRef.current) {
      const dataUrl = await canvasRef.current.exportImage("png");
      const img = new Image();
      img.src = dataUrl;

      img.onload = async () => {
        const hiddenCanvas = hiddenCanvasRef.current;
        if (!hiddenCanvas) return;

        hiddenCanvas.width = img.width;
        hiddenCanvas.height = img.height;
        const ctx = hiddenCanvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

        const colorCount: ColorStats = {};
        let totalPixels = 0;

        // Circle mask
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const radius = Math.min(centerX, centerY);

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            if (dx * dx + dy * dy > radius * radius) continue;

            const index = (y * img.width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const a = imageData[index + 3];

            if (a === 0) continue;
            if (r > 240 && g > 240 && b > 240) continue; // ignore white

            const rgb = `rgb(${r},${g},${b})`;
            colorCount[rgb] = (colorCount[rgb] || 0) + 1;
            totalPixels++;
          }
        }

        // Percentages
        const percentages: ColorStats = {};
        for (const [clr, count] of Object.entries(colorCount)) {
          percentages[clr] = parseFloat(
            ((count / totalPixels) * 100).toFixed(2)
          );
        }

        setColorStats(percentages);

        // Update the 3D planet texture
        await updatePlanetTexture();

        // Send to Gemini for classification
        await classifyWithGemini(percentages);
      };
    }
  };

  // Send percentages to Gemini
  const classifyWithGemini = async (percentages: ColorStats) => {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });

      const prompt = `
You are an astrophysicist talking to children. 
The following dictionary represents approximate color percentages used in a drawing of a planet:
${JSON.stringify(percentages)}

Classify the planet into one of these categories and provide a fun, engaging description:
1. Terrestrial - "Rocky Planet Explorer!" (mostly browns/greens/grays, Earth-like)
2. Super Earth - "Super Earth Discovered!" (larger rocky planets with extreme variations)
3. Neptune-like - "Ice Giant Wizard!" (dominant blues, aqua, cool tones)
4. Gas Giants - "Gas Giant Masterpiece!" (dominant yellows, oranges, reds, stripes)
5. Unknown - "Mysterious Space Object!" (doesn't match known categories)

Only respond with the exact category name from above.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      setClassification(responseText);
    } catch (error) {
      console.error("Gemini classification error:", error);
      setClassification("Error classifying planet.");
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setColorStats(null);
    setClassification(null);
    // Reset texture to default
    setTimeout(updatePlanetTexture, 100);
  };

  const toggleEraser = () => {
    if (isEraser) {
      setIsEraser(false);
      setColor("#000000");
    } else {
      setIsEraser(true);
      setColor("white");
    }
  };

  // Update texture on stroke end - using the correct event
  const handleStroke = () => {
    // Debounce texture updates to prevent too many rapid updates
    setTimeout(updatePlanetTexture, 100);
  };

  const classificationInfo = classification
    ? getClassificationMessage(classification)
    : null;

  return (
    // Matches the background used across the rest of the site rather than the
    // light-mode gradient this page previously carried.
    <div className="relative flex min-h-screen flex-col items-center overflow-x-clip bg-background px-4 pb-16">
      <LazyVisible className="absolute inset-0" rootMargin="0px">
        <Particles
          className="absolute inset-0"
          quantity={150}
          size={0.1}
          ease={80}
          refresh
        />
      </LazyVisible>

      {/* Title */}
      <h1 className="relative mt-6 mb-3 text-center text-2xl font-bold sm:text-3xl">
        Color Your 3D Exoplanet
      </h1>
      <p className="relative mb-4 max-w-md text-center text-sm text-muted-foreground">
        Draw on the 2D canvas and watch your creation come to life on the 3D
        planet.
      </p>

      <div className="relative mb-4 flex items-center justify-center gap-4">
        <Link
          href={"/play"}
          className="inline-flex items-center gap-1 text-sm hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Play
        </Link>
      </div>

      {/* Toolbar */}
      <div className="relative mb-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-card/80 p-3 shadow-lg backdrop-blur sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Color:</span>
          <input
            type="color"
            value={color}
            disabled={isEraser}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 border-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Size:</span>
          <input
            type="range"
            min={1}
            max={20}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-20"
          />
        </div>

        <button
          onClick={handleSaveAndAnalyze}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          🚀 Analyze Planet
        </button>

        <button
          onClick={handleClear}
          className="rounded-lg bg-destructive px-4 py-2 font-medium text-white shadow-md transition-all hover:opacity-90"
        >
          Clear
        </button>

        <button
          onClick={toggleEraser}
          className={`rounded-lg px-4 py-2 font-medium shadow-md transition-all ${
            isEraser
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-secondary text-secondary-foreground hover:opacity-90"
          }`}
        >
          {isEraser ? "Switch to Draw" : "Use Eraser"}
        </button>
      </div>

      <div className="relative flex w-full max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row">
        {/* 2D Drawing Canvas. Sized in vw on small screens so it never
            overflows, capped at the original 400px on larger ones. */}
        <div className="flex w-full flex-col items-center">
          <h3 className="mb-2 text-lg font-semibold">Draw Here</h3>
          <div className="aspect-square w-full max-w-[min(400px,80vw)] overflow-hidden rounded-full border-4 shadow-2xl">
            <ReactSketchCanvas
              ref={canvasRef}
              strokeColor={color}
              strokeWidth={strokeWidth}
              onStroke={handleStroke}
              width="100%"
              height="100%"
              style={{ cursor: "crosshair" }}
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center">
          <h3 className="mb-2 text-lg font-semibold">Your 3D Planet</h3>
          <div
            ref={threeContainerRef}
            className="aspect-square w-full max-w-[min(400px,80vw)] overflow-hidden rounded-lg border-4 shadow-2xl"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Drag to rotate · Scroll or pinch to zoom
          </p>
        </div>
      </div>

      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />

      {classificationInfo && (
        <div className="relative mt-6 w-full max-w-2xl rounded-2xl border bg-card/80 p-5 text-center shadow-lg backdrop-blur sm:p-6">
          <h2 className="mb-3 text-xl font-bold text-primary sm:text-2xl">
            {classificationInfo.title}
          </h2>
          <p className="mb-4 text-muted-foreground sm:text-lg">
            {classificationInfo.message}
          </p>

          {(classification === "Unknown" ||
            classification === "Error classifying planet.") && (
            <button
              onClick={handleClear}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90"
            >
              Try Creating Another Planet
            </button>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Keep drawing to update your 3D planet in real time.
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
