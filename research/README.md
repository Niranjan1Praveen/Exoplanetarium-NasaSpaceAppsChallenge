# Exoplanetarium — Machine Learning Research

Research companion to the Exoplanetarium exoplanet classifier
(`server/classifier/`), produced for the NASA Space Apps Challenge brief
*"A World Away: Hunting for Exoplanets with AI"*.

Everything in this directory is **additive**. No file outside `research/` was
created, modified, renamed or deleted. The existing application is untouched and
continues to work exactly as before.

---

## Research objective

> How effectively can supervised machine-learning models classify NASA exoplanet
> observations into their corresponding disposition classes, and how much can
> systematic preprocessing, feature engineering, class-imbalance handling, model
> comparison and hyperparameter optimisation improve classification performance?

Three-class supervised classification of Kepler transit detections:

| Class | Encoded |
|---|---|
| False Positive | 0 |
| Candidate | 1 |
| Confirmed | 2 |

The encoding matches the one used by the production service in
`server/classifier/app.py`, so results here are directly comparable with the
shipped models.

---

## Dataset — sourced entirely from this repository

| Item | Value |
|---|---|
| Primary dataset | `server/classifier/data/raw/koi.csv` (NASA Exoplanet Archive KOI cumulative table) |
| Objects | 9,564 |
| Distinct host stars | 8,214 |
| Target column | `koi_disposition` |
| Classes | False Positive, Candidate, Confirmed |
| Features used | 112 (79 archival + 33 engineered) |

Also read (read-only): `server/classifier/data/raw/toi.csv`,
`server/classifier/data/raw/k2.csv`,
`server/classifier/data/processed/**`, and the shipped artefacts in
`server/classifier/models/` (`lightgbm_model.pkl`, `xgboost_model.pkl`,
`scaler.pkl`, `feature_cols.pkl`), which are benchmarked as the production
baseline.

---

## Notebooks

| Notebook | Contents |
|---|---|
| `01_exoplanet_ml_research.ipynb` | The complete study: repository audit, EDA, leakage analysis, feature engineering, split design, baselines, model benchmark, imbalance experiments, hyperparameter optimisation, ensembling, final holdout evaluation, error analysis and interpretability. |

A single notebook was kept rather than split across three, because the analysis
is one continuous argument — the leakage findings determine the feature set, the
feature set determines the split, and the split determines every metric that
follows. Splitting it would have meant re-deriving state across files with no
benefit to the reader.

---

## Methodology

### Repository audit (documented discrepancies)

The audit found three issues in the existing pipeline, all verified
programmatically in the notebook:

1. **The TESS catalogue is silently discarded.** `training/data_preparation.py`
   maps only the strings `FALSE POSITIVE` / `CANDIDATE` / `CONFIRMED`. TESS uses
   the TFOPWG codes `PC`, `CP`, `KP`, `FP`, `APC`, `FA`, none of which match, so
   every TOI row becomes `NaN` and is dropped without any error. K2's `REFUTED`
   class is lost the same way.
2. **A blanket `dropna()` removes a large share of the surviving rows**, because
   it requires all 13 physical parameters to be present simultaneously.
3. **Nine of the thirteen model inputs are fixed constants at inference time** —
   the Flask UI collects four sliders and `create_features()` fills the rest with
   placeholders, so the served model is queried far outside its training
   distribution on two-thirds of its inputs.

`server/classifier/README.md` and `server/classifier/requirements.txt` are both
present but empty (0 bytes), so the pipeline description in the notebook was
reconstructed from source rather than documentation.

### Leakage analysis

Two distinct leakage channels were identified and removed.

**Direct** (24 columns) — `koi_pdisposition`
(another classifier's answer), `koi_score` (the Robovetter's disposition
confidence), the four `koi_fpflag_*` vetting flags (which *define* the false
positive label), `kepler_name` (non-null if and only if the object is confirmed),
plus identifiers and provenance strings. A model built from these columns alone
reaches **0.9995** accuracy — reported in the
notebook only so it can be rejected.

**Indirect** (22 columns) — stellar-parameter
uncertainties (`koi_steff_err*`, `koi_srad_err*`, `koi_smass_err*`,
`koi_slogg_err*`, `koi_smet_err*`) and every quantity derived from them
(`koi_prad_err*`, `koi_sma_err*`, `koi_teq_err*`, `koi_insol_err*`,
`koi_dor_err*`). Confirming a planet triggers dedicated host-star
characterisation, so confirmed objects have systematically smaller uncertainties
and are almost never missing them, while candidates and false positives are
missing them several percent of the time. That signature is created *after* the
disposition and cannot be used to predict it. Removing these columns lowered the
headline accuracy and improved the physical interpretability of what remained.

**Deliberately retained:** the automated Data Validation diagnostics
(`koi_model_snr`, `koi_max_mult_ev`, `koi_bin_oedp_sig`, the centroid-offset
columns, `koi_count`, `koi_num_transits`). These are computed by the Kepler
pipeline from photometry and pixel data *before* any disposition exists — they
are the inputs a vetter examines, not the outputs a vetter produces. The
reasoning is set out explicitly in the notebook so a reader can disagree with it.

### Split design

Multiple objects of interest orbit the same host star and share identical
stellar parameters, so a random row-level split leaks stellar information
between train and test. All splits use `StratifiedGroupKFold` grouped by
`kepid` (host star):

* Development: 7,650 rows
* Sealed holdout: 1,914 rows
* Host stars shared between the two: **0**

The holdout is assigned before any modelling and evaluated exactly once, at the
end, by the single model selected on cross-validated development scores.

### Feature engineering

* The six derived features from `training/feature_engineering.py`, reproduced
  verbatim (including its epsilon-guarded denominators).
* Log transforms of the strongly right-skewed extensive quantities — needed for a
  fairly configured linear baseline, neutral for trees.
* Explicit false-positive signatures: grazing-geometry and implausible-radius
  indicators.
* Centroid-offset significance (offset divided by its own uncertainty).
* Single- to multiple-event statistic ratio, and a transit
  duration/period consistency ratio.
* Missingness indicators, built only for transit-fit and DV columns — never for
  stellar-parameter columns, whose missingness was shown to be
  follow-up contaminated.

All transformations are row-wise and target-free, so applying them before
splitting cannot leak. Statistics that depend on other rows (imputation medians,
scaler parameters) are fitted inside per-fold pipelines only.

### Class imbalance

Class weighting, `RandomOverSampler` and SMOTE were compared against no
treatment, with all resampling performed **inside** each cross-validation fold
via an `imblearn.pipeline.Pipeline`. A median-imputation-only control isolates
the cost of imputation from the effect of resampling.

**None of the treatments mattered.** All five configurations finished within well
under a percentage point of each other, comparable to the fold noise. Two
expectations recorded in the notebook before running were contradicted and are
retained rather than edited away: class weighting was expected to trade accuracy
for balanced accuracy but moved every metric slightly down, and SMOTE was
predicted to hurt but instead came out level on macro-F1 with the highest
balanced accuracy of any configuration tested. No treatment is carried forward,
not because the alternatives failed, but because none earned the extra pipeline
complexity.

### Hyperparameter optimisation

`RandomizedSearchCV`, 12 candidates x 3 group-aware folds per model (36 fits
each), optimising **macro F1** rather than accuracy so the minority `Candidate`
class is not quietly abandoned. Selected configurations were then re-scored under
the full 5-fold protocol. The full search trace is in
`outputs/hyperparameter_search_trace.csv`.

**Tuning produced essentially nothing.** Tuned XGBoost gained less than its own
fold-to-fold standard deviation over the default configuration, and tuned
LightGBM scored slightly *below* the default from the benchmark — a configuration
that won narrowly on the search's 3 folds losing narrowly on the 5-fold
re-scoring, which is what noise at this scale looks like. This is reported
because it locates where the value in this study actually came from: the feature
and leakage decisions, not the optimiser.

---

## Models evaluated

Logistic Regression, Random Forest, Extra Trees, HistGradientBoosting, XGBoost,
LightGBM, plus tuned variants and a soft-voting ensemble. Baselines:
`DummyClassifier` (most-frequent and stratified).

### Benchmark — 5-fold group-aware CV on the development set

| Model | Accuracy | Balanced Acc | Precision Macro | Recall Macro | F1 Macro | F1 Weighted | Fit time (s) |
|---|---|---|---|---|---|---|---|
| LightGBM | 0.8630 | 0.8275 | 0.8355 | 0.8275 | 0.8300 | 0.8600 | 94.2 |
| XGBoost | 0.8599 | 0.8234 | 0.8322 | 0.8234 | 0.8263 | 0.8566 | 112.1 |
| HistGradientBoosting | 0.8588 | 0.8214 | 0.8305 | 0.8214 | 0.8245 | 0.8555 | 115.3 |
| Extra Trees | 0.8582 | 0.8151 | 0.8337 | 0.8151 | 0.8211 | 0.8531 | 10.2 |
| Random Forest | 0.8580 | 0.8128 | 0.8331 | 0.8128 | 0.8192 | 0.8524 | 18.7 |
| Logistic Regression | 0.8292 | 0.7940 | 0.7918 | 0.7940 | 0.7922 | 0.8271 | 4.3 |

---

## Results

### Best model

**Soft Voting ensemble** — selected by a decision rule fixed before the results
were seen (adopt an ensemble only if its cross-validated macro-F1 beats the best
single model). Its margin over the best single tuned model is smaller than the
fold-to-fold standard deviation and it costs roughly three times the fit time, so
it should be read as a tie rather than a decisive win; a practitioner would be
justified in deploying the single tuned XGBoost instead.

Tuned hyperparameters found by the search:

```json
{
  "XGBoost (tuned)": {
    "subsample": 0.8,
    "reg_lambda": 10.0,
    "reg_alpha": 1.0,
    "n_estimators": 700,
    "min_child_weight": 3,
    "max_depth": 8,
    "learning_rate": 0.1,
    "gamma": 0.5,
    "colsample_bytree": 1.0
  },
  "LightGBM (tuned)": {
    "subsample": 0.7,
    "reg_lambda": 5.0,
    "reg_alpha": 0.1,
    "num_leaves": 31,
    "n_estimators": 300,
    "min_child_samples": 20,
    "max_depth": 6,
    "learning_rate": 0.04,
    "colsample_bytree": 0.7
  }
}
```

### Cross-validation (development set)

| Metric | Value |
|---|---|
| Accuracy | 0.8621 |
| F1 Macro | 0.8287 |

### Final holdout — evaluated once, on data untouched until this point

| Metric | Value |
|---|---|
| **Accuracy** | **0.8678** (86.78%) |
| Balanced accuracy | 0.8334 |
| Precision (macro) | 0.8424 |
| Recall (macro) | 0.8334 |
| **F1 (macro)** | **0.8366** |
| **F1 (weighted)** | **0.8646** |
| ROC-AUC (OvR, macro) | 0.9613 |
| ROC-AUC (OvR, weighted) | 0.9668 |

Accuracy gate (`final_accuracy > 0.80`): **PASS** — enforced by an `assert` in
the notebook, strictly greater than, not rounded.

### Confusion matrix (holdout, counts — rows are truth, columns are predictions)

| | False Positive | Candidate | Confirmed |
|---|---|---|---|
| **False Positive** | 888 | 68 | 12 |
| **Candidate** | 100 | 251 | 45 |
| **Confirmed** | 3 | 25 | 522 |

### Progression

| Approach | Features | Accuracy | F1 Macro | Evaluated on |
|---|---|---|---|---|
| Shipped Exoplanetarium ensemble (own data & split) | 19 | 0.7200 | 0.6751 | production test split |
| Research baseline: Logistic Regression | 112 | 0.8292 | 0.7922 | development CV |
| Production recipe, retrained on this split | 19 | 0.7351 | 0.6758 | sealed holdout |
| Research model: Soft Voting ensemble | 112 | 0.8678 | 0.8366 | sealed holdout |

The like-for-like row is the meaningful comparison: the production feature recipe
retrained on the *same* rows, the *same* split and the *same* algorithm family as
the research model, differing only in the feature set and the missing-data
policy.

### What actually improved, in order of contribution

1. **Retaining the Data Validation diagnostics** — centroid offsets,
   multiple-event statistics, odd-even depth tests and detection significance,
   all absent from the production feature set. Largest single contributor.
2. **Preserving missing values** (and encoding missingness explicitly) instead of
   dropping incomplete rows.
3. **Modelling one well-characterised catalogue** rather than the intersection of
   three missions.
4. **Hyperparameter tuning** — real, but the smallest of the four.

The algorithm was not the bottleneck. The production system already uses XGBoost
and LightGBM, the same families that win the benchmark here. The improvement
comes from what the models were allowed to see.

---

## Reproducing this research

From the repository root:

```bash
pip install numpy pandas scipy scikit-learn matplotlib seaborn xgboost lightgbm imbalanced-learn joblib jupyter
```

```bash
jupyter notebook research/01_exoplanet_ml_research.ipynb
```

Then *Kernel -> Restart & Run All*. Or execute headlessly:

```bash
python -m nbconvert --to notebook --execute --inplace research/01_exoplanet_ml_research.ipynb
```

Notes:

* The notebook resolves the repository root by walking upward for the
  `server/classifier` marker, so no absolute path is hard-coded and it runs after
  a fresh clone on any OS.
* `RANDOM_STATE = 42` throughout; splits, searches and models are seeded.
* `seaborn`, `xgboost`, `lightgbm`, `imbalanced-learn` and `shap` are optional —
  the notebook degrades gracefully and reports what is missing rather than
  failing.
* End-to-end runtime is dominated by the two randomised searches; expect roughly
  30-60 minutes on a typical laptop.

### Generated outputs

`outputs/` is written by the notebook and can be deleted and regenerated:

| File | Contents |
|---|---|
| `research_results.json` | All headline metrics, machine-readable |
| `model_benchmark.csv` | Full cross-validated model comparison |
| `imbalance_experiments.csv` | Class-imbalance treatment comparison |
| `hyperparameter_search_trace.csv` | Every configuration tried, with its CV score |
| `selection_pool.csv` | Final model-selection candidates |
| `final_comparison.csv` | Production vs research progression |
| `permutation_importance.csv` | Holdout permutation importance, all features |
| `confusion_matrix.csv` | Holdout confusion matrix |
| `research_model.joblib` | The fitted selected model |
| `research_feature_columns.joblib` | Its expected feature order |
| `fig01`-`fig10*.png` | All figures |

---

## Limitations

These bound how far the result should be read.

* **Kepler only.** Kepler's DV diagnostic suite is not available in the same form
  for TESS, so this model does **not** transfer directly to the TOI catalogue and
  does **not** supersede the production system's multi-mission scope.
* **The `Candidate` class is partly unpredictable in principle.** Whether an
  object is still a candidate depends on follow-up resources, target priority and
  observing time — none of which appear in the photometry. There is a ceiling on
  `Candidate` recall that no model on these features can breach, and it is where
  almost all remaining error sits.
* **Selection effects are baked into the labels.** High-SNR detections around
  bright stars were preferentially followed up and therefore preferentially
  confirmed. The model partly learns what was *easy to confirm*.
* **The DV-diagnostic decision is a judgement call.** Defensible as
  pre-disposition inputs, but a stricter reviewer could argue automated vetting
  diagnostics sit too close to the vetting outcome.
* **Dispositions are revised over time**, placing an irreducible noise floor on
  achievable accuracy.
* **Single holdout split.** Repeated splits or nested CV would tighten the
  confidence interval on the final figure.
* **No light-curve modelling.** `data/raw/lightcurves.csv` (53 MB of raw
  photometry) is present but unused; 1-D CNNs on folded light curves are the
  state of the art and the natural next step.

---

## Suggested next steps for Exoplanetarium

1. Extend the inference schema to accept DV diagnostics when available, falling
   back to the current physical-parameter model when they are not.
2. Replace the blanket `dropna()` in `training/data_preparation.py` with native
   missing-value handling.
3. Fix the TESS label mapping so `toi.csv` is not silently discarded.
4. Expose predicted probabilities as a ranking with a low-confidence abstention
   band — the error analysis shows confidence separates correct from incorrect
   predictions well.
5. Explore the unused light-curve data with a 1-D CNN.
