# API Reference

Every HTTP endpoint exposed by the repository's backends, as implemented today.

The frontend (`client/`) exposes **no API routes of its own** — there is no `route.ts` anywhere under
`client/src/app/`. All server endpoints belong to the two Flask applications.

| Service | Base URL (frontend configuration) | Local default | Style |
|---|---|---|---|
| Atmosphere | `NEXT_PUBLIC_ATMOSPHERE_URL` | `http://localhost:5000` | JSON REST |
| Classifier | `NEXT_PUBLIC_CLASSIFIER_URL` | `http://127.0.0.1:5003` | HTML form (server-rendered) |

Base URLs are supplied by environment variables (no trailing slash) and inlined at build time.
**Endpoint paths, request formats and response shapes are unchanged.** The `curl` examples below use
the local defaults.

---

# 1. Atmosphere API — `server/atmosphere/app.py`

Read-only. All data derives from the module-level DataFrame `DF`, loaded once at import.
**CORS: driven by the `CORS_ORIGINS` environment variable.** Unset ⇒ `CORS(app)` — all origins, all
methods (the previous behaviour, and still the local default). When set to a comma-separated
allow-list, only those origins receive `Access-Control-Allow-Origin`.

---

## `GET /`

Health/identity stub.

| | |
|---|---|
| Parameters | none |
| Consumer | none (no frontend caller) |

**Response `200`**
```json
{ "message": "Exoplanet Atmospheres API" }
```

---

## `GET /api/types`

Returns every planet type and the full type → planet mapping in one payload.

| | |
|---|---|
| Parameters | none |
| Handler | `get_types()` → `get_type_planet_map()` |
| Consumer | `client/src/app/(lab)/lab/atmosphericAnalysis/page.tsx` (line ~487) |

**Response `200`**
```json
{
  "types": ["<type>", "..."],
  "type_planet_map": { "<type>": ["<planet>", "..."] }
}
```

**Example**
```bash
curl http://localhost:5000/api/types
```

> The frontend stores `type_planet_map` in state and derives the planet dropdown from it locally.
> This is why `/api/planets` is never called.

---

## `GET /api/planets`  ⚠️ UNUSED

| | |
|---|---|
| Query parameter | `type` (string, required in practice; defaults to `""`) |
| Handler | `planets_for_type()` |
| Consumer | **none** — no caller exists in `client/src/` |

**Response `200`**
```json
{ "planets": ["<planet>", "..."] }
```

An unknown or missing `type` returns `{"planets": []}` with status `200` — no error.

**Example**
```bash
curl "http://localhost:5000/api/planets?type=Hot%20Jupiter"
```

---

## `GET /api/data`

The main payload: transit light curve, transmission spectra, and detected molecules for one planet.

| | |
|---|---|
| Query parameter | `planet` (string; defaults to `""`) |
| Handler | `data_for_planet()` |
| Consumer | `client/src/app/(lab)/lab/atmosphericAnalysis/page.tsx` (line ~521) |

**Response `200`**
```json
{
  "transit": {
    "time": [0.0],
    "brightness": [1.0],
    "model_brightness": [1.0],
    "labels": [{ "x": 0.8, "y": 1.0005, "text": "Starlight" }]
  },
  "spectra": {
    "wavelength_morning": [2.0],
    "morning": [0.02],
    "wavelength_evening": [2.0],
    "evening": [0.02],
    "wavelength": [2.0],
    "labels": [{ "name": "Water", "symbol": "H2O", "x": 2.8, "y": 0.1 }]
  },
  "molecules": [{ "symbol": "H2O", "name": "Water" }],
  "molecules_raw": "<original CSV cell as string>",
  "planet": "<echoed planet name>",
  "success": true
}
```

**Behaviour notes — important for consumers**

| Situation | Actual behaviour |
|---|---|
| Unknown `planet` | Status **`200`**, `success: true`, `row = {}` → fully synthetic curves. **No 404, no error flag.** |
| Real time/brightness columns absent | Falls back to `synth_transit()` — deterministic, seeded by `hash(planet_name)` |
| Real wavelength/morning/evening columns absent | Falls back to `synth_spectra()` |
| No molecules column / nothing detected | `molecules: []`, `labels: []` |
| Molecule outside 2.0–5.2 µm | Omitted from `spectra.labels` (still may appear in `molecules`) |

Molecules are filtered to symbols known to `MOLECULE_LAMBDA` / `FRIENDLY`:
`H2O, CO2, CO, CH4, HCN, SO2, H2S`.

**Example**
```bash
curl "http://localhost:5000/api/data?planet=WASP-39%20b"
```

**Error semantics:** this API defines no error responses. There is no `404`, no validation, and no
error envelope. An unhandled exception surfaces as a Flask `500` HTML page (debug traceback while
`debug=True`). Client code guards only with `try/catch` around `fetch`.

---

# 2. Classifier — `server/classifier/app.py`

Server-rendered HTML. **Not a JSON API and not consumed programmatically.** The frontend links to it
as a separate destination (`client/src/components/labDashboard/sidebar.tsx`).

**CORS: none configured.** Cross-origin `fetch` from the Next.js app would be blocked — but nothing
attempts it, so this is not currently a defect.

---

## `GET /`

| | |
|---|---|
| Parameters | none |
| Handler | `index()` |
| Response | `200 text/html` — renders `templates/index.html` with the `sliders` dict |

`sliders` defines the four form controls, their ranges, defaults, steps and units:

| Field | Min | Max | Default | Unit |
|---|---|---|---|---|
| `orbital_period` | 0.5 | 50 | 15 | days |
| `transit_depth` | 100 | 10000 | 3269 | ppm |
| `planet_radius` | 0.5 | 20 | 6 | R⊕ |
| `stellar_radius` | 0.5 | 2 | 1.05 | R☉ |

---

## `POST /predict`

| | |
|---|---|
| Content-Type | `application/x-www-form-urlencoded` |
| Handler | `predict()` |
| Response | `200 text/html` — renders `templates/result.html` |

**Body parameters** — all four required, all parsed with `float()`:

| Field | Type | Notes |
|---|---|---|
| `orbital_period` | float | days |
| `transit_depth` | float | ppm |
| `planet_radius` | float | Earth radii |
| `stellar_radius` | float | Solar radii |

**Template variables passed to `result.html`**

| Variable | Type | Meaning |
|---|---|---|
| `pred_class` | string | `"False Positive"` \| `"Candidate"` \| `"Confirmed"` |
| `prob_display` | dict | `{"False Positive": 12.34, "Candidate": …, "Confirmed": …}` — percentages rounded to 2dp |
| `ensemble_probs` | list[float] | Raw 3-element probability vector (for charting) |
| `user_input` | dict | The four submitted values |
| `inference` | string | Fixed explanatory sentence |

**Example**
```bash
curl -X POST http://127.0.0.1:5003/predict -d "orbital_period=15&transit_depth=3269&planet_radius=6&stellar_radius=1.05"
```

**Error semantics:** `predict()` wraps its body in `try/except Exception`. On any failure it calls
`flash(str(e), "danger")` and re-renders `index.html` with status `200`. A malformed number therefore
produces a flashed message, **not** a `4xx`. Note this echoes the raw exception string into the page.

Prediction internals (feature construction, scaling, ensembling): [ML_MODEL.md](ML_MODEL.md#6-inference-flow).

---

# 3. External APIs consumed by the frontend

| Provider | Where | Model / SDK | Credential |
|---|---|---|---|
| Google Generative AI | `client/src/app/(play)/play/draw/page.tsx` | `gemini-3.5-flash-lite` via `@google/generative-ai` | `NEXT_PUBLIC_GEMINI_API_KEY` |
| Clerk | `client/src/middleware.ts`, sign-in/up routes | `@clerk/nextjs` | Clerk publishable + secret keys |

The Gemini call executes **in the browser**, so the key is public by construction. See
[ENVIRONMENT.md](ENVIRONMENT.md#5-environment-variables).

Despite the README's mention of a "NASA Exoplanet Archive API", **no runtime call to any NASA endpoint
exists in the repository.** NASA data is present only as committed CSV files — see [DATA.md](DATA.md).

---

## CORS summary

| Service | CORS | Configured where | Adequate for current use? |
|---|---|---|---|
| Atmosphere | Configurable via `CORS_ORIGINS`; unrestricted when unset | `server/atmosphere/app.py` | ✅ Yes — permissive locally, restrictable in production |
| Classifier | None | — | ✅ Yes — only same-origin form posts occur |

In production set `CORS_ORIGINS` to the deployed Vercel origin, e.g.
`CORS_ORIGINS=https://your-app.vercel.app`. Verified in a real browser: an allowed origin succeeds
and a disallowed origin is blocked. See
[DEPLOYMENT.md](DEPLOYMENT.md#1-render--atmosphere-service).

---

## Related documentation

[ARCHITECTURE.md](ARCHITECTURE.md) · [ML_MODEL.md](ML_MODEL.md) · [DATA.md](DATA.md) · [DEPLOYMENT.md](DEPLOYMENT.md)
