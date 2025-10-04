import os
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, accuracy_score
from sklearn.utils.class_weight import compute_class_weight
from sklearn.model_selection import StratifiedKFold
import lightgbm as lgb
import xgboost as xgb
import joblib
import warnings

# -----------------------------
# Warnings & Random Seed
# -----------------------------
warnings.filterwarnings("ignore", category=UserWarning)
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

# -----------------------------
# Paths
# -----------------------------
FEATURE_DIR = r"D:\exoplanet\data\processed\features"
MODEL_DIR = r"D:\exoplanet\models"
os.makedirs(MODEL_DIR, exist_ok=True)

N_SPLITS = 5

# -----------------------------
# Data Loading
# -----------------------------
def load_and_preprocess_data():
    print("🔄 Loading data and computing class weights...")
    try:
        train_df = pd.read_csv(os.path.join(FEATURE_DIR, "train_features.csv"))
        test_df = pd.read_csv(os.path.join(FEATURE_DIR, "test_features.csv"))
    except FileNotFoundError as e:
        print(f"❌ Error: {e}. Run feature_engineering.py first.")
        raise

    X_train = train_df.drop("label", axis=1)
    y_train = train_df["label"]
    X_test = test_df.drop("label", axis=1)
    y_test = test_df["label"]

    classes = np.unique(y_train)
    class_weights = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
    class_weight_dict = {cls: weight for cls, weight in zip(classes, class_weights)}
    print("⚖️ Class Weights:", class_weight_dict)

    return X_train, y_train, X_test, y_test, class_weight_dict

# -----------------------------
# LightGBM Training
# -----------------------------
def train_lightgbm(X_train, y_train, X_test, y_test, class_weight_dict):
    print("\n--- 🧠 Training LightGBM Model (CV + Early Stopping) ---")
    params = {
        'n_estimators': 1000,
        'learning_rate': 0.05,
        'num_leaves': 31,
        'objective': 'multiclass',
        'metric': 'multi_logloss',
        'n_jobs': -1,
        'random_state': RANDOM_STATE,
        'class_weight': class_weight_dict,
        'verbose': -1
    }

    EARLY_STOPPING_ROUNDS = 50
    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)
    best_iterations = []

    for fold, (train_idx, val_idx) in enumerate(skf.split(X_train, y_train)):
        print(f"  -> Fold {fold+1}/{N_SPLITS}")
        X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

        lgb_model = lgb.LGBMClassifier(**params)
        lgb_model.fit(
            X_tr, y_tr,
            eval_set=[(X_val, y_val)],
            eval_metric='multi_logloss',
            callbacks=[lgb.early_stopping(EARLY_STOPPING_ROUNDS, verbose=False)]
        )
        best_iterations.append(lgb_model.best_iteration_)

    final_n_estimators = int(np.mean(best_iterations) * 1.1) if best_iterations else 1000
    print(f"Final LGBM n_estimators: {final_n_estimators}")

    final_params = params.copy()
    final_params['n_estimators'] = final_n_estimators
    lgb_final = lgb.LGBMClassifier(**final_params)
    lgb_final.fit(X_train, y_train)

    lgb_preds = lgb_final.predict(X_test)
    lgb_probs = lgb_final.predict_proba(X_test)
    print("\n🔹 LightGBM Test Report:")
    print(classification_report(y_test, lgb_preds))
    print(f"Accuracy: {accuracy_score(y_test, lgb_preds):.4f}")

    joblib.dump(lgb_final, os.path.join(MODEL_DIR, "lightgbm_model.pkl"))
    print("✅ LightGBM model saved.")
    return lgb_probs

# -----------------------------
# XGBoost Training
# -----------------------------
def train_xgboost(X_train, y_train, X_test, y_test, class_weight_dict):
    print("\n--- 🧠 Training XGBoost Model ---")
    sample_weights = y_train.map(class_weight_dict).values

    xgb_model = xgb.XGBClassifier(
        n_estimators=1000,
        learning_rate=0.05,
        max_depth=6,
        objective="multi:softprob",
        eval_metric="mlogloss",
        use_label_encoder=False,
        n_jobs=-1,
        random_state=RANDOM_STATE,
        verbosity=0
    )

    # Check XGBoost version for early stopping support
    xgb_version = tuple(map(int, xgb.__version__.split(".")[:2]))
    try:
        if xgb_version >= (1, 6):
            # Modern versions support early stopping
            X_train_val = X_train.iloc[200:]
            y_train_val = y_train.iloc[200:]
            sw_train_val = y_train_val.map(class_weight_dict).values
            X_val_set = X_train.iloc[:200]
            y_val_set = y_train.iloc[:200]
            xgb_model.fit(
                X_train_val, y_train_val,
                sample_weight=sw_train_val,
                eval_set=[(X_val_set, y_val_set)],
                early_stopping_rounds=50,
                verbose=False
            )
        else:
            # Older versions - train without early stopping
            xgb_model.fit(X_train, y_train, sample_weight=sample_weights)
    except TypeError:
        # Fallback if early_stopping_rounds not accepted
        xgb_model.fit(X_train, y_train, sample_weight=sample_weights)

    xgb_preds = xgb_model.predict(X_test)
    xgb_probs = xgb_model.predict_proba(X_test)
    print("\n🔹 XGBoost Test Report:")
    print(classification_report(y_test, xgb_preds))
    print(f"Accuracy: {accuracy_score(y_test, xgb_preds):.4f}")

    joblib.dump(xgb_model, os.path.join(MODEL_DIR, "xgboost_model.pkl"))
    print("✅ XGBoost model saved.")
    return xgb_probs

# -----------------------------
# Ensemble
# -----------------------------
def run_ensemble(lgb_probs, xgb_probs, y_test):
    print("\n--- 🤝 Running Ensemble ---")
    ensemble_probs = (lgb_probs + xgb_probs) / 2
    ensemble_preds = np.argmax(ensemble_probs, axis=1)
    print("\n🔹 Ensemble Test Report:")
    print(classification_report(y_test, ensemble_preds))
    print(f"Accuracy: {accuracy_score(y_test, ensemble_preds):.4f}")
    np.save(os.path.join(MODEL_DIR, "ensemble_probs.npy"), ensemble_probs)
    print("✅ Ensemble probabilities saved.")

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    try:
        X_train, y_train, X_test, y_test, class_weight_dict = load_and_preprocess_data()
        lgb_probs = train_lightgbm(X_train, y_train, X_test, y_test, class_weight_dict)
        xgb_probs = train_xgboost(X_train, y_train, X_test, y_test, class_weight_dict)
        run_ensemble(lgb_probs, xgb_probs, y_test)
        print(f"\n✨ DONE. All models and assets saved in {MODEL_DIR}")
    except Exception as e:
        print(f"\n🚨 Training error: {e}")
