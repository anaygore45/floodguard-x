# Model Card — Flood Risk Classifier (Random Forest v1.0)

## Model Details
- **Architecture**: Ensembled Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`)
- **Hyperparameters**: `n_estimators=100`, `max_depth=6`, `random_state=42`
- **Serialization Artifacts**:
  - `backend/models/flood_risk_model.joblib`: Serialized classifier pipeline
  - `backend/models/scaler.joblib`: StandardScaler normalization artifact
  - `backend/models/feature_names.json`: Explicit ordered input feature schema

## Intended Use
- **Primary Task**: Predict the probability that a specific urban location in Mumbai will experience severe/critical waterlogging (inundation depth > 45 cm resulting in roadway or transit shutdown) given prevailing and forecast rainfall conditions.
- **Intended Users**: Municipal disaster management cells, transit authorities, traffic police, and civil defense agencies in Mumbai.
- **Out-of-Scope**: Not intended for 2D hydrodynamic wave propagation, dam break simulations, or fine-scale pipe network pressure diagnostics.

## Training & Evaluation Data
- **Chronological Split**: Strictly chronologically split to eliminate target leakage and temporal autocorrelation artifacts.
  - **Training Set**: 2010 to 2021 storm chronicles (576 verified incidents across 20 chronic hotspots).
  - **Independent Test Set**: 2022 to 2024 recent storm chronicles (144 verified incidents).
- **Features Used (8 Inputs)**:
  1. `rainfall_24h_mm`: Cumulative 24-hour rainfall
  2. `rain_3d_accum_mm`: 3-day antecedent rolling saturation
  3. `rain_7d_accum_mm`: 7-day antecedent seasonal accumulation
  4. `elevation_m`: Copernicus DEM elevation (meters MSL)
  5. `depression_depth_m`: Depression depth below baseline 10m MSL
  6. `historical_recurrence_rate`: Empirical multi-year recurrence index
  7. `installed_pump_capacity_hp`: Dewatering pump power installed at site
  8. `near_railway_subway`: Underpass binary indicator

## Performance Metrics on Independent Test Set (2022-2024)
- **F1 Score**: `0.945`
- **ROC-AUC**: `0.982`
- **Precision**: `0.932`
- **Recall**: `0.958`
- **Brier Calibration Loss**: `0.084` (Low probabilistic divergence)
- **Baseline Comparison**: Logistic Regression Baseline (`F1: 0.882`, `ROC-AUC: 0.914`).
