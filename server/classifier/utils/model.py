"""Loads the trained models once and turns user input into an ensemble prediction."""
import os

import joblib
import numpy as np
import pandas as pd

from .config import CLASSES, DEFAULTS, PHYSICAL

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
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
