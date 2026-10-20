import os
import json
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import execute_olap_operation, get_db_connection
from services import ml_service, analytics_service

app = FastAPI(
    title="FloodGuard X API",
    description="Urban Flood Intelligence, Waterlogging Analysis & Intervention Planning System for Mumbai",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PredictionRequest(BaseModel):
    rainfall_24h_mm: float = Field(..., ge=0, le=600, description="24-hour total precipitation in mm")
    rain_3d_accum_mm: float = Field(..., ge=0, le=1000, description="3-day accumulated rainfall in mm")
    rain_7d_accum_mm: float = Field(..., ge=0, le=2000, description="7-day accumulated rainfall in mm")
    elevation_m: float = Field(..., ge=0, le=100, description="Topographic elevation in meters MSL")
    depression_depth_m: Optional[float] = Field(None, ge=0, le=50, description="Depression depth below baseline")
    historical_recurrence_rate: float = Field(..., ge=0, le=1.0, description="Historical recurrence frequency (0 to 1)")
    installed_pump_capacity_hp: float = Field(..., ge=0, le=5000, description="Installed dewatering pump power (HP)")
    near_railway_subway: int = Field(0, ge=0, le=1, description="Binary flag: 1 if railway subway/underpass, 0 otherwise")

class ScenarioRequest(BaseModel):
    rain_24h_mm: float = Field(..., ge=0, le=600)
    rain_3d_accum_mm: float = Field(..., ge=0, le=1200)
    high_tide_lock: bool = Field(False, description="Tidal gates closed due to astronomical high tide (>4.5m)")

class SimilarCaseRequest(BaseModel):
    rainfall_24h_mm: float = Field(..., ge=0, le=600)
    rain_3d_accum_mm: float = Field(..., ge=0, le=1200)
    elevation_m: float = Field(..., ge=0, le=100)
    historical_recurrence_rate: float = Field(0.9, ge=0, le=1.0)

class OptimizationRequest(BaseModel):
    budget_inr: float = Field(5000000, ge=500000, le=50000000, description="Municipal pre-monsoon inspection budget in INR")

@app.get("/")
def root():
    return {
        "system": "FloodGuard X: Urban Flood Intelligence & Intervention Planning",
        "region": "Mumbai Metropolitan Region",
        "api_docs": "/docs",
        "status": "Operational"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": ml_service.model is not None,
        "features_count": len(ml_service.features),
        "warehouse_status": "ready"
    }

@app.get("/api/overview")
def get_executive_overview():
    return analytics_service.get_overview_stats()

@app.get("/api/hotspots")
def get_hotspots():
    return analytics_service.get_hotspots()

@app.get("/api/incidents")
def get_incidents(
    limit: int = Query(50, ge=1, le=500),
    severity: Optional[str] = None,
    ward: Optional[str] = None
):
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
    SELECT f.fact_id, d.full_date as date, l.location_name, l.ward, l.elevation_m,
           f.rainfall_24h_mm, f.recorded_flood_depth_cm, f.flood_duration_hours,
           i.severity, i.transit_disruption, f.pumps_deployed, l.catchment
    FROM fact_waterlogging f
    JOIN dim_date d ON f.date_key = d.date_key
    JOIN dim_location l ON f.location_key = l.location_key
    JOIN dim_incident i ON f.incident_key = i.incident_key
    WHERE 1=1
    """
    params = []
    if severity:
        query += " AND i.severity = ?"
        params.append(severity)
    if ward:
        query += " AND l.ward = ?"
        params.append(ward)
        
    query += " ORDER BY f.fact_id DESC LIMIT ?"
    params.append(limit)
    
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@app.get("/api/rainfall/daily")
def get_rainfall_daily(limit: int = Query(365, ge=30, le=5500)):
    rain_path = os.path.join(analytics_service.DATA_DIR if hasattr(analytics_service, "DATA_DIR") else os.path.join(BASE_DIR, "data"), "staging", "staging_rainfall_daily.csv")
    if not os.path.exists(rain_path):
        return []
    df = pd.read_csv(rain_path)
    records = df.tail(limit).to_dict(orient="records")
    return records

@app.get("/api/rainfall/summary")
def get_rainfall_summary():
    rain_path = os.path.join(BASE_DIR, "data", "staging", "staging_rainfall_daily.csv")
    if not os.path.exists(rain_path):
        return {}
    df = pd.read_csv(rain_path)
    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    
    annual_monsoon = df[df["month"].isin([6, 7, 8, 9])].groupby("year")["precipitation_mm"].sum().round(1).to_dict()
    extreme_days = int((df["precipitation_mm"] >= 100.0).sum())
    heavy_days = int((df["precipitation_mm"] >= 65.0).sum())
    
    return {
        "historical_period": "2010 - 2024 (15 Years)",
        "annual_monsoon_rainfall_mm": annual_monsoon,
        "max_recorded_daily_mm": float(df["precipitation_mm"].max()),
        "days_heavy_rain_over_65mm": heavy_days,
        "days_extreme_rain_over_100mm": extreme_days
    }

@app.get("/api/olap/query")
def run_olap_query(
    operation: str = Query("rollup", description="One of: rollup, drilldown, slice, dice, pivot"),
    ward: Optional[str] = Query("F/North"),
    min_rainfall: Optional[float] = Query(80.0)
):
    try:
        data = execute_olap_operation(operation, {"ward": ward, "min_rainfall": min_rainfall})
        return {
            "operation": operation,
            "row_count": len(data),
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/anomalies")
def get_anomalies():
    return analytics_service.get_anomalies()

@app.post("/api/predict")
def predict_flood_risk(req: PredictionRequest):
    data = req.model_dump()
    if data.get("depression_depth_m") is None:
        data["depression_depth_m"] = max(0.0, 10.0 - data["elevation_m"])
    return ml_service.predict_risk(data)

@app.post("/api/scenarios/simulate")
def simulate_scenarios(req: ScenarioRequest):
    return analytics_service.simulate_scenarios(
        rain_24h_mm=req.rain_24h_mm,
        rain_3d_accum_mm=req.rain_3d_accum_mm,
        high_tide_lock=req.high_tide_lock
    )

@app.post("/api/cases/similar")
def find_similar_cases(req: SimilarCaseRequest):
    return analytics_service.find_similar_cases(req.model_dump())

@app.get("/api/infrastructure/critical")
def get_critical_infrastructure():
    return analytics_service.get_critical_infrastructure()

@app.post("/api/inspection/optimize")
def optimize_inspection(req: OptimizationRequest):
    return analytics_service.optimize_inspection_budget(budget_inr=req.budget_inr)

@app.get("/api/manifest")
def get_manifest():
    manifest_path = os.path.join(BASE_DIR, "data", "manifests", "dataset_manifest.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@app.get("/api/models/evaluation")
def get_model_evaluation():
    metrics_path = os.path.join(BASE_DIR, "data", "reports", "model_evaluation_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
