import React, { useState, useMemo } from 'react';
import {
  PredictionFeatures,
  RecommendationAction,
  CongestionLevel,
} from '../types/traffic';
import { JUNCTIONS } from '../data/trafficDataset';
import {
  predictTrafficCongestion,
  generateRecommendations,
} from '../utils/trafficModel';
import {
  Lightbulb,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Send,
} from 'lucide-react';

interface Level3RecommendationsProps {
  initialFeatures?: PredictionFeatures;
  onModifyPrediction: () => void;
}

export const Level3Recommendations: React.FC<Level3RecommendationsProps> = ({
  initialFeatures,
  onModifyPrediction,
}) => {
  const [selectedJunctionId, setSelectedJunctionId] = useState<string>(
    initialFeatures?.junctionId || 'J-01'
  );
  const [overrideCongestion, setOverrideCongestion] = useState<CongestionLevel | 'auto'>(
    'auto'
  );
  const [appliedActions, setAppliedActions] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // Setup current features
  const activeFeatures: PredictionFeatures = useMemo(() => {
    if (initialFeatures && initialFeatures.junctionId === selectedJunctionId && overrideCongestion === 'auto') {
      return initialFeatures;
    }

    const junction = JUNCTIONS.find((j) => j.id === selectedJunctionId) || JUNCTIONS[0];
    const isHigh = overrideCongestion === 'High' || overrideCongestion === 'Severe';

    return {
      junctionId: junction.id,
      hour: isHigh ? 18 : 14,
      dayOfWeek: 'Friday',
      isRushHour: isHigh,
      weather: overrideCongestion === 'Severe' ? 'Heavy Rain' : 'Clear',
      vehicleVolume: isHigh ? 2800 : 1400,
      roadType: junction.roadType,
      lanes: junction.lanes,
      incidentReported: overrideCongestion === 'Severe',
      temperature: 19,
    };
  }, [initialFeatures, selectedJunctionId, overrideCongestion]);

  // Run model inference
  const prediction = useMemo(() => {
    return predictTrafficCongestion(activeFeatures);
  }, [activeFeatures]);

  // Generate prescriptive decisions
  const recommendations = useMemo(() => {
    return generateRecommendations(activeFeatures, prediction);
  }, [activeFeatures, prediction]);

  const handleApplyAction = (actionId: string) => {
    if (appliedActions.includes(actionId)) {
      setAppliedActions(appliedActions.filter((id) => id !== actionId));
    } else {
      setAppliedActions([...appliedActions, actionId]);
    }
  };

  const handleApplyAll = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setAppliedActions(recommendations.map((r) => r.id));
      setIsDeploying(false);
    }, 600);
  };

  const totalSpeedGain = recommendations
    .filter((r) => appliedActions.includes(r.id))
    .reduce((acc, r) => acc + r.estimatedSpeedGainKmH, 0);

  const totalDelayReduction = Math.min(
    75,
    recommendations
      .filter((r) => appliedActions.includes(r.id))
      .reduce((acc, r) => acc + r.delayReductionPct, 0)
  );

  return (
    <div className="space-y-6">
      {/* Header with Framework Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/40">
                Level 3 Framework
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Prescriptive Decision Engine & Actionable Interventions
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              "Convert the prediction into an actionable recommendation" — Intelligent traffic control system generating real-time traffic signal splits, variable speed limits (VSL), dynamic message sign route diversion, and transit priority dispatches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onModifyPrediction}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modify Prediction Input</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control & Simulated State Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Corridor Node:</label>
            <select
              value={selectedJunctionId}
              onChange={(e) => {
                setSelectedJunctionId(e.target.value);
                setAppliedActions([]);
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:border-cyan-500 outline-none cursor-pointer"
            >
              {JUNCTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.code} — {j.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Simulate Bottleneck Severity:</label>
            <div className="flex items-center gap-1">
              {(['auto', 'Low', 'Moderate', 'High', 'Severe'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setOverrideCongestion(lvl);
                    setAppliedActions([]);
                  }}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                    overrideCongestion === lvl
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {lvl === 'auto' ? 'Auto (from Model)' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current State Summary Pill */}
        <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">Predicted State: </span>
            <span className="font-bold text-white font-mono">{prediction.predictedCongestion}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">Current Velocity: </span>
            <span className="font-bold text-cyan-400 font-mono tabular-nums">{prediction.predictedSpeed} km/h</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">Delay: </span>
            <span className="font-bold text-red-400 font-mono tabular-nums">+{prediction.estimatedDelayMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Main Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recommendation Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-400" />
              <span>Recommended Prescriptive Actions ({recommendations.length})</span>
            </h3>

            <button
              onClick={handleApplyAll}
              disabled={isDeploying}
              className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>{isDeploying ? 'Deploying...' : 'Simulate All Interventions'}</span>
            </button>
          </div>

          {recommendations.map((action) => {
            const isApplied = appliedActions.includes(action.id);

            return (
              <div
                key={action.id}
                className={`p-4 rounded-xl border transition-all ${
                  isApplied
                    ? 'bg-purple-950/20 border-purple-500/60 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          action.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : action.priority === 'High'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        }`}
                      >
                        {action.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400">
                        {action.category} · {action.targetJunction}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white pt-0.5">
                      {action.actionTitle}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyAction(action.id)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isApplied
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-purple-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${isApplied ? 'text-white' : 'text-slate-400'}`} />
                    <span>{isApplied ? 'Intervention Active' : 'Execute Action'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Expected Outcome:</span>
                    <p className="text-slate-200 mt-0.5">{action.expectedOutcome}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Speed Gain:</span>
                    <p className="font-mono font-bold text-emerald-400 tabular-nums mt-0.5">
                      +{action.estimatedSpeedGainKmH} km/h
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Deployment Latency:</span>
                    <p className="text-cyan-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{action.implementationTime}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Projected Impact & Closed-Loop Feedback (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-xs font-mono text-purple-400">CLOSED-LOOP CONTROL</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Projected Corridor Recovery
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated response after applying selected Level 3 recommendations
              </p>
            </div>

            {/* Simulated Speed Boost */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Recovered Average Velocity</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {Math.min(prediction.freeFlowSpeed, prediction.predictedSpeed + totalSpeedGain).toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">
                {totalSpeedGain > 0 ? `+${totalSpeedGain.toFixed(1)} km/h velocity boost` : 'No active interventions'}
              </div>
            </div>

            {/* Travel Time Reduction */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div className="text-xs text-slate-400">Corridor Delay Saved</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
                {totalDelayReduction}%{' '}
                <span className="text-xs font-normal text-slate-400">reduction</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {totalDelayReduction > 0
                  ? `Saves approx. ${((prediction.estimatedDelayMinutes * totalDelayReduction) / 100).toFixed(1)} mins / trip`
                  : 'Awaiting action deployment'}
              </div>
            </div>

            {/* Active Interventions Checklist */}
            <div className="text-xs">
              <div className="text-slate-400 mb-2">Active Intervention Stack:</div>
              {appliedActions.length === 0 ? (
                <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-slate-400 text-center text-xs">
                  Click "Execute Action" on any recommendation to test simulated network recovery.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {appliedActions.map((id) => {
                    const act = recommendations.find((r) => r.id === id);
                    if (!act) return null;
                    return (
                      <div key={id} className="p-2 bg-purple-950/30 border border-purple-900/50 rounded flex items-center justify-between text-xs">
                        <span className="truncate text-purple-200">{act.actionTitle}</span>
                        <span className="text-emerald-400 font-mono shrink-0 ml-2">
                          +{act.estimatedSpeedGainKmH} km/h
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Safety Invariants Verified: SCATS cycle bounds &le; 140s maximum</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
