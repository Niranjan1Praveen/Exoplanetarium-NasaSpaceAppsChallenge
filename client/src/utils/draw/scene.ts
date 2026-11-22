// A tiny Three.js scene: one textured planet you can drag to spin and scroll to zoom.
import * as THREE from "three";

export type PlanetScene = {
  setTexture: (canvas: HTMLCanvasElement) => void;
  dispose: () => void;
};

// Solid colour canvas used before the user draws anything
function plainCanvas(fill: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  if (ctx) { ctx.fillStyle = fill; ctx.fillRect(0, 0, 512, 512); }
  return c;
}

export function createPlanetScene(box: HTMLDivElement): PlanetScene {
  const scene = new THREE.Scene(); // transparent background so the page shows through
  const cam = new THREE.PerspectiveCamera(75, box.clientWidth / box.clientHeight, 0.1, 1000);
  cam.position.z = 5;

  const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  gl.setSize(box.clientWidth, box.clientHeight);
  gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  box.appendChild(gl.domElement);

  let tex = new THREE.CanvasTexture(plainCanvas("#4F46E5"));
  const geo = new THREE.SphereGeometry(2, 64, 64);
  const mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 30 });
  const planet = new THREE.Mesh(geo, mat);
  scene.add(planet, new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  // Drag (mouse or finger) rotates the planet
  let last: { x: number; y: number } | null = null;
  const spin = (x: number, y: number) => {
    if (last) { planet.rotation.y += (x - last.x) * 0.01; planet.rotation.x += (y - last.y) * 0.01; }
    last = { x, y };
  };
  const stop = () => { last = null; };
  const down = (e: MouseEvent) => { last = { x: e.clientX, y: e.clientY }; };
  const move = (e: MouseEvent) => { if (last) spin(e.clientX, e.clientY); };
  const touchStart = (e: TouchEvent) => { const t = e.touches[0]; if (t) last = { x: t.clientX, y: t.clientY }; };
  const touchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t || !last) return;
    e.preventDefault(); // rotate the planet instead of scrolling the page
    spin(t.clientX, t.clientY);
  };
  // Scroll zooms, clamped so the planet never vanishes
  const wheel = (e: WheelEvent) => { cam.position.z = Math.max(3, Math.min(10, cam.position.z + e.deltaY * 0.01)); };
  const resize = () => {
    cam.aspect = box.clientWidth / box.clientHeight;
    cam.updateProjectionMatrix();
    gl.setSize(box.clientWidth, box.clientHeight);
  };

  const el = gl.domElement;
  const events: Array<[string, EventListener, AddEventListenerOptions?]> = [
    ["mousedown", down as EventListener], ["mousemove", move as EventListener],
    ["mouseup", stop], ["mouseleave", stop], ["wheel", wheel as EventListener],
    ["touchstart", touchStart as EventListener, { passive: true }],
    ["touchmove", touchMove as EventListener, { passive: false }], ["touchend", stop],
  ];
  events.forEach(([n, fn, o]) => el.addEventListener(n, fn, o));
  window.addEventListener("resize", resize);

  // Render loop; the id lets us stop it on unmount
  let frame = 0;
  const loop = () => { frame = requestAnimationFrame(loop); gl.render(scene, cam); };
  loop();

  return {
    setTexture(canvas) {
      tex.dispose();
      tex = new THREE.CanvasTexture(canvas);
      mat.map = tex;
      mat.needsUpdate = true;
    },
    dispose() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      events.forEach(([n, fn]) => el.removeEventListener(n, fn));
      if (box.contains(el)) box.removeChild(el);
      [gl, geo, mat, tex].forEach((x) => x.dispose());
    },
  };
}
