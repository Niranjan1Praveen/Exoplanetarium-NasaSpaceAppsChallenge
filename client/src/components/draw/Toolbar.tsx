"use client";
// Colour, brush size and the action buttons above the drawing canvas.

type Props = {
  color: string;
  size: number;
  eraser: boolean;
  onColor: (c: string) => void;
  onSize: (n: number) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onToggleEraser: () => void;
};

const BTN = "rounded-lg px-4 py-2 font-medium shadow-md transition-all";

export default function Toolbar({ color, size, eraser, onColor, onSize, onAnalyze, onClear, onToggleEraser }: Props) {
  return (
    <div className="relative mb-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-card/80 p-3 shadow-lg backdrop-blur sm:gap-4">
      <label className="flex items-center gap-2">
        <span className="text-sm font-medium">Color:</span>
        <input type="color" value={color} disabled={eraser} onChange={(e) => onColor(e.target.value)}
          className="w-10 h-10 border-2 rounded-lg cursor-pointer" />
      </label>

      <label className="flex items-center gap-2">
        <span className="text-sm font-medium">Size:</span>
        <input type="range" min={1} max={20} value={size} onChange={(e) => onSize(parseInt(e.target.value))} className="w-20" />
      </label>

      <button onClick={onAnalyze} className={`${BTN} bg-green-500 hover:bg-green-600 text-white hover:shadow-lg`}>
        🚀 Analyze Planet
      </button>
      <button onClick={onClear} className={`${BTN} bg-destructive text-white hover:opacity-90`}>Clear</button>
      <button onClick={onToggleEraser}
        className={`${BTN} hover:opacity-90 ${eraser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
        {eraser ? "Switch to Draw" : "Use Eraser"}
      </button>
    </div>
  );
}
