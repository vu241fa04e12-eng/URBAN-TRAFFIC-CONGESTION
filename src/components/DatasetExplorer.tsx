import React, { useState, useMemo } from 'react';
import { TrafficRecord, CongestionLevel, WeatherCondition } from '../types/traffic';
import { exportTrafficDatasetAsCSV, JUNCTIONS } from '../data/trafficDataset';
import { Download, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface DatasetExplorerProps {
  records: TrafficRecord[];
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ records }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJunction, setSelectedJunction] = useState<string>('all');
  const [selectedCongestion, setSelectedCongestion] = useState<string>('all');
  const [selectedWeather, setSelectedWeather] = useState<string>('all');
  const [incidentsOnly, setIncidentsOnly] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof TrafficRecord>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Filter dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedJunction !== 'all' && r.junctionId !== selectedJunction) return false;
      if (selectedCongestion !== 'all' && r.congestionLevel !== selectedCongestion) return false;
      if (selectedWeather !== 'all' && r.weather !== selectedWeather) return false;
      if (incidentsOnly && !r.incidentReported) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.id.toLowerCase().includes(q) ||
          r.junctionName.toLowerCase().includes(q) ||
          r.roadType.toLowerCase().includes(q) ||
          r.timestamp.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [records, selectedJunction, selectedCongestion, selectedWeather, incidentsOnly, searchQuery]);

  // Sort dataset
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: keyof TrafficRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getCongestionBadgeClass = (level: CongestionLevel) => {
    switch (level) {
      case 'Severe':
        return 'text-red-400 font-bold';
      case 'High':
        return 'text-orange-400 font-semibold';
      case 'Moderate':
        return 'text-amber-400';
      case 'Low':
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                6,144 Telemetry Rows
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Urban Traffic Telemetry Data Repository
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Clean, calibrated multi-junction traffic telemetry dataset ready for exploratory analysis, regression, and classification modeling in VS Code.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportTrafficDatasetAsCSV(records)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV ({records.length.toLocaleString()} Rows)</span>
            </button>
          </div>
        </div>

        {/* Dataset Schema Quick Reference */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div>
            <span className="text-slate-500 block">Row Count:</span>
            <span className="text-slate-200 font-mono font-bold">{records.length.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Corridors:</span>
            <span className="text-slate-200 font-mono font-bold">8 Junctions</span>
          </div>
          <div>
            <span className="text-slate-500 block">Time Span:</span>
            <span className="text-slate-200 font-mono font-bold">32 Continuous Days</span>
          </div>
          <div>
            <span className="text-slate-500 block">Feature Columns:</span>
            <span className="text-slate-200 font-mono font-bold">23 Columns</span>
          </div>
          <div>
            <span className="text-slate-500 block">Target 1:</span>
            <span className="text-cyan-400 font-mono font-bold">congestion_level</span>
          </div>
          <div>
            <span className="text-slate-500 block">Target 2:</span>
            <span className="text-amber-400 font-mono font-bold">average_speed_kmh</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID (TRF-00124), junction name, or road type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedJunction}
              onChange={(e) => {
                setSelectedJunction(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-cyan-500 outline-none cursor-pointer"
            >
              <option value="all">All Junctions</option>
              {JUNCTIONS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.code}
                </option>
              ))}
            </select>

            <select
              value={selectedCongestion}
              onChange={(e) => {
                setSelectedCongestion(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-cyan-500 outline-none cursor-pointer"
            >
              <option value="all">All Congestion</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Severe">Severe</option>
            </select>

            <select
              value={selectedWeather}
              onChange={(e) => {
                setSelectedWeather(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-cyan-500 outline-none cursor-pointer"
            >
              <option value="all">All Weather</option>
              <option value="Clear">Clear</option>
              <option value="Rain">Rain</option>
              <option value="Heavy Rain">Heavy Rain</option>
              <option value="Fog">Fog</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={incidentsOnly}
                onChange={(e) => {
                  setIncidentsOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-3.5 h-3.5 accent-red-500 cursor-pointer"
              />
              <span>Incidents Only</span>
            </label>
          </div>
        </div>

        {/* Status Count and Page Size */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div>
            Showing <span className="text-white font-mono font-semibold">{paginatedRecords.length}</span> of{' '}
            <span className="text-white font-mono font-semibold">{filteredRecords.length.toLocaleString()}</span> matched records
            {filteredRecords.length < records.length && (
              <span className="ml-1 text-slate-500">(filtered from {records.length.toLocaleString()})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            {[15, 25, 50, 100].map((sz) => (
              <button
                key={sz}
                onClick={() => {
                  setPageSize(sz);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                  pageSize === sz ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Telemetry Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1 font-normal">
                    <span>Record ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1 font-normal">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-normal">Corridor Node</th>
                <th
                  onClick={() => handleSort('vehicleVolume')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1 font-normal">
                    <span>Volume (vph)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('averageSpeed')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1 font-normal">
                    <span>Speed (km/h)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('occupancyPct')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1 font-normal">
                    <span>Occupancy</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-normal">Weather</th>
                <th
                  onClick={() => handleSort('travelTimeIndex')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1 font-normal">
                    <span>TTI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-normal">Congestion</th>
                <th
                  onClick={() => handleSort('hotspotScore')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1 font-normal">
                    <span>Hotspot</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
              {paginatedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-cyan-400">
                    {r.id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {r.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold text-white">{r.junctionName}</span>
                    <span className="text-[11px] text-slate-500 ml-1">({r.junctionId})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200">
                    {r.vehicleVolume.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-white">
                    {r.averageSpeed}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {r.occupancyPct}%
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">
                    {r.weather}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                    {r.travelTimeIndex}x
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px]">
                    <span className={getCongestionBadgeClass(r.congestionLevel)}>
                      {r.congestionLevel}
                    </span>
                    {r.incidentReported && (
                      <span className="ml-1 text-[10px] text-red-400 font-bold">· Incident</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-bold text-slate-200">
                    {r.hotspotScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Page <span className="text-white font-mono font-bold">{currentPage}</span> of{' '}
            <span className="text-white font-mono font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
