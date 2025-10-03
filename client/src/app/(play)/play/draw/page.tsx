"use client";

import React, { useRef, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

interface ColorStats {
  [color: string]: number;
}

const Page = () => {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [colorStats, setColorStats] = useState<ColorStats | null>(null);

  // Save & Analyze
  const handleSaveAndAnalyze = async () => {
    if (canvasRef.current) {
      const dataUrl = await canvasRef.current.exportImage("png");

      // Create image
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
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

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a === 0) continue; // Skip transparent pixels

          const rgb = `rgb(${r},${g},${b})`;
          colorCount[rgb] = (colorCount[rgb] || 0) + 1;
          totalPixels++;
        }

        // Convert to percentages
        const percentages: ColorStats = {};
        for (const [clr, count] of Object.entries(colorCount)) {
          percentages[clr] = parseFloat(
            ((count / totalPixels) * 100).toFixed(2)
          );
        }

        setColorStats(percentages);
      };
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setColorStats(null);
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

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-gray-100">
      {/* Title */}
      <h1 className="text-2xl font-bold mt-4 mb-2">🌍 Color Your Planet</h1>

      {/* Toolbar */}
      <div className="p-2 flex gap-4 items-center bg-white shadow-md rounded mb-4">
        <input
          type="color"
          value={color}
          disabled={isEraser}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 border rounded"
        />
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        />
        <button
          onClick={handleSaveAndAnalyze}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Save & Analyze
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear
        </button>
        <button
          onClick={toggleEraser}
          className={`px-4 py-2 rounded ${
            isEraser ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          {isEraser ? "Eraser On" : "Eraser Off"}
        </button>
      </div>

      {/* Circular Planet Canvas */}
      <div
        className="flex items-center justify-center"
        style={{
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid #ccc",
          background: "white",
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          strokeColor={color}
          strokeWidth={strokeWidth}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Hidden canvas for analysis */}
      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />

      {/* Color Analysis Results */}
      {colorStats && (
        <div className="mt-6 w-2/3">
          <h2 className="text-lg font-semibold mb-2">Color Usage:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(colorStats).map(([clr, pct]) => (
              <div
                key={clr}
                className="flex items-center gap-2 p-2 rounded border"
              >
                <div className="w-6 h-6 rounded" style={{ background: clr }} />
                <span>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
