import pandas as pd
from prophet import Prophet
import joblib
import os

MODEL_DIR = "trained_models"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fills in missing dates with 0 demand.
    Input df should have columns: 'ds' (date), 'y' (demand).
    """
    if df.empty:
        return df
        
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Generate full date range
    min_date = df['ds'].min()
    max_date = df['ds'].max()
    all_dates = pd.date_range(start=min_date, end=max_date, freq='D')
    
    # Reindex to fill gaps with 0
    df = df.set_index('ds')
    df = df.reindex(all_dates, fill_value=0).reset_index()
    df.rename(columns={'index': 'ds'}, inplace=True)
    
    return df

def train_prophet_model(product_id: int, df: pd.DataFrame):
    """
    Trains a Prophet model for a specific product.
    """
    df = preprocess_data(df)
    
    if len(df) < 30:
        raise ValueError("Not enough data to train Prophet model. Need at least 30 days.")
        
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )
    
    model.fit(df)
    
    # Save model
    model_path = os.path.join(MODEL_DIR, f"demand_product_{product_id}.pkl")
    joblib.dump(model, model_path)
    
    return model_path

def predict_demand(product_id: int, horizon_days: int = 30) -> list:
    """
    Loads trained model and generates predictions.
    """
    model_path = os.path.join(MODEL_DIR, f"demand_product_{product_id}.pkl")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model for product {product_id} not found. Train first.")
        
    model = joblib.load(model_path)
    
    future = model.make_future_dataframe(periods=horizon_days)
    forecast = model.predict(future)
    
    # Get only the future predictions
    future_forecast = forecast.tail(horizon_days)
    
    results = []
    for _, row in future_forecast.iterrows():
        results.append({
            "date": row['ds'].strftime("%Y-%m-%d"),
            "demand": max(0, int(round(row['yhat']))),
            "lower": max(0, int(round(row['yhat_lower']))),
            "upper": max(0, int(round(row['yhat_upper'])))
        })
        
    return results
