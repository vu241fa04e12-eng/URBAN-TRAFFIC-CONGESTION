import React from 'react';
import { Search, Network, Lightbulb, ArrowRight } from 'lucide-react';

interface FrameworkBannerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FrameworkBanner: React.FC<FrameworkBannerProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const levels = [
    {
      id: 'level1',
      number: 'Level 1',
      title: 'Analytics',
      description: 'Analyze the data and discover meaningful patterns.',
      icon: Search,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      activeBorder: 'border-emerald-500 bg-emerald-950/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      arrowColor: 'text-emerald-500/50',
    },
    {
      id: 'level2',
      number: 'Level 2',
      title: 'Prediction',
      description: 'Build a model to predict a future event/value.',
      icon: Network,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      activeBorder: 'border-blue-500 bg-blue-950/30',
      iconBg: 'bg-blue-500/20 text-blue-400',
      arrowColor: 'text-blue-500/50',
    },
    {
      id: 'level3',
      number: 'Level 3',
      title: 'Recommendation for decision',
      description: 'Convert the prediction into an actionable recommendation.',
      icon: Lightbulb,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      activeBorder: 'border-purple-500 bg-purple-950/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
      arrowColor: 'text-purple-500/50',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Analytics Framework Levels
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Three-tier data intelligence pipeline for urban traffic engineering
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>6,144 Telemetry Records</span>
          <span>·</span>
          <span>8 Metropolitan Junctions</span>
          <span>·</span>
          <span className="text-cyan-400 font-medium">Real-Time Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((lvl, index) => {
          const Icon = lvl.icon;
          const isActive = activeTab === lvl.id;

          return (
            <button
              key={lvl.id}
              onClick={() => setActiveTab(lvl.id)}
              className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isActive
                  ? `${lvl.activeBorder} shadow-sm ring-1 ring-white/10`
                  : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${lvl.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {lvl.number} <span className="text-slate-400 font-normal">({lvl.title})</span>
                    </span>
                  </div>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {lvl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className={isActive ? 'text-cyan-400 font-medium' : 'text-slate-400'}>
                  {isActive ? 'Active Framework View' : 'Click to inspect'}
                </span>
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                  Open →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
