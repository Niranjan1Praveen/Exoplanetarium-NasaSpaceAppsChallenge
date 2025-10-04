import pandas as pd
import csv       # needed for QUOTE_NONE

df = pd.read_csv(
    "iac_exoplanet_atmospheres-20251002.csv",
    sep=";",                 # semicolon separator
    engine="python",         # tolerant parser
    quoting=csv.QUOTE_NONE,  # treat " as a normal character
    on_bad_lines="skip",     # skip malformed rows (pandas ≥1.3)
    encoding="utf-8"
)

print("Shape:", df.shape)
print("Columns:", df.columns.tolist())

if "molecules" in df.columns:
    print("\nMolecules column preview:")
    print(df["molecules"].dropna().head(10))
else:
    print("\nNo 'molecules' column found.")
