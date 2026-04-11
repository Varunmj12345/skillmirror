import React from 'react';

interface BenchmarkingProps {
  userScore: number;
  marketAvg: number;
  percentile: number;
}

const Benchmarking: React.FC<BenchmarkingProps> = ({ userScore, marketAvg, percentile }) => {
  return (
    <div className="glass-panel p-6 border-white/5 bg-slate-900/40 sm-card relative overflow-hidden group">
      {/* Decorative spotlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
      
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-8 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <i className="fa-solid fa-users-viewfinder text-[10px] text-indigo-400"></i>
        </div>
        Competitive Benchmarking
      </h2>

      <div className="space-y-8 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-black text-white tracking-tight leading-none mb-2">{percentile}th</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Global IQ Percentile</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-1.5">
              <span className="text-[10px] font-black text-emerald-400">Top {100 - percentile}%</span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Role Alignment</p>
          </div>
        </div>

        <div className="relative h-16 flex items-center group/track py-4">
          {/* Base Track */}
          <div className="absolute inset-x-0 h-3 bg-slate-950/50 rounded-full border border-white/5" />

          {/* Market Average Line */}
          <div
            className="absolute h-14 border-l border-dashed border-slate-600 top-1 z-10 transition-all duration-700"
            style={{ left: `${marketAvg}%` }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap bg-[#0F172A] px-1.5 py-0.5 border border-white/5 rounded">Market AVG</span>
              <div className="w-px h-1 bg-slate-600 mt-1" />
            </div>
          </div>

          {/* User Progress Bar */}
          <div
            className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full relative z-20 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-1000 ease-out"
            style={{ width: `${userScore}%` }}
          >
            <div className="absolute -top-7 right-0 flex flex-col items-center translate-x-1/2">
              <span className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap bg-indigo-600 px-2 py-0.5 rounded-lg shadow-xl shadow-indigo-600/20">IQ: {userScore}</span>
              <div className="w-px h-1 bg-indigo-600 mt-1" />
            </div>
            {/* Shimmer on user bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
        </div>

        <ul className="space-y-4 pt-2">
          {[
            { label: 'Technical Proficiency', value: userScore + 5, market: marketAvg - 2 },
            { label: 'Strategic Visibility', value: Math.max(0, userScore - 15), market: marketAvg + 10 }
          ].map((item, i) => (
            <li key={i} className="flex flex-col gap-2 group/stat">
              <div className="flex justify-between items-center text-[9px] font-black tracking-[0.15em] uppercase">
                <span className="text-slate-500 group-hover/stat:text-slate-300 transition-colors uppercase">{item.label}</span>
                <span className={`py-0.5 px-2 rounded-md border ${item.value > item.market ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 'text-amber-400 bg-amber-500/5 border-amber-500/10'}`}>
                  {item.value > item.market ? '+' : ''}{item.value - item.market}% Δ
                </span>
              </div>
              <div className="h-1 bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-slate-700/50 transition-all duration-1000" style={{ width: `${item.market}%` }}></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Benchmarking;

