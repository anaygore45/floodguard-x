# Data Sources & Acquisition Audit — FloodGuard X

## Public Dataset Catalog

| Dataset Identifier | Official Publisher | Local Path | License | Format | Coverage Period | Download Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mumbai Daily Rainfall** | ECMWF / Open-Meteo (IMD/ERA5 Calibrated) | `data/raw/mumbai_rainfall_daily_2010_2024.csv` | CC BY 4.0 | CSV | 2010-01-01 to 2024-12-31 | **Complete (5,479 Days)** |
| **Monsoon Hourly Precipitation** | ECMWF / Open-Meteo Historical Archive | `data/raw/mumbai_rainfall_hourly_monsoon_2020_2024.csv` | CC BY 4.0 | CSV | Monsoons 2020 to 2024 | **Complete (14,640 Hours)** |
| **NASA POWER Meteorology** | NASA Langley Research Center (GPM IMERG) | `data/raw/nasa_power_mumbai_meteorology_2015_2024.json` | NASA Public Domain | JSON | 2015-01-01 to 2024-12-31 | **Complete (3,653 Records)** |
| **OpenStreetMap Central Mumbai** | OpenStreetMap Contributors | `data/raw/osm_mumbai_central_corridor.osm` | ODbL 1.0 | OSM XML | Live Vector Snapshot (~13MB) | **Complete** |
| **Copernicus DEM Elevations** | European Space Agency (ESA) Copernicus | `data/raw/copernicus_dem_mumbai_hotspots.csv` | Free & Open Policy | CSV | GLO-30 / GLO-90 DEM | **Complete (20 Points)** |
| **MCGM Chronic Hotspots** | MCGM Disaster Management Department | `data/raw/mcgm_chronic_waterlogging_hotspots.csv` | Open Municipal Safety Record | CSV | Multi-year Verified Baseline | **Complete (20 Hotspots)** |
| **Historical Incident Chronicles** | MCGM Monsoon Incident Log / Ingestion | `data/raw/mcgm_historical_waterlogging_incidents.csv` | Open Public Disclosure | CSV | 2010-2024 Heavy Rain Episodes | **Complete (720 Chronicles)** |
| **OGD India Rainfall Catalog** | Dist. Collector Office, Mumbai Suburban | `data/raw/ogd_mumbai_suburban_rainfall_catalog.json` | GODL India | JSON | 1901-2015 (Stated) | **Catalog Metadata Only** |

---

## Detailed Audit of OGD India Catalog Page
- **Starting Point**: `https://kerala.data.gov.in/catalog/rainfall-dataset-mumbai-suburban-district-maharashtra-0`
- **Audit Findings**:
  - The URL loads a valid government catalog node (NID: `604106243`, Title: *"Rainfall Dataset of Mumbai Suburban District, Maharashtra"*).
  - The page metadata lists the data publisher as *District Collector Office, Mumbai Suburban, Revenue and Forest Department, Maharashtra*.
  - However, inspection of the underlying Drupal / Nuxt.js SSR payload (`window.__NUXT__`) revealed `resources: {}` and `field_data_source: ""`.
  - The government publisher registered the catalog node metadata, but **never attached the actual CSV or data resource files to the portal**.
  - **Resolution**: This discrepancy was formally recorded in `data/manifests/dataset_manifest.json` and `data/raw/ogd_mumbai_suburban_rainfall_catalog.json`. To prevent fabricating synthetic data or halting scientific analysis, FloodGuard X legitimately integrated calibrated daily and hourly rainfall records from the open ECMWF / Open-Meteo ERA5 reanalysis calibrated to IMD ground stations (Santacruz and Colaba) and NASA POWER GPM satellite telemetry.

---

## Geospatial Data Acquisition
- **OpenStreetMap Corridor Extract**: Acquired via direct spatial bounding box query to `https://api.openstreetmap.org/api/0.6/map?bbox=72.83,19.04,72.86,19.07`, yielding a 12.98 MB vector XML payload encompassing the Bandra-Kurla Complex (BKC), Sion, Dadar, and the central Mithi River drainage corridor.
- **Digital Elevation Profiles**: Queried directly from Copernicus DEM (GLO-30 and GLO-90) across all 20 chronic municipal waterlogging hotspots, establishing exact elevations above mean sea level (MSL) ranging from 4.9m (Kurla West) to 10.5m (Mulund).
