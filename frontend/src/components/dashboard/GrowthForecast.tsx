import React from 'react';

interface GrowthForecastProps {
  data: { day: string; score: number }[];
}

const GrowthForecast: React.FC<GrowthForecastProps> = ({ data }) => {
  const isInsufficient = !data || data.length === 0 || data.every(d => d.score === 0);

  if (isInsufficient) {
    return (
      <div className="p-6 border border-zinc-800 bg-zinc-900/90 min-h-[200px] flex flex-col justify-center items-center text-center">
        <div className="w-10 h-10 border border-zinc-800 bg-zinc-950 flex items-center justify-center mb-3 text-amber-500">
          <i className="fa-solid fa-chart-line text-xs" />
        </div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-white mb-1">
          Growth Forecast
        </h3>
        <p className="text-xs font-mono text-zinc-500 max-w-xs leading-relaxed">
          Complete 3 engine activities to compile predictive telemetry.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/90 relative">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 bg-amber-500" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            30-Day Growth Forecast
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 border border-zinc-800 bg-zinc-950">
          +12.4% Δ
        </span>
      </div>

      <div className="flex items-end justify-between h-32 gap-2 px-1">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
            <div className="w-full relative flex items-end justify-center h-full">
              <div
                className="w-full bg-zinc-800 group-hover/bar:bg-amber-500 transition-colors duration-200 relative"
                style={{ height: `${Math.max(8, item.score)}%` }}
              >
                <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 text-white text-[9px] font-mono pointer-events-none whitespace-nowrap">
                  {item.score}%
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tight group-hover/bar:text-white transition-colors">
              {item.day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <p className="text-[11px] font-mono text-zinc-400 text-center">
          "Maintaining current pace will elevate readiness by <span className="text-emerald-400 font-medium">12%</span> in 3 weeks."
        </p>
      </div>
    </div>
  );
};

export default GrowthForecast;

