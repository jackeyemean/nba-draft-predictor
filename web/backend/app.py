# app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from pathlib import Path
from models import models

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nba-draft-predictor.onrender.com"
]}})

FEATURES = {
    "Guards": [
        "Age", "Height", "Weight", "Wingspan",
        "C_TS%", "C_3P%", "C_AST_TO",
        "C_BPM",
        "C_PTS/40", "C_AST/40", "C_TRB/40", "C_STL/40", "C_BLK/40"
    ],
    "Wings": [
        "Age", "Height", "Weight", "Wingspan",
        "C_TS%", "C_3P%", "C_AST_TO",
        "C_BPM",
        "C_PTS/40", "C_AST/40", "C_TRB/40", "C_STL/40", "C_BLK/40"
    ],
    "Bigs": [
        "Age", "Height", "Weight", "Wingspan",
        "C_TS%", "C_3P%", "C_ORB_DRB",
        "C_BPM",
        "C_PTS/40", "C_AST/40", "C_TRB/40", "C_STL/40", "C_BLK/40"
    ]
}

RENAME = {
    "TS%":     "C_TS%",
    "3P%":     "C_3P%",
    "AST/TO":  "C_AST_TO",
    "ORB/DRB": "C_ORB_DRB",
    "PTS/40":  "C_PTS/40",
    "AST/40":  "C_AST/40",
    "REB/40":  "C_TRB/40",
    "STL/40":  "C_STL/40",
    "BLK/40":  "C_BLK/40"
}

# load and sanitize results.csv
df = pd.read_csv(Path(__file__).parent / "results.csv")
df = df.replace({np.nan: None})

@app.route("/api/results")
def get_results():
    year = request.args.get("year", type=int)
    filtered = df if year is None else df[df["Draft Year"] == year]
    return jsonify(filtered.to_dict(orient="records"))

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json or {}

    # rename frontend keys → backend keys
    for front, back in RENAME.items():
        if front in data:
            data[back] = data.pop(front)

    pos = data.pop("Position Group", None)
    model = models.get(pos)
    if not model:
        return jsonify({"error": f"No model for '{pos}'"}), 400

    order = FEATURES.get(pos)
    if not order:
        return jsonify({"error": f"Unknown Position Group '{pos}'"}), 400

    try:
        feats = [float(data[k]) for k in order]
    except KeyError as e:
        return jsonify({"error": f"Missing feature: {e.args[0]}"}), 400
    except ValueError:
        return jsonify({"error": "Non-numeric feature value"}), 400

    score = model.predict([feats])[0]
    return jsonify({"Predicted Score": float(score)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
