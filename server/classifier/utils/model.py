"""Loads the trained models once and turns user input into an ensemble prediction."""
import ctypes
import os
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# LightGBM needs the OpenMP runtime (libgomp.so.1), which Vercel's Linux image lacks.
# Loading our bundled copy first lets LightGBM's own library find it.
GOMP = os.path.join(BASE, "lib", "libgomp.so.1")
if sys.platform.startswith("linux") and os.path.exists(GOMP):
    try:
        ctypes.CDLL("libgomp.so.1", mode=ctypes.RTLD_GLOBAL)  # a system copy, if there is one
    except OSError:
        ctypes.CDLL(GOMP, mode=ctypes.RTLD_GLOBAL)

import joblib  # noqa: E402  (must come after the preload above)
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

from .config import CLASSES, DEFAULTS, PHYSICAL  # noqa: E402

MODEL_DIR = os.path.join(BASE, "models")
EPS = 1e-6  # keeps divisions safe when a value is zero


def load(name):
    return joblib.load(os.path.join(MODEL_DIR, name))


LGB = load("lightgbm_model.pkl")
XGB = load("xgboost_model.pkl")
SCALER = load("scaler.pkl")
COLS = load("feature_cols.pkl")


def make_features(inp):
    """Build the exact one-row feature table the models were trained on."""
    df = pd.DataFrame([{**DEFAULTS, **inp}])

    # Ratios and logs that helped the models during training
    df["transit_snr"] = df["transit_depth"] / (df["transit_duration"] + EPS)
    df["planet_star_ratio"] = df["planet_radius"] / (df["stellar_radius"] + EPS)
    df["depth_radius_ratio"] = df["transit_depth"] / (df["planet_radius"] + EPS)
    df["impact_factor"] = df["impact_parameter"] / (df["stellar_radius"] + EPS)
    df["scaled_teq"] = df["eq_temperature"] / (df["stellar_temp"] + EPS)
    df["log_orbital_period"] = np.log1p(df["orbital_period"])

    df = df.reindex(columns=COLS, fill_value=0)  # same columns, same order as training

    # Only the derived (non-physical) columns were scaled in training
    derived = [c for c in COLS if c not in PHYSICAL]
    if derived:
        df[derived] = SCALER.transform(df[derived])
    return df


def predict(inp):
    """Average LightGBM and XGBoost probabilities; return (label, probs, percent dict)."""
    X = make_features(inp)
    probs = (LGB.predict_proba(X) + XGB.predict_proba(X)) / 2
    label = CLASSES.get(int(np.argmax(probs)), "Unknown")
    pct = {CLASSES[i]: round(float(p) * 100, 2) for i, p in enumerate(probs[0])}
    return label, probs[0].tolist(), pct
