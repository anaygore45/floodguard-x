"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  RotateCcw,
  Copy,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  Coins,
  Gauge,
  Check,
  Info,
  Clock,
  Waves
} from "lucide-react";

interface Hotspot {
  hotspot_id: string;
  name: string;
  ward: string;
  elevation_m: number;
  typical_flood_depth_cm: number;
  historical_recurrence_rate: number;
  installed_pump_capacity_hp: number;
  near_railway_subway: boolean;
}

interface Intervention {
  intervention_id: string;
  name: string;
  category: string;
  default_cost_inr: number;
  runoff_reduction_pct: number;
  max_depth_protection_cm: number;
  lead_time_days: number;
  applicability_notes: string;
  failure_mode: string;
  empirical_support_tier: string;
}

interface ScenarioLabProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (h: Hotspot) => void;
  apiBase: string;
}

export default function ScenarioLab({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  apiBase,
}: ScenarioLabProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<string[]>([
    "INT_01",
    "INT_02",
  ]);

  // Controls
  const [rainIntensity, setRainIntensity] = useState<number>(40);
  const [rainDuration, setRainDuration] = useState<number>(3);
  const [antecedentRain, setAntecedentRain] = useState<number>(45);
  const [highTideLock, setHighTideLock] = useState<boolean>(true);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [availableBudget, setAvailableBudget] = useState<number>(5000000);
  const [customCost, setCustomCost] = useState<string>("");
  const [scenarioName, setScenarioName] = useState<string>("Monsoon Surge Protection Plan A");
  const [scenarioDesc, setScenarioDesc] = useState<string>("Desilting & deployable barriers under high tide lock.");

  // Output Evaluation
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  // Fetch interventions catalog and saved scenarios on mount
  useEffect(() => {
    fetch(`${apiBase}/interventions`)
      .then((r) => r.json())
      .then((data) => setInterventions(data))
      .catch((err) => console.error("Interventions catalog load err:", err));

    fetchSavedScenarios();
  }, [apiBase]);

  const fetchSavedScenarios = () => {
    fetch(`${apiBase}/scenarios?limit=10`)
      .then((r) => r.json())
      .then((data) => setSavedScenarios(data))
      .catch(() => {});
  };

  // Evaluate whenever key inputs change
  useEffect(() => {
    if (selectedHotspot) {
      evaluateCurrentScenario();
    }
  }, [
    selectedHotspot,
    rainIntensity,
    rainDuration,
    antecedentRain,
    highTideLock,
    leadTimeDays,
    selectedInterventionIds,
    customCost,
  ]);

  const evaluateCurrentScenario = async () => {
    if (!selectedHotspot) return;
    setLoading(true);
    try {
      const payload: any = {
        hotspot_id: selectedHotspot.hotspot_id,
        rainfall_intensity_mm_h: rainIntensity,
        rainfall_duration_h: rainDuration,
        antecedent_rain_mm: antecedentRain,
        high_tide_lock: highTideLock,
        intervention_ids: selectedInterventionIds,
        lead_time_days_available: leadTimeDays,
      };
      if (customCost.trim() !== "" && !isNaN(Number(customCost))) {
        payload.custom_cost_inr = Number(customCost);
      }

      const res = await fetch(`${apiBase}/scenarios/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntervention = (id: string) => {
    if (selectedInterventionIds.includes(id)) {
      setSelectedInterventionIds(selectedInterventionIds.filter((x) => x !== id));
    } else {
      setSelectedInterventionIds([...selectedInterventionIds, id]);
    }
  };

  const handleSaveScenario = async () => {
    if (!selectedHotspot || !evaluation) return;
    setSaveStatus("Saving...");
    try {
      const payload: any = {
        scenario_name: scenarioName,
        description: scenarioDesc,
        hotspot_id: selectedHotspot.hotspot_id,
        rainfall_intensity_mm_h: rainIntensity,
        rainfall_duration_h: rainDuration,
        antecedent_rain_mm: antecedentRain,
        high_tide_lock: highTideLock,
        intervention_ids: selectedInterventionIds,
        custom_cost_inr: customCost ? Number(customCost) : null,
      };

      const res = await fetch(`${apiBase}/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaveStatus(`Saved (ID: ${data.scenario_id})`);
      fetchSavedScenarios();
      setTimeout(() => setSaveStatus(""), 4000);
    } catch (err) {
      setSaveStatus("Failed to save");
    }
  };

  const handleReset = () => {
    setRainIntensity(35);
    setRainDuration(3);
    setAntecedentRain(30);
    setHighTideLock(false);
    setLeadTimeDays(7);
    setSelectedInterventionIds(["INT_01"]);
    setCustomCost("");
    setScenarioName("Default Baseline Simulation");
  };

  const handleDuplicate = () => {
    setScenarioName(`${scenarioName} (Copy)`);
    setScenarioDesc(`Cloned variant of ${scenarioName}`);
  };

  const loadSaved = (scen: any) => {
    const matched = hotspots.find((h) => h.hotspot_id === scen.hotspot_id);
    if (matched) onSelectHotspot(matched);
    setRainIntensity(scen.rainfall_intensity_mm_h);
    setRainDuration(scen.rainfall_duration_h);
    setAntecedentRain(scen.antecedent_rain_mm || 0);
    setHighTideLock(Boolean(scen.high_tide_lock));
    setSelectedInterventionIds(scen.intervention_ids || []);
    setScenarioName(scen.scenario_name);
    setScenarioDesc(scen.description || "");
  };

  const currentTotalCost =
    customCost && !isNaN(Number(customCost))
      ? Number(customCost)
      : selectedInterventionIds.reduce((sum, id) => {
          const match = interventions.find((i) => i.intervention_id === id);
          return sum + (match ? match.default_cost_inr : 0);
        }, 0);

  const isOverBudget = currentTotalCost > availableBudget;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#40584B] text-white">
              FEATURE A
            </span>
            <h2 className="text-base font-semibold text-[#242722]">
              Counterfactual Flood Scenario Lab
            </h2>
          </div>
          <p className="text-xs text-[#686B65] mt-1">
            Configure empirical storm forcing and test counterfactual infrastructure interventions to observe simulated risk and depth attenuation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DCDDD6] rounded text-xs text-[#242722] hover:bg-[#F0F0EC] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#686B65]" />
            Reset
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DCDDD6] rounded text-xs text-[#242722] hover:bg-[#F0F0EC] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#686B65]" />
            Duplicate
          </button>
          <button
            onClick={handleSaveScenario}
            disabled={!evaluation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#40584B] text-white rounded text-xs font-medium hover:bg-[#32453a] transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saveStatus || "Save to Warehouse"}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Hotspot Selection */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#242722] uppercase tracking-wider">
                1. Target Hotspot Location
              </label>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#F0F0EC] text-[#686B65] font-mono">
                [OBSERVED]
              </span>
            </div>
            <select
              value={selectedHotspot?.hotspot_id || ""}
              onChange={(e) => {
                const found = hotspots.find((h) => h.hotspot_id === e.target.value);
                if (found) onSelectHotspot(found);
              }}
              className="w-full text-xs bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722] focus:outline-none focus:border-[#40584B]"
            >
              {hotspots.map((h) => (
                <option key={h.hotspot_id} value={h.hotspot_id}>
                  {h.hotspot_id}: {h.name} ({h.ward}) — Typ: {h.typical_flood_depth_cm}cm
                </option>
              ))}
            </select>

            {selectedHotspot && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0F0EC] text-[11px] text-[#686B65]">
                <div>
                  <span className="block text-[10px] uppercase text-[#686B65]/70">Elevation</span>
                  <span className="font-semibold text-[#242722]">{selectedHotspot.elevation_m}m MSL</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-[#686B65]/70">Recurrence</span>
                  <span className="font-semibold text-[#242722]">{Math.round(selectedHotspot.historical_recurrence_rate * 100)}%</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-[#686B65]/70">Pumps</span>
                  <span className="font-semibold text-[#242722]">{selectedHotspot.installed_pump_capacity_hp} HP</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Rainfall & Atmospheric Forcing */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#242722] uppercase tracking-wider">
                2. Rainfall Forcing & Boundary Condition
              </label>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#F0F0EC] text-[#686B65] font-mono">
                [USER_SCENARIO]
              </span>
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#686B65]">Precipitation Intensity</span>
                <span className="font-semibold text-[#242722]">{rainIntensity} mm/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={rainIntensity}
                onChange={(e) => setRainIntensity(Number(e.target.value))}
                className="w-full accent-[#40584B] h-1.5 bg-[#EAEAE5] rounded cursor-pointer"
              />
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#686B65]">Storm Event Duration</span>
                <span className="font-semibold text-[#242722]">{rainDuration} hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={rainDuration}
                onChange={(e) => setRainDuration(Number(e.target.value))}
                className="w-full accent-[#40584B] h-1.5 bg-[#EAEAE5] rounded cursor-pointer"
              />
            </div>

            {/* Antecedent Soil Moisture */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#686B65]">Antecedent 3-Day Saturation Proxy</span>
                <span className="font-semibold text-[#242722]">{antecedentRain} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="10"
                value={antecedentRain}
                onChange={(e) => setAntecedentRain(Number(e.target.value))}
                className="w-full accent-[#40584B] h-1.5 bg-[#EAEAE5] rounded cursor-pointer"
              />
            </div>

            {/* Tidal Lock Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0F0EC]">
              <div>
                <span className="text-xs font-medium text-[#242722]">High Tide Lock (&gt;4.5m)</span>
                <span className="block text-[11px] text-[#686B65]">Nullah outfall gates shut; impedes gravity flow</span>
              </div>
              <button
                type="button"
                onClick={() => setHighTideLock(!highTideLock)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  highTideLock ? "bg-[#A64E45]" : "bg-[#DCDDD6]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    highTideLock ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Lead Time Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#686B65]">Preparation Lead Time Available</span>
                <span className="font-semibold text-[#242722]">{leadTimeDays} days</span>
              </div>
              <input
                type="range"
                min="0"
                max="21"
                step="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full accent-[#40584B] h-1.5 bg-[#EAEAE5] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Intervention Selection (7 Canonical Interventions) */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#242722] uppercase tracking-wider">
                3. Interventions Multi-Selector ({selectedInterventionIds.length}/7 Active)
              </label>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#F0F0EC] text-[#686B65] font-mono">
                [HEURISTIC_SIM]
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {interventions.map((item) => {
                const active = selectedInterventionIds.includes(item.intervention_id);
                return (
                  <div
                    key={item.intervention_id}
                    onClick={() => handleToggleIntervention(item.intervention_id)}
                    className={`p-2.5 rounded border text-xs cursor-pointer transition-all ${
                      active
                        ? "bg-[#F5F8F6] border-[#40584B] shadow-sm"
                        : "bg-[#FFFFFF] border-[#DCDDD6] hover:bg-[#F0F0EC]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-sm flex items-center justify-center border ${
                            active
                              ? "bg-[#40584B] border-[#40584B] text-white"
                              : "border-[#DCDDD6] bg-white"
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                        </div>
                        <span className="font-medium text-[#242722]">{item.name}</span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-[#40584B]">
                        ₹{(item.default_cost_inr / 100000).toFixed(1)}L
                      </span>
                    </div>

                    <div className="mt-1 ml-6 flex flex-wrap items-center gap-2 text-[10px] text-[#686B65]">
                      <span className="bg-[#F0F0EC] px-1.5 py-0.5 rounded">
                        Eff: ~{item.runoff_reduction_pct}% reduction
                      </span>
                      <span className="bg-[#F0F0EC] px-1.5 py-0.5 rounded">
                        Lead: {item.lead_time_days}d
                      </span>
                      <span className="text-[#A77936] font-mono">{item.empirical_support_tier}</span>
                    </div>

                    {active && item.failure_mode && (
                      <div className="mt-1.5 ml-6 text-[10px] text-[#A64E45] bg-[#FDF4F4] p-1.5 rounded border border-[#F5D8D8]">
                        <strong>Constraint:</strong> {item.failure_mode}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Budget & Cost Overrides */}
          <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
            <label className="text-xs font-semibold text-[#242722] uppercase tracking-wider block">
              4. Budget Envelope & Cost Configuration
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#686B65] block mb-1">Municipal Budget Cap</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-[#686B65]">₹</span>
                  <input
                    type="number"
                    value={availableBudget}
                    onChange={(e) => setAvailableBudget(Number(e.target.value))}
                    className="w-full text-xs bg-[#FFFFFF] border border-[#DCDDD6] rounded pl-6 p-2 text-[#242722] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#686B65] block mb-1">Custom Cost Override (Optional)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-[#686B65]">₹</span>
                  <input
                    type="number"
                    placeholder="Auto-calculated"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="w-full text-xs bg-[#FFFFFF] border border-[#DCDDD6] rounded pl-6 p-2 text-[#242722] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Budget Indicator Bar */}
            <div className="pt-2 border-t border-[#F0F0EC]">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#686B65]">Budget Utilization:</span>
                <span className={`font-mono font-medium ${isOverBudget ? "text-[#A64E45]" : "text-[#40584B]"}`}>
                  ₹{currentTotalCost.toLocaleString()} / ₹{availableBudget.toLocaleString()} (
                  {Math.round((currentTotalCost / Math.max(1, availableBudget)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#EAEAE5] rounded overflow-hidden">
                <div
                  className={`h-full ${isOverBudget ? "bg-[#A64E45]" : "bg-[#40584B]"}`}
                  style={{
                    width: `${Math.min(100, (currentTotalCost / Math.max(1, availableBudget)) * 100)}%`,
                  }}
                />
              </div>
              {isOverBudget && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#A64E45]">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Warning: Total intervention cost exceeds municipal allocation cap.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output: Impact Evaluation Scorecard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {evaluation ? (
            <>
              {/* Primary Scorecard Comparison: Baseline vs Scenario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Baseline Card */}
                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#686B65] font-semibold">
                      Baseline Scenario (No Interventions)
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0F0EC] text-[#686B65]">
                      {evaluation.baseline.data_provenance}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold tracking-tight text-[#242722]">
                      {Math.round(evaluation.baseline.risk_probability * 100)}%
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        evaluation.baseline.risk_level === "Critical"
                          ? "bg-[#FDF4F4] text-[#A64E45] border border-[#F5D8D8]"
                          : evaluation.baseline.risk_level === "High"
                          ? "bg-[#FDF8F0] text-[#A77936] border border-[#F7E6CA]"
                          : "bg-[#F5F8F6] text-[#40584B] border border-[#D6E2DA]"
                      }`}
                    >
                      {evaluation.baseline.risk_level} Risk Tier
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#686B65] border-t border-[#F0F0EC] pt-2">
                    <div className="flex justify-between">
                      <span>Simulated Flood Depth:</span>
                      <span className="font-semibold text-[#242722]">{evaluation.baseline.estimated_flood_depth_cm} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>95% Confidence Interval:</span>
                      <span className="font-mono text-[#242722]">
                        [{Math.round(evaluation.baseline.confidence_interval_95[0] * 100)}% -{" "}
                        {Math.round(evaluation.baseline.confidence_interval_95[1] * 100)}%]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counterfactual Scenario Card */}
                <div className="bg-[#FFFFFF] border-2 border-[#40584B] rounded-sm p-4 space-y-3 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#40584B] font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#40584B]" />
                      Counterfactual Solution Result
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F8F6] text-[#40584B]">
                      {evaluation.counterfactual.data_provenance}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold tracking-tight text-[#40584B]">
                      {Math.round(evaluation.counterfactual.risk_probability * 100)}%
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        evaluation.counterfactual.risk_level === "Critical"
                          ? "bg-[#FDF4F4] text-[#A64E45] border border-[#F5D8D8]"
                          : evaluation.counterfactual.risk_level === "High"
                          ? "bg-[#FDF8F0] text-[#A77936] border border-[#F7E6CA]"
                          : "bg-[#F5F8F6] text-[#40584B] border border-[#D6E2DA]"
                      }`}
                    >
                      {evaluation.counterfactual.risk_level} Risk Tier
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#686B65] border-t border-[#F0F0EC] pt-2">
                    <div className="flex justify-between">
                      <span>Mitigated Flood Depth:</span>
                      <span className="font-semibold text-[#40584B]">
                        {evaluation.counterfactual.estimated_flood_depth_cm} cm (
                        -{Math.round(evaluation.baseline.estimated_flood_depth_cm - evaluation.counterfactual.estimated_flood_depth_cm)} cm)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>95% Confidence Interval:</span>
                      <span className="font-mono text-[#242722]">
                        [{Math.round(evaluation.counterfactual.confidence_interval_95[0] * 100)}% -{" "}
                        {Math.round(evaluation.counterfactual.confidence_interval_95[1] * 100)}%]
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delta & Efficiency Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
                  <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                    Absolute Risk Reduction
                  </span>
                  <div className="flex items-baseline gap-1 text-xl font-bold text-[#40584B]">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{Math.round(evaluation.impact_metrics.absolute_risk_reduction * 100)}%</span>
                  </div>
                  <span className="text-[10px] text-[#686B65]">Points dropped</span>
                </div>

                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
                  <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                    Relative Risk Reduction
                  </span>
                  <div className="text-xl font-bold text-[#242722]">
                    {evaluation.impact_metrics.relative_risk_reduction_pct}%
                  </div>
                  <span className="text-[10px] text-[#686B65]">Relative to baseline</span>
                </div>

                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
                  <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                    Total Solution Cost
                  </span>
                  <div className="text-xl font-bold text-[#242722]">
                    ₹{(evaluation.impact_metrics.total_intervention_cost_inr / 100000).toFixed(1)}L
                  </div>
                  <span className="text-[10px] text-[#686B65]">Capex + Deployment</span>
                </div>

                <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
                  <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                    Cost Efficiency Ratio
                  </span>
                  <div className="text-xl font-bold font-mono text-[#40584B]">
                    ₹{evaluation.impact_metrics.cost_per_pct_risk_reduction_inr.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#686B65]">Per 1% risk drop</span>
                </div>
              </div>

              {/* Engineering Limitations & Notes Banner */}
              {evaluation.impact_metrics.engineering_notes?.length > 0 && (
                <div className="bg-[#FDF8F0] border border-[#F7E6CA] rounded-sm p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A77936]">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Hydraulic & Physical Execution Caveats Identified:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-[#686B65] pl-1 space-y-0.5">
                    {evaluation.impact_metrics.engineering_notes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scientific Trust & Provenance Breakdown */}
              <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#242722] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#40584B]" />
                    Data Provenance & Calculation Governance
                  </h4>
                  <span className="text-[10px] text-[#686B65]">Audit Trail</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-[#F0F0EC] rounded">
                    <span className="font-semibold text-[#242722] block mb-0.5">Hydraulic Disclaimer</span>
                    <p className="text-[11px] text-[#686B65]">
                      {evaluation.trust_and_provenance.hydraulic_disclaimer}
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#F0F0EC] rounded">
                    <span className="font-semibold text-[#242722] block mb-0.5">Machine Learning Model</span>
                    <p className="text-[11px] text-[#686B65]">
                      {evaluation.trust_and_provenance.baseline_model}
                    </p>
                  </div>
                </div>
              </div>

              {/* Saved Scenarios Table */}
              <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#242722] uppercase tracking-wider">
                    Warehouse Persisted Scenarios ({savedScenarios.length})
                  </h4>
                  <button
                    onClick={fetchSavedScenarios}
                    className="text-xs text-[#40584B] hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {savedScenarios.length === 0 ? (
                  <p className="text-xs text-[#686B65]">No saved scenarios in the warehouse yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F0F0EC] text-[#242722] font-semibold border-b border-[#DCDDD6]">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Hotspot</th>
                          <th className="p-2">Rain (24h)</th>
                          <th className="p-2">Delta Risk</th>
                          <th className="p-2">Cost</th>
                          <th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F0EC]">
                        {savedScenarios.map((sc) => (
                          <tr key={sc.scenario_id} className="hover:bg-[#F5F8F6]">
                            <td className="p-2 font-medium text-[#242722]">{sc.scenario_name}</td>
                            <td className="p-2 text-[#686B65]">{sc.hotspot_name || sc.hotspot_id}</td>
                            <td className="p-2 text-[#686B65]">{sc.rainfall_24h_mm} mm</td>
                            <td className="p-2 font-semibold text-[#40584B]">
                              -{Math.round(sc.absolute_risk_reduction * 100)}%
                            </td>
                            <td className="p-2 font-mono">₹{(sc.total_cost_inr / 100000).toFixed(1)}L</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => loadSaved(sc)}
                                className="px-2 py-0.5 border border-[#DCDDD6] rounded text-[11px] text-[#242722] hover:bg-[#F0F0EC]"
                              >
                                Load
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-[#686B65] bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm">
              Computing scenario risk metrics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
