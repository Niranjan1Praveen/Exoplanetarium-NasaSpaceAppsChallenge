# training/data_preparation.py

import os
import pandas as pd
from sklearn.model_selection import train_test_split

# -----------------------------
# Paths (all on D: drive)
# -----------------------------
RAW_DIR = r"D:\exoplanet\data\raw"
PROCESSED_DIR = r"D:\exoplanet\data\processed\train_test_split"
os.makedirs(PROCESSED_DIR, exist_ok=True)

# -----------------------------
# Load CSVs with mappings
# -----------------------------
def load_and_map_koi(path):
    df = pd.read_csv(path, comment="#", engine='python', on_bad_lines='skip')
    df.columns = df.columns.str.strip()

    mapping = {
        "koi_period": "orbital_period",
        "koi_duration": "transit_duration",
        "koi_depth": "transit_depth",
        "koi_impact": "impact_parameter",
        "koi_eccen": "eccentricity",
        "koi_prad": "planet_radius",
        "koi_sma": "semi_major_axis",
        "koi_teq": "eq_temperature",
        "koi_srad": "stellar_radius",
        "koi_smass": "stellar_mass",
        "koi_steff": "stellar_temp",
        "koi_slogg": "stellar_logg",
        "koi_smet": "stellar_metallicity",
        "koi_disposition": "label"
    }

    df = df.rename(columns=mapping)
    if "label" not in df.columns:
        print(f"Warning: 'label' column missing in {path}, skipping dataset")
        return pd.DataFrame()

    cols_to_keep = [col for col in mapping.values() if col in df.columns]
    return df[cols_to_keep]


def load_and_map_toi(path):
    df = pd.read_csv(path, comment="#", engine='python', on_bad_lines='skip')
    df.columns = df.columns.str.strip()

    mapping = {
        "pl_orbper": "orbital_period",
        "pl_trandurh": "transit_duration",
        "pl_trandep": "transit_depth",
        "pl_imppar": "impact_parameter",
        "pl_orbeccen": "eccentricity",
        "pl_rade": "planet_radius",
        "pl_orbsmax": "semi_major_axis",
        "pl_eqt": "eq_temperature",
        "st_rad": "stellar_radius",
        "st_mass": "stellar_mass",
        "st_teff": "stellar_temp",
        "st_logg": "stellar_logg",
        "tfopwg_disp": "label"
    }

    df = df.rename(columns=mapping)
    if "label" not in df.columns:
        print(f"Warning: 'label' column missing in {path}, skipping dataset")
        return pd.DataFrame()

    cols_to_keep = [col for col in mapping.values() if col in df.columns]
    return df[cols_to_keep]


def load_and_map_k2(path):
    df = pd.read_csv(path, comment="#", engine='python', on_bad_lines='skip')
    df.columns = df.columns.str.strip()

    mapping = {
        "pl_orbper": "orbital_period",
        "pl_trandur": "transit_duration",
        "pl_trandep": "transit_depth",
        "pl_imppar": "impact_parameter",
        "pl_orbeccen": "eccentricity",
        "pl_rade": "planet_radius",
        "pl_orbsmax": "semi_major_axis",
        "pl_eqt": "eq_temperature",
        "st_rad": "stellar_radius",
        "st_mass": "stellar_mass",
        "st_teff": "stellar_temp",
        "st_logg": "stellar_logg",
        "disposition": "label"
    }

    df = df.rename(columns=mapping)
    if "label" not in df.columns:
        print(f"Warning: 'label' column missing in {path}, skipping dataset")
        return pd.DataFrame()

    cols_to_keep = [col for col in mapping.values() if col in df.columns]
    return df[cols_to_keep]


# -----------------------------
# Map string labels to integers
# -----------------------------
def map_labels(df):
    mapping = {
        "FALSE POSITIVE": 0,
        "CANDIDATE": 1,
        "CONFIRMED": 2
    }
    df["label"] = df["label"].map(mapping)
    return df.dropna(subset=["label"])


# -----------------------------
# Main pipeline
# -----------------------------
def main():
    print("Loading KOI...")
    koi = load_and_map_koi(os.path.join(RAW_DIR, "koi.csv"))

    print("Loading TOI...")
    toi = load_and_map_toi(os.path.join(RAW_DIR, "toi.csv"))

    print("Loading K2...")
    k2 = load_and_map_k2(os.path.join(RAW_DIR, "k2.csv"))

    data = pd.concat([koi, toi, k2], ignore_index=True)
    if data.empty:
        print("No valid data with labels found. Exiting.")
        return

    print(f"Total records before cleaning: {len(data)}")

    data = map_labels(data)

    # Drop rows with missing values for now
    data = data.dropna()
    print(f"Total records after cleaning: {len(data)}")

    # Train-test split
    train, test = train_test_split(data, test_size=0.2, stratify=data["label"], random_state=42)

    # Save processed CSVs
    train.to_csv(os.path.join(PROCESSED_DIR, "train.csv"), index=False)
    test.to_csv(os.path.join(PROCESSED_DIR, "test.csv"), index=False)

    print(f"Processed train/test saved to {PROCESSED_DIR}")


if __name__ == "__main__":
    main()
