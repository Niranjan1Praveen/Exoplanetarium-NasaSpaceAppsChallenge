# Development

Setting up and running Exoplanetarium locally, from a fresh clone.

Prerequisites and version caveats: [ENVIRONMENT.md](ENVIRONMENT.md).

---

## 1. Fresh-clone setup

```bash
git clone https://github.com/Niranjan1Praveen/Exoplanetarium-NasaSpaceAppsChallenge.git
cd Exoplanetarium-NasaSpaceAppsChallenge
```

The repository ships all model artifacts and datasets — nothing needs downloading.
Expect ~86 MB of committed data (see [DATA.md](DATA.md)).

> ⚠️ **The root `README.md` setup instructions do not work as written.** They say
> `cd server && pip install -r requirements.txt`, but no `server/requirements.txt` exists, and the one
> at `server/classifier/requirements.txt` is empty. Use the explicit `pip install` commands below.

---

## 2. Install dependencies

### Frontend

```bash
cd client && npm install
```

### Backends

No manifest exists, so install explicitly. A shared virtualenv works for both services — their
dependency sets are compatible (`server/.gitignore` already ignores `venv`).

```bash
python -m venv server/venv
```

Activate — macOS/Linux:

```bash
source server/venv/bin/activate
```

Activate — Windows (PowerShell):

```powershell
.\server\venv\Scripts\Activate.ps1
```

Then install the union of both services' requirements:

```bash
pip install flask flask-cors pandas numpy joblib scikit-learn xgboost lightgbm
```

⚠️ `scikit-learn`, `xgboost` and `lightgbm` are **not imported by `server/classifier/app.py`** but are
required to unpickle its `.pkl` artifacts. Omitting them produces a `ModuleNotFoundError` at startup
that names a module nowhere in the source. See [ENVIRONMENT.md](ENVIRONMENT.md#3-backend-dependencies--reconstructed-from-imports).

---

## 3. Environment variables

No `.env.example` is provided. Create `client/.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_GEMINI_API_KEY=xxx
```

| Variable | Needed for | Without it |
|---|---|---|
| Clerk keys | `/explore`, `/lab`, `/play` | Protected routes fail; public pages still work |
| `NEXT_PUBLIC_GEMINI_API_KEY` | `/play/draw` classification | Page renders; the Gemini call fails |

Backends need no environment variables. `EXO_DATA_PATH` optionally overrides the atmosphere CSV.

---

## 4. Running the three services

All three run independently, in **separate terminals**. There is no orchestrator, no Compose file,
and no single command that starts everything.

### 4a. Frontend → http://localhost:3000

```bash
cd client && npm run dev
```

### 4b. Atmosphere API → http://localhost:5000

```bash
cd server/atmosphere && python app.py
```

Expected startup output — the module loads the CSV at import and prints:

```
[CSV] Using path: .../iac_exoplanet_atmospheres-20251002.csv
Shape: (1048, 26)
Columns: ['name', 'planet_status', ...]
```

Verify:

```bash
curl http://localhost:5000/api/types
```

### 4c. Classifier → http://127.0.0.1:5003

```bash
cd server/classifier && python app.py
```

Verify by opening `http://127.0.0.1:5003` — a four-slider form should render.

> **`cd` into the service directory matters.** The atmosphere service resolves its CSV by globbing its
> own directory, and both services are written to be run as scripts, not as modules.

### Which services does a given page need?

| Page | Frontend | Atmosphere | Classifier |
|---|---|---|---|
| `/`, `/team` | ✅ | — | — |
| `/lab`, `/lab/exoplanet` | ✅ | — | — |
| `/lab/atmosphericAnalysis` | ✅ | ✅ **required** | — |
| Sidebar → "Exoplanet Classifier" | ✅ | — | ✅ **required** |
| `/play/*` | ✅ | — | — |

The classifier link navigates away from the Next.js app to a separate Flask-rendered site.

---

## 5. Testing

❌ **The repository contains no tests and no test framework.**

| Item | Status |
|---|---|
| Frontend test runner (Jest/Vitest/Playwright/Cypress) | ❌ Not installed |
| `npm test` script | ❌ Not defined in `client/package.json` |
| Python test framework (pytest/unittest) | ❌ Not installed, no test files |
| CI workflow (`.github/workflows`) | ❌ Does not exist |

**Available verification today**

Lint the frontend:

```bash
cd client && npm run lint
```

Type-check the frontend:

```bash
cd client && npx tsc --noEmit
```

Production build (catches most real breakage):

```bash
cd client && npm run build
```

Smoke-test the atmosphere API:

```bash
curl -s "http://localhost:5000/api/data?planet=WASP-39%20b" | head -c 400
```

Smoke-test the classifier prediction path:

```bash
curl -s -X POST http://127.0.0.1:5003/predict -d "orbital_period=15&transit_depth=3269&planet_radius=6&stellar_radius=1.05" | grep -i -o "False Positive\|Candidate\|Confirmed" | head -3
```

Verify the model artifacts load standalone:

```bash
python -c "import joblib; m=joblib.load('server/classifier/models/xgboost_model.pkl'); print(m.n_features_in_, m.classes_)"
```

> Adding a test framework would be a repository change beyond documentation and is **not** done here.
> Recorded as an unresolved question in [DECISIONS.md](DECISIONS.md).

---

## 6. Model training

⚠️ **The training scripts cannot run against this repository without editing them first.**

Every script hardcodes `D:\exoplanet\...` paths that are **not** the repository's own directories:

| Script | Hardcoded constants |
|---|---|
| `training/data_preparation.py` | `RAW_DIR`, `PROCESSED_DIR` |
| `training/feature_engineering.py` | `PROCESSED_DIR`, `FEATURE_DIR`, `MODEL_DIR` |
| `training/lgbm_training.py` | `FEATURE_DIR`, `MODEL_DIR` |
| `training/inspect_columns.py` | `RAW_DIR` |

**To run the pipeline you must** either edit those constants to point at
`server/classifier/data/...` and `server/classifier/models/`, or replicate the `D:\exoplanet\`
directory layout and copy the raw CSVs into it.

Intended execution order:

```bash
python training/data_preparation.py
```

```bash
python training/feature_engineering.py
```

```bash
python training/lgbm_training.py
```

| Stage | Reads | Writes |
|---|---|---|
| 1 · `data_preparation` | `koi.csv`, `toi.csv`, `k2.csv` | `train_test_split/{train,test}.csv` |
| 2 · `feature_engineering` | `train_test_split/*.csv` | `features/{train,test}_features.csv`, `scaler.pkl`, `feature_cols.pkl` |
| 3 · `lgbm_training` | `features/*.csv` | `lightgbm_model.pkl`, `xgboost_model.pkl`, `ensemble_probs.npy` |

> ⚠️ **Running stage 2 or 3 overwrites the shipped production artifacts** at whatever `MODEL_DIR`
> points to. `feature_engineering.py` additionally *deletes* an existing `scaler.pkl` before writing.
> Back up `server/classifier/models/` before pointing `MODEL_DIR` at it.

**Known defects to expect** (documented, not fixed): the entire TOI catalogue is silently dropped, a
blanket `dropna()` removes a large share of remaining rows, XGBoost trains on a different slice than
LightGBM, and `lgbm_training.py` swallows exceptions and exits 0 on failure. Full detail:
[ML_MODEL.md](ML_MODEL.md#known-defects-in-the-training-pipeline).

---

## 7. Research notebook

Separate from the application. Reads `server/classifier/` **read-only** and writes only inside
`research/`.

```bash
pip install numpy pandas scipy scikit-learn matplotlib seaborn xgboost lightgbm imbalanced-learn joblib jupyter
```

```bash
jupyter notebook research/01_exoplanet_ml_research.ipynb
```

Or headless:

```bash
python -m nbconvert --to notebook --execute --inplace research/01_exoplanet_ml_research.ipynb
```

The notebook resolves the repository root itself (`find_repo_root()` walks up for `server/classifier`),
so it works from any working directory. Full runtime ≈ 30–60 min, dominated by two randomized searches.
See [../research/README.md](../research/README.md).

---

## 8. Common commands

| Task | Command |
|---|---|
| Start frontend | `cd client && npm run dev` |
| Start atmosphere | `cd server/atmosphere && python app.py` |
| Start classifier | `cd server/classifier && python app.py` |
| Lint frontend | `cd client && npm run lint` |
| Type-check | `cd client && npx tsc --noEmit` |
| Production build | `cd client && npm run build` |
| Preview prod build | `cd client && npm run build && npm start` |
| Add a shadcn component | `cd client && npx shadcn@latest add <component>` |
| Inspect atmosphere CSV | `cd server/atmosphere && python m.py` |
| Run research notebook | `python -m nbconvert --to notebook --execute --inplace research/01_exoplanet_ml_research.ipynb` |

---

## 9. Gotchas

1. **`pip install -r requirements.txt` fails** — the file is empty (and the README's path doesn't exist).
2. **Classifier startup fails without `scikit-learn`/`xgboost`/`lightgbm`**, despite the source never importing them.
3. **`/lab/atmosphericAnalysis` shows empty dropdowns** if the atmosphere service isn't on port 5000 — the failure is a silent `console.error` inside `try/catch`, not a visible UI error.
4. **The classifier sidebar link is `127.0.0.1:5003`**, not a relative route; it leaves the Next.js app entirely.
5. **Protected routes need Clerk keys** — `/explore`, `/lab`, `/play` are all gated by middleware.
6. **Atmosphere picks the first `*.csv` alphabetically** in its own directory; adding another CSV there can silently change the served dataset.
7. **Both backends run `debug=True`** with auto-reload — expect double startup logs and CSV double-loading.
8. **All transit/spectra curves are synthetic** — a property of the shipped CSV's columns, not a bug in your setup. See [DATA.md](DATA.md#consequence-all-curve-data-served-by-apidata-is-synthetic).

---

## Related documentation

[ENVIRONMENT.md](ENVIRONMENT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [API.md](API.md) · [ML_MODEL.md](ML_MODEL.md) · [DEPLOYMENT.md](DEPLOYMENT.md)
