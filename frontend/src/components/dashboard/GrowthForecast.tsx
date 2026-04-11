import React from 'react';

interface GrowthForecastProps {
  data: { day: string; score: number }[];
}

const GrowthForecast: React.FC<GrowthForecastProps> = ({ data }) => {
  return (
    <div className="glass-panel p-6 border-white/5 bg-slate-900/40 sm-card relative overflow-hidden group">
      {/* Subtle emerald glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-[10px] text-emerald-400"></i>
          </div>
          30-Day Growth Forecast
        </h2>
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+12.4% Δ</span>
      </div>

      <div className="flex items-end justify-between h-36 gap-2.5 px-1 relative z-10">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
            <div className="w-full relative flex items-end justify-center h-full">
              {/* Bar */}
              <div
                className="w-full bg-slate-800/80 group-hover/bar:bg-emerald-500/20 border-t border-white/5 transition-all duration-500 rounded-t-md relative overflow-hidden"
                style={{ height: `${item.score}%`, transitionDelay: `${i * 30}ms` }}
              >
                {/* Active highlight within bar */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                
                {/* Score tooltip */}
                <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-slate-900 text-[9px] font-black rounded shadow-xl transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap">
                  {item.score}%
                </div>
              </div>
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover/bar:text-slate-300 transition-colors">
              {item.day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10">
        <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed text-center">
          "Maintaining current consistency will elevate your readiness by <span className="text-emerald-400">12%</span> in 3 weeks."
        </p>
      </div>
    </div>
  );
};

export default GrowthForecast;

