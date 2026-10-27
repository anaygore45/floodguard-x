# FloodGuard-X: Counterfactual City
**Tagline:** *Predict the Risk. Test the Solution. Prevent the Impact.*

---

## 1. Executive Summary & Research Motivation

Conventional urban flood management platforms typically produce static hazard maps that identify where flooding occurred historically. While useful for retrospective diagnostics, static maps fail to answer the primary operational question faced by municipal disaster response authorities:

> **"What is the most effective and cost-efficient intervention we can recommend for a specific urban waterlogging hotspot under a given rainfall scenario?"**

**FloodGuard-X: Counterfactual City** transforms urban flood intelligence from descriptive risk mapping to **counterfactual scenario simulation and optimal intervention design**. By coupling 15 years of meteorological reanalysis (Open-Meteo ERA5 / NASA POWER), high-resolution topography (Copernicus 30m DEM), and 720 verified municipal waterlogging chronicles with a calibrated Random Forest probability engine and a SciPy Mixed-Integer Linear Programming (MILP) knapsack optimizer, the platform enables municipal engineers to configure storm scenarios, simulate infrastructure and operational interventions, stress-test resilience margins, and mathematically optimize capital allocation.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph DataTier [Dimensional Data Warehouse (SQLite / Star Schema)]
        dim_loc[dim_location]
        dim_date[dim_date]
        dim_inc[dim_incident]
        dim_int[dim_intervention]
        fact_wl[fact_waterlogging]
        fact_scen[fact_scenario]
        fact_out[fact_outcome_observation]
    end

    subgraph ServiceTier [Scientific Backend Engines (FastAPI 2.0)]
        ML[RandomForestClassifier Risk Engine]
        CFE[Counterfactual Scenario Evaluator]
        EXP[Counterfactual Explanation Engine]
        RIPPLE[Ripple Impact Geospatial Engine]
        MILP[SciPy MILP Budget Optimizer]
        FEEDBACK[Outcome Feedback & Validation Service]
    end

    subgraph PresentationTier [Next.js 14 + MapLibre GL JS Frontend]
        Lab[Feature A: Scenario Lab]
        Explainer[Feature B: Explanation Engine]
        RippleMap[Feature C: Ripple Impact GIS]
        Optimizer[Feature D: Budget Optimizer]
        Trust[Feature E: Trust & Provenance Panel]
        FeedbackView[Feature F: Learning from Outcomes]
    end

    DataTier --> ServiceTier
    ServiceTier --> PresentationTier
```

---

## 3. Seven Canonical Counterfactual Interventions

The system models seven standardized municipal flood defense and transit intervention types with explicit physical thresholds, cost profiles, and documented failure modes:

| ID | Intervention Name | Category | Default Cost (INR) | Runoff Reduction | Physical Depth Limit | Lead Time | Failure Mode / Boundary Limit | Empirical Support Tier |
|---|---|---|---|---|---|---|---|---|
| **INT_01** | Culvert Desilting & Drain Maintenance | Drainage Maintenance | ₹350,000 | 28.0% | 999 cm (Gravity) | 7 days | Tidal backflow surcharging during astronomical high tides (>4.5m) | `[OBSERVED]` |
| **INT_02** | Rapid-Deployment Flood Barriers | Perimeter Protection | ₹750,000 | 45.0% | 75 cm (Crest) | 1 day | Hydrodynamic overtopping and perimeter leakage when depth exceeds 75cm | `[HEURISTIC_SIM]` |
| **INT_03** | Auxiliary Dewatering Sump Pump Capacity | Pumping Infrastructure | ₹1,200,000 | 38.0% | 999 cm (Forced) | 14 days | Receiving nullah outfalls and Mithi River reaching bankfull discharge capacity | `[OBSERVED]` |
| **INT_04** | High-Infiltration Permeable Pavement | Low-Impact Development | ₹950,000 | 20.0% | 40 cm | 30 days | Fine sediment pore clogging and water table saturation during sustained downpours | `[HEURISTIC_SIM]` |
| **INT_05** | Bioswales & Urban Rain Gardens | Green Infrastructure | ₹600,000 | 22.0% | 50 cm | 21 days | Saturated soil matrix after continuous 3-day rainfall, transitioning to 100% overland bypass | `[HEURISTIC_SIM]` |
| **INT_06** | Automated Transit Diversion & Variable Signs | Transit / Exposure Control | ₹400,000 | 32.0% | 999 cm | 3 days | Commuter non-compliance and vehicular gridlock along secondary detour corridors | `[OBSERVED]` |
| **INT_07** | IoT Silt Depth & Water Level Telemetry | Smart Monitoring & IoT | ₹250,000 | 18.0% | 999 cm | 5 days | Cellular telecom outages during extreme cloudbursts or sensor lens occlusion | `[OBSERVED]` |

---

## 4. Subsystem Breakdown

### Feature A: Counterfactual Flood Scenario Lab
- **Interactive Control Surface**: Configures hotspot location, rainfall intensity (10–120 mm/h), storm duration (1–12h), antecedent moisture proxy (0–250 mm), astronomical high tide lock (>4.5m), and advance preparation lead time (0–21 days).
- **Intervention Synthesis**: Simulates single and multi-intervention combinations using non-linear diminishing returns:
  $$\eta_{\text{combined}} = 1 - \prod_{k} (1 - \eta_k)$$
- **Scorecards & Deltas**: Outputs baseline vs scenario risk probabilities, absolute risk reduction ($\Delta R$), relative percentage reduction, mitigated water depth (cm), and cost-effectiveness ratio ($\text{Cost} / \Delta R$).
- **Warehouse Persistence**: Scenarios can be saved to, listed from, and duplicated in `fact_scenario`.

### Feature B: Counterfactual Explanation Engine
Generates 5 comparative scenarios simultaneously:
1. Baseline (Zero Intervention)
2. Selected Intervention Package
3. Comprehensive Maximum Defense Package (Drains + Barriers + Pumps)
4. Stress Test: +20% Extreme Cloudburst Rainfall Surge
5. Cost-Equivalent Alternative Intervention

Provides structured, evidence-based answers to the **6 core diagnostic research questions**:
1. *Why was this intervention package recommended over alternatives?*
2. *What happens if rainfall intensity increases by 20%?*
3. *How much difference would advance preparation lead time make?*
4. *How sensitive is the recommendation to municipal budget changes?*
5. *Which parts rely on empirical observations vs engineering assumptions?*
6. *What are the known physical limitations and failure modes?*

### Feature C: Ripple Impact Engine (Geospatial & Infrastructure)
- **Road Network Cascades**: Maps affected transit corridors (Dr. Ambedkar Road, SV Road, LBS Marg, Milan Subway) with obstruction depth (cm) and traffic delay penalties.
- **Critical Healthcare Facilities**: Calculates proximity and ingress threats for tertiary hospitals (KEM, Sion LTMGH, Cooper, Kurla Bhabha) and fire stations (Dadar, Andheri), computing emergency vehicle detour latencies (e.g. +28 min ambulance delay).
- **MapLibre GL JS Integration**: Renders GeoJSON linestrings and point markers with threat-level color classification.

### Feature D: Budget-Aware Intervention Optimizer (SciPy MILP)
Formulates a global Mixed-Integer Linear Program over 140 candidate hotspot-intervention pairs:
$$\max \sum_{h=1}^{H} \sum_{i=1}^{I} B_{h, i} \cdot x_{h, i}$$
Subject to:
1. **Budget Ceiling**: $\sum_{h, i} C_{h, i} \cdot x_{h, i} \le \text{Budget}$
2. **Site Capacity**: $\sum_{i=1}^{I} x_{h, i} \le 2 \quad \forall h \in \{1 \dots H\}$
3. **Critical Hospital Protection**: $\sum_{i=1}^{I} x_{\text{feeder}, i} \ge 1 \quad \forall \text{feeder} \in \{\text{HS\_01}, \text{HS\_02}\}$

Delivers optimal funded allocations, rejected alternative audits with specific rejection reasons, and a +62.9% ROI uplift over naive baseline spending.

### Feature E: Uncertainty, Provenance & Scientific Trust Panel
- **Taxonomy Tagging**:
  - `[OBSERVED]`: 15-year ERA5 Reanalysis, Copernicus DEM, MCGM chronicles.
  - `[ML_MODEL]`: Calibrated Random Forest (F1: 0.912, ROC-AUC: 0.971, Brier: 0.084).
  - `[HEURISTIC_SIM]`: Literature-derived attenuation coefficients.
  - `[USER_SCENARIO]`: User-configured storm forcing.
- **Academic Disclaimer**: Explicitly informs operators that heuristic scores are calibrated screening indices, not 2D hydrodynamic Saint-Venant shallow-water simulations.
- **Sensitivity Matrix**: Simulates response curves across 25, 50, 75, 100, and 125 mm/h downpours.

### Feature F: Learning from Outcomes (Feedback & Retraining Loop)
- **Field Data Ingestion**: Form for municipal engineers to log ground-truth storm observations (actual rain, depth, severity tier, active defenses, field notes).
- **Live Calibration Engine**: Computes instant Brier calibration score, mean absolute depth error, and tier match accuracy.
- **Model Retraining Readiness**: Tracks accumulated verified cases toward the 20-case threshold for Model v1.1 retraining.

---

## 5. Verification & Testing

The system is tested end-to-end with 19 passing Pytest test cases:
```bash
pytest tests/
# ======================== 19 passed in 7.92s ========================
```
- API Health & Overview Endpoints
- Starlette HTTP Client Compatibility
- Monotonic Counterfactual Risk Reduction
- SciPy MILP Budget Feasibility & Hard Constraints
- Ripple Impact Road & Facility Graph
- Ground-Truth Post-Storm Feedback Logging
- OLAP Multi-Dimensional Aggregations (`scenario_rollup`, `outcome_accuracy`)
