import pandas as pd
import re
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import LeaveOneOut, cross_val_predict

# ─── Config ─────────────────────────────────────────────────────────────────
MIN_YEAR    = 2011
MAX_YEAR    = 2021
TRAIN_PATH  = "data/cleaned/FINAL_TRAINING.csv"
OUT_DIR     = "training"   # where to save the .pkl models
RANDOM_SEED = 100
N_EST       = 100

# ─── Position Predicates ─────────────────────────────────────────────────────
def is_guard_only(pos_str: str) -> bool:
    parts = re.split(r"[,\-/\s]+", pos_str.upper())
    return all(p in {"PG","SG"} for p in parts if p)

def is_wing(pos_str: str) -> bool:
    parts = [p for p in re.split(r"[,\-/\s]+", pos_str.upper()) if p]
    if "C" in parts: return False
    if "SF" in parts: return True
    return "PF" in parts and len(parts)>1

def is_big(pos_str: str) -> bool:
    parts = [p for p in re.split(r"[,\-/\s]+", pos_str.upper()) if p]
    return "C" in parts or all(p=="PF" for p in parts)

# ─── Feature Lists ───────────────────────────────────────────────────────────
FEATURES = {
    "guards": [
        "Age", "Height", "Wingspan", "Weight",
        "C_TS%", "C_AST_TO", "C_ORB_DRB", "C_3PAr",
        "C_BPM", "C_AST%", "C_TOV%",
        "C_FGA/40", "C_PTS/40", "C_AST/40", "C_TRB/40", "C_STL/40"
    ],
    "wings": [
        "Age", "Height", "Wingspan", "Weight",
        "C_TS%", "C_AST_TO", "C_ORB_DRB", "C_3PAr",
        "C_BPM", "C_AST%", "C_TOV%",
        "C_FGA/40", "C_PTS/40", "C_AST/40", "C_TRB/40", "C_STL/40"
    ],
    "bigs": [
        "Age", "Height", "Wingspan", "Weight",
        "C_TS%", "C_AST_TO", "C_ORB_DRB", "C_3PAr",
        "C_BPM", "C_TRB%", "C_BLK%",
        "C_FGA/40", "C_PTS/40", "C_AST/40", "C_TRB/40", "C_BLK/40",
    ]
}

# ─── Main ────────────────────────────────────────────────────────────────────
def train_group(name, predicate):
    df = pd.read_csv(TRAIN_PATH)
    # filter by year & position
    df = df[df["Draft Year"].between(MIN_YEAR, MAX_YEAR)]
    df = df[df["POS"].apply(predicate)].copy()
    if df.empty:
        print(f"No {name} in {MIN_YEAR}–{MAX_YEAR}.")
        return None

    feats = FEATURES[name]
    missing = [c for c in feats+["Player Tier"] if c not in df.columns]
    if missing:
        raise KeyError(f"{name}: missing columns {missing}")

    X = df[feats]
    y = df["Player Tier"]

    # LOO predictions
    loo = LeaveOneOut()
    model = RandomForestRegressor(
        n_estimators=N_EST,
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    print(f"Running leave one out testing for {name.capitalize()}…")
    preds = cross_val_predict(
        model, X, y,
        cv=loo, n_jobs=-1, verbose=1
    )
    df_out = df.reset_index(drop=True).copy()
    df_out["Predicted Tier"]  = preds
    df_out["Actual Tier"]     = df_out["Player Tier"]
    df_out["Group"]           = name.capitalize()

    # Train full model
    model.fit(X, y)

    # print feature importances
    importances = pd.Series(model.feature_importances_, index=feats)
    importances = importances.sort_values(ascending=False)
    print(f"Feature importances for {name.capitalize()}:")
    print(importances.to_string(), "\n")

    # save model
    path = f"{OUT_DIR}/{name}.pkl"
    joblib.dump(model, path)
    print(f"Saved {name} model to {path}\n")

    return df_out[["Name","Draft Year","POS","Group","Predicted Tier","Actual Tier"]]

if __name__=="__main__":
    results = []
    for grp, pred in [("guards", is_guard_only),
                      ("wings",  is_wing),
                      ("bigs",   is_big)]:
        df_grp = train_group(grp, pred)
        if df_grp is not None:
            results.append(df_grp)

    # concatenate all LOO results and save
    all_lootests = pd.concat(results, ignore_index=True)
    all_lootests.to_csv("refined.csv", index=False)
    print("All leave-one-out results in refined.csv")
