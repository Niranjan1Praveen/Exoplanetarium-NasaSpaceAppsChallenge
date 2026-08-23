# ML Model

The production classifier, its artifacts, and its relationship to the training scripts and the
research study. Everything here is derived from the code and the serialized artifacts as they exist.

---

## 1. Production classifier at a glance

| Property | Value | Source of truth |
|---|---|---|
| Task | 3-class classification of a transit detection | `server/classifier/app.py` |
| Classes | `0 = False Positive`, `1 = Candidate`, `2 = Confirmed` | `class_map` in `app.py` |
| Models | LightGBM + XGBoost, soft-voted | `models/*.pkl` |
| Combination | Arithmetic mean of `predict_proba`, then `argmax` | `predict()` in `app.py` |
| Model input width | **19 features** | `feature_cols.pkl`, and `n_features_in_` on both models |
| UI input width | **4 values** | `FEATURES` in `app.py` |
| Scaler input width | **6 features** (derived only) | `scaler.pkl` `n_features_in_` |

---

## 2. Model artifacts — `server/classifier/models/`

| File | Size | Type | Loaded at runtime? | Purpose |
|---|---|---|---|---|
| `lightgbm_model.pkl` | 1.6 MB | `lightgbm.sklearn.LGBMClassifier` | ✅ Yes | Ensemble member 1 |
| `xgboost_model.pkl` | 9.4 MB | `xgboost.sklearn.XGBClassifier` | ✅ Yes | Ensemble member 2 |
| `scaler.pkl` | 1.1 KB | `sklearn.preprocessing.StandardScaler` | ✅ Yes | Scales the 6 derived features only |
| `feature_cols.pkl` | 342 B | `list[str]` (19 names) | ✅ Yes | Canonical feature order |
| `ensemble_probs.npy` | — | `ndarray (1836, 3)` | ❌ **No** | Training-time artifact; never read by `app.py` |
| `__init__.py` | 0 B | — | ❌ No | Makes the directory importable; nothing imports it |

**Verified artifact metadata**

```
xgboost_model.pkl   n_features_in_ = 19   classes_ = [0 1 2]      (int)
lightgbm_model.pkl  n_features_in_ = 19   classes_ = [0. 1. 2.]   (float)
scaler.pkl          n_features_in_ = 6
ensemble_probs.npy  shape = (1836, 3)     ← matches the 1,836-row test split
```

> ⚠️ **Class-label dtype mismatch:** XGBoost reports integer classes, LightGBM float. This is harmless
> for the current code because `predict()` uses `np.argmax` over the averaged probability array and
> never reads `classes_`. It would matter if anyone indexed by class label. Cause: **UNKNOWN** —
> most likely the differing `y` dtypes passed during training.

### How models are loaded

At **module import time** in `server/classifier/app.py` (not lazily, not per-request):

```
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
lgb_model, xgb_model, scaler, feature_cols = joblib.load(...)   # 4 separate calls
```

Paths are **repo-relative and portable**. A missing or unreadable artifact raises at import, so the
process fails to start rather than failing per-request. Serialization format is joblib pickle, which
carries an implicit dependency on compatible `scikit-learn` / `xgboost` / `lightgbm` versions —
**no version is pinned anywhere** (see [ENVIRONMENT.md](ENVIRONMENT.md)).

---

## 3. Input schema

### 3a. What the user supplies (4 values)

`FEATURES` in `app.py`, rendered as sliders by `templates/index.html`:

| Field | Unit | Min | Max | Default |
|---|---|---|---|---|
| `orbital_period` | days | 0.5 | 50 | 15 |
| `transit_depth` | ppm | 100 | 10000 | 3269 |
| `planet_radius` | R⊕ | 0.5 | 20 | 6 |
| `stellar_radius` | R☉ | 0.5 | 2 | 1.05 |

### 3b. What the model consumes (19 features, `feature_cols.pkl` order)

| # | Feature | Group | Origin at inference |
|---|---|---|---|
| 1 | `orbital_period` | physical | user |
| 2 | `transit_duration` | physical | ⚠️ placeholder `1.0` |
| 3 | `transit_depth` | physical | user |
| 4 | `impact_parameter` | physical | ⚠️ placeholder `0.5` |
| 5 | `eccentricity` | physical | ⚠️ placeholder `0.0` |
| 6 | `planet_radius` | physical | user |
| 7 | `semi_major_axis` | physical | ⚠️ placeholder `1.0` |
| 8 | `eq_temperature` | physical | ⚠️ placeholder `1.0` |
| 9 | `stellar_radius` | physical | user |
| 10 | `stellar_mass` | physical | ⚠️ placeholder `1.0` |
| 11 | `stellar_temp` | physical | ⚠️ placeholder `5800.0` |
| 12 | `stellar_logg` | physical | ⚠️ placeholder `4.44` |
| 13 | `stellar_metallicity` | physical | ⚠️ placeholder `0.0` |
| 14 | `transit_snr` | derived → **scaled** | computed |
| 15 | `planet_star_ratio` | derived → **scaled** | computed |
| 16 | `depth_radius_ratio` | derived → **scaled** | computed |
| 17 | `impact_factor` | derived → **scaled** | computed |
| 18 | `scaled_teq` | derived → **scaled** | computed |
| 19 | `log_orbital_period` | derived → **scaled** | computed |

The 13 "physical" names are listed in `PHYSICAL_FEATURES` (identical in `app.py` and
`training/feature_engineering.py`). The 6 derived features are exactly `feature_cols − PHYSICAL_FEATURES`,
which is why `scaler.n_features_in_ == 6`.

> ⚠️ **Nine of thirteen physical inputs are constants at inference time.** The models were trained on
> the real distributions of those nine variables, so at serving time they are queried far outside the
> training distribution on two-thirds of their physical inputs. Consequence for accuracy: **UNKNOWN** —
> not measured anywhere in the repository. Rationale for this design: **UNKNOWN**; no comment, commit
> message, or document explains it. Recorded in [DECISIONS.md](DECISIONS.md).

---

## 4. Feature engineering

Identical formulas appear in `app.py::create_features()` (inference) and
`training/feature_engineering.py::engineer_features()` (training), with `EPSILON = 1e-6`:

| Feature | Formula |
|---|---|
| `transit_snr` | `transit_depth / (transit_duration + ε)` |
| `planet_star_ratio` | `planet_radius / (stellar_radius + ε)` |
| `depth_radius_ratio` | `transit_depth / (planet_radius + ε)` |
| `impact_factor` | `impact_parameter / (stellar_radius + ε)` |
| `scaled_teq` | `eq_temperature / (stellar_temp + ε)` |
| `log_orbital_period` | `log1p(orbital_period)` |

The formulas are **duplicated by hand** in two files rather than shared through a common module.
They currently agree; nothing enforces that they stay in sync. See [DECISIONS.md](DECISIONS.md).

---

## 5. Preprocessing

**Partial scaling** — the distinguishing choice of this pipeline:

```
derived_cols = [c for c in feature_cols if c not in PHYSICAL_FEATURES]   # the 6 derived
df[derived_cols] = scaler.transform(df[derived_cols])                    # physical left raw
```

The 13 physical features are passed to the models **unscaled**; only the 6 derived ratios are
standardized. Training does the same (`cols_to_scale` in `feature_engineering.py`). Rationale:
**UNKNOWN** — tree ensembles are scale-invariant, so the scaler has no expected effect on either
model's output, but no comment or commit explains why it was introduced.

Missing values at training time were handled by **median imputation** using training medians
(`impute_data()` in `feature_engineering.py`). At inference no imputation is needed, because every
column is either user-supplied or placeholder-filled.

---

## 6. Inference flow

```
POST /predict  (4 form fields)
   │
   ├─ user_input = {f: float(request.form[f]) for f in FEATURES}
   │
   ├─ create_features(user_input)
   │     1. DataFrame from the 4 user values
   │     2. inject 9 placeholder constants
   │     3. compute the 6 derived features
   │     4. add any remaining feature_cols as 0        ← no-op today; all 19 exist by now
   │     5. reorder to feature_cols  (df = df[feature_cols])
   │     6. scaler.transform(derived_cols) only
   │
   ├─ lgb_probs = lgb_model.predict_proba(X)           # (1, 3)
   ├─ xgb_probs = xgb_model.predict_proba(X)           # (1, 3)
   ├─ ensemble_probs = (lgb_probs + xgb_probs) / 2     # equal weight, hardcoded
   │
   ├─ pred_class_index = argmax(ensemble_probs)
   ├─ pred_class = class_map[idx]                      # 0 FP · 1 Candidate · 2 Confirmed
   └─ render result.html (pred_class, prob_display, ensemble_probs, user_input)
```

Step 4 is defensive and currently unreachable — all 19 columns already exist by that point. If a
future `feature_cols.pkl` added a name, it would be silently filled with `0` rather than raising.

---

## 7. Training scripts — `server/classifier/training/`

⚠️ **None of these scripts can run against this repository without editing.** Every one hardcodes
`D:\exoplanet\...` paths that are *not* the repository's own `data/` and `models/` directories.

| Script | Role | Reads | Writes | Runnable as-is? |
|---|---|---|---|---|
| `data_preparation.py` | Load KOI/TOI/K2, harmonize columns, map labels, split | `D:\exoplanet\data\raw\{koi,toi,k2}.csv` | `D:\exoplanet\data\processed\train_test_split\{train,test}.csv` | ❌ |
| `feature_engineering.py` | Derive 6 features, impute, partial-scale, save scaler | `…\train_test_split\*.csv` | `…\features\*.csv`, `D:\exoplanet\models\{scaler,feature_cols}.pkl` | ❌ |
| `lgbm_training.py` | Train LightGBM (5-fold CV + early stopping) and XGBoost, ensemble | `…\features\*.csv` | `D:\exoplanet\models\{lightgbm_model,xgboost_model,ensemble_probs}` | ❌ |
| `inspect_columns.py` | Print columns of `lightcurves.csv` | `D:\exoplanet\data\raw\lightcurves.csv` | stdout | ❌ · **UNUSED** utility |

Pipeline order: `data_preparation.py` → `feature_engineering.py` → `lgbm_training.py`.

### Known defects in the training pipeline

These are properties of the current code, verified programmatically in the research notebook:

1. **The entire TESS catalogue is silently discarded.** `map_labels()` maps only
   `FALSE POSITIVE / CANDIDATE / CONFIRMED`. TESS `tfopwg_disp` uses `PC, CP, KP, FP, APC, FA` — none
   match, so every TOI row becomes `NaN` and is dropped by `dropna(subset=["label"])`, with no warning.
   K2's `REFUTED` class is lost the same way.
2. **A blanket `data.dropna()`** requires all 13 physical parameters simultaneously, discarding a large
   share of the remaining rows.
3. **XGBoost trains on a different slice than LightGBM.** In `train_xgboost()`, the early-stopping
   branch fits on `X_train.iloc[200:]` and validates on `X_train.iloc[:200]` — a positional, unshuffled
   split — so the two ensemble members do not see the same training data. Rationale: **UNKNOWN**.
4. **Broad exception swallowing.** `lgbm_training.py`'s `__main__` wraps everything in
   `except Exception as e: print(...)`, so a training failure exits with status 0.

### Relationship between training artifacts and production inference

| Question | Answer |
|---|---|
| Do the shipped `.pkl` files come from these scripts? | **Consistent with them** — shapes and names match (19 features, 6 scaled, 3 classes). **Not provable** from the repository: no run log, no model card, no training timestamp is committed. Treat as **UNKNOWN**. |
| Can they be regenerated today? | ❌ No — hardcoded paths must be edited first. |
| Does `app.py` read anything under `data/`? | ❌ No. Inference depends only on `models/`. |
| Is `ensemble_probs.npy` used in production? | ❌ No — written by `run_ensemble()`, never read. Its 1,836 rows equal the test-split size. |

Orphaned compiled modules `__pycache__/model_loader.cpython-313.pyc` and `preprocess.cpython-313.pyc`
have **no `.py` source in the repository and no importers**. They indicate an earlier refactor whose
sources were removed. Their contents are **UNKNOWN** and they are dead weight. The `cpython-313` tag
implies Python 3.13 was used at some point.

---

## 8. Research model — NOT production

`research/` is a **separate, additive study**. It shares data with the classifier but no code, and
nothing in it is imported by any application.

| | Production | Research |
|---|---|---|
| Location | `server/classifier/` | `research/` |
| Artifact | `models/{lightgbm,xgboost}_model.pkl` | `research/outputs/research_model.joblib` |
| Loaded by a running service? | ✅ Yes | ❌ **No** |
| Features | 19 (13 physical + 6 derived) | 112 (79 archival + 33 engineered) |
| Data | Pooled KOI + K2 (TOI silently dropped) | KOI only (`data/raw/koi.csv`) |
| Split | Random row-level, `train_test_split` | Group-aware by `kepid` (host star), sealed holdout |
| Missing values | Dropped via `dropna()` | Retained; missingness encoded as features |
| Measured accuracy | 0.7200 (shipped ensemble, own test split) | 0.8678 (sealed holdout) |

The research study reads `server/classifier/` **read-only** and modified nothing there. Its full
methodology, leakage audit and measured results are in [../research/README.md](../research/README.md)
and the executed notebook `research/01_exoplanet_ml_research.ipynb`.

> **Do not treat the research figures as production metrics.** They were measured on a different
> dataset scope, a different feature set and a different splitting strategy. Promoting the research
> model into `server/classifier/` would be a behavioural change and is **not** in scope of the current
> repository state.

---

## Related documentation

[ARCHITECTURE.md](ARCHITECTURE.md) · [DATA.md](DATA.md) · [API.md](API.md) · [DECISIONS.md](DECISIONS.md) · [../research/README.md](../research/README.md)
