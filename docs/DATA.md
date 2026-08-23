# Data

Every dataset in the repository: where it lives, what it is for, when it is read, and whether
deployment requires it.

Total committed data ≈ **86 MB**, of which **only ~0.3 MB is needed at runtime**.

---

## 1. Inventory

| # | Dataset | Path | Size | Used at |
|---|---|---|---|---|
| 1 | Atmosphere catalogue | `server/atmosphere/iac_exoplanet_atmospheres-20251002.csv` | 293 KB | **Runtime** |
| 2 | KOI cumulative | `server/classifier/data/raw/koi.csv` | 11.2 MB | Training · Research |
| 3 | TOI (TESS) | `server/classifier/data/raw/toi.csv` | 4.2 MB | Training (⚠️ discarded) · Research |
| 4 | K2 | `server/classifier/data/raw/k2.csv` | 7.6 MB | Training · Research |
| 5 | Light curves | `server/classifier/data/raw/lightcurves.csv` | 50.6 MB | ❌ **UNUSED** |
| 6 | Train/test split | `server/classifier/data/processed/train_test_split/{train,test}.csv` | 786 KB | Training intermediate |
| 7 | Engineered features | `server/classifier/data/processed/features/{train,test}_features.csv` | 1.9 MB | Training intermediate · Research benchmark |
| 8 | X/y splits | `server/classifier/data/processed/features/{X_train,X_test,y_train,y_test}*.csv` | 1.8 MB | ⚠️ Provenance **UNKNOWN** |
| 9 | Frontend CSVs | `client/public/train/{TOI_2025…,cumulative_2025…}.csv` | 7.4 MB | ❌ **UNUSED** |
| 10 | Research outputs | `research/outputs/*.csv`, `*.json`, `*.joblib` | ~11 MB | Research only |
| 11 | FAQ / steps | `client/public/data/{faqs,workingSteps}.ts` | 2.6 KB | **Runtime** (`faqs` only; `workingSteps` ❌ UNUSED) |

---

## 2. Atmosphere dataset — the only runtime dataset

**Path:** `server/atmosphere/iac_exoplanet_atmospheres-20251002.csv`
**Required for deployment:** ✅ **Yes** — the atmosphere service raises `FileNotFoundError` at import without it.

| Property | Value |
|---|---|
| Shape | **1,048 rows × 26 columns** |
| Distinct planets | 293 |
| Distinct types | 10 |
| Separator | `;` (semicolon) |
| Quoting | `csv.QUOTE_NONE` — `"` is treated as a literal character |
| Bad lines | `on_bad_lines="skip"` — malformed rows silently dropped |
| Source | Filename suggests IAC (Instituto de Astrofísica de Canarias), dated 2025-10-02. Exact provenance/licence: **UNKNOWN** — no metadata committed. |

### Path resolution

```
DATA_PATH = os.environ["EXO_DATA_PATH"]           # if set and non-empty
          else first *.csv in server/atmosphere/  # sorted(glob(...)) — currently only this file
```

⚠️ Adding any second `.csv` to `server/atmosphere/` could change which file loads, since selection is
`sorted(glob(...))[0]`.

### Columns (as committed)

`name`, `planet_status`, `mass`, `radius`, `type`, `orbital_period`, `semi_major_axis`, `star_name`,
`star_distance`, `star_teff`, `star_radius`, `temp_calculated`, `mag_v`, `mag_j`, `mag_k`,
`scale_factor`, `tsm`, `esm`, `alternate_names`, `updated`, `observation_type`, `reference`,
`molecules`, `albedo`, `phase_curve`, `comments`

### Resolved column mapping — verified

`load_data()` maps columns by keyword heuristics. Running that logic against the shipped CSV gives:

| `META` key | Resolved to | Note |
|---|---|---|
| `planet_col` | `name` | ✅ |
| `type_col` | `type` | ✅ |
| `molecules_col` | `molecules` | ✅ 1,048 non-null |
| `time_col` | `phase_curve` | ⚠️ Matched only because `phase_curve` contains `"phase"` — it is not a time axis |
| `bright_col` | **`None`** | No column matches |
| `wave_col` | **`None`** | No column matches |
| `morning_col` / `evening_col` | **`None`** | No column matches |

### ⚠️ Consequence: all curve data served by `/api/data` is synthetic

Because `bright_col` is `None`, the transit branch always falls through to `synth_transit()`.
Because `wave_col` is `None`, spectra always come from `synth_spectra()`. Both are deterministic,
seeded by `hash(planet_name)` via `_rng_for()`, and shaped by `radius`, `star_radius` and
`temp_calculated` from the row.

**Only `molecules` is real measured data** flowing through to the UI. This is a factual property of
the current code plus the current CSV — whether it was intended is **UNKNOWN**.

### Known data-quality artifact

Because `QUOTE_NONE` is used, quote characters survive into values. Type labels are literally
`"Hot Jupiter"`, `"Warm"`, `"UltraHot Jupiter"` — **including the double quotes** — and are returned
that way by `/api/types` and rendered in the frontend dropdown.

`molecules` cells are JSON-like strings, e.g. `{"CO":"Detection","H2O":"Detection"}`, sometimes
double-quoted/escaped. `parse_molecules_cell()` handles this with layered JSON attempts and a regex
fallback, keeping only values containing `detect` and not `non`.

---

## 3. Classifier raw datasets — training and research only

**Path:** `server/classifier/data/raw/` · **Required for deployment:** ❌ **No**
Nothing in `server/classifier/app.py` reads any file under `data/`.

| File | Shape | Target column | Read by |
|---|---|---|---|
| `koi.csv` | 9,564 × 141 | `koi_disposition` | `training/data_preparation.py`, research notebook |
| `toi.csv` | 7,699 × 87 | `tfopwg_disp` | `training/data_preparation.py` (⚠️ result discarded), research notebook |
| `k2.csv` | 4,004 × 295 | `disposition` | `training/data_preparation.py`, research notebook |
| `lightcurves.csv` | 50.6 MB, 25 cols | — | ❌ **UNUSED** by any code path |

All three catalogue files are NASA Exoplanet Archive exports with `#`-prefixed comment headers
(read with `comment="#"`, `engine="python"`, `on_bad_lines="skip"`).

### Target-label vocabularies — the source of a real defect

| Catalogue | Values present | Mapped by `data_preparation.py`? |
|---|---|---|
| KOI | `FALSE POSITIVE` (4,839), `CONFIRMED` (2,746), `CANDIDATE` (1,979) | ✅ all |
| K2 | `CONFIRMED` (2,315), `CANDIDATE` (1,374), `FALSE POSITIVE` (293), `REFUTED` (22) | ⚠️ `REFUTED` dropped |
| TOI | `PC` (4,678), `FP` (1,196), `CP` (683), `KP` (583), `APC` (461), `FA` (98) | ❌ **none** — all 7,699 rows dropped |

`map_labels()` maps only `{FALSE POSITIVE: 0, CANDIDATE: 1, CONFIRMED: 2}`, so every TOI row becomes
`NaN` and is removed by `dropna(subset=["label"])` with no warning. See
[ML_MODEL.md](ML_MODEL.md#known-defects-in-the-training-pipeline).

### `lightcurves.csv` (UNUSED, 50.6 MB — 59% of repository data)

Columns include `flux`, `flux_err`, `quality`, `timecorr`, `centroid_col`, `centroid_row`,
`cadenceno`, `sap_flux`, `pdcsap_flux`, `sap_quality`, `mom_centr1/2`, `pos_corr1/2`, `target`.
Raw photometric time series. Referenced only by `training/inspect_columns.py`, itself an unused
column-printing utility. No model consumes it.

---

## 4. Classifier processed datasets

**Path:** `server/classifier/data/processed/` · **Required for deployment:** ❌ **No**

### `train_test_split/`

| File | Rows | Columns |
|---|---|---|
| `train.csv` | 7,342 | 14 |
| `test.csv` | 1,836 | 14 |

Schema: the 13 harmonized physical features + `label`:

```
orbital_period, transit_duration, transit_depth, impact_parameter, eccentricity,
planet_radius, semi_major_axis, eq_temperature, stellar_radius, stellar_mass,
stellar_temp, stellar_logg, stellar_metallicity, label
```

Class distribution — `train`: `0`=3,649 · `2`=2,195 · `1`=1,498. `test`: `0`=913 · `2`=549 · `1`=374.
Total 9,178 rows, consistent with KOI+K2 after label mapping and `dropna()` (TOI absent, as expected).

### `features/`

| File | Rows | Columns | Notes |
|---|---|---|---|
| `train_features.csv` | 7,342 | 20 | 13 physical + 6 derived + `label` |
| `test_features.csv` | 1,836 | 20 | same |
| `X_train_features.csv` | 7,342 | 19 | features only |
| `X_test_features.csv` | 1,836 | 19 | features only |
| `y_train.csv` | 7,342 | 1 | `label` |
| `y_test.csv` | 1,836 | 1 | `label` |

⚠️ **`feature_engineering.py` writes only `train_features.csv` and `test_features.csv`.** The four
`X_*`/`y_*` files are **not produced by any script in the repository**. Their provenance is
**UNKNOWN** — most plausibly a manual export or a removed script. They are read by nothing.

The 1,836-row test split matches `models/ensemble_probs.npy` shape `(1836, 3)`, which is consistent
with those artifacts having been produced by the same training run.

---

## 5. Frontend datasets

| Path | Used? | Notes |
|---|---|---|
| `client/public/data/faqs.ts` | ✅ | Imported by `components/reusableComponents/faqs.tsx` |
| `client/public/data/workingSteps.ts` | ❌ **UNUSED** | Exports `workingSteps`; the only occurrence in the repository is its own declaration — no importer |
| `client/public/train/TOI_2025.10.01_09.55.48.csv` | ❌ **UNUSED** | 4.0 MB, no reference in `client/src/` |
| `client/public/train/cumulative_2025.10.01_09.54.29.csv` | ❌ **UNUSED** | 3.5 MB, no reference in `client/src/` |

The two `public/train/` CSVs appear to be duplicate NASA exports of TOI and KOI (dated 2025-10-01),
overlapping `server/classifier/data/raw/`. Because they sit in `public/`, Next.js would serve them
publicly — 7.4 MB of dead weight in the deployment bundle. Reason for their presence: **UNKNOWN**.

Local 3D/texture assets (`client/public/models/*.glb`, `client/public/textures/`) are runtime-required
by the 3D scenes; see [ARCHITECTURE.md](ARCHITECTURE.md#static-assets-clientpublic).

---

## 6. Research datasets

**Path:** `research/outputs/` · **Required for deployment:** ❌ **No**

Generated by `research/01_exoplanet_ml_research.ipynb`; fully regenerable by re-running it.
Includes `research_results.json` (all headline metrics), benchmark/comparison CSVs,
`permutation_importance.csv`, `confusion_matrix.csv`, ten `fig*.png` figures, and
`research_model.joblib` (10 MB, **not loaded by any service**).

The notebook reads `server/classifier/data/**` and `server/classifier/models/*.pkl` **read-only**.
See [../research/README.md](../research/README.md).

---

## 7. File-path dependencies

| Consumer | Path style | Portable? |
|---|---|---|
| `server/atmosphere/app.py` | `BASE_DIR` + `glob`, `EXO_DATA_PATH` override | ✅ Yes |
| `server/classifier/app.py` | `BASE_DIR/models/...` | ✅ Yes |
| `server/classifier/training/*.py` | Hardcoded `D:\exoplanet\...` | ❌ **No** — Windows-absolute, outside the repo |
| `research/01_..._research.ipynb` | `find_repo_root()` walks up for `server/classifier` | ✅ Yes |
| `client` static assets | `/models/...`, `/textures/...` | ✅ Yes |

The training scripts are the only path-portability defect. They neither read the repository's own
`data/raw/` nor write to its `models/`.

---

## 8. Deployment requirement summary

| Dataset | Required to deploy? |
|---|---|
| `server/atmosphere/iac_exoplanet_atmospheres-20251002.csv` | ✅ **Yes** — atmosphere service |
| `server/classifier/models/{lightgbm,xgboost,scaler,feature_cols}.pkl` | ✅ **Yes** — classifier service (models, not data) |
| `client/public/{models,textures,data/faqs.ts}` | ✅ **Yes** — frontend |
| `server/classifier/data/**` (all 74 MB) | ❌ No |
| `server/classifier/models/ensemble_probs.npy` | ❌ No |
| `client/public/train/*.csv` | ❌ No |
| `research/**` | ❌ No |

**Runtime data footprint is ~0.3 MB** (one CSV) plus ~11 MB of model artifacts. The remaining ~74 MB
is training/research material and unused files.

> This is an observation about what the running services read — **not a recommendation to delete
> anything**. Removing files is a behavioural change and out of scope for this documentation.

---

## Related documentation

[ML_MODEL.md](ML_MODEL.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [API.md](API.md) · [DEPLOYMENT.md](DEPLOYMENT.md)
