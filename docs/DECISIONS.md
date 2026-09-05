# Decisions

Architectural and design decisions **observable in the repository**.

> **Evidence rule for this document.** Rationale is stated only where the repository supports it —
> code comments, commit messages, `research/README.md`, or an unambiguous structural fact. Where a
> decision is visible but its reasoning is not recorded anywhere, rationale is marked **UNKNOWN**
> rather than reconstructed. A plausible-sounding guess would be indistinguishable from a fact once
> written down, so none are offered.
>
> The repository has **no ADR directory, no design docs, and no inline `# why:` comments**. Almost all
> rationale below is therefore UNKNOWN. That is a finding about the repository, not an omission here.

---

## Index

| # | Decision | Rationale |
|---|---|---|
| [D1](#d1--three-independent-processes) | Three independent processes | UNKNOWN |
| [D2](#d2--classifier-is-a-separate-site-not-an-api) | Classifier is a separate site, not an API | UNKNOWN |
| [D3](#d3--backend-urls-hardcoded-to-localhost) | Backend URLs hardcoded to localhost | UNKNOWN |
| [D4](#d4--lightgbm--xgboost-soft-voting-ensemble) | LightGBM + XGBoost soft-voting ensemble | Partially evidenced |
| [D5](#d5--nine-of-thirteen-model-inputs-are-placeholders) | Nine of thirteen model inputs are placeholders | UNKNOWN |
| [D6](#d6--partial-scaling-derived-features-only) | Partial scaling — derived features only | UNKNOWN |
| [D7](#d7--six-hand-derived-physical-ratio-features) | Six hand-derived physical ratio features | Partially evidenced |
| [D8](#d8--blanket-dropna-in-data-preparation) | Blanket `dropna()` in data preparation | UNKNOWN |
| [D9](#d9--label-map-covers-only-the-koik2-vocabulary) | Label map covers only the KOI/K2 vocabulary | UNKNOWN |
| [D10](#d10--training-scripts-use-absolute-dexoplanet-paths) | Training scripts use absolute `D:\exoplanet\` paths | UNKNOWN |
| [D11](#d11--atmosphere-resolves-columns-by-keyword-heuristics) | Atmosphere resolves columns by keyword heuristics | Partially evidenced |
| [D12](#d12--synthetic-fallback-curves) | Synthetic fallback curves | Evidenced |
| [D13](#d13--unrestricted-cors-on-atmosphere-none-on-classifier) | Unrestricted CORS on atmosphere, none on classifier | Evidenced |
| [D14](#d14--clerk-auth-on-three-route-groups) | Clerk auth on three route groups | Evidenced |
| [D15](#d15--gemini-called-client-side) | Gemini called client-side | UNKNOWN |
| [D16](#d16--datasets-and-model-artifacts-committed-to-git) | Datasets and model artifacts committed to git | UNKNOWN |
| [D17](#d17--research-kept-strictly-separate-from-production) | Research kept strictly separate from production | **Fully evidenced** |
| [D18](#d18--research-uses-koi-only-with-a-group-aware-split) | Research uses KOI only, group-aware split | **Fully evidenced** |
| [D19](#d19--research-excludes-46-leakage-columns) | Research excludes 46 leakage columns | **Fully evidenced** |
| [D20](#d20--no-tests-and-no-ci) | No tests and no CI | UNKNOWN |

---

## Application architecture

### D1 — Three independent processes

**Decision.** Frontend (Next.js), atmosphere API (Flask), and classifier (Flask) run as three separate
processes with no shared code, config, or data store.

**Evidence.** Separate directories; no cross-imports between `server/atmosphere` and
`server/classifier`; no shared module; three independent dependency sets.

**Rationale.** **UNKNOWN.** The README's team table lists distinct frontend, API and AI/ML roles, which
is *consistent with* a team-parallelism split, but no document states this as the reason.

**Consequence.** Each backend is independently deployable ([DEPLOYMENT.md](DEPLOYMENT.md#4-independent-deployability)); feature-engineering logic is duplicated (see [D7](#d7--six-hand-derived-physical-ratio-features)).

---

### D2 — Classifier is a separate site, not an API

**Decision.** The classifier renders its own Jinja2 HTML (`templates/index.html`, `result.html`) and is
reached by a hyperlink, not consumed as JSON.

**Evidence.** `server/classifier/app.py` uses `render_template`, has no CORS, and returns no JSON.
`client/src/components/labDashboard/sidebar.tsx` links to `http://127.0.0.1:5003`, leaving the SPA.

**Rationale.** **UNKNOWN.** Notably, the *atmosphere* service made the opposite choice — its comment
`# Enable CORS for Next.js frontend` shows JSON-for-Next.js was a deliberate, documented choice there.
No equivalent note explains why the classifier diverged.

**Consequence.** Two different UI paradigms; the classifier's styling and auth are outside Clerk's control.

---

### D3 — Backend URLs hardcoded to localhost — ⚠️ SUPERSEDED by [D21](#d21--backend-urls-moved-to-build-time-environment-variables)

**Original decision.** Backend addresses were string literals in frontend source, not configuration.

**Evidence.** `http://localhost:5000` (×2) in `atmosphericAnalysis/page.tsx`; `http://127.0.0.1:5003`
in `sidebar.tsx`. No `NEXT_PUBLIC_*_URL` variable existed.

**Rationale.** **UNKNOWN.** No comment or commit explained it. It is *consistent with* hackathon-speed
development, but the repository does not say so.

**Status.** Resolved — the three literals were replaced by `NEXT_PUBLIC_ATMOSPHERE_URL` and
`NEXT_PUBLIC_CLASSIFIER_URL`. See [D21](#d21--backend-urls-moved-to-build-time-environment-variables).

---

## Machine learning

### D4 — LightGBM + XGBoost soft-voting ensemble

**Decision.** Two gradient-boosting models, probabilities averaged with equal weight, then `argmax`.

**Evidence.** `app.py`: `ensemble_probs = (lgb_probs + xgb_probs) / 2`. The same combination appears in
`training/lgbm_training.py::run_ensemble()`. `README.md` states *"Utilizes LightGBM and XGBoost
ensemble models for robust predictions."*

**Rationale.** **Partially evidenced** — the README asserts the goal ("robust predictions") but no
comparison, benchmark, or ablation justifying two models over one exists in the application code.
The equal 50/50 weighting is unexplained: **UNKNOWN**.

**Note.** The independent research study later measured the two boosters as statistically
indistinguishable on this data, and found ensembling gained less than one fold-standard-deviation over
a single model — see [../research/README.md](../research/README.md). That is *post-hoc evidence*, not
the original rationale.

---

### D5 — Nine of thirteen model inputs are placeholders

**Decision.** The UI collects 4 values; `create_features()` fills the other 9 physical parameters with
fixed constants (`stellar_temp = 5800.0`, `eccentricity = 0.0`, `impact_parameter = 0.5`, …).

**Evidence.** `server/classifier/app.py::create_features()`, comment `# Placeholder features (unknown inputs)`.

**Rationale.** **UNKNOWN.** The comment states *what* they are, not *why* four inputs were chosen, nor
why these particular constants. Whether the values are physically motivated (5800 K ≈ solar Teff, log g
4.44 ≈ solar) or arbitrary is not recorded — the solar-like values are suggestive but unstated.

**Consequence.** The model is queried far outside its training distribution on two-thirds of its
physical inputs. Accuracy impact: **UNKNOWN** — never measured in the repository.
See [ML_MODEL.md](ML_MODEL.md#3-input-schema).

---

### D6 — Partial scaling, derived features only

**Decision.** `StandardScaler` is fitted and applied to the 6 derived features; the 13 physical
features pass through unscaled.

**Evidence.** `feature_engineering.py`: `cols_to_scale = [c for c in X_train.columns if c not in PHYSICAL_FEATURES]`, with the print `"Applying StandardScaler to non-physical (derived) features..."`. Mirrored in `app.py`. Confirmed by `scaler.pkl` having `n_features_in_ = 6`.

**Rationale.** **UNKNOWN.** Both consumers are tree ensembles, which are invariant to monotone feature
scaling, so the scaler is not expected to change predictions. No comment explains why it exists or why
it is applied selectively.

---

### D7 — Six hand-derived physical ratio features

**Decision.** `transit_snr`, `planet_star_ratio`, `depth_radius_ratio`, `impact_factor`, `scaled_teq`,
`log_orbital_period`, each with an `EPSILON = 1e-6` guarded denominator.

**Evidence.** `feature_engineering.py::engineer_features()` numbers and names them in comments
(`# 1. Transit SNR`, `# 2. Planet-Star Radius Ratio`, …). Duplicated verbatim in `app.py`.

**Rationale.** **Partially evidenced.** The names are self-describing and the quantities are standard
transit-photometry ratios, so the *intent* is legible. Why these six and not others: **UNKNOWN**.

**Consequence.** The formulas are maintained in **two files with no shared module**. They agree today;
nothing enforces that. A change to one silently desynchronizes training from inference.

---

### D8 — Blanket `dropna()` in data preparation

**Decision.** `data_preparation.py` calls `data.dropna()`, requiring all 13 physical parameters present.

**Evidence.** The line is preceded by the comment `# Drop rows with missing values for now`.

**Rationale.** **Partially evidenced** — *"for now"* explicitly marks this as a temporary measure. No
follow-up, issue, or TODO records what was intended to replace it.

**Consequence.** A large share of labelled rows is discarded. Quantified in the research notebook.

---

### D9 — Label map covers only the KOI/K2 vocabulary

**Decision.** `map_labels()` maps `{FALSE POSITIVE: 0, CANDIDATE: 1, CONFIRMED: 2}` only.

**Evidence.** `data_preparation.py::map_labels()`, followed by `dropna(subset=["label"])`.

**Rationale.** **UNKNOWN.** The file explicitly loads TOI (`load_and_map_toi()` maps `tfopwg_disp` →
`label`), so TESS support was clearly *attempted*. The label map does not cover TESS's `PC/CP/KP/FP/APC/FA`
codes, so all 7,699 TOI rows silently become `NaN` and are dropped. Whether this is an oversight or a
deliberate exclusion is **UNKNOWN** — there is no comment, and no error or warning fires.

**Assessment.** The presence of dead TOI-loading code strongly suggests a defect rather than a choice,
but the repository does not confirm it. Documented as a defect in
[ML_MODEL.md](ML_MODEL.md#known-defects-in-the-training-pipeline) on the basis of the contradiction
between the code's evident intent and its behaviour.

---

### D10 — Training scripts use absolute `D:\exoplanet\` paths

**Decision.** All four training scripts hardcode Windows-absolute paths outside the repository.

**Evidence.** `RAW_DIR = r"D:\exoplanet\data\raw"` and similar in every `training/*.py`.
Comment in `data_preparation.py`: `# Paths (all on D: drive)`.

**Rationale.** **UNKNOWN.** The comment documents the fact, not the reason. Notably, `app.py` in the
same package uses portable `BASE_DIR`-relative paths — so the portable pattern was known and used
elsewhere in the project.

**Consequence.** Training is not reproducible from a clone without edits. See
[DEVELOPMENT.md](DEVELOPMENT.md#6-model-training).

---

## Atmosphere service

### D11 — Atmosphere resolves columns by keyword heuristics

**Decision.** Column roles are discovered at load time by substring matching (`_find_col()`), not by a
fixed schema.

**Evidence.** `_find_col()` plus the `META` dict in `load_data()`.

**Rationale.** **Partially evidenced.** The design is self-evidently tolerant of varying CSV schemas —
consistent with accepting arbitrary NASA/IAC exports. No comment states this as the goal.

**Consequence.** Fragile in a way that is invisible at runtime: against the shipped CSV, `time_col`
resolves to `phase_curve` (matched only on the substring `"phase"`), while `bright_col`, `wave_col`,
`morning_col` and `evening_col` all resolve to `None`. See [DATA.md](DATA.md#resolved-column-mapping--verified).

---

### D12 — Synthetic fallback curves

**Decision.** When real columns are absent, transit and spectra data are synthesized deterministically
(`synth_transit()`, `synth_spectra()`, seeded via `_rng_for()` on the planet name).

**Evidence.** Functions grouped under the explicit banner comment `# ---------- SYNTHETIC SERIES ----------`.

**Rationale.** **Evidenced as intent** — the code is unambiguously labelled synthetic, and seeding by
name makes output stable per planet, which is a deliberate property. Why fallback was preferred over
returning an error or an empty payload: **UNKNOWN**.

**Consequence.** ⚠️ Against the *shipped* CSV this fallback is not an edge case — it is the **only**
path. All transit and spectra values served by `/api/data` are synthetic; only `molecules` is measured.
The API response contains no flag distinguishing synthetic from real data, so the frontend cannot tell
and does not label it.

---

### D13 — Unrestricted CORS on atmosphere, none on classifier

**Decision.** `CORS(app)` with no arguments on atmosphere; no CORS on classifier.

**Evidence.** `server/atmosphere/app.py`: `CORS(app)  # Enable CORS for Next.js frontend`.

**Rationale.** **Evidenced** for *why CORS exists* (the inline comment names the Next.js frontend).
Why it was unrestricted rather than origin-scoped: **UNKNOWN**. The classifier needs none because it
is navigated to, not fetched ([D2](#d2--classifier-is-a-separate-site-not-an-api)).

**Update.** Atmosphere CORS is now driven by `CORS_ORIGINS`. It still defaults to `*` when unset, so
local behaviour is unchanged; production sets it to the Vercel origin. The classifier still has no
CORS, because it is still navigated to rather than fetched. See
[D23](#d23--cors-restrictable-by-environment-default-unchanged).

---

## Frontend

### D14 — Clerk auth on three route groups

**Decision.** `/explore`, `/lab`, `/play` require authentication; everything else is public.

**Evidence.** `client/src/middleware.ts`:
`createRouteMatcher(['/explore(.*)', '/lab(.*)', '/play(.*)'])` + `auth.protect()`.

**Rationale.** **Evidenced as scope** — the matcher precisely enumerates the interactive/lab surfaces
while leaving marketing pages public. Why authentication is required for public educational content at
all: **UNKNOWN**.

**Note.** The classifier at `:5003` is **outside** this protection entirely — it is a separate Flask
app with no auth. Whether that gap is intentional is **UNKNOWN**.

---

### D15 — Gemini called client-side

**Decision.** `/play/draw` calls `gemini-3.5-flash-lite` directly from the browser using
`NEXT_PUBLIC_GEMINI_API_KEY`.

**Evidence.** `client/src/app/(play)/play/draw/page.tsx` — `"use client"` component instantiating
`new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string)`.

**Rationale.** **UNKNOWN.** No API route proxy exists (`client/src/app/` contains no `route.ts`), so
this was not a fallback from a failed server-side attempt.

**Consequence.** The `NEXT_PUBLIC_` prefix inlines the key into the browser bundle, making it readable
by any visitor. This is inherent to the current approach, not a misconfiguration.

---

## Repository management

### D16 — Datasets and model artifacts committed to git

**Decision.** ~86 MB of CSVs and ~11 MB of `.pkl` models are tracked in git. No LFS, no external storage.

**Evidence.** Files present; `.gitattributes` absent; `.gitignore` files do not exclude them.

**Rationale.** **UNKNOWN.**

**Consequence.** The repository is self-contained — a clone can run inference and the research notebook
with no downloads, which is a genuine benefit. Costs are clone size and the tracking of a 50.6 MB
**unused** file (`lightcurves.csv`). Also note root `.gitignore` omits `__pycache__/`, which is why two
orphaned `.pyc` files are committed.

---

### D17 — Research kept strictly separate from production

**Decision.** All research lives in `research/`; no application file was created, modified or deleted
for it.

**Evidence.** **Fully evidenced.** `research/README.md` states: *"Everything in this directory is
additive. No file outside `research/` was created, modified, renamed or deleted."* The notebook reads
`server/classifier/` read-only via `find_repo_root()`. `research/outputs/research_model.joblib` is
loaded by no service.

**Rationale.** **Evidenced** — stated as an explicit constraint of the research task: keep the working
application intact while evaluating alternatives.

**Consequence.** Research findings are informational. Acting on any of them (fixing the TOI label map,
promoting the research model) would be a behavioural change requiring a separate decision.

---

### D18 — Research uses KOI only, with a group-aware split

**Decision.** The study models `koi.csv` alone and splits by `kepid` (host star) rather than by row.

**Evidence.** **Fully evidenced** in `research/README.md` and the executed notebook: multiple KOIs share
a host star and therefore identical stellar parameters, so a random row split leaks stellar information
across the boundary. `StratifiedGroupKFold` grouped by `kepid`; verified zero host-star overlap.

**Rationale.** **Evidenced** — stated and justified in the research documentation.

**Contrast.** Production training uses pooled KOI+K2 with a random `train_test_split` and no grouping.

---

### D19 — Research excludes 46 leakage columns

**Decision.** 24 direct-leakage and 22 indirect-leakage columns are excluded from the research feature set.

**Evidence.** **Fully evidenced** in `research/README.md` and the notebook's leakage section, including
the measured counter-example: a model built only from leakage columns reaches 0.9995 accuracy, reported
solely to be rejected.

**Rationale.** **Evidenced** — direct columns (`koi_fpflag_*`, `koi_score`, `koi_pdisposition`,
`kepler_name`) encode the label; indirect columns (stellar-parameter uncertainties) carry a
post-confirmation follow-up signature.

**Note.** The production feature set (13 physical + 6 derived) happens to contain none of these
columns, so production is leakage-free — but by virtue of its narrow feature set rather than by a
documented leakage analysis. No leakage discussion exists in the application code.

---

### D20 — No tests and no CI

**Decision.** The repository has no test framework, no test files, and no CI workflows.

**Evidence.** No `test` script in `package.json`; no test runner in dependencies; no `pytest`/`unittest`
files; no `.github/workflows/`.

**Rationale.** **UNKNOWN.**

**Consequence.** No automated guard against the training/inference feature-formula drift described in
[D7](#d7--six-hand-derived-physical-ratio-features).

---

## Deployment

> Decisions D21–D26 were made **as part of the production-deployment task**, not inferred from
> pre-existing repository history. Their rationale is recorded here explicitly. Where the repository
> offers no evidence for an earlier intent, that is still marked **UNKNOWN**.

### D21 — Backend URLs moved to build-time environment variables

**Decision.** The three hardcoded backend literals were replaced by exactly two variables:
`NEXT_PUBLIC_ATMOSPHERE_URL` and `NEXT_PUBLIC_CLASSIFIER_URL`.

**Evidence of need.** `fetch("http://localhost:5000/api/types")`, the `/api/data` template literal,
and `<Link href="http://127.0.0.1:5003">` — all unreachable from any non-local deployment.

**Rationale.** Required for the frontend to address Render-hosted backends at all. `NEXT_PUBLIC_` is
mandatory because both call sites execute in the browser (one client component, one server-rendered
anchor whose `href` the browser follows).

**Deliberately no localhost fallback in source.** An `?? "http://localhost:5000"` default would
reintroduce a production-relevant literal that silently masks a misconfigured deployment. Local
defaults live in `client/.env.local` instead. The classifier link falls back to `"#"` so an unset
variable cannot produce an `href="undefined"`.

**Consequence.** ⚠️ `NEXT_PUBLIC_*` is inlined at build time — changing a backend URL requires a
redeploy, not just an env-var edit.

---

### D22 — Gunicorn as the production WSGI server, `python app.py` retained for development

**Decision.** Both services keep their `if __name__ == "__main__":` block and gain a gunicorn start
command: `gunicorn app:app --bind 0.0.0.0:$PORT`.

**Evidence.** Both modules define a module-level `app = Flask(__name__)`, so `app:app` is the correct
WSGI target for both. Neither has an application factory or a `wsgi.py`.

**Rationale.** Flask's development server is explicitly unsuitable for production. Gunicorn was chosen
as the minimal, conventional WSGI server for Flask on Render; no model-serving framework was
introduced, as required. Keeping `python app.py` preserves the documented local workflow unchanged.

**Verified.** ✅ Both services started under gunicorn 23.0.0 locally and served their endpoints.

**Open.** ⬜ Worker count is unset (gunicorn default 1). Each worker loads ~11 MB of models at import,
so raising it multiplies memory. Not tuned here — **REQUIRES PRODUCTION TESTING**.

---

### D23 — CORS restrictable by environment, default unchanged

**Decision.** `CORS_ORIGINS` selects the allow-list; unset means `*`.

**Rationale.** Production must be able to restrict the API to the Vercel origin. Defaulting to `*`
keeps existing local behaviour byte-identical, satisfying "do not unnecessarily change current local
CORS behavior". The alternative — defaulting to a restrictive list — would have broken local
development silently.

**Verified.** ✅ In a real browser: an allowed origin succeeds; a disallowed origin is blocked.

---

### D24 — Flask secret key from `SECRET_KEY`, ephemeral random fallback

**Decision.** `app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(32)`, with a startup
warning when the variable is absent.

**Evidence.** The previous value was the committed literal `"exoplanet_secret"`. It is used only to
sign the session cookie carrying `flash()` messages from `/predict`'s error path.

**Rationale.** Removes a committed signing key without committing a replacement. A random fallback
keeps local development working with no setup.

**Known trade-off.** With more than one gunicorn worker and `SECRET_KEY` unset, each worker signs
differently and flash messages can be dropped. Documented as **required in production** rather than
silently worked around.

---

### D25 — Python pinned to 3.12; dependency versions pinned per service

**Decision.** `.python-version` = `3.12` for both services; per-service pinned `requirements.txt`.

**Rationale, from evidence.**
- `scikit-learn==1.7.0` is pinned because that version is **recorded inside the artifacts**
  (`InconsistentVersionWarning` names 1.7.0). Pinning it eliminates the warning class entirely.
- `xgboost==3.0.5` / `lightgbm==4.7.0` are pinned as the **currently verified compatible** versions,
  **not** as the training versions, which are **UNKNOWN**.
- Python 3.12 was chosen because it is the interpreter the pinned set was actually verified on, and
  because scikit-learn 1.7.0 publishes wheels for it. The training interpreter is **UNKNOWN**.

**Verified.** ✅ Clean venv install → all four artifacts load warning-free → prediction identical to
the pre-existing environment (max abs diff 3.75e-11).

**Not done.** No model was retrained, modified, or re-serialized.

---

### D26 — Deployment topology: Vercel frontend + two separate Render services

**Decision.**

```
Vercel  └── client/                Next.js frontend
Render  ├── server/atmosphere/     Flask JSON API
        └── server/classifier/     Flask HTML app
```

The two Flask applications are **not** merged.

**Rationale — grounded in repository evidence, not invented history.**

| Basis | Evidence in the repository |
|---|---|
| Independent code | No Python import crosses `server/atmosphere` ↔ `server/classifier`; they share no module, helper or config |
| Independent dependencies | Atmosphere needs `flask-cors` and no ML stack; classifier needs `scikit-learn`/`xgboost`/`lightgbm` (~11 MB of artifacts) and no CORS. The manifests have four packages in common and four that differ |
| Independent data/runtime needs | Atmosphere reads one 0.3 MB CSV co-located with `app.py`; classifier reads four `.pkl` files from `models/`. Neither reads the other's files |
| Independent lifecycles | Separate entry points, separate ports, separate start commands; neither imports or supervises the other |
| Independent deployability | Each has its own root directory, `requirements.txt`, `.python-version` and gunicorn command |
| Different interaction models | Atmosphere is `fetch`-ed as JSON; the classifier is **navigated to** as HTML ([D2](#d2--classifier-is-a-separate-site-not-an-api)) — merging them would require redesigning one of the two |

**What is NOT claimed.** The repository's earlier intent is **UNKNOWN**. `README.md` mentions
"Vercel (Frontend) · Render (Backend)" and `client/.gitignore` ignores `.vercel`, but no deployment
configuration ever existed to corroborate a prior plan. This topology is a **new decision**, recorded
here; it is merely *consistent with* that README line.

**Consequence.** Two Render services must be provisioned and their URLs supplied to Vercel as
[D21](#d21--backend-urls-moved-to-build-time-environment-variables)'s variables.

---

## Appendix — `README.md` vs repository reality

The root `README.md` is a submission narrative. These specific claims are not supported by the code.
Listed so future readers trust the code over the document; **the README has not been edited**.

| README claim | Repository reality |
|---|---|
| `cd server && pip install -r requirements.txt` | ❌ No `server/requirements.txt`. The only one (`server/classifier/`) is **0 bytes**. |
| AI/ML stack: *"CNN · PCA / t-SNE · K-Means · DBSCAN · Isolation Forest · Autoencoders"* | ❌ **None** appear anywhere in the repository. Only LightGBM + XGBoost + StandardScaler are used. |
| *"NASA Exoplanet Archive API"* under APIs | ❌ No runtime call to any NASA endpoint. NASA data is present only as committed CSVs. |
| *"Plotly.js"* in the frontend stack | ❌ Not in `package.json`. Charting uses `recharts`. |
| *"Deployment: Vercel (Frontend) · Render (Backend)"* | ⚠️ No deployment config of any kind exists. Intention, not implementation. |
| `/api/planets` listed as a main endpoint | ⚠️ Implemented but **never called** by the frontend. |
| Classifier *"Displays classification confidence scores"* | ✅ Accurate — `prob_display` percentages are passed to `result.html`. |
| Atmosphere *"Generates synthetic transit and spectral curves when data is incomplete"* | ✅ Accurate — and against the shipped CSV this is the only path ([D12](#d12--synthetic-fallback-curves)). |

---

## Related documentation

[ARCHITECTURE.md](ARCHITECTURE.md) · [ML_MODEL.md](ML_MODEL.md) · [DATA.md](DATA.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [../research/README.md](../research/README.md)
