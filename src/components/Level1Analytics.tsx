import React, { useState, useMemo } from 'react';
import { TrafficRecord } from '../types/traffic';
import { JUNCTIONS } from '../data/trafficDataset';
import { TrendingUp, CloudRain, AlertOctagon, Clock, Layers } from 'lucide-react';

interface Level1AnalyticsProps {
  records: TrafficRecord[];
  onNavigateToPrediction: () => void;
}

export const Level1Analytics: React.FC<Level1AnalyticsProps> = ({
  records,
  onNavigateToPrediction,
}) => {
  const [selectedJunctionFilter, setSelectedJunctionFilter] = useState<string>('all');

  // Filter records
  const filteredRecords = useMemo(() => {
    if (selectedJunctionFilter === 'all') return records;
    return records.filter((r) => r.junctionId === selectedJunctionFilter);
  }, [records, selectedJunctionFilter]);

  // High-level aggregate KPIs
  const kpiStats = useMemo(() => {
    const total = filteredRecords.length || 1;
    const avgSpeed = (filteredRecords.reduce((acc, r) => acc + r.averageSpeed, 0) / total).toFixed(1);
    const avgTTI = (filteredRecords.reduce((acc, r) => acc + r.travelTimeIndex, 0) / total).toFixed(2);
    const congestedCount = filteredRecords.filter((r) => r.congestionLevel === 'High' || r.congestionLevel === 'Severe').length;
    const congestionPct = Math.round((congestedCount / total) * 100);
    const incidentCount = filteredRecords.filter((r) => r.incidentReported).length;

    return {
      totalRecords: total,
      avgSpeed,
      avgTTI,
      congestionPct,
      incidentCount,
    };
  }, [filteredRecords]);

  // Hourly diurnal distribution (0 to 23)
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => {
      const atHour = filteredRecords.filter((r) => r.hour === h);
      const count = atHour.length || 1;
      const avgVol = Math.round(atHour.reduce((acc, r) => acc + r.vehicleVolume, 0) / count);
      const avgSpd = +(atHour.reduce((acc, r) => acc + r.averageSpeed, 0) / count).toFixed(1);
      const tti = +(atHour.reduce((acc, r) => acc + r.travelTimeIndex, 0) / count).toFixed(2);
      return { hour: h, avgVol, avgSpd, tti };
    });
    return hours;
  }, [filteredRecords]);

  // Weather impact distribution
  const weatherStats = useMemo(() => {
    const weatherTypes = ['Clear', 'Rain', 'Heavy Rain', 'Fog'] as const;
    return weatherTypes.map((w) => {
      const matched = filteredRecords.filter((r) => r.weather === w);
      const count = matched.length || 1;
      const avgSpeed = +(matched.reduce((acc, r) => acc + r.averageSpeed, 0) / count).toFixed(1);
      const incidentRate = +((matched.filter((r) => r.incidentReported).length / count) * 100).toFixed(1);
      return { weather: w, count: matched.length, avgSpeed, incidentRate };
    });
  }, [filteredRecords]);

  // Hotspot ranking by junction
  const hotspotRankings = useMemo(() => {
    return JUNCTIONS.map((j) => {
      const jRecords = records.filter((r) => r.junctionId === j.id);
      const count = jRecords.length || 1;
      const avgHotspotScore = Math.round(jRecords.reduce((acc, r) => acc + r.hotspotScore, 0) / count);
      const avgSpeed = +(jRecords.reduce((acc, r) => acc + r.averageSpeed, 0) / count).toFixed(1);
      const peakHourTTI = Math.max(...jRecords.map((r) => r.travelTimeIndex));
      const severeCount = jRecords.filter((r) => r.congestionLevel === 'Severe').length;
      const incidentTotal = jRecords.filter((r) => r.incidentReported).length;

      return {
        junction: j,
        avgHotspotScore,
        avgSpeed,
        peakHourTTI,
        severeCount,
        incidentTotal,
      };
    }).sort((a, b) => b.avgHotspotScore - a.avgHotspotScore);
  }, [records]);

  const maxVolume = Math.max(...hourlyData.map((d) => d.avgVol), 1);

  return (
    <div className="space-y-6">
      {/* Level 1 Header with Definition */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Level 1 Framework
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Urban Traffic Exploratory Analytics & Hotspot Discovery
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              "Analyze the data and discover meaningful patterns" — Synthesizing 6,144 hourly telemetry measurements to uncover recurrent congestion bottlenecks, temporal rush-hour waves, and environmental speed degradation factors.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Filter Corridor:</span>
            <select
              value={selectedJunctionFilter}
              onChange={(e) => setSelectedJunctionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 outline-none cursor-pointer"
            >
              <option value="all">All Corridors (Citywide Aggregate)</option>
              {JUNCTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.code} - {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Core Quantitative Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Sampled Telemetry</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1 tabular-nums">
              {kpiStats.totalRecords.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">32 continuous days</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Mean Velocity</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1 tabular-nums">
              {kpiStats.avgSpeed}{' '}
              <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Citywide corridor average</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Travel Time Index</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1 tabular-nums">
              {kpiStats.avgTTI}x
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Delay vs free-flow time</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Congestion Ratio</span>
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-400 font-mono mt-1 tabular-nums">
              {kpiStats.congestionPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">High/Severe condition rate</div>
          </div>
        </div>
      </div>

      {/* Analytical Section 1: 24-Hour Diurnal Volume & Speed Waveform */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Diurnal Traffic Flow & Velocity Waveform (24-Hour Profile)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing the inverse relationship between vehicle density and flow speed (AM Peak: 07:00–09:00, PM Peak: 16:30–19:30)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-cyan-600/70" />
              <span className="text-slate-300">Volume (veh/hr)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400" />
              <span className="text-slate-300">Speed (km/h)</span>
            </div>
          </div>
        </div>

        {/* Custom Bar & Trend Visualizer */}
        <div className="h-64 flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-800 relative">
          {/* Rush Hour Shaded Bands */}
          <div
            className="absolute top-0 bottom-0 bg-red-500/5 border-x border-red-500/20 pointer-events-none"
            style={{ left: `${(7 / 24) * 100}%`, width: `${(3 / 24) * 100}%` }}
          >
            <span className="text-[10px] font-mono text-red-400/80 px-1 pt-1 block">AM Peak</span>
          </div>

          <div
            className="absolute top-0 bottom-0 bg-red-500/5 border-x border-red-500/20 pointer-events-none"
            style={{ left: `${(16 / 24) * 100}%`, width: `${(4 / 24) * 100}%` }}
          >
            <span className="text-[10px] font-mono text-red-400/80 px-1 pt-1 block">PM Peak</span>
          </div>

          {hourlyData.map((d) => {
            const heightPct = Math.round((d.avgVol / maxVolume) * 100);
            const isPeak = (d.hour >= 7 && d.hour <= 9) || (d.hour >= 16 && d.hour <= 19);

            return (
              <div
                key={d.hour}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Hover Tooltip */}
                <div className="absolute -top-12 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-lg text-[11px] whitespace-nowrap">
                  <span className="font-mono font-bold text-white">{d.hour}:00</span> ·{' '}
                  <span className="text-cyan-300">{d.avgVol} veh/h</span> ·{' '}
                  <span className="text-amber-400">{d.avgSpd} km/h</span>
                </div>

                {/* Speed dot marker representation */}
                <div
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-1 ring-1 ring-amber-300"
                  style={{
                    transform: `translateY(-${Math.max(10, Math.min(180, (d.avgSpd / 100) * 180))}px)`,
                  }}
                  title={`Speed: ${d.avgSpd} km/h`}
                />

                {/* Volume Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm transition-all ${
                    isPeak
                      ? 'bg-gradient-to-t from-cyan-600/70 to-cyan-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                />

                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  {d.hour % 3 === 0 ? `${d.hour}h` : ''}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-1">
          <span>00:00 (Midnight)</span>
          <span className="text-slate-300 font-medium">12:00 (Noon)</span>
          <span>23:00 (Night)</span>
        </div>
      </div>

      {/* Analytical Section 2: Hotspot Identification & Weather Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hotspot Corridor Ranking (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Urban Hotspot Bottleneck Index</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Composite metric calculated from TTI, lane occupancy saturation, and queue duration
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">8 Corridors</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2 font-normal">Corridor Node</th>
                  <th className="pb-2 text-right font-normal">Severity Score</th>
                  <th className="pb-2 text-right font-normal">Mean Velocity</th>
                  <th className="pb-2 text-right font-normal">Max TTI</th>
                  <th className="pb-2 text-right font-normal">Incidents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {hotspotRankings.map((h, idx) => (
                  <tr key={h.junction.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 font-sans">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-mono">#{idx + 1}</span>
                        <span>{h.junction.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {h.junction.zone} · {h.junction.lanes} Lanes
                      </div>
                    </td>

                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-bold ${h.avgHotspotScore > 65 ? 'text-red-400' : h.avgHotspotScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {h.avgHotspotScore}
                        </span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${h.avgHotspotScore > 65 ? 'bg-red-500' : h.avgHotspotScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${h.avgHotspotScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 text-right text-slate-200">
                      {h.avgSpeed} <span className="text-[10px] text-slate-400 font-sans">km/h</span>
                    </td>

                    <td className="py-2.5 text-right font-semibold text-amber-400">
                      {h.peakHourTTI}x
                    </td>

                    <td className="py-2.5 text-right text-slate-300">
                      {h.incidentTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weather Degradation Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Weather Impact Analysis</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Empirical speed reduction under precipitation
                </p>
              </div>
              <CloudRain className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-3">
              {weatherStats.map((w) => {
                const speedLoss = Math.max(0, Math.round(62.4 - w.avgSpeed));
                return (
                  <div key={w.weather} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{w.weather}</span>
                      <span className="text-slate-400 text-[11px]">
                        {w.count} records ({Math.round((w.count / records.length) * 100)}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Average Speed:</span>
                        <div className="font-mono font-bold text-white tabular-nums">
                          {w.avgSpeed} km/h
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Incident Rate:</span>
                        <div className="font-mono font-bold text-amber-400 tabular-nums">
                          {w.incidentRate}%
                        </div>
                      </div>
                    </div>

                    {speedLoss > 0 && (
                      <div className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                        <span>Speed penalty: -{speedLoss} km/h vs clear conditions</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={onNavigateToPrediction}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Feed Patterns into Level 2 Prediction Model →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
