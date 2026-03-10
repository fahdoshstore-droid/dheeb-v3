"""
🐺 DHEEB TRADING SYSTEM V3
DHEEB Filter V3 - ML-Powered Setup Classifier
Uses Random Forest to predict setup probability based on historical data.
"""

import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

class DheebFilterV3:
    def __init__(self, model_path='dheeb_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.features = [
            'fvg_size', 
            'sweep_strength', 
            'killzone_active',
            'confluence_count', 
            'htf_bias_aligned', 
            'atr_value'
        ]
        
        # Load model if exists
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)

    def load_trading_log(self, filepath: str) -> pd.DataFrame:
        """Load trading history from JSONL file"""
        records = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    records.append(json.loads(line))
            return pd.DataFrame(records)
        except FileNotFoundError:
            print(f"Warning: Trading log {filepath} not found. Creating empty DataFrame.")
            return pd.DataFrame(columns=self.features + ['outcome'])

    def train(self, df: pd.DataFrame):
        """Train the Random Forest model on historical data"""
        if df.empty or len(df) < 50:
            print("Not enough data to train model. Need at least 50 records.")
            return False

        X = df[self.features]
        y = df['outcome'] # 1 = Win, 0 = Loss

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model = RandomForestClassifier(
            n_estimators=100, 
            max_depth=5,
            random_state=42,
            class_weight='balanced'
        )
        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        print("=== DHEEB Filter V3 - Performance Report ===")
        print(classification_report(y_test, y_pred))

        # Save model
        joblib.dump(self.model, self.model_path)
        return True

    def predict_setup(self, setup: dict) -> dict:
        """
        Predict the probability of success for a new setup.
        """
        # If no model is trained yet, fallback to rule-based scoring
        if self.model is None:
            return self._rule_based_fallback(setup)

        # Prepare features array
        feature_values = np.array([[
            setup.get('fvg_size', 0),
            setup.get('sweep_strength', 0),
            setup.get('killzone_active', 0),
            setup.get('confluence_count', 0),
            setup.get('htf_bias_aligned', 0),
            setup.get('atr_value', 0)
        ]])

        # Predict probability of class 1 (Win)
        probability = self.model.predict_proba(feature_values)[0][1]
        
        # Decision logic
        decision = "ENTER" if probability >= 0.65 else "SKIP"
        
        if probability >= 0.75:
            confidence = "HIGH"
        elif probability >= 0.65:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"

        return {
            "probability": round(probability * 100, 1),
            "decision": decision,
            "confidence": confidence,
            "is_ml_based": True
        }

    def _rule_based_fallback(self, setup: dict) -> dict:
        """Fallback logic when ML model is not yet trained"""
        score = 0
        
        if setup.get('killzone_active'): score += 30
        if setup.get('htf_bias_aligned'): score += 30
        if setup.get('sweep_strength', 0) > 0.5: score += 20
        if setup.get('fvg_size', 0) > 5: score += 20
        
        decision = "ENTER" if score >= 70 else "SKIP"
        
        return {
            "probability": score,
            "decision": decision,
            "confidence": "HIGH" if score >= 80 else "MEDIUM" if score >= 70 else "LOW",
            "is_ml_based": False
        }

if __name__ == "__main__":
    # Simple test
    filter_v3 = DheebFilterV3()
    test_setup = {
        'fvg_size': 18.5, 
        'sweep_strength': 1, 
        'killzone_active': 1,
        'confluence_count': 4, 
        'htf_bias_aligned': 1, 
        'atr_value': 12.3
    }
    result = filter_v3.predict_setup(test_setup)
    print(f"Test Setup Result: {result}")
