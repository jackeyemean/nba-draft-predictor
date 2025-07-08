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
    "http://127.0.0.1:3000"
]}})

# ——— Define exact feature order per Position Group ———
FEATURES = {
    "Guards": [
        "Age","Height","Weight","Wingspan",
        "C_TS%","C_3P%","C_AST_TO","C_BPM",
        "C_PTS/40","C_AST/40","C_TRB/40","C_STL/40","C_BLK/40"
    ],
    "Wings": [
        "Age","Height","Weight","Wingspan",
        "C_TS%","C_3P%","C_AST_TO","C_BPM",
        "C_PTS/40","C_AST/40","C_TRB/40","C_STL/40","C_BLK/40"
    ],
    "Bigs": [
        "Age","Height","Weight","Wingspan",
        "C_TS%","C_3P%","C_ORB_DRB","C_BPM",
        "C_PTS/40","C_AST/40","C_TRB/40","C_STL/40","C_BLK/40"
    ]
}

# Load and sanitize results.csv
df = pd.read_csv(Path(__file__).parent / 'results.csv')
df = df.replace({np.nan: None})

@app.route('/api/results')
def get_results():
    year = request.args.get('year', type=int)
    filtered = df if year is None else df[df['Draft Year']==year]
    return jsonify(filtered.to_dict(orient='records'))

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json or {}
    pos  = data.pop('Position Group', None)
    model = models.get(pos)
    if model is None:
        return jsonify({'error': f"No model for {pos}"}), 400

    order = FEATURES.get(pos)
    if order is None:
        return jsonify({'error': f"Unknown Position Group: {pos}"}), 400

    try:
        features = [float(data[f]) for f in order]
    except KeyError as e:
        return jsonify({'error': f"Missing feature: {e.args[0]}"}), 400
    except ValueError as e:
        return jsonify({'error': "Invalid numeric value in one of the features"}), 400

    score = model.predict([features])[0]
    return jsonify({'Predicted Score': float(score)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
