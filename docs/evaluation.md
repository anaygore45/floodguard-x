# Model Evaluation & Verification — FloodGuard X

## Evaluation Protocol
To prevent data leakage, spatial overfitting, and temporal autocorrelation, FloodGuard X adheres to a chronological evaluation protocol:
1. **Zero Data Leakage**: Models are trained on past monsoons (2010–2021) and evaluated strictly on future unseen monsoons (2022–2024).
2. **Probability Calibration**: Tree-based probabilities are evaluated via Brier Score and reliability diagrams to ensure estimated percentages correspond to empirical observed frequencies.
3. **Uncertainty Quantification**: 95% confidence intervals are estimated via the variance among individual decision tree estimators in the ensemble.

---

## Metric Breakdown

| Metric | Random Forest (Production) | Logistic Regression (Baseline) | Interpretation |
| :--- | :--- | :--- | :--- |
| **Accuracy** | **94.4%** | 88.2% | Overall prediction correctness |
| **Precision** | **93.2%** | 86.4% | Minimizes false positive evacuation alerts |
| **Recall** | **95.8%** | 90.1% | Maximizes capture of severe waterlogging events |
| **F1 Score** | **0.945** | 0.882 | Harmonic mean of precision and recall |
| **ROC-AUC** | **0.982** | 0.914 | Discriminative separation across all thresholds |
| **Brier Score** | **0.084** | 0.118 | Probabilistic accuracy (lower is superior) |

---

## Feature Importances (Gini Impurity Reduction)
1. `rainfall_24h_mm`: **36.4%** — Primary volumetric trigger of surface runoff exceedance.
2. `elevation_m`: **24.8%** — Topographic elevation governs gravitational drainage head.
3. `historical_recurrence_rate`: **18.2%** — Captures unmapped localized micro-catchment vulnerability.
4. `rain_3d_accum_mm`: **12.5%** — Antecedent saturation reducing soil infiltration capacity.
5. `depression_depth_m`: **4.8%** — Depth below regional roadway grade.
6. `near_railway_subway`: **2.1%** — Severe localized underpass entrapment hazard.
7. `installed_pump_capacity_hp`: **1.2%** — Mitigation capacity dampening low-volume inundation.
