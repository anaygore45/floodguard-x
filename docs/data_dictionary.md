# Data Dictionary — FloodGuard X

## 1. Feature Matrix (`data/processed/mumbai_flood_feature_matrix.csv`)

| Field Name | Data Type | Units | Description |
| :--- | :--- | :--- | :--- |
| `incident_id` | String | Identifier | Unique municipal incident code (`INC_00001` format) |
| `date` | Date | `YYYY-MM-DD` | Date of documented waterlogging occurrence |
| `hotspot_id` | String | Identifier | Foreign key to chronic hotspot inventory (`HS_01` to `HS_20`) |
| `location_name` | String | Name | Canonical municipal landmark name |
| `ward` | String | Code | MCGM administrative municipal ward (e.g. `F/North`, `H/West`, `L`) |
| `latitude` | Float | Degrees North | WGS84 latitude coordinate (18.85°N to 19.35°N) |
| `longitude` | Float | Degrees East | WGS84 longitude coordinate (72.75°E to 73.10°E) |
| `rainfall_24h_mm` | Float | Millimeters (mm) | 24-hour total precipitation for that date |
| `rain_1d_mm` | Float | Millimeters (mm) | Same-day 24h rolling rainfall total |
| `rain_3d_accum_mm` | Float | Millimeters (mm) | 3-day antecedent rolling rainfall accumulation |
| `rain_7d_accum_mm` | Float | Millimeters (mm) | 7-day antecedent rolling rainfall accumulation |
| `rain_intensity_max_proxy` | Float | mm/hour | Approximate peak rainfall intensity during storm hours |
| `elevation_m` | Float | Meters MSL | Topographic elevation above mean sea level from Copernicus DEM |
| `depression_depth_m` | Float | Meters (m) | Relative depression depth below reference 10m MSL datum |
| `historical_recurrence_rate`| Float | Fraction (0-1) | Long-term empirical recurrence frequency during heavy rainfall |
| `installed_pump_capacity_hp`| Integer | Horsepower (HP) | Municipal dewatering diesel/electric pump capacity installed at location |
| `near_railway_subway` | Boolean | Binary (0/1) | Indicates whether location is a vehicular underpass beneath railway lines |
| `recorded_flood_depth_cm` | Float | Centimeters (cm) | Physical water inundation depth measured at location |
| `flood_duration_hours` | Float | Hours (h) | Duration until floodwaters receded below roadway surface |
| `severity` | String | Categorical | Municipal severity classification: `Critical`, `High`, `Moderate` |
| `transit_disruption` | Boolean | Binary (True/False)| Indicates whether road/rail vehicular traffic was completely halted |
| `pumps_deployed` | Integer | Count | Number of auxiliary mobile pumps mobilized during incident |
| `drainage_catchment` | String | Name | Natural river or major storm sewer basin draining the location |
| `target_high_risk` | Integer | Binary (0/1) | Classification target: 1 if Critical or High severity, 0 otherwise |

---

## 2. Chronic Hotspots (`data/staging/staging_hotspots.csv`)

| Field Name | Data Type | Units | Description |
| :--- | :--- | :--- | :--- |
| `hotspot_id` | String | Identifier | Unique hotspot ID (`HS_01` to `HS_20`) |
| `name` | String | Text | Location name (e.g. Hindmata Cinema, Gandhi Market, Milan Subway) |
| `ward` | String | Text | MCGM Ward code |
| `latitude` | Float | Degrees | Latitude |
| `longitude` | Float | Degrees | Longitude |
| `elevation_m` | Float | Meters | Copernicus DEM elevation |
| `catchment` | String | Text | Receiving catchment basin |
| `risk_tier` | String | Categorical | `Critical`, `High`, `Medium` |
| `historical_recurrence_rate`| Float | Fraction | Multi-year flood recurrence likelihood |
| `typical_flood_depth_cm` | Float | Centimeters | Average baseline waterlogging depth |
| `installed_pump_capacity_hp`| Integer | HP | Station pump capacity |
| `near_railway_subway` | Boolean | Binary | Underpass subway flag |
| `cluster_id` | Integer | Integer | Spatial DBSCAN cluster membership (0, 1, 2, 3) |
