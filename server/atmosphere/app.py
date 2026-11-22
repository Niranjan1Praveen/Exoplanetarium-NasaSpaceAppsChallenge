"""Exoplanet Atmospheres API: light curves, spectra and molecules per planet.

Local dev : python app.py              (optionally FLASK_DEBUG=1)
Production: gunicorn app:app --bind 0.0.0.0:$PORT
"""
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from utils.loader import load_data, type_map
from utils.molecules import is_empty, known_list, parse_cell, spectra_labels
from utils.synth import numeric_pair, real_transit, synth_spectra, synth_transit

app = Flask(__name__)

# CORS_ORIGINS is a comma-separated allow-list; unset means allow everyone (local dev)
origins = os.environ.get("CORS_ORIGINS", "*").strip()
if origins == "*":
    CORS(app)
else:
    CORS(app, origins=[o.strip() for o in origins.split(",") if o.strip()])

DF, META = load_data()


def spectra_for(sub, row, name):
    """Real spectra where the CSV has them, synthetic ones everywhere else."""
    wl_m, y_m, wl_e, y_e = synth_spectra(row, name)
    wcol, mcol, ecol = META["wave_col"], META["morning_col"], META["evening_col"]
    am, pm = numeric_pair(sub, wcol, mcol), numeric_pair(sub, wcol, ecol)
    if am is not None:
        wl_m, y_m = am[wcol].tolist(), am[mcol].tolist()
    if pm is not None:
        wl_e, y_e = pm[wcol].tolist(), pm[ecol].tolist()
    return wl_m, y_m, wl_e, y_e


@app.route("/")
def index():
    return jsonify({"message": "Exoplanet Atmospheres API"})


@app.get("/api/types")
def get_types():
    """All planet types plus the planets under each."""
    mapping = type_map(DF, META)
    return jsonify({"types": list(mapping), "type_planet_map": mapping})


@app.get("/api/planets")
def planets_for_type():
    """Planets belonging to ?type=..."""
    kind = request.args.get("type", "")
    return jsonify({"planets": type_map(DF, META).get(kind, [])})


@app.get("/api/data")
def data_for_planet():
    """Transit curve, spectra and detected molecules for ?planet=..."""
    planet = request.args.get("planet", "")
    sub = DF[DF[META["planet_col"]].astype(str) == planet]
    row = sub.iloc[0].to_dict() if len(sub) else {}
    name = row.get(META["planet_col"], "Unknown")

    transit = real_transit(sub, META["time_col"], META["bright_col"]) or synth_transit(row, name)
    wl_m, y_m, wl_e, y_e = spectra_for(sub, row, name)

    # Molecules: parse the raw cell once, reuse it for labels and the list
    raw = row.get(META["molecules_col"]) if META["molecules_col"] else None
    raw = "" if is_empty(raw) else str(raw)
    found = parse_cell(raw)
    mols = known_list(found)
    print(f"[DATA] planet={planet!r} | molecules={[m['symbol'] for m in mols]}")

    return jsonify({
        "transit": transit,
        "spectra": {
            "wavelength_morning": wl_m, "morning": y_m,
            "wavelength_evening": wl_e, "evening": y_e,
            "wavelength": wl_m or wl_e,
            "labels": spectra_labels(found, wl_m, y_m, wl_e, y_e),
        },
        "molecules": mols,
        "molecules_raw": raw,
        "planet": planet,
        "success": True,
    })


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=debug)
