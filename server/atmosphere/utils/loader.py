"""Reads the IAC atmospheres CSV and works out which column means what."""
import csv
import glob
import os
import re

import pandas as pd

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CSV = "iac_exoplanet_atmospheres-20251002.csv"

# Column-name hints: every inner list needs at least one of its words in the name
SIGNAL = ["blocked", "depth", "transmission", "amount", "signal", "opacity", "radius"]
HINTS = {
    "time": [["time", "elapsed", "hour", "phase"]],
    "bright": [["relative", "norm", "transit", "flux", "brightness", "starlight", "depth"]],
    "wave": [["wavelength", "lambda", "micron", "um", "μm"]],
    "morning": [["morning", "am", "dawn", "east"], SIGNAL],
    "evening": [["evening", "pm", "dusk", "west"], SIGNAL],
}


def csv_path():
    """Env override first, otherwise the first CSV sitting next to app.py."""
    path = os.environ.get("EXO_DATA_PATH", "")
    if path:
        return path
    found = sorted(glob.glob(os.path.join(BASE, "*.csv")))
    return found[0] if found else os.path.join(BASE, DEFAULT_CSV)


def read_raw(path):
    """The file is semicolon separated with messy quotes, so parse it leniently."""
    df = pd.read_csv(path, sep=";", engine="python", quoting=csv.QUOTE_NONE,
                     on_bad_lines="skip", encoding="utf-8")
    print("Shape:", df.shape)
    return df


def clean_cols(df):
    """Lower-case, snake_case, and strip odd characters from column names."""
    df = df.copy()
    df.columns = [re.sub(r"[^a-z0-9_]+", "", c.strip().lower().replace(" ", "_"))
                  for c in df.columns]
    return df


def find_col(cols, groups):
    """Return the first column whose name matches one word from every group."""
    for col in cols:
        name = col.lower()
        if all(any(k in name for k in grp) for grp in groups):
            return col
    return None


def load_data(path=None):
    """Load the CSV and return (dataframe, meta) where meta maps roles to columns."""
    path = path or csv_path()
    print(f"[CSV] Using path: {path}")
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV not found at {path}")
    df = clean_cols(read_raw(path))
    cols = df.columns

    meta = {f"{k}_col": find_col(cols, v) for k, v in HINTS.items()}
    # Fall back to a plain "morning"/"evening" column if the stricter match missed
    for side in ("morning", "evening"):
        meta[f"{side}_col"] = meta[f"{side}_col"] or find_col(cols, [[side]])

    meta["planet_col"] = find_col(cols, [["planet", "name", "exoplanet"]]) or "planet"
    meta["type_col"] = find_col(cols, [["type", "class", "category"]]) or "type"
    meta["molecules_col"] = "molecules" if "molecules" in cols else None

    # Make sure planet/type columns exist so the API never crashes on them
    if "planet" not in cols:
        df["planet"] = [f"Planet {i + 1}" for i in range(len(df))]
    if "type" not in cols:
        df["type"] = "Unknown"
    # QUOTE_NONE leaves wrapping quotes on text ("Hot Jupiter"), so strip them for display
    for key in ("planet_col", "type_col"):
        df[meta[key]] = df[meta[key]].astype(str).str.strip().str.strip('"').str.strip()
    return df, meta


def type_map(df, meta):
    """Group planet names under their planet type: {type: [planets]}."""
    tcol, pcol = meta["type_col"], meta["planet_col"]
    pairs = df[[tcol, pcol]].dropna().drop_duplicates()
    return {t: sorted(g[pcol].unique().tolist()) for t, g in pairs.groupby(tcol)}
