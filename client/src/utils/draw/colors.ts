// Image helpers for the drawing game: load the sketch, map it to a texture, count colours.

export type ColorStats = Record<string, number>;

// Turn a data URL into a loaded <img>
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });
}

// Square 512px canvas with the sketch clipped to a circle on white, ready for the sphere
export function circleTexture(img: HTMLImageElement, size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, size, size);
    ctx.restore();
  }
  return c;
}

// Percent of each colour inside the circle, skipping transparent and near-white pixels
export function colorShares(img: HTMLImageElement, canvas: HTMLCanvasElement): ColorStats {
  const { width: w, height: h } = img;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return {};
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;

  const cx = w / 2, cy = h / 2, r2 = Math.min(cx, cy) ** 2;
  const counts: ColorStats = {};
  let total = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > r2) continue; // outside the planet
      const i = (y * w + x) * 4;
      const [r, g, b, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]];
      if (a === 0 || (r > 240 && g > 240 && b > 240)) continue; // blank paper
      const key = `rgb(${r},${g},${b})`;
      counts[key] = (counts[key] || 0) + 1;
      total++;
    }
  }
  return Object.fromEntries(
    Object.entries(counts).map(([k, n]) => [k, parseFloat(((n / total) * 100).toFixed(2))])
  );
}
