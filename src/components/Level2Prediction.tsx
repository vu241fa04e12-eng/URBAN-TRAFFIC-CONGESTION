import React, { useState, useMemo } from 'react';
import {
  PredictionFeatures,
  RoadType,
  WeatherCondition,
  CongestionLevel,
} from '../types/traffic';
import { JUNCTIONS } from '../data/trafficDataset';
import {
  predictTrafficCongestion,
  MODEL_EVALUATION_METRICS,
} from '../utils/trafficModel';
import { AccuracyMetrics } from './AccuracyMetrics';
import {
  Network,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface Level2PredictionProps {
  initialJunctionId?: string;
  onSendToDecisions: (features: PredictionFeatures) => void;
}

export const Level2Prediction: React.FC<Level2PredictionProps> = ({
  initialJunctionId = 'J-01',
  onSendToDecisions,
}) => {
  const [selectedJunctionId, setSelectedJunctionId] = useState<string>(initialJunctionId);
  const [hour, setHour] = useState<number>(17); // 5 PM rush hour default
  const [dayOfWeek, setDayOfWeek] = useState<string>('Friday');
  const [vehicleVolume, setVehicleVolume] = useState<number>(2400);
  const [weather, setWeather] = useState<WeatherCondition>('Rain');
  const [incidentReported, setIncidentReported] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(18);
  const [activeTab, setActiveTab] = useState<'simulator' | 'benchmarks' | 'accuracyHorizon'>('simulator');

  const selectedJunction = useMemo(() => {
    return JUNCTIONS.find((j) => j.id === selectedJunctionId) || JUNCTIONS[0];
  }, [selectedJunctionId]);

  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
  const isRushHour = !isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19));

  const features: PredictionFeatures = useMemo(() => {
    return {
      junctionId: selectedJunctionId,
      hour,
      dayOfWeek,
      isRushHour,
      weather,
      vehicleVolume,
      roadType: selectedJunction.roadType,
      lanes: selectedJunction.lanes,
      incidentReported,
      temperature,
    };
  }, [selectedJunctionId, hour, dayOfWeek, isRushHour, weather, vehicleVolume, selectedJunction, incidentReported, temperature]);

  // Compute live prediction
  const prediction = useMemo(() => {
    return predictTrafficCongestion(features);
  }, [features]);

  const getCongestionBadge = (level: CongestionLevel) => {
    switch (level) {
      case 'Severe':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Framework Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                Level 2 Framework
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Predictive Congestion Modeling & Speed Forecasting
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              "Build a model to predict a future event/value" — Machine learning ensemble (Random Forest & XGBoost) estimating velocity loss, travel time index, and bottleneck severity based on spatio-temporal features.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Simulator
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'benchmarks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Model Benchmarks & Metrics
            </button>
            <button
              onClick={() => setActiveTab('accuracyHorizon')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'accuracyHorizon'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3 text-cyan-300" />
              <span>Date-Driven Accuracy Predictor</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'accuracyHorizon' ? (
        <AccuracyMetrics />
      ) : activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Feature Configuration Console (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Input Feature Vectors</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Trained on 6,144 rows</span>
            </div>

            {/* Junction Target */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Junction / Corridor:
              </label>
              <select
                value={selectedJunctionId}
                onChange={(e) => setSelectedJunctionId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              >
                {JUNCTIONS.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.code} — {j.name} ({j.roadType}, {j.lanes} Lanes)
                  </option>
                ))}
              </select>
            </div>

            {/* Hour of Day Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Time of Day (Hour):</span>
                <span className="font-mono font-bold text-cyan-400 tabular-nums">
                  {hour.toString().padStart(2, '0')}:00{' '}
                  {isRushHour ? '(Rush Hour)' : '(Regular Flow)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>00:00 (Night)</span>
                <span>08:00 (AM Peak)</span>
                <span>12:00</span>
                <span>18:00 (PM Peak)</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Day of Week:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDayOfWeek(d)}
                    className={`py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      dayOfWeek === d
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Vehicle Inflow Rate:</span>
                <span className="font-mono font-bold text-cyan-400 tabular-nums">
                  {vehicleVolume.toLocaleString()} veh/hr
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="3500"
                step="50"
                value={vehicleVolume}
                onChange={(e) => setVehicleVolume(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>200 (Sparse)</span>
                <span>1,500 (Moderate)</span>
                <span>3,500 (Near Saturation)</span>
              </div>
            </div>

            {/* Weather Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Weather Condition:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Clear', 'Rain', 'Heavy Rain', 'Fog'] as WeatherCondition[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      weather === w
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Active Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incidentReported}
                  onChange={(e) => setIncidentReported(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white">Simulate Active Incident / Collision</span>
                  <p className="text-slate-400 text-[11px]">
                    Induces localized capacity drop of 50-70% and shockwave bottleneck
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Model Inference Outputs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Predicted Class Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-cyan-400">ML INFERENCE RESULT</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Predicted Congestion Severity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Confidence: <span className="font-mono font-bold text-white">{prediction.confidence}%</span> based on Random Forest ensemble
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${getCongestionBadge(
                    prediction.predictedCongestion
                  )}`}
                >
                  {prediction.predictedCongestion === 'Severe' && (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {prediction.predictedCongestion} Congestion
                </div>
              </div>

              {/* 3 Core Output Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-400">Predicted Flow Speed</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
                    {prediction.predictedSpeed}{' '}
                    <span className="text-xs font-normal text-slate-400">km/h</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    <span>Free flow: {prediction.freeFlowSpeed} km/h</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-400">Travel Time Index (TTI)</div>
                  <div className="text-2xl font-bold text-amber-400 font-mono mt-1 tabular-nums">
                    {prediction.travelTimeIndex}x
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {prediction.travelTimeIndex >= 2.0
                      ? 'Trips take 2x+ longer'
                      : 'Near acceptable flow'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-400">Corridor Trip Delay</div>
                  <div className="text-2xl font-bold text-red-400 font-mono mt-1 tabular-nums">
                    +{prediction.estimatedDelayMinutes}{' '}
                    <span className="text-xs font-normal text-slate-400">mins</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">10 km baseline corridor</div>
                </div>
              </div>

              {/* Class Probability Distribution */}
              <div className="mt-5">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Multiclass Probability Distribution</span>
                  <span className="text-[11px] text-slate-400 font-normal">Softmax weights</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {Object.entries(prediction.congestionProbability).map(([level, prob]) => (
                    <div key={level} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                        <span>{level}</span>
                        <span className="font-mono font-bold text-white">{prob}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            level === 'Severe'
                              ? 'bg-red-500'
                              : level === 'High'
                              ? 'bg-orange-500'
                              : level === 'Moderate'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Drivers & Importance */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Feature Importance & Inference Drivers
                </div>
                <div className="space-y-2">
                  {prediction.keyDrivers.map((driver) => (
                    <div key={driver.feature} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{driver.feature}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{driver.impact}</span>
                        <span className="font-mono text-cyan-400 font-bold tabular-nums w-8 text-right">
                          {driver.weight}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prescriptive Transition CTA to Level 3 */}
            <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-blue-300">Level 2 → Level 3 Pipeline</span>
                <h4 className="text-sm font-bold text-white">
                  Convert this Prediction into Actionable Interventions
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Generate adaptive signal timing splits, ramp meters, and variable speed limits.
                </p>
              </div>

              <button
                onClick={() => onSendToDecisions(features)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Generate Level 3 Decisions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ML Model Benchmarks & Metrics View */
        <div className="space-y-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">
              Model Performance Comparison (Evaluated on 6,144 Row Dataset)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              80/20 Train-Test split validation across continuous 32-day urban traffic records.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2.5 font-normal">Model Architecture</th>
                    <th className="pb-2.5 font-normal">Primary Objective</th>
                    <th className="pb-2.5 text-right font-normal">Accuracy</th>
                    <th className="pb-2.5 text-right font-normal">R² Score</th>
                    <th className="pb-2.5 text-right font-normal">RMSE</th>
                    <th className="pb-2.5 text-right font-normal">MAE</th>
                    <th className="pb-2.5 text-right font-normal">Training Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                  {MODEL_EVALUATION_METRICS.models.map((m) => (
                    <tr key={m.name} className="hover:bg-slate-900/50">
                      <td className="py-3 font-sans font-semibold text-white">
                        {m.name}
                      </td>
                      <td className="py-3 font-sans text-slate-400">
                        {m.task}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-400">
                        {m.accuracy}
                      </td>
                      <td className="py-3 text-right text-cyan-400 font-bold">
                        {m.r2Score}
                      </td>
                      <td className="py-3 text-right text-slate-300">
                        {m.rmse}
                      </td>
                      <td className="py-3 text-right text-slate-300">
                        {m.mae}
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {m.trainingTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">
              Multiclass Confusion Matrix (XGBoost Classifier)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Row represents actual category; column represents predicted category on test fold.
            </p>

            <div className="max-w-md mx-auto overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-sans text-slate-400 font-normal">Actual \ Pred</th>
                    {MODEL_EVALUATION_METRICS.confusionMatrix.labels.map((l) => (
                      <th key={l} className="p-2 text-cyan-400 font-semibold">{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {MODEL_EVALUATION_METRICS.confusionMatrix.matrix.map((row, rowIdx) => {
                    const label = MODEL_EVALUATION_METRICS.confusionMatrix.labels[rowIdx];
                    return (
                      <tr key={label}>
                        <td className="p-2 text-left font-sans font-semibold text-slate-300">{label}</td>
                        {row.map((val, colIdx) => {
                          const isDiagonal = rowIdx === colIdx;
                          return (
                            <td
                              key={colIdx}
                              className={`p-2.5 tabular-nums ${
                                isDiagonal
                                  ? 'bg-blue-600/30 font-bold text-blue-200'
                                  : val > 20
                                  ? 'bg-amber-950/20 text-amber-300'
                                  : 'text-slate-400'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
