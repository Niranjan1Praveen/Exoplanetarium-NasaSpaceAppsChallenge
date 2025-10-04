// main.js — Exoplanet Atmos dashboard (CSP-safe)

/* ------------------------ utilities ------------------------ */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function setOptions(el, values) {
  el.innerHTML = "";
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    el.appendChild(opt);
  }
}

function darkLayout(title, xLabel, yLabel) {
  return {
    title: { text: title, font: { color: "#fff" } },
    plot_bgcolor: "#000",
    paper_bgcolor: "#000",
    margin: { t: 40, r: 20, b: 60, l: 70 },
    xaxis: {
      title: { text: xLabel, font: { color: "#fff" } },
      tickfont: { color: "#fff" },
      gridcolor: "rgba(255,255,255,0.12)",
      zerolinecolor: "rgba(255,255,255,0.18)",
      linecolor: "#fff",
      color: "#fff"
    },
    yaxis: {
      title: { text: yLabel, font: { color: "#fff" } },
      tickfont: { color: "#fff" },
      gridcolor: "rgba(255,255,255,0.12)",
      zerolinecolor: "rgba(255,255,255,0.18)",
      linecolor: "#fff",
      color: "#fff"
    },
    showlegend: true,
    legend: { font: { color: "#fff" } }
  };
}

/* -------------------- bootstrap (CSP-safe) -------------------- */
function loadBootstrapTypePlanet() {
  // Read non-executable JSON from the DOM (avoids inline JS blocked by CSP)
  const el = document.getElementById("bootstrap-data");
  try {
    window.TYPE_PLANET = el ? JSON.parse(el.textContent) : {};
  } catch (e) {
    console.error("Failed to parse bootstrap TYPE_PLANET JSON:", e);
    window.TYPE_PLANET = {};
  }
}

/* -------------------- molecules rendering -------------------- */
function renderMolecules(mols) {
  const host = document.getElementById("moleculeList");
  host.innerHTML = "";
  if (!mols || !mols.length) {
    const p = document.createElement("p");
    p.className = "molecule-empty";
    p.textContent = "No molecule detections reported for this planet.";
    host.appendChild(p);
    return;
  }
  for (const m of mols) {
    const chip = document.createElement("div");
    chip.className = "molecule-chip";
    chip.innerHTML = `<span class="sym">${m.symbol}</span><span class="name">${m.name}</span>`;
    host.appendChild(chip);
  }
}

/* --------------------------- plotting --------------------------- */
async function drawForPlanet(planet) {
  const payload = await fetchJSON(`/data?planet=${encodeURIComponent(planet)}`);

  // ===== Transit =====
  const tDiv = document.getElementById("transitChart");
  const t = payload.transit || {};

  const observed = {
    x: t.time || [],
    y: t.brightness || [],
    mode: "markers",
    name: "Observed",
    marker: { size: 5, opacity: 0.9, color: "#ffffff", line: { width: 0 } }
  };

  const model = {
    x: t.time || [],
    y: t.model_brightness || [],
    mode: "lines",
    name: "Best Fit Model",
    line: { width: 3, color: "#bbbbbb" }
  };

  const tLayout = darkLayout("Transit Light Curve", "Elapsed Time (hours)", "Relative Brightness");
  const ann = [];
  (t.labels || []).forEach(a => {
    const raw = String(a.text || "");
    if (/^starlight$/i.test(raw.trim())) {
      ann.push({
        x: a.x, y: 1.02, xref: "x", yref: "paper",
        text: "Starlight", showarrow: false,
        font: { color: "#fff", size: 12 }, align: "center"
      });
    } else {
      ann.push({
        x: a.x, y: a.y, xref: "x", yref: "y",
        text: "Blocked by planet & atmosphere",
        showarrow: false,
        font: { color: "#fff", size: 12 },
        align: "center",
        yshift: -6
      });
    }
  });
  tLayout.annotations = ann;
  Plotly.newPlot(tDiv, [observed, model], tLayout, { displayModeBar: false });

  // ===== Spectra =====
  const sDiv = document.getElementById("spectraChart");
  const s = payload.spectra || {};
  const traces = [];

  if ((s.morning || []).length) {
    traces.push({
      x: s.wavelength_morning || [],
      y: s.morning,
      mode: "lines+markers",
      name: "Morning",
      line: { width: 2, color: "#ffffff" },
      marker: { size: 5, opacity: 0.9, color: "#ffffff" }
    });
  }
  if ((s.evening || []).length) {
    traces.push({
      x: s.wavelength_evening || [],
      y: s.evening,
      mode: "lines+markers",
      name: "Evening",
      line: { width: 2, dash: "dot", color: "#bbbbbb" },
      marker: { size: 5, opacity: 0.9, color: "#bbbbbb" }
    });
  }

  const sLayout = darkLayout(
    "Transmission Spectra (Morning vs Evening)",
    "Wavelength (μm)",
    "Amount of Light Blocked"
  );
  sLayout.annotations = (s.labels || []).map(a => ({
    x: a.x, y: a.y, xref: "x", yref: "y",
    text: `${a.name} (${a.symbol})`,
    showarrow: false,
    font: { color: "#fff", size: 12 }
  }));
  Plotly.newPlot(sDiv, traces, sLayout, { displayModeBar: false });

  // ===== Molecules panel (prefer explicit list from API; else fallback from labels) =====
  const mols = (payload.molecules && payload.molecules.length)
    ? payload.molecules
    : (s.labels || []).map(a => ({ symbol: a.symbol, name: a.name }));

  // de-duplicate by symbol
  const seen = new Set();
  const dedup = [];
  for (const m of mols) {
    if (!m || !m.symbol) continue;
    if (!seen.has(m.symbol)) { seen.add(m.symbol); dedup.push(m); }
  }
  renderMolecules(dedup);
}

/* --------------------------- init --------------------------- */
function setup() {
  loadBootstrapTypePlanet(); // CSP-safe bootstrapping

  const typeSelect = document.getElementById("typeSelect");
  const planetSelect = document.getElementById("planetSelect");

  const types = Object.keys(window.TYPE_PLANET || {}).sort();
  setOptions(typeSelect, types);
  const firstType = types[0] || null;
  if (firstType) setOptions(planetSelect, window.TYPE_PLANET[firstType]);

  typeSelect.addEventListener("change", () => {
    const t = typeSelect.value;
    const planets = window.TYPE_PLANET[t] || [];
    setOptions(planetSelect, planets);
    if (planets[0]) drawForPlanet(planets[0]);
  });

  planetSelect.addEventListener("change", () => {
    if (planetSelect.value) drawForPlanet(planetSelect.value);
  });

  const initPlanet = (window.TYPE_PLANET[firstType] || [])[0];
  if (initPlanet) drawForPlanet(initPlanet);
}

document.addEventListener("DOMContentLoaded", setup);
