# Deployment

Deployment configuration for the **decided** target architecture.

```
Vercel
  └── client/                 Next.js frontend
Render
  ├── server/atmosphere/      Flask JSON API      (separate service)
  └── server/classifier/      Flask HTML app      (separate service)
```

The two Flask applications remain **separate services**. They share no code, no configuration and no
data, and are deployed and scaled independently. See
[DECISIONS.md](DECISIONS.md#d26--deployment-topology-vercel-frontend--two-separate-render-services).

---

## 0. Evidence labels used in this document

| Label | Meaning |
|---|---|
| ✅ **VERIFIED** | Actually executed locally on this machine and observed to work. |
| ⬜ **UNVERIFIED** | Not tested; no claim either way. |
| 🟨 **ASSUMED** | Believed true from vendor documentation or wheel metadata, but not executed here. |
| 🔬 **REQUIRES PRODUCTION TESTING** | Can only be confirmed on Render/Vercel itself. |

> **Nothing in this document has been deployed to Render or Vercel.** Every Render/Vercel-specific
> claim below is 🟨 ASSUMED or 🔬 REQUIRES PRODUCTION TESTING. Only local results are marked ✅.

---

## 1. Render — Atmosphere service

| Setting | Value |
|---|---|
| Root directory | `server/atmosphere` |
| Runtime | Python |
| Python version | `3.12` (via `server/atmosphere/.python-version`) — 🟨 ASSUMED Render honours this file |
| Build command | `pip install -r requirements.txt` |
| Start command | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| Health check path | `/` (returns `{"message": "Exoplanet Atmospheres API"}`) |

**Why `app:app`** — `server/atmosphere/app.py` defines a module-level `app = Flask(__name__)`, so the
WSGI callable is `app` inside module `app`. ✅ VERIFIED locally with gunicorn 23.0.0.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | Provided by Render | `5000` | Bind port. Render injects it; the start command expands `$PORT`. |
| `CORS_ORIGINS` | Recommended | `*` | Comma-separated allow-list of frontend origins. Set to the Vercel origin in production. |
| `EXO_DATA_PATH` | Optional | auto-glob | Absolute path to the CSV. Pre-existing; leave unset to use the co-located file. |
| `FLASK_DEBUG` | No | unset (off) | Local development only. **Never set in production.** |

### Required runtime files

```
server/atmosphere/app.py
server/atmosphere/iac_exoplanet_atmospheres-20251002.csv     ← the only data file needed (~0.3 MB)
server/atmosphere/requirements.txt
server/atmosphere/.python-version
```

`templates/`, `static/` and `m.py` are **not** required — `app.py` returns JSON only and never calls
`render_template`. They are harmless if present.

⚠️ The CSV is located by `glob`-ing the service's own directory, so it must stay co-located with
`app.py` unless `EXO_DATA_PATH` is set.

---

## 2. Render — Classifier service

| Setting | Value |
|---|---|
| Root directory | `server/classifier` |
| Runtime | Python |
| Python version | `3.12` (via `server/classifier/.python-version`) — 🟨 ASSUMED Render honours this file |
| Build command | `pip install -r requirements.txt` |
| Start command | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| Health check path | `/` (renders the slider form) |

**Why `app:app`** — same structure as Atmosphere. ✅ VERIFIED locally with gunicorn 23.0.0.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | Provided by Render | `5003` | Bind port. |
| `SECRET_KEY` | **Yes, in production** | ephemeral random | Flask session signing for `flash()` messages. |
| `FLASK_DEBUG` | No | unset (off) | Local development only. **Never set in production.** |
| `HOST` | No | `127.0.0.1` | Only affects `python app.py`; irrelevant under gunicorn. |

> **Set `SECRET_KEY` explicitly on Render.** When it is unset the app generates a *per-process* random
> key so that no secret is committed. With more than one gunicorn worker each worker would then sign
> with a different key, and `flash()` messages could be dropped. Generate one with:
> `python -c "import secrets; print(secrets.token_hex(32))"`

### Required runtime files

```
server/classifier/app.py
server/classifier/models/lightgbm_model.pkl        ← model artifacts (all four required)
server/classifier/models/xgboost_model.pkl
server/classifier/models/scaler.pkl
server/classifier/models/feature_cols.pkl
server/classifier/templates/index.html
server/classifier/templates/result.html
server/classifier/requirements.txt
server/classifier/.python-version
```

**Not required at runtime** (~74 MB): all of `data/`, `models/ensemble_probs.npy`, `training/`.
They are not read by any inference code path but currently ship with the repository.

Model paths are resolved from `BASE_DIR/models`, i.e. repo-relative — portable, no absolute paths.

### Memory note

Each gunicorn worker loads both models at import time. Worker count multiplies the model memory
footprint. ⬜ UNVERIFIED what Render instance size is needed — 🔬 REQUIRES PRODUCTION TESTING.

---

## 3. Vercel — Frontend

| Setting | Value |
|---|---|
| Root directory | `client` |
| Framework preset | Next.js |
| Build command | `npm run build` (default) |
| Node | ⬜ UNVERIFIED/undeclared; Next.js 15.5 requires ≥ 18.18. Built locally on Node 24.19.0 ✅ |

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_ATMOSPHERE_URL` | **Yes** | Base URL of the Render Atmosphere service, **no trailing slash**. |
| `NEXT_PUBLIC_CLASSIFIER_URL` | **Yes** | Base URL of the Render Classifier service, **no trailing slash**. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk — gates `/explore`, `/lab`, `/play`. |
| `CLERK_SECRET_KEY` | **Yes** | Clerk server-side. |
| `NEXT_PUBLIC_GEMINI_API_KEY` | For `/play/draw` | Pre-existing; browser-exposed by the `NEXT_PUBLIC_` prefix. |

> ⚠️ `NEXT_PUBLIC_*` values are **inlined into the client bundle at build time**, not read at runtime.
> Changing a backend URL requires a **rebuild/redeploy**, not just an env var edit.

---

## 4. Local vs production configuration

| Concern | Local development | Production |
|---|---|---|
| Frontend URLs | `client/.env.local` (gitignored) | Vercel project env vars |
| Atmosphere URL | `http://localhost:5000` | `https://<atmosphere>.onrender.com` |
| Classifier URL | `http://127.0.0.1:5003` | `https://<classifier>.onrender.com` |
| Backend server | `python app.py` (Werkzeug) | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| Debug | opt-in via `FLASK_DEBUG=1` | off (never set the variable) |
| CORS | `CORS_ORIGINS` unset → `*` | `CORS_ORIGINS=https://<app>.vercel.app` |
| Classifier secret | ephemeral random + warning | `SECRET_KEY` set explicitly |

Local behaviour is unchanged from before this work: `python app.py` still starts each backend on its
original port, and CORS still defaults to permissive.

---

## 5. What was verified locally

All of the following were executed on this machine (macOS, Apple Silicon).

| # | Check | Result |
|---|---|---|
| 1 | Clean venv install of `server/classifier/requirements.txt` on Python 3.12.13 | ✅ VERIFIED |
| 2 | All four `.pkl` artifacts load | ✅ VERIFIED — **zero warnings** with the pinned versions |
| 3 | Representative prediction (15 d, 3269 ppm, 6 R⊕, 1.05 R☉) | ✅ VERIFIED — `Candidate` (FP 9.41 % / Cand 88.2 % / Conf 2.39 %) |
| 4 | Prediction identical across Python 3.14/sklearn 1.9 and Python 3.12/sklearn 1.7 | ✅ VERIFIED — max abs diff 3.75e-11 |
| 5 | Atmosphere `/`, `/api/types`, `/api/planets`, `/api/data` | ✅ VERIFIED — all 200, payload shape unchanged |
| 6 | Atmosphere under gunicorn with `$PORT` from the environment | ✅ VERIFIED |
| 7 | Classifier under gunicorn with `$PORT` from the environment | ✅ VERIFIED |
| 8 | Classifier `/` + `/predict` in a real browser under gunicorn | ✅ VERIFIED — correct result page |
| 9 | `SECRET_KEY` read from the environment | ✅ VERIFIED |
| 10 | CORS restricted to an allow-list — allowed origin succeeds in a browser | ✅ VERIFIED |
| 11 | CORS restricted — disallowed origin blocked by the browser | ✅ VERIFIED |
| 12 | Frontend production build (`npm run build`) | ✅ VERIFIED — 16/16 pages, exit 0, using the real rotated Clerk credentials |
| 13 | Backend URLs come from env vars, not literals | ✅ VERIFIED — rebuilt with fake prod URLs; they appear in the bundle and **no** `localhost:5000` / `127.0.0.1:5003` literal survives |

---

## 6. Still to be tested on Render / Vercel

| # | Item | Label |
|---|---|---|
| 1 | Anything at all running on Render or Vercel | 🔬 REQUIRES PRODUCTION TESTING |
| 2 | `.python-version` being honoured by Render's Python builder | 🟨 ASSUMED / 🔬 |
| 3 | Linux wheel availability for the pinned versions on Render's image | 🟨 ASSUMED (manylinux wheels published for all pins) / 🔬 |
| 4 | OpenMP availability for LightGBM/XGBoost on Render's Linux image | 🟨 ASSUMED — see [ENVIRONMENT.md](ENVIRONMENT.md) system dependencies / 🔬 |
| 5 | Instance size / memory sufficient for model loading per worker | 🔬 REQUIRES PRODUCTION TESTING |
| 6 | Cold-start time with ~11 MB of models loaded at import | 🔬 REQUIRES PRODUCTION TESTING |
| 7 | Real Vercel → Render CORS round trip with the deployed origins | 🔬 REQUIRES PRODUCTION TESTING |
| 8 | Render free-tier idle spin-down behaviour vs frontend fetch timeouts | 🔬 REQUIRES PRODUCTION TESTING |
| 9 | End-to-end `/lab/atmosphericAnalysis` page through Clerk auth | 🔬 REQUIRES PRODUCTION TESTING — Clerk credentials are now configured, but the signed-in page has not yet been exercised end to end |

---

## 7. Known blockers and open items

### ✅ Resolved — Clerk credentials and the previously committed development secret

Both former Clerk blockers are closed.

**Credentials are configured.** The build previously failed with
`Error: @clerk/clerk-react: Missing publishableKey` because no Clerk keys were present. Real keys are
now set locally (`client/.env` and `client/.env.local`, both gitignored) and
`npm run build` **succeeds on those real credentials** — 16/16 pages, exit 0, with no placeholder key
needed. The same variables must still be set in the Vercel project for production.

**The exposed secret has been retired.** `client/.clerk/.tmp/keyless.json` was previously tracked
(added in `0997c69`) and contained a Clerk keyless-instance `secretKey`. Remediation completed:

- the Secret Key was **rotated** in the Clerk dashboard;
- the old compromised Secret Key was **deleted** there, so the exposed value is no longer active;
- the three generated files under `client/.clerk/.tmp/` were **untracked** in commit `67a4ca8`
  (`git rm --cached`, local files preserved);
- the pre-existing `/.clerk/` rule in `client/.gitignore` is **now active** — it was previously inert
  only because tracking predated it. The rule was not modified.

No Clerk authentication source code was changed at any point.

> Residual note: the rotated-away value still exists in git history at `0997c69` on the public
> repository. It is inert because that key was deleted in Clerk. History was **not** rewritten — see
> §"Git history" guidance in [DECISIONS.md](DECISIONS.md).

### 🟡 Open item 3 — Repository size

~74 MB of runtime-unused data still ships (`data/raw/lightcurves.csv` 50.6 MB,
`client/public/train/` 7.4 MB). Not a blocker; slows clones and builds.

### 🟡 Open item 4 — `server/requirements.txt` is now superseded

The root `server/requirements.txt` holds an unpinned union of both services' dependencies. It is left
unchanged, but the per-service files are authoritative for deployment.

### 🟡 Open item 5 — Training scripts remain non-runnable

`server/classifier/training/*.py` hardcode `D:\exoplanet\...` paths. Untouched — not part of the
deployed runtime.

---

## 8. Independent deployability

| Service | Independently deployable? | Notes |
|---|---|---|
| `server/atmosphere` | ✅ Yes | Own manifest, own Python pin, own data file, no cross-imports. |
| `server/classifier` | ✅ Yes | Own manifest, own Python pin, own model artifacts, no cross-imports. |
| `client` | ✅ Yes | Reaches both backends purely through build-time env vars. |

No deploy-time ordering constraint exists. The only runtime coupling is the frontend needing the two
backend URLs, supplied as environment variables.

---

## 9. Deployment checklist

- [x] Per-service `requirements.txt` with pinned versions
- [x] Python version pinned per service (`.python-version`)
- [x] Backend URLs moved to environment variables
- [x] Production WSGI server (gunicorn) for both backends
- [x] `debug=True` removed from both backends
- [x] Flask secret key moved to `SECRET_KEY`
- [x] CORS restrictable via `CORS_ORIGINS`
- [x] `$PORT` honoured by both start commands
- [x] Clerk credentials configured locally; build verified on the real keys
- [x] Clerk Secret Key rotated and the old compromised key deleted in the Clerk dashboard
- [x] Generated `client/.clerk/` files untracked (`67a4ca8`); `/.clerk/` ignore rule now active
- [ ] Set the Clerk keys in the Vercel project
- [ ] Set `CORS_ORIGINS` to the real Vercel origin once known
- [ ] Set `SECRET_KEY` on the Render classifier service
- [ ] Deploy and run the production tests in §6

---

## Related documentation

[ENVIRONMENT.md](ENVIRONMENT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DEVELOPMENT.md](DEVELOPMENT.md) · [DATA.md](DATA.md) · [DECISIONS.md](DECISIONS.md) · [ML_MODEL.md](ML_MODEL.md)
