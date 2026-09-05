# Architecture

Current architecture of the Exoplanetarium repository. Describes what exists today.
See [../CLAUDE.md](../CLAUDE.md) for the project entry point.

---

## 1. System overview

Three independent processes with **no shared runtime, no service discovery, no gateway, and no
build-time coupling**. Each has its own dependency set and its own lifecycle.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
└───────────────┬─────────────────────────────────────┬────────────────────┘
                │                                     │
                │ (1) page loads / XHR                │ (3) full-page navigation
                ▼                                     ▼
┌──────────────────────────────┐          ┌──────────────────────────────────┐
│  client/  — Next.js 15       │          │ server/classifier/ — Flask       │
│  localhost:3000              │          │ 127.0.0.1:5003                   │
│                              │          │                                  │
│  App Router, React 19        │          │  GET  /         → index.html     │
│  Clerk middleware guards     │          │  POST /predict  → result.html    │
│    /explore /lab /play       │          │                                  │
│  NO Next API routes          │          │  Server-rendered Jinja2 HTML.    │
│                              │          │  Not consumed as an API.         │
│  ┌────────────────────────┐  │          │                                  │
│  │ Gemini call (browser)  │  │          │  loads at import time:           │
│  │ gemini-3.5-flash-lite  │──┼──▶ Google│    lightgbm_model.pkl            │
│  └────────────────────────┘  │   API    │    xgboost_model.pkl             │
└───────────────┬──────────────┘          │    scaler.pkl                    │
                │                         │    feature_cols.pkl              │
                │ (2) fetch()             └──────────────────────────────────┘
                │ NEXT_PUBLIC_ATMOSPHERE_URL
                ▼
┌──────────────────────────────────────────┐
│ server/atmosphere/ — Flask + Flask-CORS  │
│ 0.0.0.0:5000                             │
│                                          │
│  GET /            → {"message": ...}     │
│  GET /api/types                          │
│  GET /api/planets     ← UNUSED by client │
│  GET /api/data?planet=…                  │
│                                          │
│  loads at import time:                   │
│    iac_exoplanet_atmospheres-*.csv       │
│    (in-memory DataFrame `DF`)            │
└──────────────────────────────────────────┘
```

**Legend of connections**

| # | From | To | Mechanism | Coupling |
|---|---|---|---|---|
| 1 | Browser | `client` | HTTP page load | normal |
| 2 | Browser (client JS) | `atmosphere` | `fetch()` to `${NEXT_PUBLIC_ATMOSPHERE_URL}/api/...` | ✅ configurable (build-time env) |
| 3 | Browser | `classifier` | `<Link href={NEXT_PUBLIC_CLASSIFIER_URL}>` — leaves the SPA | ✅ configurable (build-time env) |
| — | Browser (client JS) | Google Generative AI | `@google/generative-ai` SDK, client-side | external |

---

## 2. Entry points

| Component | Entry file | Symbol / mechanism | Bind |
|---|---|---|---|
| Frontend | `client/src/app/layout.tsx` | Next.js App Router root layout | `next dev` → `:3000` |
| Frontend auth | `client/src/middleware.ts` | `clerkMiddleware`, `createRouteMatcher` | edge middleware |
| Atmosphere | `server/atmosphere/app.py` | WSGI callable `app` — prod: `gunicorn app:app --bind 0.0.0.0:$PORT` | `0.0.0.0:$PORT` |
| Classifier | `server/classifier/app.py` | WSGI callable `app` — prod: `gunicorn app:app --bind 0.0.0.0:$PORT` | `0.0.0.0:$PORT` |

Both modules still expose an `if __name__ == "__main__":` block for local development
(`python app.py`), defaulting to ports 5000 and 5003 with debug **off** unless `FLASK_DEBUG` is set.
In production neither uses Flask's development server.

---

## 3. Ports

| Port | Service | Configurable? |
|---|---|---|
| 3000 | Next.js dev/start | Yes — `next dev -p` |
| 5000 | Atmosphere Flask (local default) | ✅ Yes — `PORT` env var; gunicorn `--bind` in production |
| 5003 | Classifier Flask (local default) | ✅ Yes — `PORT` env var; gunicorn `--bind` in production |

On Render the platform injects `PORT` and the start command binds to it.

---

## 4. Frontend architecture

**Framework:** Next.js 15.5 (App Router) · React 19 · TypeScript (`strict: true`, target ES2017) ·
Tailwind CSS v4 · shadcn/ui (Radix primitives) · Three.js via `@react-three/fiber` + `drei`.

### Route map (`client/src/app/`)

| Route | File | Auth | Backend dependency |
|---|---|---|---|
| `/` | `app/page.tsx` | public | none |
| `/team` | `app/team/page.tsx` | public | none |
| `/sign-in`, `/sign-up` | `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/...` | public | Clerk |
| `/explore` | `app/explore/page.tsx` | 🔒 protected | none |
| `/lab` | `app/(lab)/lab/page.tsx` | 🔒 protected | none |
| `/lab/exoplanet` | `app/(lab)/lab/exoplanet/page.tsx` | 🔒 protected | none — pure 3D (`/models/rocky.glb`) |
| `/lab/atmosphericAnalysis` | `app/(lab)/lab/atmosphericAnalysis/page.tsx` | 🔒 protected | **atmosphere API** |
| `/play` | `app/(play)/play/page.tsx` | 🔒 protected | none |
| `/play/discoveryMethods` | `app/(play)/play/discoveryMethods/page.tsx` | 🔒 protected | none — local `physics.ts` |
| `/play/draw` | `app/(play)/play/draw/page.tsx` | 🔒 protected | **Google Gemini** (client-side) |
| `/play/timeline` | `app/(play)/play/timeline/page.tsx` | 🔒 protected | none — local `missions.ts` |
| `/robots.txt`, `/sitemap.xml` | `app/robots.ts`, `app/sitemap.ts` | public | none |
| `/not-found` | `app/not-found.tsx` | — | none |

Protection is defined in `client/src/middleware.ts`:
`createRouteMatcher(['/explore(.*)', '/lab(.*)', '/play(.*)'])`.

### Component layout

| Path | Contents |
|---|---|
| `client/src/components/ui/` | shadcn/ui primitives |
| `client/src/components/reusableComponents/` | Marketing/shared sections (`faqs`, `footer`, `heroVideo`, `starsBackground`, …) |
| `client/src/components/labDashboard/` | Lab shell, incl. `sidebar.tsx` — **holds the hardcoded classifier link** |
| `client/src/hooks/use-mobile.ts`, `client/src/lib/utils.ts` | Utilities |

### Static assets (`client/public/`)

| Directory | Purpose | Used? |
|---|---|---|
| `models/` | `.glb` 3D models (planets, telescopes) | ✅ via `useGLTF("/models/…")` |
| `textures/` | Planet textures | ✅ |
| `team/`, `logo.png`, `hero-thumbnail.png` | Imagery | ✅ |
| `data/faqs.ts`, `data/workingSteps.ts` | TS data modules imported from `src` | ✅ (`faqs` imported by `reusableComponents/faqs.tsx`) |
| `train/*.csv` (7.4 MB) | TOI + KOI cumulative CSVs | ❌ **UNUSED** — no reference in `client/src/` |

`next.config.ts` sets AVIF/WebP image formats, immutable cache headers for `/models` and `/textures`,
and security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`).

---

## 5. Backend: atmosphere (`server/atmosphere/`)

**Role:** read-only JSON API over one atmospheric-properties CSV.

| Aspect | Detail |
|---|---|
| Framework | Flask + `flask_cors.CORS(app)` — unrestricted, all origins |
| Data load | At **import time**: `DF, META = load_data()` — module-level globals |
| CSV resolution | `os.environ["EXO_DATA_PATH"]`, else first `*.csv` in the module directory via `glob` |
| CSV dialect | `sep=";"`, `engine="python"`, `quoting=csv.QUOTE_NONE`, `on_bad_lines="skip"` |
| Column discovery | `_find_col()` keyword heuristics → `META` dict; **schema is not fixed** |
| Synthetic fallback | `synth_transit()` / `synth_spectra()` generate deterministic curves (seeded by `hash(planet_name)`) when real columns are absent |

Key symbols: `read_csv_exact()`, `_normalize_cols()`, `_find_col()`, `load_data()`, `synth_transit()`,
`synth_spectra()`, `parse_molecules_cell()`, `build_molecule_labels()`, `get_type_planet_map()`.

**Important behavioural note:** because `_find_col()` searches for columns by keyword, and the shipped
CSV lacks explicit time/wavelength columns, most responses are **synthetic** rather than measured.
This is a property of the current code, not a claim about intent. See [DATA.md](DATA.md#2-atmosphere-dataset--the-only-runtime-dataset).

**Unused within this component:** `templates/index.html`, `static/css/styles.css`, `static/js/main.js`
(`app.py` never imports or calls `render_template`), and `m.py`.

---

## 6. Backend: classifier (`server/classifier/`)

**Role:** server-rendered HTML form → ensemble prediction → result page.

| Aspect | Detail |
|---|---|
| Framework | Flask + Jinja2 templates. **No CORS.** |
| Artifact load | At **import time** via `joblib.load()` from `MODEL_DIR = <app.py dir>/models` |
| Session | `app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(32)`, used by `flash()` |
| UI inputs | 4 sliders: `orbital_period`, `transit_depth`, `planet_radius`, `stellar_radius` |
| Model inputs | 19 features (`feature_cols.pkl`) |

Key symbols: `create_features()`, route handlers `index()` and `predict()`, constants
`FEATURES`, `PHYSICAL_FEATURES`, `EPSILON`, `sliders`, `class_map`.

Path handling is repo-relative and portable:
`BASE_DIR = os.path.dirname(os.path.abspath(__file__))` → `MODEL_DIR = BASE_DIR/models`.

Full model detail: [ML_MODEL.md](ML_MODEL.md).

---

## 7. Runtime data & model dependencies

Files that **must exist at process start** or the service fails on import:

| Service | Required at startup | Failure mode if missing |
|---|---|---|
| atmosphere | `server/atmosphere/iac_exoplanet_atmospheres-20251002.csv` (or `EXO_DATA_PATH`) | `FileNotFoundError` raised in `load_data()` at import |
| classifier | `models/lightgbm_model.pkl`, `models/xgboost_model.pkl`, `models/scaler.pkl`, `models/feature_cols.pkl` | `joblib.load` raises at import |
| classifier | `templates/index.html`, `templates/result.html` | `TemplateNotFound` at request time |
| client | `public/models/*.glb`, `public/textures/*` | 3D scenes fail to render |

**Not required at runtime:** everything under `server/classifier/data/` (raw + processed),
`models/ensemble_probs.npy`, `client/public/train/`, and all of `research/`.
See [DATA.md](DATA.md#8-deployment-requirement-summary).

---

## 8. Cross-directory dependencies

| Dependency | Direction | Nature | Risk |
|---|---|---|---|
| `client` → `server/atmosphere` | runtime HTTP | `NEXT_PUBLIC_ATMOSPHERE_URL` in `atmosphericAnalysis/page.tsx` (2 sites) | ✅ configurable per environment |
| `client` → `server/classifier` | runtime hyperlink | `NEXT_PUBLIC_CLASSIFIER_URL` in `labDashboard/sidebar.tsx` | ✅ configurable per environment |
| `research` → `server/classifier` | **read-only, offline** | Notebook reads `data/raw/*.csv`, `data/processed/**`, `models/*.pkl` | none at runtime |
| `server/classifier/training` → filesystem | offline | Hardcoded `D:\exoplanet\...`, **not** the repo's own dirs | ⚠️ scripts non-portable |

**There are no Python imports across `server/atmosphere` ↔ `server/classifier`.** The two backends
share no code, no config, and no data.

There is **no build-time dependency** between `client` and either backend — no generated client, no
OpenAPI schema, no shared types. The response shape is duplicated by hand as TypeScript interfaces
(`PlanetData`, `TypePlanetMap`) in `atmosphericAnalysis/page.tsx`.

---

## 9. Independent deployability

| Service | Independently deployable? | Reasoning |
|---|---|---|
| `server/atmosphere` | ✅ **Yes** | Self-contained: one CSV beside `app.py`, no imports from elsewhere, `EXO_DATA_PATH` override, own pinned `requirements.txt` and `.python-version`, own gunicorn start command. |
| `server/classifier` | ✅ **Yes** | Self-contained: repo-relative model paths, no cross-imports, own pinned `requirements.txt` and `.python-version`, own gunicorn start command. Needs only `app.py`, `models/*.pkl` (4 files) and `templates/`. |
| `client` | ✅ **Yes** | Builds and deploys standalone; reaches both backends purely through build-time environment variables. |

**Conclusion:** all three are independently deployable. The two backends remain **separate services**
— they share no code, no configuration, no data and no dependency manifest, and neither imports the
other. The frontend's only coupling is two environment variables. See
[DEPLOYMENT.md](DEPLOYMENT.md).

### Deployment topology

```
Local development                      Production
─────────────────                      ──────────
localhost:3000   next dev              Vercel      client/            (Next.js)
localhost:5000   python app.py         Render      server/atmosphere  (gunicorn)
127.0.0.1:5003   python app.py         Render      server/classifier  (gunicorn)
```

The topology is identical in both environments — three processes, no gateway, no shared runtime.
Only the URLs and the WSGI server differ, and the URLs are supplied as environment variables.

---

## 10. API boundaries

| Boundary | Contract | Versioning | Auth |
|---|---|---|---|
| client ↔ atmosphere | Untyped JSON; TS interfaces hand-maintained client-side | none | none |
| browser ↔ classifier | HTML form POST (`application/x-www-form-urlencoded`) | none | none |
| client ↔ Clerk | `@clerk/nextjs` middleware | SDK | Clerk session |
| browser ↔ Gemini | `@google/generative-ai` SDK, client-side | SDK | `NEXT_PUBLIC_GEMINI_API_KEY` |

Endpoint-level detail: [API.md](API.md).

---

## Related documentation

[API.md](API.md) · [ML_MODEL.md](ML_MODEL.md) · [DATA.md](DATA.md) · [ENVIRONMENT.md](ENVIRONMENT.md) ·
[DEVELOPMENT.md](DEVELOPMENT.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [DECISIONS.md](DECISIONS.md)
