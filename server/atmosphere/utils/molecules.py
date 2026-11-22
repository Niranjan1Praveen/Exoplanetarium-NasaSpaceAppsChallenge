"""Parses the messy molecules column and places molecule labels on the spectra."""
import json
import re

import numpy as np

# Where each molecule's absorption feature sits (micrometres)
LAMBDA = {"H2O": 2.8, "CO2": 4.3, "CO": 4.6, "CH4": 3.3, "HCN": 3.0, "SO2": 4.05, "H2S": 3.9}
NAMES = {"H2O": "Water", "CO2": "Carbon Dioxide", "CO": "Carbon Monoxide", "CH4": "Methane",
         "HCN": "HCN", "SO2": "Sulfur Dioxide", "H2S": "Hydrogen Sulfide"}


def is_empty(cell):
    return cell is None or (isinstance(cell, float) and np.isnan(cell))


def is_detected(val):
    val = str(val or "").lower()
    return "detect" in val and "non" not in val


def try_json(text):
    """json.loads, retrying with single quotes swapped for double quotes."""
    for s in (text, text.replace("'", '"')):
        try:
            return json.loads(s)
        except Exception:
            pass
    return None


def parse_cell(cell):
    """Turn cells like '"{"CO":"Detection"}"' into a sorted list of detected symbols."""
    if is_empty(cell):
        return []
    text = str(cell).strip()
    if text in ("", "[]", "{}", '"[]"', '"{}"'):
        return []
    # Peel off one wrapping quote layer (left behind by QUOTE_NONE)
    if len(text) >= 2 and text[0] == text[-1] and text[0] in ("'", '"'):
        text = text[1:-1].strip()

    obj = try_json(text.replace(r'\"', '"').replace("\\'", "'"))
    if isinstance(obj, dict):
        return sorted({str(k).strip() for k, v in obj.items() if is_detected(v)})
    if isinstance(obj, list):
        return sorted({str(x).strip() for x in obj if str(x).strip()})

    # Last resort: pull key:value pairs out with a regex
    pairs = re.findall(r'([A-Za-z0-9_+\-./()]+)"?\s*:\s*"?([^"}]+)"?', text)
    return sorted({k.strip() for k, v in pairs if is_detected(v)})


def nearest_y(xs, ys, x0):
    if not xs or not ys:
        return None
    return float(np.asarray(ys)[int(np.argmin(np.abs(np.asarray(xs) - x0)))])


def spectra_labels(found, wl_m, y_m, wl_e, y_e):
    """Floating labels just above each detected molecule's feature."""
    top = max(max(y_m, default=0), max(y_e, default=0), 1e-6)
    labels = []
    for mol in found:
        lam = LAMBDA.get(mol)
        if lam is None or not 2.0 <= lam <= 5.2:
            continue  # outside the plotted wavelength range
        ys = [v for v in (nearest_y(wl_m, y_m, lam), nearest_y(wl_e, y_e, lam)) if v is not None]
        y = max(ys + [top * 0.9])
        labels.append({"name": NAMES.get(mol, mol), "symbol": mol,
                       "x": float(lam), "y": float(y + 0.05 * top)})
    return labels


def known_list(found):
    """Only molecules we have a friendly name for, shaped for the dashboard."""
    return [{"symbol": s, "name": NAMES.get(s, s)} for s in found if s in NAMES]
