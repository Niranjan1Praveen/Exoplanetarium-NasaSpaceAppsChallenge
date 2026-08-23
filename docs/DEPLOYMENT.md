# Deployment

Deployment state of the repository **as it exists today**.

> **This document does not propose a deployment architecture.** The repository contains no deployment
> configuration of any kind, so there is nothing to describe beyond prerequisites, blockers and open
> decisions. Choosing a platform is a human decision — see
> [Unresolved deployment decisions](#5-unresolved-deployment-decisions).

---

## 1. Current deployment status

| Question | Answer |
|---|---|
| Is anything deployed today? | **UNKNOWN** — no deployment metadata, URL, or CI record in the repository |
| Is any deployment config committed? | ❌ **No** |
| Has any service been deployed before? | **UNKNOWN** |

**Exhaustive search for deployment configuration found nothing:**

| Looked for | Found |
|---|---|
| `Dockerfile`, `docker-compose.yml` | ❌ |
| `Procfile` | ❌ |
| `render.yaml` | ❌ |
| `vercel.json` | ❌ |
| `*.toml` (`fly.toml`, `railway.toml`, `pyproject.toml`) | ❌ |
| `runtime.txt`, `.python-version`, `.nvmrc` | ❌ |
| `.github/workflows/**` (CI/CD) | ❌ |
| `requirements.txt` with content | ❌ (one file, 0 bytes) |
| `.env.example` | ❌ |

The root `README.md` states *"Deployment: Vercel (Frontend) · Render (Backend)"*. **No configuration
supports this** — it records an intention, not an implemented setup. Treat it as **UNKNOWN**.

Circumstantial evidence of Vercel awareness: `client/src/app/metadata.ts` reads
`VERCEL_PROJECT_PRODUCTION_URL`, and `client/.gitignore` ignores `.vercel`. Neither proves a deployment
exists.

---

## 2. Per-service prerequisites

### 2a. Frontend — `client/`

| Item | Value |
|---|---|
| Build | `npm run build` (Next.js 15, Turbopack) |
| Start | `npm start` → `next start` |
| Node | **UNKNOWN** — undeclared; Next.js 15.5 requires ≥ 18.18 |
| Port | `$PORT`, default 3000 |
| Required env | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Optional env | `NEXT_PUBLIC_GEMINI_API_KEY` (for `/play/draw`), `NEXT_PUBLIC_SITE_URL` |
| Required files | `client/src/**`, `client/public/{models,textures,data/faqs.ts}` |
| Output | Standard Next.js server build (no `output: "standalone"`, no static export) |

⚠️ `client/public/` contains ~44 MB of `.glb` models plus 7.4 MB of **unused** CSVs in `public/train/`,
all of which ship in the deployment bundle.

### 2b. Atmosphere — `server/atmosphere/`

| Item | Value |
|---|---|
| Start | `python app.py` |
| Python | **UNKNOWN** — undeclared |
| Dependencies | `flask flask-cors pandas numpy` (**not declared anywhere**) |
| Port | 5000, hardcoded in `app.run(host="0.0.0.0", port=5000, debug=True)` |
| Host | `0.0.0.0` — externally reachable ✅ |
| Required files | `app.py` + `iac_exoplanet_atmospheres-20251002.csv` (or `EXO_DATA_PATH`) |
| Env | `EXO_DATA_PATH` (optional) |
| Filesystem assumption | Reads its CSV via `glob` of its **own directory** — must be co-located |
| Not required | `templates/`, `static/`, `m.py` (all unused) |

### 2c. Classifier — `server/classifier/`

| Item | Value |
|---|---|
| Start | `python app.py` |
| Python | **UNKNOWN** — undeclared. `.pyc` artifacts imply 3.13 was used |
| Dependencies | `flask pandas numpy joblib` **+ `scikit-learn xgboost lightgbm`** (needed to unpickle) |
| Port | 5003, hardcoded in `app.run(debug=True, port=5003)` |
| Host | ⚠️ **`127.0.0.1`** — Flask default; **loopback only, not externally reachable** |
| Required files | `app.py`, `models/{lightgbm_model,xgboost_model,scaler,feature_cols}.pkl`, `templates/{index,result}.html` |
| Env | none |
| Filesystem assumption | `BASE_DIR/models` — repo-relative ✅ portable |
| Not required | all of `data/` (74 MB), `models/ensemble_probs.npy`, `training/` |

---

## 3. Deployment blockers

Things that would prevent a working deployment **today**, ordered by severity.

### 🔴 Blocker 1 — Backend URLs are hardcoded to localhost

The frontend cannot reach a deployed backend. Three literals, no environment variable:

| File | Line | Literal |
|---|---|---|
| `client/src/app/(lab)/lab/atmosphericAnalysis/page.tsx` | ~487 | `fetch("http://localhost:5000/api/types")` |
| `client/src/app/(lab)/lab/atmosphericAnalysis/page.tsx` | ~522 | `fetch(\`http://localhost:5000/api/data?planet=…\`)` |
| `client/src/components/labDashboard/sidebar.tsx` | ~75 | `<Link href="http://127.0.0.1:5003">` |

**Impact:** deploy the frontend anywhere and `/lab/atmosphericAnalysis` shows empty dropdowns (the
`fetch` fails into a `console.error`, with no UI error state), and the classifier sidebar link points
at the *visitor's own machine*. Fixing this requires a code change — **not performed here**.

### 🔴 Blocker 2 — No Python dependency manifest

`server/classifier/requirements.txt` is **0 bytes**; no other manifest exists. Every PaaS Python
builder (Render, Railway, Heroku, App Engine) requires one. Without it the build installs nothing.
The README's `pip install -r requirements.txt` from `server/` targets a file that does not exist.

### 🟠 Blocker 3 — Classifier binds loopback only

`app.run(debug=True, port=5003)` omits `host`, so Flask binds `127.0.0.1`. In a container or PaaS the
service is unreachable from outside. Atmosphere does not have this problem (`host="0.0.0.0"`).

### 🟠 Blocker 4 — Both backends hardcode `debug=True`

Flask debug mode enables the Werkzeug interactive debugger, which permits arbitrary code execution
from the browser on unhandled exceptions. **Unsafe to expose publicly.** Also forces the auto-reloader.

### 🟠 Blocker 5 — Development server, no WSGI server

Both services run via `app.run()` (Werkzeug dev server): single-threaded by default, explicitly "not
suitable for production" per Flask's own warning. No `gunicorn`/`waitress`/`uvicorn` is present or
declared.

### 🟡 Blocker 6 — Hardcoded Flask session secret

`server/classifier/app.py` sets `app.secret_key = "exoplanet_secret"` — a committed literal. Used only
by `flash()` today, but it is a public signing key.

### 🟡 Blocker 7 — Undeclared runtime versions

Neither Python nor Node version is pinned. The committed `.pkl` artifacts are version-sensitive:
`joblib`/`scikit-learn`/`xgboost`/`lightgbm` mismatches can fail at unpickle time or, worse, load with
altered behaviour. The versions used to create them are **UNKNOWN**.

### 🟡 Blocker 8 — Repository size

~86 MB of committed data, of which ~74 MB is unused at runtime (notably `lightcurves.csv` at 50.6 MB
and `client/public/train/` at 7.4 MB). Slows clones and builds; may hit limits on some platforms.
See [DATA.md](DATA.md#8-deployment-requirement-summary).

---

## 4. Independent deployability

| Service | Independently deployable? | Notes |
|---|---|---|
| `server/atmosphere` | ✅ **Yes** | Self-contained; no cross-imports; `0.0.0.0`; CORS on; `EXO_DATA_PATH` override. Needs only a manifest + a WSGI server. |
| `server/classifier` | ✅ **Yes** (functionally) | Self-contained; repo-relative model paths. Needs a manifest, `host="0.0.0.0"`, `debug=False`, and only 4 `.pkl` files + `templates/`. |
| `client` | ⚠️ **Deployable, partially non-functional** | Builds and deploys standalone, but Blocker 1 breaks `/lab/atmosphericAnalysis` and the classifier link in any non-local deployment. |

The three services share **no code, no config, and no database**. There is no ordering constraint at
deploy time — only the frontend's *runtime* expectation that backends answer on localhost.

**Minimum deployable artifact per service**

```
atmosphere/   app.py + iac_exoplanet_atmospheres-20251002.csv        (~0.3 MB)
classifier/   app.py + models/{4 .pkl} + templates/{2 .html}          (~11 MB)
client/       full Next.js build + public/{models,textures,data}
```

---

## 5. Unresolved deployment decisions

These require human input. **No decision is made here**, because the repository does not specify one.

| # | Decision | Why it is open |
|---|---|---|
| 1 | **Target platform for each service** | README says Vercel + Render; no config exists. Whether that remains the plan is **UNKNOWN**. |
| 2 | **How the frontend learns backend URLs** | Requires a new env var (e.g. `NEXT_PUBLIC_ATMOSPHERE_URL`, `NEXT_PUBLIC_CLASSIFIER_URL`) and a code change. Naming/approach undecided. |
| 3 | **Whether the classifier stays a separate site** | It is currently linked to, not embedded. Keeping it separate, embedding it, or converting it to a JSON API consumed by the Next app are all open. |
| 4 | **WSGI server and process model** | Which server, how many workers — undecided. Model artifacts are loaded per-process at import (~11 MB each). |
| 5 | **CORS policy for production** | `CORS(app)` allows all origins. Restricting to the frontend origin is a behavioural change. |
| 6 | **Whether `debug=True` may be turned off** | Required for safe deployment, but it *is* a behavioural change — needs explicit approval. |
| 7 | **Python and Node version pins** | Must be chosen and validated against the committed `.pkl` files. |
| 8 | **Whether unused data ships** | 74 MB of unused files. Excluding them changes repository contents — a deletion decision, not a documentation one. |
| 9 | **Secret management** | Clerk/Gemini keys, and replacing the hardcoded Flask secret. |
| 10 | **Whether the research model is ever promoted** | `research/outputs/research_model.joblib` is not wired in. Promoting it would change predictions. See [ML_MODEL.md](ML_MODEL.md#8-research-model--not-production). |

---

## 6. Pre-deployment checklist

Derived from the blockers above. **None of these have been done.**

- [ ] Write `requirements.txt` for each backend (or one shared)
- [ ] Pin Python and Node versions; verify `.pkl` artifacts load under them
- [ ] Replace hardcoded backend URLs with environment variables
- [ ] Set `host="0.0.0.0"` on the classifier
- [ ] Set `debug=False` on both backends
- [ ] Introduce a production WSGI server
- [ ] Move the Flask secret key to an environment variable
- [ ] Restrict CORS to the frontend origin
- [ ] Configure Clerk and Gemini secrets on the platform
- [ ] Decide whether unused data ships

---

## Related documentation

[ENVIRONMENT.md](ENVIRONMENT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DEVELOPMENT.md](DEVELOPMENT.md) · [DATA.md](DATA.md) · [DECISIONS.md](DECISIONS.md)
