import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
import numpy as np

MODEL_DIR = "trained_models"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts features for the model.
    Expected columns: order_date, expected_delivery, actual_delivery
    """
    df['order_date'] = pd.to_datetime(df['order_date'])
    df['actual_delivery'] = pd.to_datetime(df['actual_delivery'])
    
    # Target: actual lead time in days
    df['actual_lead_time'] = (df['actual_delivery'] - df['order_date']).dt.days
    
    # Features
    df['month'] = df['order_date'].dt.month
    df['is_winter'] = df['month'].isin([11, 12, 1]).astype(int)
    
    # Ensure no negative lead times due to data errors
    df['actual_lead_time'] = df['actual_lead_time'].clip(lower=0)
    
    return df

def train_lead_time_model(supplier_id: int, df: pd.DataFrame):
    """
    Trains a model to predict lead time for a supplier.
    """
    df = extract_features(df)
    
    if len(df) < 5:
        raise ValueError("Not enough historical orders to train model.")
        
    X = df[['month', 'is_winter']]
    y = df['actual_lead_time']
    
    # Use RandomForest for better handling of non-linear seasonal delays
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Save model
    model_path = os.path.join(MODEL_DIR, f"lead_time_supplier_{supplier_id}.pkl")
    joblib.dump(model, model_path)
    
    # Also save the standard deviation of errors to calculate safety stock
    predictions = model.predict(X)
    residuals = y - predictions
    std_dev = np.std(residuals)
    
    meta_path = os.path.join(MODEL_DIR, f"lead_time_supplier_{supplier_id}_meta.json")
    import json
    with open(meta_path, 'w') as f:
        json.dump({"std_dev_days": float(std_dev)}, f)
        
    return model_path

def predict_lead_time(supplier_id: int, current_month: int) -> dict:
    """
    Predicts the expected lead time and variance for a given supplier.
    """
    model_path = os.path.join(MODEL_DIR, f"lead_time_supplier_{supplier_id}.pkl")
    meta_path = os.path.join(MODEL_DIR, f"lead_time_supplier_{supplier_id}_meta.json")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model for supplier {supplier_id} not found.")
        
    model = joblib.load(model_path)
    
    import json
    with open(meta_path, 'r') as f:
        meta = json.load(f)
        
    is_winter = 1 if current_month in [11, 12, 1] else 0
    X_pred = pd.DataFrame({'month': [current_month], 'is_winter': [is_winter]})
    
    predicted_days = model.predict(X_pred)[0]
    
    return {
        "supplier_id": supplier_id,
        "predicted_lead_time_days": round(predicted_days, 1),
        "std_dev_days": round(meta["std_dev_days"], 2)
    }
