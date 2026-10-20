# Analytical Limitations & Assumptions — FloodGuard X

## Scientific & Data Caveats

### 1. Spatial Resolution of Rainfall Datasets
- Reanalysis precipitation (ERA5 / Open-Meteo) and satellite precipitation (NASA POWER / GPM IMERG) operate on spatial grids of 0.1° (~11 km) and 0.5° (~50 km) respectively, calibrated to regional weather telemetry.
- **Limitation**: Highly localized, micro-scale convective cloudbursts that deposit extreme rain over a single municipal ward (e.g. 80 mm in Dadar while Colaba records 15 mm) may show slight divergence from regional gridded aggregates.
- **Guidance**: Use regional rainfall as a synoptic hazard envelope, not as a point-scale laser gauge.

### 2. Subterranean Drainage Infrastructure Mapping
- Public OpenStreetMap and municipal open data include surface waterways (Mithi River, Dahisar River, Poisar River, Oshiwara River, and major natural nullahs), but **do not provide complete 3D vector alignments of subterranean stormwater drains, barrel culverts, and underground manhole siltation depths**.
- **Limitation**: The model infers localized drainage impedance through empirical recurrence frequency and topographic depression metrics rather than 1D St. Venant pipe-network hydraulic routing.

### 3. Digital Elevation Model (DEM) Resolution
- Elevation data is derived from Copernicus DEM (GLO-30 / GLO-90) at 30-meter to 90-meter spatial resolution.
- **Limitation**: Micro-topographic features such as roadway curbs, railway embankment berms, and localized subway sumps may be smoothed within a 30m grid cell. Spot elevations have been cross-calibrated with municipal ground surveys where available.

### 4. Anomaly Detection Interpretation
- Isolation Forest anomaly flags indicate statistical deviation (e.g. significant flood depth recorded under modest rainfall).
- **Limitation**: An anomaly score is a diagnostic investigation signal highlighting potential unobserved factors (e.g. mechanical pump diesel outage, high tide tidal flap lock, or debris blockage). **It is not direct physical proof of siltation.**

### 5. Inspection Budget Optimizer (MILP)
- The optimization model formulates pre-monsoon culvert inspection and desilting as a Mixed Integer Linear Program (Binary Knapsack).
- **Limitation**: The optimizer maximizes cumulative risk coverage under the budget ceiling. Completing an inspection or desilting intervention reduces vulnerability, but cannot physically guarantee zero flooding under severe cloudbursts exceeding hydraulic design capacity.
