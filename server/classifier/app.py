"""Exoplanet classifier: a LightGBM + XGBoost ensemble behind a small HTML UI and a JSON API.

Local dev : python app.py              (optionally FLASK_DEBUG=1)
Production: gunicorn app:app --bind 0.0.0.0:$PORT
"""
import os

from flask import Flask, flash, jsonify, render_template, request

from utils.config import INPUTS, SLIDERS
from utils.model import predict

app = Flask(__name__)

# The secret key only signs flash() cookies; fall back to a random one if unset
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(32)
if not os.environ.get("SECRET_KEY"):
    print("[WARN] SECRET_KEY is not set, using an ephemeral key. Set it in production.")

INFO = "Exoplanet classification result based on ensemble of LightGBM and XGBoost models."


def read_inputs(src):
    """Pull the four slider values out of a form or JSON dict as floats."""
    return {f: float(src[f]) for f in INPUTS}


# ---------- JSON API (used by the Next.js lab page) ----------
@app.get("/api/sliders")
def api_sliders():
    """Slider ranges and units, so the frontend form matches the model."""
    return jsonify(SLIDERS)


@app.post("/api/predict")
def api_predict():
    """Body: {"orbital_period":..,"transit_depth":..,"planet_radius":..,"stellar_radius":..}"""
    try:
        inp = read_inputs(request.get_json(force=True) or {})
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({"error": f"Bad input: {e}"}), 400
    label, _, pct = predict(inp)
    return jsonify({"label": label, "probs": pct, "inputs": inp})


# ---------- Standalone HTML UI ----------
@app.get("/")
def index():
    return render_template("index.html", sliders=SLIDERS)


@app.post("/predict", endpoint="predict")  # endpoint name used by url_for in the form
def predict_view():
    try:
        inp = read_inputs(request.form)
        label, probs, pct = predict(inp)
        return render_template("result.html", pred_class=label, prob_display=pct,
                               inference=INFO, user_input=inp, ensemble_probs=probs)
    except Exception as e:
        flash(str(e), "danger")  # show the problem on the form instead of crashing
        return render_template("index.html", sliders=SLIDERS)


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(host=host, port=int(os.environ.get("PORT", 5003)), debug=debug)
