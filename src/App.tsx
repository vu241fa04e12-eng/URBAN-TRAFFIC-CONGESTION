import React, { useState, useMemo } from 'react';
import { getTrafficDataset, exportTrafficDatasetAsCSV } from './data/trafficDataset';
import { TrafficRecord, PredictionFeatures } from './types/traffic';
import { TopNav } from './components/TopNav';
import { FrameworkBanner } from './components/FrameworkBanner';
import { CityHotspotMap } from './components/CityHotspotMap';
import { Level1Analytics } from './components/Level1Analytics';
import { Level2Prediction } from './components/Level2Prediction';
import { Level3Recommendations } from './components/Level3Recommendations';
import { DatasetExplorer } from './components/DatasetExplorer';
import { DateAccuracyDashboard } from './components/DateAccuracyDashboard';
import heroImage from './assets/images/urban_traffic_overview_1790328489905.jpg';
import {
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedJunctionForPrediction, setSelectedJunctionForPrediction] = useState<string>('J-01');
  const [customFeatures, setCustomFeatures] = useState<PredictionFeatures | undefined>(undefined);

  // Initialize dataset singleton (6,144 rows)
  const records = useMemo(() => getTrafficDataset(), []);

  const handleExportCSV = () => {
    exportTrafficDatasetAsCSV(records);
  };

  const handleSelectJunctionForPrediction = (junctionId: string) => {
    setSelectedJunctionForPrediction(junctionId);
    setActiveTab('level2');
  };

  const handleSendToDecisions = (features: PredictionFeatures) => {
    setCustomFeatures(features);
    setActiveTab('level3');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract (3 Zones) */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportCSV={handleExportCSV}
        recordCount={records.length}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Spotlight (on Overview tab) */}
        {activeTab === 'overview' && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
            {/* Background Image with Measured Scrim */}
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt="Urban traffic network overview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>

            {/* Hero Copy */}
            <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-cyan-400 font-semibold font-mono">PROJECT BLUEPRINT</span>
                <span>·</span>
                <span>6,144 Telemetry Records</span>
                <span>·</span>
                <span>Greenshields Transport Theory</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance">
                Smart Traffic: Urban Traffic Congestion Prediction & Hotspot Analysis
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                An end-to-end intelligent transportation system implementing the three-tier framework:
                <span className="text-emerald-400 font-medium"> Level 1 (Analytics)</span> to discover spatial bottlenecks,
                <span className="text-blue-400 font-medium"> Level 2 (Prediction)</span> to forecast congestion severity, and
                <span className="text-purple-400 font-medium"> Level 3 (Decision Recommendations)</span> to dispatch adaptive signal adjustments and route diversions.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('date-accuracy')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-950/40 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Check Accuracy By Date</span>
                </button>

                <button
                  onClick={() => setActiveTab('level2')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Launch Prediction Simulator</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download 6,144 Row Dataset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Framework Levels Banner (From User Prompt Image) */}
        <FrameworkBanner activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Section Content */}
        {activeTab === 'overview' && (
          <CityHotspotMap
            records={records}
            onSelectJunctionForPrediction={handleSelectJunctionForPrediction}
            onGoToDecisions={() => setActiveTab('level3')}
          />
        )}

        {activeTab === 'date-accuracy' && (
          <DateAccuracyDashboard records={records} />
        )}

        {activeTab === 'level1' && (
          <Level1Analytics
            records={records}
            onNavigateToPrediction={() => setActiveTab('level2')}
          />
        )}

        {activeTab === 'level2' && (
          <Level2Prediction
            initialJunctionId={selectedJunctionForPrediction}
            onSendToDecisions={handleSendToDecisions}
          />
        )}

        {activeTab === 'level3' && (
          <Level3Recommendations
            initialFeatures={customFeatures}
            onModifyPrediction={() => setActiveTab('level2')}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer records={records} />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SmartTraffic UrbanAI</span>
            <span>·</span>
            <span>Urban Congestion Prediction & Hotspot Analysis</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>6,144 Continuous Records</span>
            <span>·</span>
            <span>Greenshields Traffic Model</span>
            <span>·</span>
            <span>Adaptive Corridor Management</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
