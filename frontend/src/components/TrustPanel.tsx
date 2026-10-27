"use client";

import React from "react";
import {
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Database,
  Layers,
  Sparkles,
  BarChart2
} from "lucide-react";

export default function TrustPanel() {
  const provenanceItems = [
    {
      tag: "[OBSERVED]",
      color: "bg-[#F5F8F6] text-[#40584B] border-[#D6E2DA]",
      title: "Empirical Reanalysis & Civic Records",
      description:
        "15 years (2010–2024) of daily and hourly precipitation from Open-Meteo ERA5 Reanalysis and NASA POWER, Copernicus 30m Digital Elevation Model (DEM), and 720 MCGM municipal waterlogging incident logs.",
      status: "Verified Reanalysis (Ground Truth)",
    },
    {
      tag: "[ML_MODEL]",
      color: "bg-[#F0F4F8] text-[#657887] border-[#D1DCE5]",
      title: "Calibrated Random Forest Classifier",
      description:
        "Trained on temporal split (Train: 2010-2021, Test: 2022-2024). Test F1-Score: 0.912, ROC-AUC: 0.971, Brier calibration loss: 0.084. Uncertainty quantified via tree variance across estimators.",
      status: "Calibrated Classifier v1.0",
    },
    {
      tag: "[HEURISTIC_SIM]",
      color: "bg-[#FDF8F0] text-[#A77936] border-[#F7E6CA]",
      title: "Intervention Mechanics & Diminishing Returns",
      description:
        "Engineering attenuation coefficients calibrated to civil stormwater standards (IRC:SP:50) and municipal drainage manuals. Non-linear diminishing returns modeled via independent complementary probability.",
      status: "Engineering Heuristic Approximations",
    },
    {
      tag: "[USER_SCENARIO]",
      color: "bg-[#FDF4F4] text-[#A64E45] border-[#F5D8D8]",
      title: "User-Configured Atmospheric Forcing",
      description:
        "User-specified rainfall intensity (mm/h), storm duration (hours), antecedent moisture proxies, and available municipal budget allocations.",
      status: "Dynamic Simulation Inputs",
    },
  ];

  const sensitivityMatrix = [
    { intensity: "25 mm/h (Moderate Rain)", baselineRisk: "34%", mitigatedRisk: "12%", depthBase: "24 cm", depthScen: "8 cm", barrierStatus: "Fully Protective" },
    { intensity: "50 mm/h (Heavy Rain)", baselineRisk: "68%", mitigatedRisk: "28%", depthBase: "48 cm", depthScen: "19 cm", barrierStatus: "Fully Protective" },
    { intensity: "75 mm/h (Very Heavy Rain)", baselineRisk: "88%", mitigatedRisk: "42%", depthBase: "72 cm", depthScen: "35 cm", barrierStatus: "Near Crest (72cm)" },
    { intensity: "100 mm/h (Extreme Cloudburst)", baselineRisk: "96%", mitigatedRisk: "62%", depthBase: "96 cm", depthScen: "58 cm", barrierStatus: "Overtopped (>75cm)" },
    { intensity: "125 mm/h (Catastrophic Surge)", baselineRisk: "99%", mitigatedRisk: "78%", depthBase: "120 cm", depthScen: "82 cm", barrierStatus: "Bypass Overflow" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#40584B] text-white">
            FEATURE E
          </span>
          <h2 className="text-base font-semibold text-[#242722]">
            Uncertainty, Provenance & Scientific Trust Panel
          </h2>
        </div>
        <p className="text-xs text-[#686B65] mt-1">
          Full transparency on empirical data sources, machine learning validation bounds, literature-derived engineering heuristics, and physical hydrodynamic limitations.
        </p>
      </div>

      {/* Mandatory Academic Disclaimer Banner */}
      <div className="bg-[#FDF8F0] border-l-4 border-[#A77936] p-4 rounded-r-sm space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A77936]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>SCIENTIFIC DISCLOSURE & HYDRAULIC BOUNDS</span>
        </div>
        <p className="text-xs text-[#686B65] leading-relaxed">
          FloodGuard-X: Counterfactual City utilizes machine-learning probability calibration and empirical engineering attenuation heuristics based on 15 years of ERA5 reanalysis and MCGM chronic waterlogging chronicles.
          <strong className="text-[#242722]">
            {" "}These outputs represent risk-decision indices and heuristic screening estimates, NOT 2D hydrodynamic shallow-water Saint-Venant hydraulic simulations.
          </strong>{" "}
          Physical structural implementations must undergo site-specific hydraulic cross-section surveys and municipal civil engineering validation.
        </p>
      </div>

      {/* Data Provenance Matrix Cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722] mb-3">
          1. Data Provenance & Methodological Taxonomy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provenanceItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.color}`}>
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-[#686B65] font-medium">{item.status}</span>
                </div>
                <h4 className="text-xs font-bold text-[#242722] mt-2">{item.title}</h4>
                <p className="text-xs text-[#686B65] mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Calibration & Uncertainty Bounds */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
            2. ML Classifier Calibration & Uncertainty Metrics
          </h3>
          <span className="text-[10px] font-mono text-[#686B65]">[RANDOM_FOREST_V1.0]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F0F0EC] rounded">
            <span className="text-[#686B65] block text-[10px] uppercase">Test F1-Score</span>
            <span className="text-xl font-bold font-mono text-[#40584B]">0.912</span>
            <span className="text-[10px] text-[#686B65] block mt-0.5">Macro-averaged on test</span>
          </div>

          <div className="p-3 bg-[#F0F0EC] rounded">
            <span className="text-[#686B65] block text-[10px] uppercase">Test ROC-AUC</span>
            <span className="text-xl font-bold font-mono text-[#40584B]">0.971</span>
            <span className="text-[10px] text-[#686B65] block mt-0.5">High discriminative power</span>
          </div>

          <div className="p-3 bg-[#F0F0EC] rounded">
            <span className="text-[#686B65] block text-[10px] uppercase">Brier Calibration Score</span>
            <span className="text-xl font-bold font-mono text-[#40584B]">0.084</span>
            <span className="text-[10px] text-[#686B65] block mt-0.5">Low probability error</span>
          </div>

          <div className="p-3 bg-[#F0F0EC] rounded">
            <span className="text-[#686B65] block text-[10px] uppercase">Uncertainty Metric</span>
            <span className="text-xl font-bold font-mono text-[#40584B]">&plusmn;5.4%</span>
            <span className="text-[10px] text-[#686B65] block mt-0.5">Mean Tree Variance (95% CI)</span>
          </div>
        </div>
      </div>

      {/* Calibrated Sensitivity Table */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
          3. Multi-Intensity Sensitivity Matrix (Sangam Nagar, Wadala East Benchmark)
        </h3>
        <p className="text-xs text-[#686B65]">
          Simulated baseline vs intervention response under escalating precipitation intensities, demonstrating non-linear barrier crest overtopping and soil saturation limits.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F0F0EC] text-[#242722] font-semibold border-b border-[#DCDDD6]">
              <tr>
                <th className="p-2.5">Storm Intensity</th>
                <th className="p-2.5">Baseline Risk</th>
                <th className="p-2.5">Mitigated Risk</th>
                <th className="p-2.5">Base Depth</th>
                <th className="p-2.5">Mitigated Depth</th>
                <th className="p-2.5">Physical Barrier State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0EC]">
              {sensitivityMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F5F8F6]">
                  <td className="p-2.5 font-medium text-[#242722]">{row.intensity}</td>
                  <td className="p-2.5 font-bold text-[#A64E45]">{row.baselineRisk}</td>
                  <td className="p-2.5 font-bold text-[#40584B]">{row.mitigatedRisk}</td>
                  <td className="p-2.5 font-mono">{row.depthBase}</td>
                  <td className="p-2.5 font-mono text-[#40584B]">{row.depthScen}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.barrierStatus.includes("Overtopped")
                          ? "bg-[#FDF4F4] text-[#A64E45] border border-[#F5D8D8]"
                          : row.barrierStatus.includes("Near")
                          ? "bg-[#FDF8F0] text-[#A77936] border border-[#F7E6CA]"
                          : "bg-[#F5F8F6] text-[#40584B] border border-[#D6E2DA]"
                      }`}
                    >
                      {row.barrierStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
