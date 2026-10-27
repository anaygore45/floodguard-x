import os
import sys
import pytest
from starlette.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from main import app

client = TestClient(app)

def test_interventions_catalog():
    res = client.get("/api/interventions")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 7
    ids = [item["intervention_id"] for item in data]
    assert "INT_01" in ids
    assert "INT_02" in ids
    assert "INT_07" in ids
    for item in data:
        assert "default_cost_inr" in item
        assert "runoff_reduction_pct" in item
        assert "empirical_support_tier" in item
        assert item["default_cost_inr"] > 0

def test_evaluate_counterfactual():
    payload = {
        "hotspot_id": "HS_01",
        "rainfall_intensity_mm_h": 40.0,
        "rainfall_duration_h": 3.0,
        "antecedent_rain_mm": 50.0,
        "high_tide_lock": True,
        "intervention_ids": ["INT_01", "INT_02"],
        "lead_time_days_available": 7
    }
    res = client.post("/api/scenarios/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "baseline" in data
    assert "counterfactual" in data
    assert "impact_metrics" in data
    assert "trust_and_provenance" in data
    
    base_prob = data["baseline"]["risk_probability"]
    scen_prob = data["counterfactual"]["risk_probability"]
    assert scen_prob <= base_prob
    assert data["impact_metrics"]["absolute_risk_reduction"] >= 0.0
    assert data["impact_metrics"]["total_intervention_cost_inr"] == 1100000.0
    assert len(data["counterfactual"]["confidence_interval_95"]) == 2

def test_save_and_list_scenarios():
    payload = {
        "scenario_name": "Pytest Monitored Hindmata Scenario",
        "description": "Validation test scenario for automated counterfactual lab",
        "hotspot_id": "HS_01",
        "rainfall_intensity_mm_h": 35.0,
        "rainfall_duration_h": 4.0,
        "antecedent_rain_mm": 30.0,
        "high_tide_lock": False,
        "intervention_ids": ["INT_01", "INT_03"]
    }
    res = client.post("/api/scenarios", json=payload)
    assert res.status_code == 200
    saved = res.json()
    assert "scenario_id" in saved
    scen_id = saved["scenario_id"]
    
    # Retrieve detail
    res_get = client.get(f"/api/scenarios/{scen_id}")
    assert res_get.status_code == 200
    detail = res_get.json()
    assert detail["scenario_id"] == scen_id
    assert detail["hotspot_id"] == "HS_01"
    
    # List scenarios
    res_list = client.get("/api/scenarios?limit=10")
    assert res_list.status_code == 200
    scens = res_list.json()
    assert len(scens) >= 1

def test_counterfactual_explanation():
    payload = {
        "hotspot_id": "HS_02",
        "rainfall_intensity_mm_h": 45.0,
        "rainfall_duration_h": 3.0,
        "antecedent_rain_mm": 20.0,
        "high_tide_lock": True,
        "selected_intervention_ids": ["INT_01", "INT_02"]
    }
    res = client.post("/api/scenarios/explain", json=payload)
    assert res.status_code == 200
    data = res.json()
    
    assert "comparison_matrix" in data
    matrix = data["comparison_matrix"]
    assert "baseline_zero_intervention" in matrix
    assert "selected_intervention" in matrix
    assert "comprehensive_package" in matrix
    assert "stress_test_plus_20pct_rain" in matrix
    assert "cost_equivalent_alternative" in matrix
    
    assert "diagnostic_explanations" in data
    diag = data["diagnostic_explanations"]
    assert "q1_why_recommended" in diag
    assert "q2_rainfall_surge_effect" in diag
    assert "q3_lead_time_importance" in diag
    assert "q4_budget_sensitivity" in diag
    assert "q5_empirical_vs_assumed" in diag
    assert "q6_failure_modes_and_limitations" in diag

def test_ripple_impact():
    res = client.get("/api/impact/HS_01")
    assert res.status_code == 200
    data = res.json()
    assert "target_hotspot" in data
    assert "network_disruption_summary" in data
    assert "critical_facilities" in data
    assert "affected_roads" in data
    assert "geojson" in data
    
    summary = data["network_disruption_summary"]
    assert summary["affected_road_corridors_count"] > 0
    assert summary["peak_ambulance_delay_minutes"] > 0
    
    # Check GeoJSON
    geojson = data["geojson"]
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) > 0

def test_milp_plan_optimization():
    budget = 6000000.0
    payload = {
        "budget_inr": budget,
        "must_include_critical": True
    }
    res = client.post("/api/interventions/optimize-plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "optimization_summary" in data
    summary = data["optimization_summary"]
    assert summary["total_allocated_cost_inr"] <= budget
    assert summary["selected_interventions_count"] > 0
    assert summary["optimizer_roi_gain_pct"] >= 0.0
    assert len(data["hotspot_allocations"]) > 0

def test_outcome_recording_and_validation():
    payload = {
        "hotspot_id": "HS_01",
        "actual_rainfall_24h_mm": 135.0,
        "actual_flood_depth_cm": 62.0,
        "actual_severity": "Critical",
        "interventions_present": "INT_01,INT_03",
        "operator_notes": "Continuous pump operation maintained during high tide."
    }
    res = client.post("/api/outcomes", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "observation_id" in data
    assert "brier_calibration_loss" in data
    
    # Validation report
    res_val = client.get("/api/outcomes/validation")
    assert res_val.status_code == 200
    val_data = res_val.json()
    assert val_data["total_observations"] >= 5
    assert "brier_calibration_score" in val_data
    assert "retraining_status" in val_data

def test_model_evaluation_safe():
    res = client.get("/api/models/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert "test_f1_score" in data
    assert "test_roc_auc" in data

def test_olap_scenario_rollup():
    res = client.get("/api/olap/query?operation=scenario_rollup")
    assert res.status_code == 200
    data = res.json()
    assert data["operation"] == "scenario_rollup"
    assert "data" in data

def test_olap_outcome_accuracy():
    res = client.get("/api/olap/query?operation=outcome_accuracy")
    assert res.status_code == 200
    data = res.json()
    assert data["operation"] == "outcome_accuracy"
    assert len(data["data"]) > 0
