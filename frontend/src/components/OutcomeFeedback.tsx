"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  PlusCircle,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Send,
  Sparkles
} from "lucide-react";

interface Hotspot {
  hotspot_id: string;
  name: string;
  ward: string;
}

interface OutcomeFeedbackProps {
  hotspots: Hotspot[];
  apiBase: string;
}

export default function OutcomeFeedback({ hotspots, apiBase }: OutcomeFeedbackProps) {
  const [valData, setValData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitMsg, setSubmitMsg] = useState<string>("");

  // Form State
  const [hotspotId, setHotspotId] = useState<string>("HS_01");
  const [observedDate, setObservedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [actualRain, setActualRain] = useState<number>(125);
  const [actualDepth, setActualDepth] = useState<number>(55);
  const [actualSeverity, setActualSeverity] = useState<string>("High");
  const [interventionsPresent, setInterventionsPresent] = useState<string>(
    "INT_01,INT_02"
  );
  const [operatorNotes, setOperatorNotes] = useState<string>(
    "Pumps deployed 15 min prior to heavy downpour. Barrier held until 50cm."
  );

  useEffect(() => {
    fetchValidation();
  }, []);

  const fetchValidation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/outcomes/validation`);
      const data = await res.json();
      setValData(data);
    } catch (err) {
      console.error("Error fetching outcome validation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch(`${apiBase}/outcomes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotspot_id: hotspotId,
          observed_date: observedDate,
          actual_rainfall_24h_mm: actualRain,
          actual_flood_depth_cm: actualDepth,
          actual_severity: actualSeverity,
          interventions_present: interventionsPresent,
          operator_notes: operatorNotes,
        }),
      });
      const data = await res.json();
      setSubmitMsg(`Observation logged successfully (ID: ${data.observation_id})`);
      fetchValidation();
      setTimeout(() => setSubmitMsg(""), 5000);
    } catch (err) {
      setSubmitMsg("Failed to submit observation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#40584B] text-white">
              FEATURE F
            </span>
            <h2 className="text-base font-semibold text-[#242722]">
              Learning from Outcomes (Feedback & Retraining Loop)
            </h2>
          </div>
          <p className="text-xs text-[#686B65] mt-1">
            Ground-truth post-storm observation logging to validate prediction accuracy, compute live Brier calibration scores, and trigger automated Model v1.1 retraining.
          </p>
        </div>

        <button
          onClick={fetchValidation}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DCDDD6] rounded text-xs text-[#242722] hover:bg-[#F0F0EC] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#686B65]" />
          Refresh Metrics
        </button>
      </div>

      {valData && (
        <>
          {/* Validation Metrics KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Verified Field Cases
              </span>
              <div className="text-2xl font-bold font-mono text-[#242722]">
                {valData.total_observations}
              </div>
              <span className="text-[10px] text-[#40584B] font-medium">
                {valData.retraining_status}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Brier Calibration Loss
              </span>
              <div className="text-2xl font-bold font-mono text-[#40584B]">
                {valData.brier_calibration_score}
              </div>
              <span className="text-[10px] text-[#686B65]">Calibrated probability loss</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Mean Depth Error
              </span>
              <div className="text-2xl font-bold font-mono text-[#242722]">
                &plusmn;{valData.mean_depth_absolute_error_cm} cm
              </div>
              <span className="text-[10px] text-[#686B65]">Predicted vs actual depth</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
              <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
                Risk Tier Match Accuracy
              </span>
              <div className="text-2xl font-bold font-mono text-[#40584B]">
                {valData.tier_prediction_accuracy_pct}%
              </div>
              <span className="text-[10px] text-[#686B65]">Exact category precision</span>
            </div>
          </div>

          {/* Form & Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Field Observation Submission Form (5 cols) */}
            <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722] flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#40584B]" />
                  Log Field Post-Storm Observation
                </h3>
                <span className="text-[10px] text-[#686B65] font-mono">[GROUND_TRUTH]</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#686B65] block mb-1">Hotspot Location</label>
                  <select
                    value={hotspotId}
                    onChange={(e) => setHotspotId(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722]"
                  >
                    {hotspots.map((h) => (
                      <option key={h.hotspot_id} value={h.hotspot_id}>
                        {h.hotspot_id}: {h.name} ({h.ward})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#686B65] block mb-1">Event Date</label>
                    <input
                      type="date"
                      value={observedDate}
                      onChange={(e) => setObservedDate(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[#686B65] block mb-1">Observed Severity Tier</label>
                    <select
                      value={actualSeverity}
                      onChange={(e) => setActualSeverity(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722]"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#686B65] block mb-1">Actual 24h Rain (mm)</label>
                    <input
                      type="number"
                      value={actualRain}
                      onChange={(e) => setActualRain(Number(e.target.value))}
                      className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[#686B65] block mb-1">Actual Flood Depth (cm)</label>
                    <input
                      type="number"
                      value={actualDepth}
                      onChange={(e) => setActualDepth(Number(e.target.value))}
                      className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722] font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#686B65] block mb-1">
                    Interventions Present on Site (IDs)
                  </label>
                  <input
                    type="text"
                    value={interventionsPresent}
                    onChange={(e) => setInterventionsPresent(e.target.value)}
                    placeholder="e.g. INT_01, INT_02"
                    className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#686B65] block mb-1">
                    Municipal Inspector Field Notes
                  </label>
                  <textarea
                    rows={3}
                    value={operatorNotes}
                    onChange={(e) => setOperatorNotes(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722]"
                  />
                </div>

                {submitMsg && (
                  <div className="p-2 bg-[#F5F8F6] border border-[#D6E2DA] rounded text-xs text-[#40584B]">
                    {submitMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-[#40584B] text-white rounded font-medium hover:bg-[#32453a] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Logging Observation..." : "Record Verified Observation"}
                </button>
              </form>
            </div>

            {/* Right: Verified Observations Table (7 cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
                  Recent Field Validation Log ({valData.recent_observations.length} Records)
                </h3>
                <span className="text-[10px] text-[#686B65] font-mono">
                  Target: 20 Cases for Retrain Cycle
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F0F0EC] text-[#242722] font-semibold border-b border-[#DCDDD6]">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Actual Rain</th>
                      <th className="p-2">Obs Depth</th>
                      <th className="p-2">Predicted vs Actual</th>
                      <th className="p-2">Brier Loss</th>
                      <th className="p-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0EC]">
                    {valData.recent_observations.map((row: any) => (
                      <tr key={row.observation_id} className="hover:bg-[#F5F8F6]">
                        <td className="p-2 font-mono text-[#686B65]">{row.observed_date}</td>
                        <td className="p-2 font-medium text-[#242722]">{row.hotspot_name}</td>
                        <td className="p-2 font-mono">{row.actual_rainfall_24h_mm} mm</td>
                        <td className="p-2 font-mono font-semibold">{row.actual_flood_depth_cm} cm</td>
                        <td className="p-2">
                          <span className="text-[#686B65]">{row.predicted_risk_tier}</span> &rarr;{" "}
                          <span className="font-semibold text-[#242722]">{row.actual_severity}</span>
                        </td>
                        <td className="p-2 font-mono text-[#40584B]">
                          {row.model_calibration_error}
                        </td>
                        <td className="p-2 text-right">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F5F8F6] text-[#40584B] border border-[#D6E2DA]">
                            {row.validation_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
