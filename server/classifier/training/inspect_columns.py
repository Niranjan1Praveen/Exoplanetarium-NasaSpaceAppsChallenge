# training/inspect_columns.py

import pandas as pd
import os

RAW_DIR = r"D:\exoplanet\data\raw"

datasets = ["lightcurves.csv"]

for file in datasets:
    path = os.path.join(RAW_DIR, file)
    try:
        # Skip comment lines starting with #
        df = pd.read_csv(path, comment="#", engine='python', on_bad_lines='skip')
        df.columns = df.columns.str.strip()  # remove leading/trailing spaces
        print(f"\nColumns in {file}:")
        print(df.columns.tolist())
    except Exception as e:
        print(f"Error reading {file}: {e}")
