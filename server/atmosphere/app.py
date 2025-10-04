from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os, re, glob, csv, json

APP_TITLE = "Exoplanet Atmospheres — Dark Demo"
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# ---------- CSV PATH ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.environ.get("EXO_DATA_PATH", "")
if not DATA_PATH:
    candidates = sorted(glob.glob(os.path.join(BASE_DIR, "*.csv")))
    DATA_PATH = candidates[0] if candidates else os.path.join(BASE_DIR, "iac_exoplanet_atmospheres-20251002.csv")
print(f"[CSV] Using path: {DATA_PATH}")

# ---------- EXACT CSV LOADER (matches user's code) ----------
def read_csv_exact(path: str) -> pd.DataFrame:
    df = pd.read_csv(
        path,
        sep=";",                 # semicolon separator
        engine="python",         # tolerant parser
        quoting=csv.QUOTE_NONE,  # treat " as a normal character
        on_bad_lines="skip",     # skip malformed rows (pandas ≥1.3)
        encoding="utf-8"
    )
    # to match your terminal prints during startup
    print("Shape:", df.shape)
    print("Columns:", df.columns.tolist())
    return df

# ---------- COLUMN HELPERS ----------
def _normalize_cols(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [re.sub(r"[^a-z0-9_]+", "", c.strip().lower().replace(" ", "_")) for c in df.columns]
    return df

def _find_col(cols, keywords):
    def contains_all(colname: str) -> bool:
        name = colname.lower()
        for kw in keywords:
            if isinstance(kw, (list, tuple, set)):
                if not any(k in name for k in kw):
                    return False
            else:
                if kw not in name:
                    return False
        return True
    for c in cols:
        if contains_all(c):
            return c
    return None

# ---------- LOAD DATA & META ----------
def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"CSV not found at {DATA_PATH}")
    raw = read_csv_exact(DATA_PATH)          # <--- use your exact method
    df = _normalize_cols(raw)

    planet_col = _find_col(df.columns, [["planet", "name", "exoplanet"]]) or "planet"
    type_col   = _find_col(df.columns, [["type", "class", "category"]])   or "type"

    time_col   = _find_col(df.columns, [["time","elapsed","hour","phase"]])
    bright_col = _find_col(df.columns, [["relative","norm","transit","flux","brightness","starlight","depth"]])

    wave_col   = _find_col(df.columns, [["wavelength","lambda","micron","um","μm"]])
    morning_col = _find_col(df.columns, [["morning","am","dawn","east"], ["blocked","depth","transmission","amount","signal","opacity","radius"]])
    evening_col = _find_col(df.columns, [["evening","pm","dusk","west"], ["blocked","depth","transmission","amount","signal","opacity","radius"]])
    if morning_col is None and any("morning" in c for c in df.columns): morning_col = _find_col(df.columns, [["morning"]])
    if evening_col is None and any("evening" in c for c in df.columns): evening_col = _find_col(df.columns, [["evening"]])

    if "planet" not in df.columns: df["planet"] = [f"Planet {i+1}" for i in range(len(df))]
    if "type"   not in df.columns: df["type"]   = "Unknown"

    df[planet_col] = df[planet_col].astype(str).str.strip()
    df[type_col]   = df[type_col].astype(str).str.strip()

    meta = {
        "planet_col": planet_col,
        "type_col": type_col,
        "time_col": time_col,
        "bright_col": bright_col,
        "wave_col": wave_col,
        "morning_col": morning_col,
        "evening_col": evening_col,
        "molecules_col": "molecules" if "molecules" in df.columns else None,
    }

    if "molecules" in raw.columns:
        print("\nMolecules column preview:")
        try:
            print(raw["molecules"].dropna().head(10))
        except Exception as e:
            print(f"(preview failed) {e}")
    else:
        print("\nNo 'molecules' column found.")

    return df, meta

DF, META = load_data()

# ---------- SYNTHETIC SERIES ----------
def _num(x, default=np.nan):
    try: return float(x)
    except Exception: return default

def _rng_for(name: str):
    seed = abs(hash(str(name))) % (2**32 - 1)
    return np.random.RandomState(seed)

def synth_transit(row):
    name = row.get(META["planet_col"], "Unknown")
    rng = _rng_for(name)
    rp = _num(row.get("radius", np.nan))
    rs = _num(row.get("star_radius", np.nan))
    rp_rs = 0.1 if (np.isnan(rp) or np.isnan(rs) or rs <= 0) else max(0.03, min(0.35, rp/(rs*10.0)))
    depth = np.clip(rp_rs**2, 0.002, 0.03)

    total_hours, center, duration, tau = 6.0, 3.0, 2.0, 0.25
    t = np.linspace(0, total_hours, 240)
    y_model = np.ones_like(t)
    t1, t4 = center - duration/2, center + duration/2
    t2, t3 = t1 + tau, t4 - tau
    in_ingress = (t >= t1) & (t < t2)
    in_flat    = (t >= t2) & (t <= t3)
    in_egress  = (t >  t3) & (t <= t4)
    y_model[in_ingress] = 1.0 - depth * (t[in_ingress] - t1) / (t2 - t1)
    y_model[in_flat]    = 1.0 - depth
    y_model[in_egress]  = 1.0 - depth * (1.0 - (t[in_egress] - t3) / (t4 - t3))
    y_obs = y_model + rng.normal(0, 0.0006, size=t.size)

    labels = [
        {"x": 0.8, "y": 1.0005, "text": "Starlight"},
        {"x": 5.2, "y": 1.0005, "text": "Starlight"},
        {"x": center, "y": float(1.0 - depth + 0.002), "text": "Starlight blocked by planet\nand its atmosphere"}
    ]
    return t.tolist(), y_obs.tolist(), y_model.tolist(), labels

def _gauss(x, mu, sig): return np.exp(-0.5 * ((x - mu) / sig) ** 2)

def synth_spectra(row):
    name = row.get(META["planet_col"], "Unknown")
    rng = _rng_for(name)
    teq = _num(row.get("temp_calculated", np.nan))
    base = float(np.clip(0.02 + 0.00001 * (0 if np.isnan(teq) else teq), 0.01, 0.06))

    wl = np.linspace(2.0, 5.2, 90)
    water_amp, co2_amp = base * 1.8, base * 2.4

    morning = base + water_amp * _gauss(wl, 2.75, 0.18) + co2_amp * _gauss(wl, 4.30, 0.12)
    morning *= (0.92 + 0.02 * np.sin(wl*1.3))
    morning += rng.normal(0, 0.001, size=wl.size)

    evening = base + water_amp * 1.12 * _gauss(wl, 2.80, 0.20) + co2_amp * 1.08 * _gauss(wl, 4.28, 0.14)
    evening *= (0.98 + 0.02 * np.cos(wl*0.9))
    evening += rng.normal(0, 0.001, size=wl.size)

    return wl.tolist(), np.clip(morning, 0, None).tolist(), wl.tolist(), np.clip(evening, 0, None).tolist()

# ---------- MOLECULES ----------
MOLECULE_LAMBDA = {
    "H2O": 2.8, "CO2": 4.3, "CO": 4.6, "CH4": 3.3, "HCN": 3.0, "SO2": 4.05, "H2S": 3.9
}
FRIENDLY = {
    "H2O": "Water", "CO2": "Carbon Dioxide", "CO": "Carbon Monoxide",
    "CH4": "Methane", "HCN": "HCN", "SO2": "Sulfur Dioxide", "H2S": "Hydrogen Sulfide"
}

def parse_molecules_cell(cell):
    """
    Parse user-CSV molecules cells like:  "\"{\"CO\":\"Detection\",\"H2O\":\"Detection\"}\""
    Keep only values that include 'detect' (and not 'non').
    """
    detected = []
    if cell is None or (isinstance(cell, float) and np.isnan(cell)):
        return detected

    text = str(cell).strip()
    if not text or text in ("[]", "{}", '"[]"', '"{}"'):
        return detected

    # strip ONE outer layer of quotes if present (your QUOTE_NONE keeps them)
    if len(text) >= 2 and text[0] == text[-1] and text[0] in ("'", '"'):
        text = text[1:-1].strip()

    # try json loads (single quotes or escaped quotes handled)
    def _try_load(s):
        try:
            return json.loads(s)
        except Exception:
            try:
                return json.loads(s.replace("'", '"'))
            except Exception:
                return None

    obj = _try_load(text.replace(r'\"', '"').replace("\\'", "'"))
    if isinstance(obj, dict):
        for k, v in obj.items():
            val = str(v or "").lower()
            if "detect" in val and "non" not in val:
                detected.append(str(k).strip())
        return sorted(set(detected))
    if isinstance(obj, list):
        return sorted({str(x).strip() for x in obj if str(x).strip()})

    # fallback: regex pairs
    for k, v in re.findall(r'([A-Za-z0-9_+\-./()]+)"?\s*:\s*"?([^"}]+)"?', text):
        if "detect" in str(v).lower() and "non" not in str(v).lower():
            detected.append(k.strip())

    return sorted(set(detected))

def nearest_y(x_list, y_list, x0):
    if not x_list or not y_list: return None
    arrx = np.asarray(x_list); arry = np.asarray(y_list)
    idx = int(np.argmin(np.abs(arrx - x0)))
    return float(arry[idx])

def build_molecule_labels(row, wl_m, y_m, wl_e, y_e):
    detected = []
    if META.get("molecules_col"):
        detected = parse_molecules_cell(row.get(META["molecules_col"]))
    if not detected:
        return []
    labels = []
    max_y = max((max(y_m) if y_m else 0), (max(y_e) if y_e else 0), 1e-6)
    for mol in detected:
        lam = MOLECULE_LAMBDA.get(mol)
        if lam is None or lam < 2.0 or lam > 5.2:
            continue
        ym = nearest_y(wl_m, y_m, lam)
        ye = nearest_y(wl_e, y_e, lam)
        yv = max([v for v in [ym, ye] if v is not None] + [max_y * 0.9])
        labels.append({
            "name": FRIENDLY.get(mol, mol),
            "symbol": mol,
            "x": float(lam),
            "y": float(yv + 0.05 * max_y)
        })
    return labels

# ---------- HELPERS ----------
def get_type_planet_map():
    tcol, pcol = META["type_col"], META["planet_col"]
    pairs = DF[[tcol, pcol]].dropna().drop_duplicates()
    mapping = {}
    for t, group in pairs.groupby(tcol):
        mapping[t] = sorted(group[pcol].unique().tolist())
    return mapping

# ---------- ROUTES ----------
@app.route("/")
def index():
    return jsonify({"message": "Exoplanet Atmospheres API"})

@app.get("/api/types")
def get_types():
    """Get all available exoplanet types"""
    mapping = get_type_planet_map()
    return jsonify({
        "types": list(mapping.keys()),
        "type_planet_map": mapping
    })

@app.get("/api/planets")
def planets_for_type():
    """Get planets for a specific type"""
    t = request.args.get("type", "")
    mapping = get_type_planet_map()
    return jsonify({
        "planets": mapping.get(t, [])
    })

@app.get("/api/data")
def data_for_planet():
    """Get all data for a specific planet"""
    planet = request.args.get("planet", "")
    pcol = META["planet_col"]
    sub = DF[DF[pcol].astype(str) == str(planet)].copy()
    row = sub.iloc[0].to_dict() if len(sub) else {}

    # ---------- Transit ----------
    tcol, bcol = META["time_col"], META["bright_col"]
    transit = {"time": [], "brightness": [], "model_brightness": [], "labels": []}
    if tcol and bcol and tcol in sub.columns and bcol in sub.columns:
        tmp = sub[[tcol, bcol]].copy()
        tmp[tcol] = pd.to_numeric(tmp[tcol], errors="coerce")
        tmp[bcol] = pd.to_numeric(tmp[bcol], errors="coerce")
        tmp = tmp.dropna().sort_values(tcol)
        if len(tmp):
            y = tmp[bcol].to_numpy()
            window = max(5, min(31, len(y)//10*2+1))
            y_model = pd.Series(y).rolling(window, center=True, min_periods=1).median().to_numpy()
            transit = {
                "time": tmp[tcol].tolist(),
                "brightness": tmp[bcol].tolist(),
                "model_brightness": y_model.tolist(),
                "labels": [
                    {"x": float(tmp[tcol].iloc[0]),   "y": 1.0005, "text": "Starlight"},
                    {"x": float(tmp[tcol].iloc[-1]),  "y": 1.0005, "text": "Starlight"},
                    {"x": float(tmp[tcol].median()),  "y": float(min(y_model)+0.002), "text": "Starlight blocked by planet\nand its atmosphere"}
                ]
            }
        else:
            tt, yy, yy_model, labels = synth_transit(row)
            transit = {"time": tt, "brightness": yy, "model_brightness": yy_model, "labels": labels}
    else:
        tt, yy, yy_model, labels = synth_transit(row)
        transit = {"time": tt, "brightness": yy, "model_brightness": yy_model, "labels": labels}

    # ---------- Spectra ----------
    wcol, mcol, ecol = META["wave_col"], META["morning_col"], META["evening_col"]
    wl_m, y_m, wl_e, y_e = synth_spectra(row)
    if wcol and mcol and wcol in sub.columns and mcol in sub.columns:
        tm = sub[[wcol, mcol]].copy()
        tm[wcol] = pd.to_numeric(tm[wcol], errors="coerce")
        tm[mcol] = pd.to_numeric(tm[mcol], errors="coerce")
        tm = tm.dropna().sort_values(wcol)
        if len(tm): wl_m, y_m = tm[wcol].tolist(), tm[mcol].tolist()
    if wcol and ecol and wcol in sub.columns and ecol in sub.columns:
        te = sub[[wcol, ecol]].copy()
        te[wcol] = pd.to_numeric(te[wcol], errors="coerce")
        te[ecol] = pd.to_numeric(te[ecol], errors="coerce")
        te = te.dropna().sort_values(wcol)
        if len(te): wl_e, y_e = te[wcol].tolist(), te[ecol].tolist()

    spectra = {
        "wavelength_morning": wl_m,
        "morning": y_m,
        "wavelength_evening": wl_e,
        "evening": y_e,
        "wavelength": wl_m if len(wl_m) else wl_e,
        "labels": build_molecule_labels(row, wl_m, y_m, wl_e, y_e)
    }

    # ---------- Molecules (list for dashboard + raw for debug) ----------
    molecules_raw = ""
    molecules_list = []
    if META.get("molecules_col"):
        raw_val = row.get(META["molecules_col"], "")
        if raw_val is not None and not (isinstance(raw_val, float) and np.isnan(raw_val)):
            molecules_raw = str(raw_val)  # optional: show somewhere if you want

        detected_syms = parse_molecules_cell(raw_val)
        known_syms = set(MOLECULE_LAMBDA.keys()) | set(FRIENDLY.keys())
        for sym in detected_syms:
            if sym in known_syms:
                molecules_list.append({"symbol": sym, "name": FRIENDLY.get(sym, sym)})

    # small debug print on each request
    print(f"[DATA] planet={planet!r} | molecules_raw={molecules_raw!r} | molecules={[m['symbol'] for m in molecules_list]}")

    return jsonify({
        "transit": transit,
        "spectra": spectra,
        "molecules": molecules_list,
        "molecules_raw": molecules_raw,
        "planet": planet,
        "success": True
    })

# ---------- MAIN ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)