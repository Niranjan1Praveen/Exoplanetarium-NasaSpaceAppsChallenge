# Environment

Runtimes, dependencies, environment variables and configuration — as actually declared in the
repository, with gaps identified explicitly.

> **Headline finding:** the repository contains **no usable Python dependency manifest**. The only
> `requirements.txt` is `server/classifier/requirements.txt` and it is **0 bytes**. Both backends'
> dependency sets below were reconstructed by reading imports, not from a manifest.

---

## 1. Runtimes

| Runtime | Declared where | Version | Confidence |
|---|---|---|---|
| Node.js | ❌ Nowhere — no `engines`, no `.nvmrc`, no `.node-version` | **UNKNOWN** | Next.js 15.5 requires **Node ≥ 18.18**; not repository-declared |
| Python | ❌ Nowhere — no `runtime.txt`, no `pyproject.toml`, no `Pipfile` | **UNKNOWN** | `__pycache__/*.cpython-313.pyc` implies **Python 3.13** was used at some point |
| npm/pnpm/yarn | `client/package-lock.json` present → **npm** | lockfile v? | ✅ npm |

⚠️ Neither runtime version is pinned. A deployment platform will pick its own default, which may not
match what the committed model pickles were produced with.

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

```bash
pip install flask flask-cors pandas numpy
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

```bash
pip install flask pandas numpy joblib scikit-learn xgboost lightgbm
```

### `server/classifier/training/*.py`

Adds direct imports of `scikit-learn`, `xgboost`, `lightgbm` (plus stdlib `warnings`).
Same install line as above.

### Versions on the machine that produced this documentation

Reference only — **not a pin, and not a recommendation**:

```
flask 3.1.3 · pandas 3.0.5 · numpy 2.5.1 · joblib 1.5.3
scikit-learn 1.9.0 · xgboost 3.4.0 · lightgbm 4.7.0
flask-cors  NOT INSTALLED
```

The four committed `.pkl` artifacts load successfully under these versions. The versions they were
*created* with are **UNKNOWN** — joblib pickles carry no reliable version record here.

---

## 4. Dependency manifest status

| Manifest | Path | Status |
|---|---|---|
| `package.json` | `client/package.json` | ✅ Complete, lockfile present |
| `package-lock.json` | `client/package-lock.json` | ✅ Present |
| `requirements.txt` | `server/classifier/requirements.txt` | ❌ **0 bytes — empty** |
| `requirements.txt` | `server/requirements.txt` | ❌ **Does not exist** (root `README.md` instructs `pip install -r requirements.txt` from `server/` — that command fails) |
| `requirements.txt` | `server/atmosphere/` | ❌ Does not exist |
| `pyproject.toml` / `Pipfile` / `environment.yml` | anywhere | ❌ None |
| `runtime.txt` / `.python-version` | anywhere | ❌ None |
| `.nvmrc` / `engines` | anywhere | ❌ None |

**Incomplete declarations, ranked by impact**

1. **No Python dependencies declared at all** — blocks reproducible backend deployment.
2. **No Python version pinned** — model-pickle compatibility is version-sensitive.
3. **No Node version pinned** — Next.js 15 has a minimum, undeclared here.
4. **`README.md` documents a `server/requirements.txt` that does not exist.**
5. **`lodash` override targets a nonexistent version.**

---

## 5. Environment variables

| Variable | Consumer | Required | Default / fallback |
|---|---|---|---|
| `NEXT_PUBLIC_GEMINI_API_KEY` | `client/src/app/(play)/play/draw/page.tsx` | ✅ for `/play/draw` | none — cast `as string`, so `undefined` fails at call time |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `@clerk/nextjs` (implicit) | ✅ for auth | Clerk SDK convention; not referenced in source |
| `CLERK_SECRET_KEY` | `@clerk/nextjs` middleware (implicit) | ✅ for auth | as above |
| `NEXT_PUBLIC_SITE_URL` | `client/src/app/metadata.ts` | ➖ Optional | falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000` |
| `VERCEL_PROJECT_PRODUCTION_URL` | `client/src/app/metadata.ts` | ➖ Auto (Vercel) | — |
| `EXO_DATA_PATH` | `server/atmosphere/app.py` | ➖ Optional | first `*.csv` in `server/atmosphere/` |

**Observations**

- `EXO_DATA_PATH` is the **only** environment variable either backend reads. Ports, hosts, debug mode
  and the classifier's model directory are all hardcoded.
- ❌ **No variable configures backend URLs for the frontend.** `http://localhost:5000` and
  `http://127.0.0.1:5003` are literals in source. This is the primary deployment blocker —
  see [DEPLOYMENT.md](DEPLOYMENT.md#3-deployment-blockers).
- ❌ **No `.env.example` exists**, so the required Clerk/Gemini variables are undiscoverable without
  reading the code. `client/.gitignore` ignores `.env*`.
- `client/.clerk/` exists locally and is gitignored (`/.clerk/`, commented "can include secrets").
  Contents not inspected or reproduced here.

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
| Atmosphere | `0.0.0.0` | 5000 | `debug=True` | ❌ hardcoded |
| Classifier | `127.0.0.1` (Flask default) | 5003 | `debug=True` | ❌ hardcoded |

⚠️ **Both backends hardcode `debug=True`.** Flask's debug mode enables the Werkzeug interactive
debugger and auto-reloader; it is unsafe to expose publicly. Changing this is a behavioural change and
is **not** performed here — flagged in [DEPLOYMENT.md](DEPLOYMENT.md#3-deployment-blockers).

Other hardcoded runtime configuration:

| Setting | Location | Value |
|---|---|---|
| Flask session secret | `server/classifier/app.py` | `"exoplanet_secret"` — literal, committed |
| CORS policy | `server/atmosphere/app.py` | `CORS(app)` — all origins |
| Model directory | `server/classifier/app.py` | `BASE_DIR/models` (repo-relative, portable) |
| Training I/O paths | `server/classifier/training/*.py` | `D:\exoplanet\...` — absolute, Windows-only |

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
