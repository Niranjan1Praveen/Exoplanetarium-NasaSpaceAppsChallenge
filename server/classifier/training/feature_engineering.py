# training/feature_engineering.py

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

# -----------------------------
# Paths
# -----------------------------
PROCESSED_DIR = r"D:\exoplanet\data\processed\train_test_split"
FEATURE_DIR = r"D:\exoplanet\data\processed\features"
MODEL_DIR = r"D:\exoplanet\models"

os.makedirs(FEATURE_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# -----------------------------
# Config
# -----------------------------
EPSILON = 1e-6

# Core physical features (we won't scale these)
PHYSICAL_FEATURES = [
    "orbital_period", "transit_duration", "transit_depth",
    "impact_parameter", "eccentricity", "planet_radius",
    "semi_major_axis", "eq_temperature", "stellar_radius",
    "stellar_mass", "stellar_temp", "stellar_logg", "stellar_metallicity"
]

# -----------------------------
# Feature Engineering
# -----------------------------
def engineer_features(df):
    df_engineered = df.copy()

    # 1. Transit SNR
    if {"transit_depth", "transit_duration"} <= set(df_engineered.columns):
        df_engineered["transit_snr"] = df_engineered["transit_depth"] / (df_engineered["transit_duration"] + EPSILON)

    # 2. Planet-Star Radius Ratio
    if {"planet_radius", "stellar_radius"} <= set(df_engineered.columns):
        df_engineered["planet_star_ratio"] = df_engineered["planet_radius"] / (df_engineered["stellar_radius"] + EPSILON)

    # 3. Depth-to-Planet Radius Ratio
    if {"transit_depth", "planet_radius"} <= set(df_engineered.columns):
        df_engineered["depth_radius_ratio"] = df_engineered["transit_depth"] / (df_engineered["planet_radius"] + EPSILON)

    # 4. Impact Factor
    if {"impact_parameter", "stellar_radius"} <= set(df_engineered.columns):
        df_engineered["impact_factor"] = df_engineered["impact_parameter"] / (df_engineered["stellar_radius"] + EPSILON)

    # 5. Scaled Equilibrium Temperature
    if {"eq_temperature", "stellar_temp"} <= set(df_engineered.columns):
        df_engineered["scaled_teq"] = df_engineered["eq_temperature"] / (df_engineered["stellar_temp"] + EPSILON)

    # 6. Log Orbital Period
    if "orbital_period" in df_engineered.columns:
        df_engineered["log_orbital_period"] = np.log1p(df_engineered["orbital_period"])

    return df_engineered

# -----------------------------
# Imputation
# -----------------------------
def impute_data(train_df, test_df):
    print("🔄 Imputing missing values with training median...")
    median_values = train_df.median()
    train_df.fillna(median_values, inplace=True)
    test_df.fillna(median_values, inplace=True)
    return train_df, test_df

# -----------------------------
# Main Pipeline
# -----------------------------
def main():
    print("🚀 Starting Feature Engineering pipeline...")

    # Delete old scaler if exists
    scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
    if os.path.exists(scaler_path):
        os.remove(scaler_path)
        print("🧹 Old scaler.pkl deleted.")

    # Load train/test data
    train = pd.read_csv(os.path.join(PROCESSED_DIR, "train.csv"))
    test = pd.read_csv(os.path.join(PROCESSED_DIR, "test.csv"))

    # 1. Engineer new features
    train = engineer_features(train)
    test = engineer_features(test)

    # 2. Impute missing values
    train, test = impute_data(train, test)

    # 3. Identify label column
    label_col = 'label' if 'label' in train.columns else None

    if label_col:
        X_train = train.drop(columns=[label_col])
        y_train = train[label_col]
        X_test = test.drop(columns=[label_col])
        y_test = test[label_col]
    else:
        X_train, X_test = train, test
        y_train = pd.Series(dtype='object')
        y_test = pd.Series(dtype='object')

    # 4. Partial scaling — only non-physical features
    print("⚙️ Applying StandardScaler to non-physical (derived) features...")
    cols_to_scale = [c for c in X_train.columns if c not in PHYSICAL_FEATURES]

    scaler = StandardScaler()
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()

    X_train_scaled[cols_to_scale] = scaler.fit_transform(X_train[cols_to_scale])
    X_test_scaled[cols_to_scale] = scaler.transform(X_test[cols_to_scale])

    # 5. Save new scaler
    joblib.dump(scaler, scaler_path)
    print(f"✅ New scaler saved at: {scaler_path}")

    # 6. Save feature column order for prediction
    feature_cols_path = os.path.join(MODEL_DIR, "feature_cols.pkl")
    feature_cols = X_train_scaled.columns.tolist()
    joblib.dump(feature_cols, feature_cols_path)
    print(f"✅ Feature column order saved at: {feature_cols_path}")

    # 7. Re-attach labels
    train_final = pd.concat([X_train_scaled, y_train.reset_index(drop=True)], axis=1)
    test_final = pd.concat([X_test_scaled, y_test.reset_index(drop=True)], axis=1)

    # 8. Save processed feature datasets
    train_final.to_csv(os.path.join(FEATURE_DIR, "train_features.csv"), index=False)
    test_final.to_csv(os.path.join(FEATURE_DIR, "test_features.csv"), index=False)
    print(f"✅ Feature-engineered datasets saved at: {FEATURE_DIR}")

if __name__ == "__main__":
    main()
