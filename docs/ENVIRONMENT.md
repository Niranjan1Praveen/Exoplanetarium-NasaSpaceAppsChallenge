# Environment

Runtimes, dependencies, environment variables and configuration — as actually declared in the
repository, with gaps identified explicitly.

> **Update:** each backend now has its own pinned `requirements.txt` and its own `.python-version`.
> The dependency sets were still derived by reading imports (plus what `joblib.load` needs to
> unpickle), then **verified experimentally in a clean virtual environment** — not taken from
> `pip freeze`.

---

## 1. Runtimes

| Runtime | Declared where | Version | Confidence |
|---|---|---|---|
| Node.js | ❌ Nowhere — no `engines`, no `.nvmrc`, no `.node-version` | **UNKNOWN** | Next.js 15.5 requires **Node ≥ 18.18**. Build verified locally on **Node 24.19.0 / npm 11.17.0** |
| Python (Atmosphere) | `server/atmosphere/.python-version` | **3.12** | ✅ Verified locally on 3.12.13 |
| Python (Classifier) | `server/classifier/.python-version` | **3.12** | ✅ Verified locally on 3.12.13 |
| npm | `client/package-lock.json` present → **npm** | — | ✅ npm |

Historical note: `server/classifier/__pycache__/*.cpython-313.pyc` implies Python 3.13 was used at
some point, and the developer venv at `server/venv` is Python 3.14.2. Neither is the pin; **3.12 was
chosen because it is the version the pinned dependency set was verified against.**

---

## 2. Frontend dependencies — `client/package.json`

**Fully declared and lockfile-backed.** This is the only well-specified dependency set in the repository.

| Area | Key packages |
|---|---|
| Framework | `next@^15.5.22`, `react@^19.1.9`, `react-dom@^19.1.9` |
| Language/build | `typescript@^5`, `@types/node@^20`, `@types/react@^19`, `eslint@^9`, `eslint-config-next@15.5.3` |
| Styling | `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `tw-animate-css`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| UI primitives | ~25 `@radix-ui/react-*` packages, `cmdk`, `vaul`, `sonner`, `input-otp` |
| 3D | `three@^0.180.0`, `@react-three/fiber@^9.3.0`, `@react-three/drei@^10.7.6`, `cobe` |
| Animation | `framer-motion@^12`, `motion@^12`, `rough-notation`, `swiper`, `embla-carousel-react` |
| Data/forms | `recharts@^2.15.4`, `react-hook-form`, `@hookform/resolvers`, `zod@^4`, `date-fns` |
| Auth | `@clerk/nextjs@^6.39.6` |
| AI | `@google/generative-ai@^0.24.1` |
| Misc | `dom-to-image`, `react-sketch-canvas`, `react-resizable-panels`, `lucide-react` |

**Notable manifest details**

- `"overrides": { "lodash": "^4.18.1" }` — ⚠️ **lodash 4.18.1 does not exist** (latest is 4.17.x). This
  override is unsatisfiable as written. `lodash` is not a direct dependency; this appears to target a
  transitive one, likely as a security remediation. Effect on install: **UNKNOWN** — verify before
  trusting it. Intent: **UNKNOWN**.
- `"private": true` — not publishable.
- Build uses Turbopack: `next dev --turbopack`, `next build --turbopack`.

**Scripts**

| Script | Command |
|---|---|
| `npm run dev` | `next dev --turbopack` |
| `npm run build` | `next build --turbopack` |
| `npm start` | `next start` |
| `npm run lint` | `eslint` |

❌ **No `test` script.** No test framework is installed. See [DEVELOPMENT.md](DEVELOPMENT.md#5-testing).

---

## 3. Backend dependencies — reconstructed from imports

### `server/atmosphere/app.py`

| Package | Import | Required |
|---|---|---|
| `flask` | `from flask import Flask, request, jsonify` | ✅ |
| `flask-cors` | `from flask_cors import CORS` | ✅ |
| `pandas` | `import pandas as pd` | ✅ |
| `numpy` | `import numpy as np` | ✅ |
| stdlib | `os, re, glob, csv, json` | — |

Declared in **`server/atmosphere/requirements.txt`**:

```
Flask==3.1.3
flask-cors==6.0.5
pandas==2.3.3
numpy==2.3.4
gunicorn==23.0.0        # production WSGI server; not imported by app.py
```

### `server/classifier/app.py`

| Package | Import | Required |
|---|---|---|
| `flask` | `from flask import Flask, render_template, request, flash` | ✅ |
| `pandas` | `import pandas as pd` | ✅ |
| `numpy` | `import numpy as np` | ✅ |
| `joblib` | `import joblib` | ✅ |
| stdlib | `os` | — |

⚠️ **Hidden transitive requirement.** `app.py` never imports `sklearn`, `xgboost` or `lightgbm`, but
`joblib.load()` unpickles objects of those classes. **All three must be installed** or startup fails
with `ModuleNotFoundError` during unpickling — a non-obvious failure, since nothing in the source
names them.

Declared in **`server/classifier/requirements.txt`**:

```
Flask==3.1.3
pandas==2.3.3
numpy==2.3.4
joblib==1.5.3
scikit-learn==1.7.0
xgboost==3.0.5
lightgbm==4.7.0
gunicorn==23.0.0        # production WSGI server; not imported by app.py
```

Note `flask-cors` is **not** a classifier dependency — that service serves HTML and is navigated to,
never fetched cross-origin.

### `server/classifier/training/*.py`

Adds direct imports of `scikit-learn`, `xgboost`, `lightgbm` (plus stdlib `warnings`). These scripts
are **not part of the deployed runtime** and still hardcode `D:\exoplanet\...` paths.

### Version provenance — what is known vs chosen

| Package | Training version | Basis |
|---|---|---|
| scikit-learn | **1.7.0** — ✅ *established* | `scaler.pkl` and the label encoders raise `InconsistentVersionWarning: … from version 1.7.0` when loaded under a different version |
| xgboost | **UNKNOWN** — older than 3.4.1 | Loading under 3.4.1 warns "generated by an older version of XGBoost". No exact version recorded |
| lightgbm | **UNKNOWN** — 4.x series | Booster string reports `version=v4`; no minor version recorded |
| pandas / numpy / joblib / Flask | **UNKNOWN** | No record in the repository |
| Python | **UNKNOWN** | `.pyc` artifacts suggest 3.13 was used at some point; not proof of the training interpreter |

> The pinned versions above are the **currently verified compatible runtime versions**, *not* a claim
> about the original training environment — except `scikit-learn==1.7.0`, which does match the version
> recorded inside the artifacts.

**Verified experimentally** in a clean Python 3.12.13 virtual environment:

- all four `.pkl` artifacts load with **zero warnings**;
- the representative prediction is byte-for-byte the same as under the developer's Python 3.14 /
  scikit-learn 1.9.0 environment (max absolute probability difference **3.75e-11**).

For comparison, the pre-existing `server/venv` (Python 3.14.2, scikit-learn 1.9.0, xgboost 3.4.1,
pandas 3.0.5, numpy 2.5.2) also loads the artifacts and predicts identically, but emits
`InconsistentVersionWarning` and an XGBoost old-format warning. It is a working development
environment; the pinned set is the one recommended for deployment.

---

## 3a. System-level dependencies

| Platform | Requirement | Status |
|---|---|---|
| **macOS (Apple Silicon)** | **`libomp` is required** for LightGBM and XGBoost | ✅ **VERIFIED** |
| **Linux (incl. Render)** | No extra install expected | 🟨 ASSUMED — not tested on Render |
| **Windows** | No extra install expected | ⬜ UNVERIFIED |

**Why macOS needs `libomp`** — the published macOS wheels do **not** bundle an OpenMP runtime. Both
`lightgbm/lib/lib_lightgbm.dylib` and `xgboost/lib/libxgboost.dylib` link `@rpath/libomp.dylib` with
an rpath of `/opt/homebrew/opt/libomp/lib`. Verified with `otool -L` / `otool -l`; no `libomp*` file
exists inside either wheel. Without it, `import lightgbm` fails to load its shared library.

```bash
# macOS only — Homebrew
brew install libomp
```

> ❗ `libomp` is a **system** dependency and must **not** be added to `requirements.txt`.
> ❗ Do **not** run the Homebrew command on Linux or Windows.

On Linux, `manylinux` wheels for LightGBM/XGBoost link `libgomp`, which is present in typical
Debian/Ubuntu-based images. This was **not** tested on Render — see
[DEPLOYMENT.md](DEPLOYMENT.md#6-still-to-be-tested-on-render--vercel).

---

## 4. Dependency manifest status

| Manifest | Path | Status |
|---|---|---|
| `package.json` | `client/package.json` | ✅ Complete, lockfile present |
| `package-lock.json` | `client/package-lock.json` | ✅ Present |
| `requirements.txt` | `server/atmosphere/requirements.txt` | ✅ **Present, pinned, verified** |
| `requirements.txt` | `server/classifier/requirements.txt` | ✅ **Present, pinned, verified** |
| `requirements.txt` | `server/requirements.txt` | ⚠️ Pre-existing unpinned union of both services. **Superseded** by the per-service files; left unchanged |
| `.python-version` | `server/atmosphere/`, `server/classifier/` | ✅ **Present — `3.12`** |
| `.env.example` | `client/.env.example` | ✅ **Present** — documents required frontend variables, no secrets |
| `pyproject.toml` / `Pipfile` / `environment.yml` | anywhere | ❌ None |
| `.nvmrc` / `engines` | anywhere | ❌ **Still none** |

**Remaining gaps, ranked by impact**

1. **No Node version pinned** — Next.js 15 has a minimum (≥ 18.18), undeclared here.
2. **`server/requirements.txt` is stale/unpinned** — ignore it in favour of the per-service manifests.
3. **`lodash` override targets a nonexistent version** (`^4.18.1`; latest is 4.17.x) — pre-existing,
   effect on install **UNKNOWN**, untouched by this work.
4. **Training-script dependencies are still undeclared** — out of the deployed runtime.

---

## 5. Environment variables

### Frontend — `client/`

| Variable | Consumer | Required | Default / fallback |
|---|---|---|---|
| `NEXT_PUBLIC_ATMOSPHERE_URL` | `client/src/app/(lab)/lab/atmosphericAnalysis/page.tsx` | ✅ | **none** — no localhost fallback in source |
| `NEXT_PUBLIC_CLASSIFIER_URL` | `client/src/components/labDashboard/sidebar.tsx` | ✅ | **none** — link falls back to `"#"` if unset |
| `NEXT_PUBLIC_GEMINI_API_KEY` | `client/src/app/(play)/play/draw/page.tsx` | ✅ for `/play/draw` | none — cast `as string`, so `undefined` fails at call time |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `@clerk/nextjs` (implicit) | ✅ for auth | Clerk SDK convention; not referenced in source |
| `CLERK_SECRET_KEY` | `@clerk/nextjs` middleware (implicit) | ✅ for auth | as above |
| `NEXT_PUBLIC_SITE_URL` | `client/src/app/metadata.ts` | ➖ Optional | falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000` |
| `VERCEL_PROJECT_PRODUCTION_URL` | `client/src/app/metadata.ts` | ➖ Auto (Vercel) | — |

### Backend — `server/atmosphere/`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | Provided by the platform | `5000` | Bind port for `python app.py`; expanded by the gunicorn start command |
| `CORS_ORIGINS` | Recommended in production | `*` | Comma-separated origin allow-list. Unset ⇒ previous permissive behaviour |
| `EXO_DATA_PATH` | Optional (pre-existing) | first `*.csv` in the service directory | Absolute path to the atmospheres CSV |
| `FLASK_DEBUG` | No | unset (off) | `1`/`true`/`yes` enables debug for local dev only |

### Backend — `server/classifier/`

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | Provided by the platform | `5003` | Bind port for `python app.py`; expanded by the gunicorn start command |
| `SECRET_KEY` | **Yes in production** | ephemeral `os.urandom(32)` + warning | Flask session signing for `flash()` |
| `HOST` | No | `127.0.0.1` | Only affects `python app.py`; gunicorn binds via `--bind` |
| `FLASK_DEBUG` | No | unset (off) | `1`/`true`/`yes` enables debug for local dev only |

**Observations**

- Local configuration lives in **`client/.env.local`** (gitignored). **`client/.env.example`** is the
  tracked, secret-free template.
- `NEXT_PUBLIC_*` values are **inlined at build time**, so changing a backend URL requires a rebuild.
- Both backends now default to **debug off**; debug is opt-in via `FLASK_DEBUG`.
- No committed Flask secret remains: `SECRET_KEY` comes from the environment, with a per-process
  random fallback.
- Clerk credentials are configured locally in `client/.env` and `client/.env.local` (both gitignored),
  and `npm run build` succeeds on them.
- ✅ `client/.clerk/.tmp/` is **no longer tracked**. These files are generated by `@clerk/nextjs` in
  keyless mode; they were untracked in commit `67a4ca8` and the pre-existing `/.clerk/` rule in
  `client/.gitignore` is now active. The Clerk Secret Key they contained was rotated and the old
  compromised key deleted in the Clerk dashboard, so that value is no longer active.
  See [DEPLOYMENT.md](DEPLOYMENT.md#7-known-blockers-and-open-items).

⚠️ `NEXT_PUBLIC_*` variables are **inlined into the browser bundle**. The Gemini key is therefore
public to anyone loading `/play/draw`. That is inherent to calling Gemini client-side, which is what
the current code does. Risk assessment: **out of scope**; recorded as a fact in
[DECISIONS.md](DECISIONS.md).

---

## 6. Ports and runtime configuration

| Service | Host | Port | Debug | Configurable |
|---|---|---|---|---|
| Frontend (dev) | localhost | 3000 | — | ✅ `next dev -p <port>` |
| Frontend (prod) | `0.0.0.0` | `$PORT` or 3000 | — | ✅ `next start -p` / `PORT` |
| Atmosphere (dev) | `0.0.0.0` | `$PORT` or 5000 | off unless `FLASK_DEBUG` | ✅ env |
| Atmosphere (prod) | `--bind 0.0.0.0:$PORT` via gunicorn | `$PORT` | off | ✅ env |
| Classifier (dev) | `$HOST` or `127.0.0.1` | `$PORT` or 5003 | off unless `FLASK_DEBUG` | ✅ env |
| Classifier (prod) | `--bind 0.0.0.0:$PORT` via gunicorn | `$PORT` | off | ✅ env |

Production runs under **gunicorn**, never Flask's development server. The `if __name__ == "__main__":`
blocks are local-development entry points only.

Other runtime configuration:

| Setting | Location | Value |
|---|---|---|
| Flask session secret | `server/classifier/app.py` | `os.environ.get("SECRET_KEY")`, random fallback |
| CORS policy | `server/atmosphere/app.py` | `CORS_ORIGINS` env; `*` when unset |
| Model directory | `server/classifier/app.py` | `BASE_DIR/models` (repo-relative, portable) |
| Training I/O paths | `server/classifier/training/*.py` | `D:\exoplanet\...` — absolute, Windows-only, unchanged |

---

## 7. Build configuration

| File | Purpose |
|---|---|
| `client/next.config.ts` | AVIF/WebP images, 30-day image cache, immutable caching for `/models` + `/textures`, `optimizePackageImports`, security headers, `poweredByHeader: false` |
| `client/tsconfig.json` | `target: ES2017`, `strict: true` |
| `client/eslint.config.mjs` | Flat ESLint config |
| `client/postcss.config.mjs` | Tailwind v4 via PostCSS |
| `client/components.json` | shadcn/ui generator config |
| `client/middleware.ts` | Clerk route protection |

`.gitignore` coverage: root ignores `.DS_Store`, `.vscode/`; `server/.gitignore` ignores `venv`;
`client/.gitignore` covers `node_modules`, `.next`, `.env*`, `.vercel`, `/.clerk/`.
⚠️ Root `.gitignore` does **not** cover `__pycache__/` — which is why `server/classifier/__pycache__/*.pyc`
are committed.

---

## Related documentation

[DEVELOPMENT.md](DEVELOPMENT.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DECISIONS.md](DECISIONS.md)
