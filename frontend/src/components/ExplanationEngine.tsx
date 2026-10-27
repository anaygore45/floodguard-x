"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Scale,
  Zap
} from "lucide-react";

interface Hotspot {
  hotspot_id: string;
  name: string;
  ward: string;
  typical_flood_depth_cm: number;
}

interface ExplanationEngineProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (h: Hotspot) => void;
  apiBase: string;
}

export default function ExplanationEngine({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  apiBase,
}: ExplanationEngineProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rainIntensity, setRainIntensity] = useState<number>(45);
  const [rainDuration, setRainDuration] = useState<number>(3);
  const [highTideLock, setHighTideLock] = useState<boolean>(true);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([
    "INT_01",
    "INT_02",
  ]);

  const [expandedQ, setExpandedQ] = useState<number | null>(0);

  useEffect(() => {
    if (selectedHotspot) {
      fetchExplanation();
    }
  }, [selectedHotspot, rainIntensity, rainDuration, highTideLock, selectedInterventions]);

  const fetchExplanation = async () => {
    if (!selectedHotspot) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/scenarios/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotspot_id: selectedHotspot.hotspot_id,
          rainfall_intensity_mm_h: rainIntensity,
          rainfall_duration_h: rainDuration,
          antecedent_rain_mm: 35.0,
          high_tide_lock: highTideLock,
          selected_intervention_ids: selectedInterventions,
        }),
      });
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error("Error fetching counterfactual explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  const questions = [
    {
      id: 0,
      title: "1. Why was this intervention package recommended over alternatives?",
      key: "q1_why_recommended",
      icon: <CheckCircle2 className="w-4 h-4 text-[#40584B]" />,
      tier: "[EMPIRICAL_TRADE_OFF]",
    },
    {
      id: 1,
      title: "2. What happens if rainfall intensity increases by 20%? (Stress Test)",
      key: "q2_rainfall_surge_effect",
      icon: <Zap className="w-4 h-4 text-[#A64E45]" />,
      tier: "[STRESS_SIMULATION]",
    },
    {
      id: 2,
      title: "3. How much difference would advance preparation lead time make?",
      key: "q3_lead_time_importance",
      icon: <Clock className="w-4 h-4 text-[#A77936]" />,
      tier: "[OPERATIONAL_TIMING]",
    },
    {
      id: 3,
      title: "4. How sensitive is the recommendation to municipal budget changes?",
      key: "q4_budget_sensitivity",
      icon: <Scale className="w-4 h-4 text-[#657887]" />,
      tier: "[MARGINAL_SENSITIVITY]",
    },
    {
      id: 4,
      title: "5. Which parts rely on empirical observations vs engineering assumptions?",
      key: "q5_empirical_vs_assumed",
      icon: <Layers className="w-4 h-4 text-[#74877B]" />,
      tier: "[DATA_PROVENANCE]",
    },
    {
      id: 5,
      title: "6. What are the known physical limitations and failure modes?",
      key: "q6_failure_modes_and_limitations",
      icon: <AlertTriangle className="w-4 h-4 text-[#A64E45]" />,
      tier: "[PHYSICAL_CONSTRAINTS]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#40584B] text-white">
              FEATURE B
            </span>
            <h2 className="text-base font-semibold text-[#242722]">
              Counterfactual Explanation Engine
            </h2>
          </div>
          <p className="text-xs text-[#686B65] mt-1">
            Multi-scenario cross-comparison evaluating why interventions are recommended, testing +20% extreme cloudburst surge, and explaining data provenance.
          </p>
        </div>

        {/* Hotspot & Forcing Quick Pick */}
        <div className="flex items-center gap-3">
          <select
            value={selectedHotspot?.hotspot_id || ""}
            onChange={(e) => {
              const h = hotspots.find((x) => x.hotspot_id === e.target.value);
              if (h) onSelectHotspot(h);
            }}
            className="text-xs bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722]"
          >
            {hotspots.map((h) => (
              <option key={h.hotspot_id} value={h.hotspot_id}>
                {h.hotspot_id}: {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-xs text-[#686B65] bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm">
          Simulating 5 comparative counterfactual scenarios and diagnostic Q&A...
        </div>
      )}

      {data && !loading && (
        <>
          {/* Section 1: Five Comparative Scenarios Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
                1. Multi-Scenario Comparative Matrix (5 Profiles)
              </h3>
              <span className="text-[11px] text-[#686B65]">
                Evaluated at {rainIntensity} mm/h ({rainDuration}h storm)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Card 1: Baseline */}
              {data.comparison_matrix.baseline_zero_intervention && (
                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#686B65] block">
                      Scenario 1: Baseline
                    </span>
                    <h4 className="text-xs font-bold text-[#242722] mt-0.5">Zero Intervention</h4>
                    <p className="text-[11px] text-[#686B65] mt-1">Existing municipal drains only</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-[#F0F0EC] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Risk:</span>
                      <span className="font-bold text-[#A64E45]">
                        {Math.round(data.comparison_matrix.baseline_zero_intervention.baseline.risk_probability * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Water Depth:</span>
                      <span className="font-semibold text-[#242722]">
                        {data.comparison_matrix.baseline_zero_intervention.baseline.estimated_flood_depth_cm} cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Cost:</span>
                      <span className="font-mono text-[#242722]">₹0</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2: Selected Intervention */}
              {data.comparison_matrix.selected_intervention && (
                <div className="bg-[#FFFFFF] border-2 border-[#40584B] rounded-sm p-3 space-y-2 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#40584B] block">
                      Scenario 2: Selected
                    </span>
                    <h4 className="text-xs font-bold text-[#242722] mt-0.5">Recommended Package</h4>
                    <p className="text-[11px] text-[#686B65] mt-1">Desilting + Rapid Barriers</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-[#F0F0EC] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Risk:</span>
                      <span className="font-bold text-[#40584B]">
                        {Math.round(data.comparison_matrix.selected_intervention.counterfactual.risk_probability * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Water Depth:</span>
                      <span className="font-semibold text-[#40584B]">
                        {data.comparison_matrix.selected_intervention.counterfactual.estimated_flood_depth_cm} cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Cost:</span>
                      <span className="font-mono text-[#242722]">
                        ₹{(data.comparison_matrix.selected_intervention.impact_metrics.total_intervention_cost_inr / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 3: Multi-Intervention Package */}
              {data.comparison_matrix.comprehensive_package && (
                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#686B65] block">
                      Scenario 3: Max Defense
                    </span>
                    <h4 className="text-xs font-bold text-[#242722] mt-0.5">Tri-Intervention</h4>
                    <p className="text-[11px] text-[#686B65] mt-1">Drains + Barriers + Pumps</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-[#F0F0EC] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Risk:</span>
                      <span className="font-bold text-[#40584B]">
                        {Math.round(data.comparison_matrix.comprehensive_package.counterfactual.risk_probability * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Water Depth:</span>
                      <span className="font-semibold text-[#242722]">
                        {data.comparison_matrix.comprehensive_package.counterfactual.estimated_flood_depth_cm} cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Cost:</span>
                      <span className="font-mono text-[#242722]">
                        ₹{(data.comparison_matrix.comprehensive_package.impact_metrics.total_intervention_cost_inr / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 4: Stress Test (+20% Rain) */}
              {data.comparison_matrix.stress_test_plus_20pct_rain && (
                <div className="bg-[#FDF4F4] border border-[#F5D8D8] rounded-sm p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#A64E45] block">
                      Scenario 4: Stress Surge
                    </span>
                    <h4 className="text-xs font-bold text-[#A64E45] mt-0.5">+20% Rain Downpour</h4>
                    <p className="text-[11px] text-[#686B65] mt-1">Cloudburst intensity stress test</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-[#F5D8D8] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Surge Risk:</span>
                      <span className="font-bold text-[#A64E45]">
                        {Math.round(data.comparison_matrix.stress_test_plus_20pct_rain.counterfactual.risk_probability * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Surge Depth:</span>
                      <span className="font-semibold text-[#A64E45]">
                        {data.comparison_matrix.stress_test_plus_20pct_rain.counterfactual.estimated_flood_depth_cm} cm
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A64E45] font-semibold">
                      {data.comparison_matrix.stress_test_plus_20pct_rain.counterfactual.barrier_overtopped
                        ? "⚠ Barriers Overtopped"
                        : "✓ Crest Enveloped"}
                    </div>
                  </div>
                </div>
              )}

              {/* Card 5: Cost-Equivalent Alternative */}
              {data.comparison_matrix.cost_equivalent_alternative && (
                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#686B65] block">
                      Scenario 5: Alternative
                    </span>
                    <h4 className="text-xs font-bold text-[#242722] mt-0.5">Budget-Equal Counter</h4>
                    <p className="text-[11px] text-[#686B65] mt-1">Automated Transit Diversion</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-[#F0F0EC] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Risk:</span>
                      <span className="font-bold text-[#242722]">
                        {Math.round(data.comparison_matrix.cost_equivalent_alternative.counterfactual.risk_probability * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Water Depth:</span>
                      <span className="font-semibold text-[#242722]">
                        {data.comparison_matrix.cost_equivalent_alternative.counterfactual.estimated_flood_depth_cm} cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686B65]">Cost:</span>
                      <span className="font-mono text-[#242722]">
                        ₹{(data.comparison_matrix.cost_equivalent_alternative.impact_metrics.total_intervention_cost_inr / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Six Core Diagnostic Research Questions Accordion */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
              2. Diagnostic Counterfactual Answers (Core Research Questions)
            </h3>

            <div className="space-y-2">
              {questions.map((q) => {
                const isOpen = expandedQ === q.id;
                const answerText = data.diagnostic_explanations[q.key];

                return (
                  <div
                    key={q.id}
                    className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedQ(isOpen ? null : q.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[#F0F0EC] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {q.icon}
                        <span className="text-xs font-semibold text-[#242722]">{q.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0F0EC] text-[#686B65]">
                          {q.tier}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#686B65]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#686B65]" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-[#242722] leading-relaxed border-t border-[#F0F0EC] bg-[#FAFAF8]">
                        <p className="mt-2">{answerText}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
