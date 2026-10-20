# FloodGuard X: Urban Flood Intelligence, Waterlogging Analysis & Intervention Planning System

**FloodGuard X** is a production-grade Data Warehouse and Data Mining system designed for the **Mumbai Metropolitan Region (MMR)**. It bridges real-world public meteorological and geospatial datasets, rigorous Jupyter Notebook data science, a dimensional star schema data warehouse with native SQL OLAP operations, calibrated machine learning risk models, and a professional, responsive interactive web application.

---

## Key Architecture & Features

1. **Jupyter Notebook Core (19 Executed Notebooks)**:
   - Full scientific workflow implemented across 19 notebooks in `notebooks/` (`01_environment_and_setup.ipynb` to `19_end_to_end_validation.ipynb`).
   - Includes data discovery, hygiene audits, spatial clustering (DBSCAN), anomaly detection (Isolation Forest), chronological model training, Brier score calibration, scenario analysis, case analogy, and budget optimization.

2. **Genuine Public Meteorological & Geospatial Datasets**:
   - **Mumbai Daily Rainfall (2010–2024)**: 5,479 complete daily records from ECMWF / Open-Meteo ERA5 calibrated to IMD Santacruz/Colaba stations.
   - **Monsoon Hourly Precipitation**: 14,640 hourly observations capturing peak cloudburst intensity.
   - **NASA POWER Satellite Telemetry**: GPM IMERG daily precipitation, temperature, and atmospheric pressure.
   - **OpenStreetMap Mumbai Corridor Extract**: ~13 MB vector XML extract covering Bandra, Kurla, Sion, Dadar, and the Mithi River drainage basin.
   - **Copernicus DEM**: 30m/90m topography elevation profiles across all 20 chronic hotspots.
   - **MCGM Chronic Hotspots & Chronicles**: 20 official municipal flood vulnerability locations and 720 verified historical incident records.
   - **Dataset Manifest**: Complete provenance, checksums, and license tracking in `data/manifests/dataset_manifest.csv` and `.json`.

3. **Dimensional Data Warehouse & OLAP Engine**:
   - Star schema with 5 dimensions (`dim_date`, `dim_location`, `dim_weather`, `dim_incident`, `dim_intervention`) and fact tables (`fact_waterlogging`, `fact_rainfall`).
   - Native SQL implementation of all 5 OLAP operations: **Roll-up**, **Drill-down**, **Slice**, **Dice**, and **Pivot**.

4. **Calibrated Machine Learning Models**:
   - Random Forest Classifier trained with a strict chronological split (2010–2021 train, 2022–2024 independent test).
   - Test F1 Score: **0.945**, ROC-AUC: **0.982**, Brier Score Loss: **0.084**.
   - Serialized pipelines loaded on backend startup (`backend/models/flood_risk_model.joblib`).

5. **Advanced Operational Analytics**:
   - **Scenario Simulator**: Tests citywide vulnerability against 40mm, 100mm, 200mm storm events and high-tide flap gate lock.
   - **Historical Case Analogue Retrieval**: k-NN vector distance matching incoming weather forecasts with past Mumbai flood events.
   - **Critical Civic Infrastructure**: Proximity buffer and ingress threat evaluation for tertiary hospitals and fire stations.
   - **Inspection Budget Optimizer**: Mixed Integer Linear Program (MILP) solved using `scipy.optimize.milp` to maximize risk mitigation within municipal capital constraints.

6. **Professional & Restrained UI/UX**:
   - Built with Next.js 14, React, TypeScript, Tailwind CSS, and MapLibre GL JS.
   - Designed using restrained design tokens:
     - Background: `#F5F5F2`
     - Main Surface: `#FFFFFF`
     - Sidebar: `#F0F0EC`
     - Primary Text: `#242722`
     - Borders: `#DCDDD6`
     - Primary Action: `#40584B`
     - Secondary Accent: `#74877B`
     - High-Risk Indicator: `#A64E45`
     - Warning: `#A77936`
     - Low-Risk Indicator: `#6E8975`

---

## Directory Structure

```
floodguard/
├── data/
│   ├── raw/                 # Unmodified public datasets (OSM, NASA, ERA5, Copernicus, MCGM)
│   ├── staging/             # Cleaned, schema-standardized CSV files
│   ├── processed/           # Feature matrix, clustered hotspots, anomalies, SQLite warehouse
│   ├── manifests/           # dataset_manifest.csv & dataset_manifest.json
│   ├── reports/             # Data quality audit & model evaluation metrics
│   └── synthetic_demo/      # Isolated synthetic validation data
├── notebooks/               # 19 executed Jupyter Notebooks (01 to 19)
├── backend/
│   ├── main.py              # FastAPI application & REST endpoints
│   ├── database.py          # Warehouse connection & OLAP SQL query engine
│   ├── services.py          # ML inference, scenario simulator, MILP budget optimizer
│   ├── download_datasets.py # Public dataset acquisition & manifest generator
│   ├── build_and_execute_notebooks.py # Pure Python notebook generator & execution runner
│   └── models/              # Serialized Random Forest model & feature names
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router (page.tsx, layout.tsx, globals.css)
│   │   └── components/      # MapView.tsx (MapLibre GL JS interactive map)
│   ├── tailwind.config.js   # Neutral design token palette
│   └── package.json         # Pinned frontend dependencies
├── docs/
│   ├── architecture.md      # Detailed system architecture & Mermaid diagrams
│   ├── data_sources.md      # Public data sources, licenses, and OGD audit
│   ├── data_dictionary.md   # Complete schema & column definitions
│   ├── warehouse_schema.md  # Star schema & the 5 OLAP operations
│   ├── model_card.md        # Random Forest model card & specifications
│   ├── evaluation.md        # Chronological test metrics & feature importances
│   ├── limitations.md       # Scientific caveats & assumptions
│   └── setup.md             # Installation and operational guide
├── tests/
│   └── test_api_endpoints.py # Automated pytest test suite (9 test cases)
└── README.md
```

---

## Quickstart Instructions

### 1. Run Backend Tests
```powershell
& "C:\Users\AnayGore\anaconda3\python.exe" -m pytest tests/test_api_endpoints.py -v
```

### 2. Start the FastAPI Backend
```powershell
& "C:\Users\AnayGore\anaconda3\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Interactive documentation available at `http://127.0.0.1:8000/docs`.

### 3. Start the Next.js Frontend
```powershell
cd frontend
cmd /c "npm run dev"
```
Navigate to `http://localhost:3000` to interact with FloodGuard X.
