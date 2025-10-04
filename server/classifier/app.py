# app.py

from flask import Flask, render_template, request, flash
import pandas as pd
import numpy as np
import joblib
import os

# -----------------------------
# Paths and Config
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
FEATURES = ["orbital_period", "transit_depth", "planet_radius", "stellar_radius"]
EPSILON = 1e-6

# Physical features (not scaled)
PHYSICAL_FEATURES = [
    "orbital_period", "transit_duration", "transit_depth",
    "impact_parameter", "eccentricity", "planet_radius",
    "semi_major_axis", "eq_temperature", "stellar_radius",
    "stellar_mass", "stellar_temp", "stellar_logg", "stellar_metallicity"
]

# -----------------------------
# Load models, scaler, feature columns
# -----------------------------
lgb_model = joblib.load(os.path.join(MODEL_DIR, "lightgbm_model.pkl"))
xgb_model = joblib.load(os.path.join(MODEL_DIR, "xgboost_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
feature_cols = joblib.load(os.path.join(MODEL_DIR, "feature_cols.pkl"))

# -----------------------------
# Flask App
# -----------------------------
app = Flask(__name__)
app.secret_key = "exoplanet_secret"

# Slider configuration with realistic units
sliders = {
    "orbital_period": {"min": 0.5, "max": 50, "default": 15, "step": 0.00000000001, "unit": "days"},
    "transit_depth": {"min": 100, "max": 10000, "default": 3269, "step": 0.01, "unit": "ppm"},
    "planet_radius": {"min": 0.5, "max": 20, "default": 6, "step": 0.00001, "unit": "R⊕"},
    "stellar_radius": {"min": 0.5, "max": 2, "default": 1.05, "step": 0.00001, "unit": "R☉"},
}

# -----------------------------
# Feature Engineering for Prediction
# -----------------------------
def create_features(user_input):
    df = pd.DataFrame([user_input])

    # Placeholder features (unknown inputs)
    df["transit_duration"] = 1.0       # unknown
    df["eccentricity"] = 0.0           # unknown
    df["impact_parameter"] = 0.5       # unknown
    df["eq_temperature"] = 1.0         # unknown
    df["semi_major_axis"] = 1.0        # unknown
    df["stellar_mass"] = 1.0           # unknown
    df["stellar_temp"] = 5800.0        # Sun-like default
    df["stellar_logg"] = 4.44          # Sun-like default
    df["stellar_metallicity"] = 0.0    # unknown

    # Derived features
    df["transit_snr"] = df["transit_depth"] / (df["transit_duration"] + EPSILON)
    df["planet_star_ratio"] = df["planet_radius"] / (df["stellar_radius"] + EPSILON)
    df["depth_radius_ratio"] = df["transit_depth"] / (df["planet_radius"] + EPSILON)
    df["impact_factor"] = df["impact_parameter"] / (df["stellar_radius"] + EPSILON)
    df["scaled_teq"] = df["eq_temperature"] / (df["stellar_temp"] + EPSILON)
    df["log_orbital_period"] = np.log1p(df["orbital_period"])

    # Ensure all training columns exist
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0

    # Reorder columns exactly as in training
    df = df[feature_cols]

    # Scale only derived features (non-physical)
    derived_cols = [c for c in feature_cols if c not in PHYSICAL_FEATURES]
    if derived_cols:
        df[derived_cols] = scaler.transform(df[derived_cols])

    return df

# -----------------------------
# Routes
# -----------------------------
@app.route("/", methods=["GET"])
def index():
    return render_template("index.html", sliders=sliders)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Collect user input
        user_input = {f: float(request.form[f]) for f in FEATURES}

        # Prepare feature DataFrame
        X = create_features(user_input)

        # Model predictions
        lgb_probs = lgb_model.predict_proba(X)
        xgb_probs = xgb_model.predict_proba(X)
        ensemble_probs = (lgb_probs + xgb_probs) / 2
        pred_class_index = int(np.argmax(ensemble_probs))
        
        # Map classes to labels
        class_map = {0: "False Positive", 1: "Candidate", 2: "Confirmed"}
        pred_class = class_map.get(pred_class_index, str(pred_class_index))

        # Prepare probability display
        prob_display = {class_map[i]: round(float(p)*100, 2) for i, p in enumerate(ensemble_probs[0])}
        inference = "Exoplanet classification result based on ensemble of LightGBM and XGBoost models."

        return render_template("result.html", pred_class=pred_class, prob_display=prob_display, inference=inference)

    except Exception as e:
        flash(str(e), "danger")
        return render_template("index.html", sliders=sliders)

# -----------------------------
# Run App
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5003)
