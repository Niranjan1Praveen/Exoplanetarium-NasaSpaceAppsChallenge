# CLAUDE.md — Exoplanetarium

Entry point for Claude Code sessions and engineers new to this repository.
It describes the repository **as it currently exists**, not an intended or idealized design.

> **Conventions used throughout `docs/`**
> - **UNKNOWN** — not determinable from the repository. Never guessed.
> - **UNUSED** — present in the repository but not referenced by any running code path.
> - Rationale is stated only where repository evidence supports it. See [docs/DECISIONS.md](docs/DECISIONS.md).

---

## Project purpose

Exoplanetarium is a NASA Space Apps Challenge 2025 submission (team CODE4CHANGE) for the problem
statement *"A World Away: Hunting for Exoplanets with AI"*. It combines:

- an ML classifier that labels transit detections as **False Positive / Candidate / Confirmed**,
- an atmosphere-data API serving transit light-curve and transmission-spectra data,
- an educational/interactive Next.js frontend (3D models, discovery methods, mission timeline, AI planet drawing).

---

## Repository structure

```
.
├── CLAUDE.md                  ← this file
├── README.md                  ← hackathon submission overview (see caveat below)
├── docs/                      ← durable documentation layer
├── client/                    ← Next.js 15 frontend (App Router, TypeScript)
├── server/
│   ├── atmosphere/            ← Flask JSON API  (port 5000)
│   └── classifier/            ← Flask HTML app  (port 5003) + models + data + training
├── research/                  ← ML research notebook (NOT production)
├── designs/                   ← static PNG screenshots used by README.md
└── test.txt                   ← scratch file, contents "Hello!" — UNUSED
```

> ⚠️ **`README.md` is a submission narrative, not a technical spec.** Several of its claims do not
> match the code — notably a `server/requirements.txt` that does not exist, and an AI/ML stack listing
> CNN, PCA/t-SNE, K-Means, DBSCAN, Isolation Forest and Autoencoders, none of which appear anywhere in
> the repository. Discrepancies are catalogued in [docs/DECISIONS.md](docs/DECISIONS.md#appendix--readmemd-vs-repository-reality).
> **Trust the code over the README.**

---

## Major applications

| # | Application | Path | Type | Port | Entry point |
|---|---|---|---|---|---|
| 1 | Frontend | `client/` | Next.js 15 / React 19 | 3000 | `client/src/app/layout.tsx` |
| 2 | Atmosphere API | `server/atmosphere/` | Flask, JSON only, CORS on | 5000 | `server/atmosphere/app.py` |
| 3 | Classifier | `server/classifier/` | Flask, server-rendered HTML | 5003 | `server/classifier/app.py` |

**How they connect** — there is no API gateway and no shared client library:

- Frontend → Atmosphere: two hardcoded `fetch("http://localhost:5000/...")` calls in
  `client/src/app/(lab)/lab/atmosphericAnalysis/page.tsx`.
- Frontend → Classifier: a plain hyperlink `<Link href="http://127.0.0.1:5003">` in
  `client/src/components/labDashboard/sidebar.tsx`. The classifier is **navigated to**, never called as an API.
- The frontend has **no Next.js API routes** (`client/src/app/` contains no `route.ts`).

Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/API.md](docs/API.md)

---

## Production vs research — a hard boundary

| Category | Location | Status |
|---|---|---|
| **Production inference** | `server/classifier/app.py`, `server/classifier/models/*.pkl` | Serves live predictions |
| **Production API** | `server/atmosphere/app.py` | Serves live data |
| **Production frontend** | `client/src/` | Live UI |
| **Training code** | `server/classifier/training/*.py` | ⚠️ Cannot run as-is — hardcoded `D:\exoplanet\...` paths |
| **Research** | `research/` | Standalone study; **nothing in `research/` is imported by any application** |
| **Legacy / unused** | see table below | Present but unreachable |

`research/` was produced additively and does not modify or feed the deployed system. Its model
(`research/outputs/research_model.joblib`) is **not** loaded by `server/classifier/app.py`.
See [docs/ML_MODEL.md](docs/ML_MODEL.md#8-research-model--not-production).

### Known unused / legacy items

| Item | Why it is unused |
|---|---|
| `server/atmosphere/templates/`, `server/atmosphere/static/` | `app.py` returns JSON only; never calls `render_template` |
| `server/atmosphere/m.py` | 20-line standalone CSV-inspection script |
| `server/classifier/training/inspect_columns.py` | Standalone column-printing script |
| `server/classifier/models/ensemble_probs.npy` | Written by training; never read at inference |
| `server/classifier/data/raw/lightcurves.csv` (53 MB) | Not read by any code path |
| `server/classifier/__pycache__/model_loader.*.pyc`, `preprocess.*.pyc` | Compiled modules with **no `.py` source** and no importers |
| `client/public/train/*.csv` (7.4 MB) | Not referenced anywhere in `client/src/` |
| `GET /api/planets` (atmosphere) | Implemented but never called by the frontend |
| `test.txt` | Scratch file |

---

## How to start the project

Three processes, started independently. There is no orchestrator (no Docker Compose, no Procfile).

```bash
cd client && npm install && npm run dev          # → http://localhost:3000
```

```bash
cd server/atmosphere && python app.py            # → http://localhost:5000
```

```bash
cd server/classifier && python app.py            # → http://127.0.0.1:5003
```

⚠️ **`pip install -r requirements.txt` will not work.** The only `requirements.txt` in the repository
is `server/classifier/requirements.txt` and it is **0 bytes**. Install dependencies manually — see
[docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

## Important constraints

1. **Backend URLs are hardcoded to localhost.** No `NEXT_PUBLIC_API_URL` or equivalent exists. The
   frontend cannot reach a deployed backend without a code change. This is the single largest
   deployment blocker — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#3-deployment-blockers).
2. **No Python dependency manifest has content.** Reproducing either backend requires reading imports.
3. **Training scripts hardcode `D:\exoplanet\...`** and read/write paths that are not the repository's
   own `data/` and `models/` directories. They cannot retrain the shipped models without edits.
4. **The classifier UI collects 4 inputs but the model consumes 19 features.** Nine physical parameters
   are filled with fixed placeholder constants at inference time in `create_features()`.
   See [docs/ML_MODEL.md](docs/ML_MODEL.md#6-inference-flow).
5. **Clerk auth gates `/explore`, `/lab`, `/play`** via `client/src/middleware.ts`. Without Clerk keys
   those routes fail.
6. **`NEXT_PUBLIC_GEMINI_API_KEY` is exposed to the browser** by design of the `NEXT_PUBLIC_` prefix;
   the Gemini call in `client/src/app/(play)/play/draw/page.tsx` runs client-side.
7. **Do not modify application behavior** when working in `research/` or `docs/`.

---

## Documentation index

| Document | Covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Components, diagram, ports, boundaries, cross-directory dependencies, independent deployability |
| [docs/API.md](docs/API.md) | Every HTTP endpoint, parameters, responses, consumers, CORS |
| [docs/ML_MODEL.md](docs/ML_MODEL.md) | Production classifier, artifacts, preprocessing, inference flow, training scripts, research separation |
| [docs/DATA.md](docs/DATA.md) | Every dataset, purpose, schema, runtime/training/research usage, deployment necessity |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Runtimes, dependencies, env vars, ports, manifest gaps |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Fresh-clone setup, per-service startup, testing, training |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Prerequisites per service, blockers, unresolved decisions |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Design decisions with evidence; rationale marked UNKNOWN where unsupported |
| [research/README.md](research/README.md) | The research study and its measured results |
