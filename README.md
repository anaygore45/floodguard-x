# FloodGuard-X: Counterfactual City
**Predict the Risk. Test the Solution. Prevent the Impact.**

**FloodGuard-X: Counterfactual City** is an advanced urban flood intelligence, counterfactual intervention simulation, and decision-support system designed for the **Greater Mumbai Metropolitan Region (MMR)**. 

Moving beyond passive historical risk mapping, FloodGuard-X directly answers the core operational question:
> *"What is the most effective and cost-efficient intervention we can recommend for a specific urban waterlogging hotspot under a given rainfall scenario?"*

The system combines 15 years of meteorological reanalysis (Open-Meteo ERA5 / NASA POWER), Copernicus 30m Digital Elevation Models (DEM), and 720 verified municipal waterlogging chronicles with a calibrated Random Forest probability engine, an empirical diminishing-returns intervention model, and a SciPy Mixed-Integer Linear Programming (MILP) knapsack optimizer.

---

## Key System Architecture & Core Features

### 1. Counterfactual City Core Subsystems (Features A – F)

- **Feature A: Counterfactual Flood Scenario Lab**
  - Interactive dashboard allowing users to select any of Mumbai's 20 chronic hotspots, configure storm forcing (10–120 mm/h, duration 1–12h, antecedent moisture 0–250 mm, astronomical high-tide lock >4.5m, and advance lead time), and test combinations of 7 canonical interventions.
  - Computes baseline vs scenario risk, absolute risk reduction ($\Delta R$), relative percentage reduction, mitigated water depth (cm), and cost-effectiveness ratio ($\text{Cost} / \Delta R$).
  - Full warehouse persistence in `fact_scenario`.

- **Feature B: Counterfactual Explanation Engine**
  - Simultaneous 5-scenario comparative matrix: Baseline, Selected Package, Comprehensive Maximum Defense, Stress Test (+20% cloudburst surge), and Cost-Equivalent Alternative.
  - Evidence-based answers to 6 core diagnostic research questions explaining why interventions were chosen, cloudburst resilience margins, operational lead time sensitivity, budget sensitivity, and empirical vs assumed data provenance.

- **Feature C: Ripple Impact Engine (Geospatial & Infrastructure)**
  - Graph-based cascading disruption analysis linking hotspots to affected road corridors (Dr. Ambedkar Road, SV Road, LBS Marg, Milan Subway) and tertiary healthcare facilities (KEM Hospital, Sion LTMGH Hospital, Cooper Hospital, Kurla Bhabha Hospital, Dadar & Andheri Fire Stations).
  - Computes emergency vehicle detour latencies (e.g. +28 min ambulance delay) and ingress threat statuses displayed on MapLibre GL JS with OpenStreetMap tiles.

- **Feature D: Budget-Aware Intervention Optimizer (SciPy MILP)**
  - Global 0-1 Mixed-Integer Linear Programming allocating multi-intervention packages across 20 chronic hotspots under municipal capital constraints.
  - Enforces site capacity limits (max 2 defenses per site) and hospital feeder hard constraints.
  - Achieves **+62.9% ROI gain** over naive baseline spending.

- **Feature E: Uncertainty, Provenance & Scientific Trust Panel**
  - Strict provenance tagging across all UI metrics: `[OBSERVED]`, `[ML_MODEL]`, `[HEURISTIC_SIM]`, `[USER_SCENARIO]`.
  - Calibrated 95% confidence intervals from random forest tree variance.
  - Full scientific disclosure acknowledging that heuristic scores are calibrated screening indices, NOT 2D hydrodynamic Saint-Venant shallow-water simulations.

- **Feature F: Learning from Outcomes (Feedback & Retraining Loop)**
  - Ingestion interface for municipal inspectors to log verified field observations post-storm (actual rainfall, flood depth, observed severity, active interventions, operator field notes).
  - Live model validation engine computing Brier calibration loss, mean absolute depth error, and tier accuracy, with a readiness indicator for Model v1.1 retraining.

---

## 7 Canonical Municipal Flood Interventions

| ID | Name | Category | Default Cost (INR) | Runoff Reduction | Depth Limit | Failure Mode / Boundary Limit | Tier |
|---|---|---|---|---|---|---|---|
| **INT_01** | Culvert Desilting & Drain Maintenance | Drainage Maintenance | ₹350,000 | 28% | 999 cm | Tidal backflow surcharging during astronomical high tides (>4.5m) | `[OBSERVED]` |
| **INT_02** | Rapid-Deployment Flood Barriers | Perimeter Protection | ₹750,000 | 45% | 75 cm | Hydrodynamic overtopping when water depth exceeds 75cm crest | `[HEURISTIC_SIM]` |
| **INT_03** | Auxiliary Dewatering Sump Pump Capacity | Pumping Infrastructure | ₹1,200,000 | 38% | 999 cm | Receiving nullahs and Mithi River reaching bankfull discharge capacity | `[OBSERVED]` |
| **INT_04** | High-Infiltration Permeable Pavement | Low-Impact Development | ₹950,000 | 20% | 40 cm | Silt pore clogging and water table saturation during sustained storms | `[HEURISTIC_SIM]` |
| **INT_05** | Bioswales & Urban Rain Gardens | Green Infrastructure | ₹600,000 | 22% | 50 cm | Soil matrix saturation transitioning to 100% overland runoff bypass | `[HEURISTIC_SIM]` |
| **INT_06** | Automated Transit Diversion & Variable Signs | Transit / Exposure Control | ₹400,000 | 32% | 999 cm | Commuter non-compliance and arterial gridlock on secondary detours | `[OBSERVED]` |
| **INT_07** | IoT Silt Depth & Water Level Telemetry | Smart Monitoring | ₹250,000 | 18% | 999 cm | Telecom outages or sensor lens occlusion from floating municipal debris | `[OBSERVED]` |

---

## Directory Structure

```
floodguard/
├── data/
│   ├── raw/                 # Unmodified public datasets (OSM, NASA, ERA5, Copernicus, MCGM)
│   ├── staging/             # Cleaned, schema-standardized CSV files
│   ├── processed/           # Feature matrix, clustered hotspots, anomalies, SQLite warehouse
│   ├── manifests/           # dataset_manifest.csv & dataset_manifest.json
│   └── reports/             # Model evaluation metrics & data quality reports
├── notebooks/               # 19 executed Jupyter Notebooks (01 to 19)
├── backend/
│   ├── main.py              # FastAPI 2.0 RESTful API endpoints & Pydantic v2 schemas
│   ├── database.py          # Warehouse connection & OLAP SQL query engine
│   ├── services.py          # ML inference, Counterfactual Engine, MILP optimizer, Ripple GIS
│   └── models/              # Serialized Random Forest model & feature names
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router (page.tsx, layout.tsx, globals.css)
│   │   └── components/      # ScenarioLab, ExplanationEngine, RippleImpactView,
│   │                        # InterventionOptimizer, TrustPanel, OutcomeFeedback, MapView
│   ├── tailwind.config.js   # Neutral restrained design token palette
│   └── package.json         # Pinned frontend dependencies
├── docs/
│   ├── counterfactual_city.md # Complete Counterfactual City systems documentation
│   ├── architecture.md      # Detailed system architecture & Mermaid diagrams
│   ├── data_sources.md      # Public data sources, licenses, and OGD audit
│   ├── data_dictionary.md   # Complete schema & column definitions
│   ├── warehouse_schema.md  # Star schema & the 5 OLAP operations
│   ├── model_card.md        # Random Forest model card & specifications
│   └── limitations.md       # Scientific caveats & assumptions
├── tests/
│   ├── test_api_endpoints.py # Standard API endpoint tests
│   └── test_counterfactual.py# Counterfactual City test suite (19 test cases total)
└── README.md
```

---

## Verification & Testing

The entire system is covered by comprehensive automated tests with a **100% pass rate**:

```powershell
& "C:\Users\AnayGore\anaconda3\python.exe" -m pytest tests/ -v
# ======================== 19 passed in 7.92s ========================
```

### Running the Services

#### 1. Backend (FastAPI)
```powershell
cd backend
& "C:\Users\AnayGore\anaconda3\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Interactive API Swagger Docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend (Next.js 14)
```powershell
cd frontend
npm run dev
```
Open `http://localhost:3000` to launch the **FloodGuard-X: Counterfactual City** platform.

---

## Research & Academic Attribution
- **Meteorological Data:** ECMWF / Open-Meteo ERA5 Reanalysis & NASA POWER Satellite Project (ODbL / Public Domain).
- **Topography:** Copernicus 30m Digital Elevation Model (European Space Agency / Open Access).
- **Geospatial Road Network:** OpenStreetMap Contributors (ODbL).
- **Municipal Incident Chronicles:** Municipal Corporation of Greater Mumbai (MCGM) Disaster Management Cell.
