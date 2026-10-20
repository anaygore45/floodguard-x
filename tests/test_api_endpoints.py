import os
import sys
import pytest
from starlette.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True

def test_overview():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["verified_hotspots_count"] >= 20
    assert data["total_verified_incidents"] > 0

def test_hotspots():
    res = client.get("/api/hotspots")
    assert res.status_code == 200
    spots = res.json()
    assert len(spots) >= 20
    assert "name" in spots[0]
    assert "latitude" in spots[0]

def test_olap_rollup():
    res = client.get("/api/olap/query?operation=rollup")
    assert res.status_code == 200
    data = res.json()
    assert data["operation"] == "rollup"
    assert len(data["data"]) > 0

def test_olap_pivot():
    res = client.get("/api/olap/query?operation=pivot")
    assert res.status_code == 200
    data = res.json()
    assert data["operation"] == "pivot"
    assert len(data["data"]) > 0

def test_predict_risk():
    payload = {
        "rainfall_24h_mm": 125.0,
        "rain_3d_accum_mm": 210.0,
        "rain_7d_accum_mm": 350.0,
        "elevation_m": 5.2,
        "historical_recurrence_rate": 0.95,
        "installed_pump_capacity_hp": 800,
        "near_railway_subway": 1
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "risk_probability" in data
    assert 0.0 <= data["risk_probability"] <= 1.0
    assert data["risk_level"] in ["Critical", "High", "Moderate", "Low"]

def test_scenario_simulate():
    payload = {
        "rain_24h_mm": 150.0,
        "rain_3d_accum_mm": 250.0,
        "high_tide_lock": True
    }
    res = client.post("/api/scenarios/simulate", json=payload)
    assert res.status_code == 200
    spots = res.json()
    assert len(spots) >= 20

def test_similar_cases():
    payload = {
        "rainfall_24h_mm": 110.0,
        "rain_3d_accum_mm": 180.0,
        "elevation_m": 7.0,
        "historical_recurrence_rate": 0.9
    }
    res = client.post("/api/cases/similar", json=payload)
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) > 0
    assert "similarity_score" in cases[0]

def test_inspection_optimization():
    payload = {"budget_inr": 4500000}
    res = client.post("/api/inspection/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["allocated_cost_inr"] <= 4500000
    assert data["selected_count"] > 0
