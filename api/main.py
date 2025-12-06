from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from catboost import CatBoostRegressor
import pickle
import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict
from pathlib import Path
import os

app = FastAPI(
    title="Bangkok Traffy Prediction API",
    description="API for predicting complaint counts by category in Bangkok subdistricts",
    version="1.0.0"
)

# CORS middleware for web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and metadata
BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / 'bangkok_traffy_model.cbm'
METADATA_PATH = BASE_DIR / 'model_metadata.pkl'

model = CatBoostRegressor()
model.load_model(str(MODEL_PATH))

with open(METADATA_PATH, 'rb') as f:
    metadata = pickle.load(f)

target_cols = metadata['target_cols']
valid_subdistricts = metadata['subdistricts']


class PredictionRequest(BaseModel):
    subdistrict: str = Field(..., description="Bangkok subdistrict name (แขวง)")
    year: int = Field(..., ge=2023, le=2030, description="Year")
    month: int = Field(..., ge=1, le=12, description="Month")
    day: int = Field(..., ge=1, le=31, description="Day")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "subdistrict": "วังทองหลาง",
                "year": 2024,
                "month": 6,
                "day": 15
            }]
        }
    }


class PredictionResponse(BaseModel):
    subdistrict: str
    date: str
    predictions: Dict[str, float]
    total_predicted: float


@app.get("/")
def root():
    return {
        "message": "Bangkok Traffy Prediction API",
        "endpoints": {
            "/predict": "POST - Make predictions",
            "/subdistricts": "GET - List valid subdistricts",
            "/categories": "GET - List prediction categories",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}


@app.get("/subdistricts")
def get_subdistricts():
    return {
        "count": len(valid_subdistricts),
        "subdistricts": sorted(valid_subdistricts)
    }


@app.get("/categories")
def get_categories():
    return {
        "count": len(target_cols),
        "categories": target_cols
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Validate subdistrict
    if request.subdistrict not in valid_subdistricts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid subdistrict. Use /subdistricts endpoint to see valid options."
        )
    
    try:
        # Create date
        date_obj = datetime(request.year, request.month, request.day)
        
        # Create features matching training data EXACTLY
        # Initialize all feature columns with 0
        features_dict = {feature: [0] for feature in metadata['feature_names']}
        
        # Set the actual values
        features_dict['subdistrict'] = [request.subdistrict]
        features_dict['year'] = [request.year]
        features_dict['day'] = [request.day]
        features_dict['month_sin'] = [np.sin(2 * np.pi * request.month / 12)]
        features_dict['month_cos'] = [np.cos(2 * np.pi * request.month / 12)]
        features_dict['dow_sin'] = [np.sin(2 * np.pi * date_obj.weekday() / 7)]
        features_dict['dow_cos'] = [np.cos(2 * np.pi * date_obj.weekday() / 7)]
        features_dict['doy_sin'] = [np.sin(2 * np.pi * date_obj.timetuple().tm_yday / 365)]
        features_dict['doy_cos'] = [np.cos(2 * np.pi * date_obj.timetuple().tm_yday / 365)]
        
        features = pd.DataFrame(features_dict)
        
        # Make prediction
        predictions = model.predict(features)[0]
        
        # Format results
        prediction_dict = {
            cat: max(0, float(pred))  # Ensure non-negative
            for cat, pred in zip(target_cols, predictions)
        }
        
        return PredictionResponse(
            subdistrict=request.subdistrict,
            date=date_obj.strftime("%Y-%m-%d"),
            predictions=prediction_dict,
            total_predicted=sum(prediction_dict.values())
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/batch")
def predict_batch(requests: List[PredictionRequest]):
    """Batch prediction for multiple requests"""
    results = []
    for req in requests:
        try:
            result = predict(req)
            results.append(result.model_dump())
        except HTTPException as e:
            results.append({"error": e.detail, "request": req.model_dump()})
    
    return {"predictions": results, "count": len(results)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
