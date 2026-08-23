import React from 'react';

interface GrowthForecastProps {
  data: { day: string; score: number }[];
}

const GrowthForecast: React.FC<GrowthForecastProps> = ({ data }) => {
  const isInsufficient = !data || data.length === 0 || data.every(d => d.score === 0);

  if (isInsufficient) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-light-card dark:shadow-none relative overflow-hidden group min-h-[220px] flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-3">
          <i className="fa-solid fa-chart-line text-emerald-600 dark:text-emerald-400 text-lg"></i>
        </div>
        <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Growth Forecast</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          Complete 3 activities to see your growth prediction.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-light-card dark:shadow-none relative overflow-hidden group">
      {/* Subtle emerald glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-[10px] text-emerald-600 dark:text-emerald-400"></i>
          </div>
          30-Day Growth Forecast
        </h2>
        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">+12.4% Δ</span>
      </div>

      <div className="flex items-end justify-between h-36 gap-2.5 px-1 relative z-10">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2.5 group/bar">
            <div className="w-full relative flex items-end justify-center h-full">
              {/* Bar */}
              <div
                className="w-full bg-slate-100 dark:bg-slate-800/80 group-hover/bar:bg-emerald-500/20 border-t border-slate-200/60 dark:border-white/5 transition-all duration-500 rounded-t-md relative overflow-hidden"
                style={{ height: `${item.score}%`, transitionDelay: `${i * 30}ms` }}
              >
                {/* Active highlight within bar */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/15 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                
                {/* Score tooltip */}
                <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-mono font-bold rounded shadow-lg transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap">
                  {item.score}%
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight group-hover/bar:text-slate-900 dark:group-hover/bar:text-slate-200 transition-colors">
              {item.day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 relative z-10">
        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-bold italic leading-relaxed text-center">
          "Maintaining current consistency will elevate your readiness by <span className="text-emerald-700 dark:text-emerald-400">12%</span> in 3 weeks."
        </p>
      </div>
    </div>
  );
};

export default GrowthForecast;
