from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from typing import List, Optional

app = FastAPI(title="Qollab ML Service", description="Predictive Analytics for Inventory Management")

class TrainDemandRequest(BaseModel):
    product_id: int
    horizon_days: int = 30

class TrainLeadTimeRequest(BaseModel):
    supplier_id: int

class PredictRequest(BaseModel):
    product_id: int
    horizon_days: int = 30

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "qollab-ml"}

@app.post("/train/demand")
def train_demand(request: TrainDemandRequest):
    """
    Trains a demand forecasting model (Prophet) for a specific product.
    """
    # Placeholder: Call the trainer module
    return {"status": "success", "message": f"Demand model trained for product {request.product_id}"}

@app.post("/train/lead-time")
def train_lead_time(request: TrainLeadTimeRequest):
    """
    Trains a lead time prediction model for a specific supplier.
    """
    # Placeholder: Call the trainer module
    return {"status": "success", "message": f"Lead time model trained for supplier {request.supplier_id}"}

@app.post("/predict")
def predict(request: PredictRequest):
    """
    Returns predictions for a given product.
    """
    # Placeholder: Call the predictor module
    return {
        "product_id": request.product_id,
        "predictions": [
            {"date": "2026-05-07", "demand": 12, "lower": 8, "upper": 15},
            {"date": "2026-05-08", "demand": 15, "lower": 10, "upper": 19}
        ]
    }
