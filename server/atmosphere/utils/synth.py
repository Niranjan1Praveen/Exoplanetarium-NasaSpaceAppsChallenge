"""Builds light curves and spectra: real ones from the CSV, believable demo ones otherwise."""
import numpy as np
import pandas as pd


def num(x, default=np.nan):
    """Float conversion that shrugs off junk values."""
    try:
        return float(x)
    except Exception:
        return default


def rng_for(name):
    """Seed the noise per planet so a planet looks the same on every request."""
    return np.random.RandomState(abs(hash(str(name))) % (2**32 - 1))


def gauss(x, mu, sig):
    return np.exp(-0.5 * ((x - mu) / sig) ** 2)


def numeric_pair(sub, xcol, ycol):
    """Two columns as clean, sorted numbers, or None if they aren't usable."""
    if not (xcol and ycol and xcol in sub.columns and ycol in sub.columns):
        return None
    tmp = sub[[xcol, ycol]].apply(pd.to_numeric, errors="coerce").dropna().sort_values(xcol)
    return tmp if len(tmp) else None


def transit_labels(start, end, mid, low):
    """Text annotations for the light-curve chart."""
    return [
        {"x": start, "y": 1.0005, "text": "Starlight"},
        {"x": end, "y": 1.0005, "text": "Starlight"},
        {"x": mid, "y": low, "text": "Starlight blocked by planet\nand its atmosphere"},
    ]


def real_transit(sub, tcol, bcol):
    """Use measured time/brightness if present, smoothing it for the model line."""
    tmp = numeric_pair(sub, tcol, bcol)
    if tmp is None:
        return None
    y = tmp[bcol].to_numpy()
    win = max(5, min(31, len(y) // 10 * 2 + 1))
    model = pd.Series(y).rolling(win, center=True, min_periods=1).median().to_numpy()
    t = tmp[tcol]
    return {"time": t.tolist(), "brightness": y.tolist(), "model_brightness": model.tolist(),
            "labels": transit_labels(float(t.iloc[0]), float(t.iloc[-1]),
                                     float(t.median()), float(model.min() + 0.002))}


def synth_transit(row, name):
    """A trapezoid-shaped dip with a bit of noise, sized from planet/star radius."""
    rng = rng_for(name)
    rp, rs = num(row.get("radius")), num(row.get("star_radius"))
    bad = np.isnan(rp) or np.isnan(rs) or rs <= 0
    ratio = 0.1 if bad else np.clip(rp / (rs * 10), 0.03, 0.35)
    depth = np.clip(ratio**2, 0.002, 0.03)

    mid, dur, tau = 3.0, 2.0, 0.25  # centre, duration and ingress time (hours)
    t = np.linspace(0, 6.0, 240)
    t1, t4 = mid - dur / 2, mid + dur / 2
    t2, t3 = t1 + tau, t4 - tau
    model = np.ones_like(t)
    ing, flat, egr = (t >= t1) & (t < t2), (t >= t2) & (t <= t3), (t > t3) & (t <= t4)
    model[ing] = 1 - depth * (t[ing] - t1) / (t2 - t1)
    model[flat] = 1 - depth
    model[egr] = 1 - depth * (1 - (t[egr] - t3) / (t4 - t3))
    obs = model + rng.normal(0, 0.0006, size=t.size)

    return {"time": t.tolist(), "brightness": obs.tolist(), "model_brightness": model.tolist(),
            "labels": transit_labels(0.8, 5.2, mid, float(1 - depth + 0.002))}


def synth_spectra(row, name):
    """Morning/evening spectra with water (~2.8µm) and CO2 (~4.3µm) bumps."""
    rng = rng_for(name)
    teq = num(row.get("temp_calculated"))
    base = float(np.clip(0.02 + 1e-5 * (0 if np.isnan(teq) else teq), 0.01, 0.06))
    wl = np.linspace(2.0, 5.2, 90)
    h2o, co2 = base * 1.8, base * 2.4

    am = base + h2o * gauss(wl, 2.75, 0.18) + co2 * gauss(wl, 4.30, 0.12)
    am = am * (0.92 + 0.02 * np.sin(wl * 1.3)) + rng.normal(0, 0.001, wl.size)
    pm = base + h2o * 1.12 * gauss(wl, 2.80, 0.20) + co2 * 1.08 * gauss(wl, 4.28, 0.14)
    pm = pm * (0.98 + 0.02 * np.cos(wl * 0.9)) + rng.normal(0, 0.001, wl.size)
    return wl.tolist(), np.clip(am, 0, None).tolist(), wl.tolist(), np.clip(pm, 0, None).tolist()
