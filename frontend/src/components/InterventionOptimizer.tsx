"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sliders,
  Filter,
  Layers,
  Sparkles
} from "lucide-react";

interface InterventionOptimizerProps {
  apiBase: string;
}

export default function InterventionOptimizer({ apiBase }: InterventionOptimizerProps) {
  const [budget, setBudget] = useState<number>(7500000);
  const [mustProtectHospitals, setMustProtectHospitals] = useState<boolean>(true);
  const [optData, setOptData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runOptimizer();
  }, []);

  const runOptimizer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/interventions/optimize-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget_inr: budget,
          must_include_critical: mustProtectHospitals,
        }),
      });
      const data = await res.json();
      setOptData(data);
    } catch (err) {
      console.error("Optimizer run err:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#40584B] text-white">
              FEATURE D
            </span>
            <h2 className="text-base font-semibold text-[#242722]">
              Budget-Aware Intervention Optimizer (SciPy MILP)
            </h2>
          </div>
          <p className="text-xs text-[#686B65] mt-1">
            Global Mixed-Integer Linear Programming allocating multi-intervention packages across 20 chronic hotspots under municipal capital constraints.
          </p>
        </div>

        <button
          onClick={runOptimizer}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#40584B] text-white rounded text-xs font-semibold hover:bg-[#32453a] transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {loading ? "Solving MILP..." : "Solve Optimal Allocation"}
        </button>
      </div>

      {/* Control Strip */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Budget Slider */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-[#242722]">Municipal Budget Allocation:</span>
            <span className="font-mono font-bold text-[#40584B]">
              ₹{(budget / 100000).toFixed(1)} Lakhs (₹{budget.toLocaleString()})
            </span>
          </div>
          <input
            type="range"
            min="1000000"
            max="20000000"
            step="500000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[#40584B] h-1.5 bg-[#EAEAE5] rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#686B65]">
            <span>₹10L (Minimal Pilot)</span>
            <span>₹1.0Cr (Ward Capital Plan)</span>
            <span>₹2.0Cr (Comprehensive)</span>
          </div>
        </div>

        {/* Hospital Constraint Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#F0F0EC] rounded border border-[#DCDDD6]">
          <div>
            <span className="text-xs font-semibold text-[#242722] block">
              Hospital Access Hard Constraint
            </span>
            <span className="text-[10px] text-[#686B65]">
              Guarantees &ge;1 defense on hospital feeders
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMustProtectHospitals(!mustProtectHospitals)}
            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              mustProtectHospitals ? "bg-[#40584B]" : "bg-[#DCDDD6]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                mustProtectHospitals ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {optData && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Allocated Capital
              </span>
              <div className="text-2xl font-bold font-mono text-[#242722]">
                ₹{(optData.optimization_summary.total_allocated_cost_inr / 100000).toFixed(1)}L
              </div>
              <span className="text-[10px] text-[#40584B] font-medium">
                {optData.optimization_summary.budget_utilization_pct}% utilized
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Selected Interventions
              </span>
              <div className="text-2xl font-bold text-[#40584B]">
                {optData.optimization_summary.selected_interventions_count}
              </div>
              <span className="text-[10px] text-[#686B65]">
                Across {optData.optimization_summary.hotspots_treated_count} hotspots
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Cumulative Benefit Score
              </span>
              <div className="text-2xl font-bold text-[#242722]">
                {optData.optimization_summary.cumulative_benefit_score}
              </div>
              <span className="text-[10px] text-[#686B65]">Weighted risk attenuation</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                MILP Optimization Uplift
              </span>
              <div className="flex items-baseline gap-1 text-2xl font-bold text-[#40584B]">
                <TrendingUp className="w-5 h-5" />
                <span>+{optData.optimization_summary.optimizer_roi_gain_pct}%</span>
              </div>
              <span className="text-[10px] text-[#686B65]">Vs naive baseline spending</span>
            </div>
          </div>

          {/* Hotspot Allocations Table */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
                Optimal Plan Breakdown by Location ({optData.hotspot_allocations.length} Sites Funded)
              </h3>
              <span className="text-[10px] font-mono text-[#686B65]">
                {optData.optimization_summary.solver_status}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0F0EC] text-[#242722] font-semibold border-b border-[#DCDDD6]">
                  <tr>
                    <th className="p-2.5">Hotspot Location</th>
                    <th className="p-2.5">Ward</th>
                    <th className="p-2.5">Risk Tier</th>
                    <th className="p-2.5">Allocated Interventions</th>
                    <th className="p-2.5 text-right">Site Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0EC]">
                  {optData.hotspot_allocations.map((spot: any) => (
                    <tr key={spot.hotspot_id} className="hover:bg-[#F5F8F6]">
                      <td className="p-2.5 font-medium text-[#242722]">
                        {spot.hotspot_id}: {spot.hotspot_name}
                      </td>
                      <td className="p-2.5 text-[#686B65]">{spot.ward}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            spot.risk_tier === "Critical"
                              ? "bg-[#FDF4F4] text-[#A64E45]"
                              : "bg-[#FDF8F0] text-[#A77936]"
                          }`}
                        >
                          {spot.risk_tier}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {spot.interventions.map((intItem: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#F0F0EC] text-[#242722] border border-[#DCDDD6] text-[11px]"
                            >
                              {intItem.name} (-{intItem.runoff_reduction_pct}%)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-right font-semibold text-[#40584B]">
                        ₹{(spot.total_hotspot_cost_inr / 100000).toFixed(1)}L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rejected Alternatives Audit */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
              Audit Trail: Rejected Alternative Interventions (Sample)
            </h3>
            <p className="text-xs text-[#686B65]">
              Mathematically audited candidates that were evaluated by the MILP branch-and-cut solver but not selected due to capacity or marginal efficiency limits.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0F0EC] text-[#242722] font-semibold border-b border-[#DCDDD6]">
                  <tr>
                    <th className="p-2">Location</th>
                    <th className="p-2">Evaluated Intervention</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Benefit</th>
                    <th className="p-2">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0EC]">
                  {optData.rejected_alternatives_sample.map((rej: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FDF4F4]/50">
                      <td className="p-2 text-[#242722]">{rej.hotspot_name}</td>
                      <td className="p-2 text-[#686B65]">{rej.intervention_name}</td>
                      <td className="p-2 font-mono">₹{(rej.cost_inr / 100000).toFixed(1)}L</td>
                      <td className="p-2 font-mono">{rej.benefit_score}</td>
                      <td className="p-2 text-[#A64E45] font-medium">{rej.rejection_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
