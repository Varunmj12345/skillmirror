import React from 'react';

interface AIStrategyProps {
  strategy: string;
}

const AIStrategy: React.FC<AIStrategyProps> = ({ strategy }) => {
  return (
    <div className="glass-panel p-6 border-white/5 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 overflow-hidden relative group sm-card">
      {/* Decorative Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
      
      {/* Circuit-like decorative element */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[60px] -mr-20 -mt-20 pointer-events-none" />

      <div className="flex items-center gap-5 relative z-10">
        <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600/10 flex items-center justify-center text-indigo-400 text-2xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
          <i className="fa-solid fa-wand-magic-sparkles animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white leading-tight tracking-tight">AI Strategic Intelligence</h2>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-1">Autonomous Strategy Engine v4.0</p>
        </div>
      </div>

      <div className="mt-8 p-5 rounded-3xl bg-[#0F172A]/80 border border-white/5 backdrop-blur-3xl relative z-10 transition-colors group-hover:border-indigo-500/20">
        <div className="flex gap-5">
          <div className="w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full my-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <p className="text-sm text-slate-200 font-medium leading-[1.6] italic">
            "{strategy}"
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Engine Optimized</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Readiness Boost</span>
          <span className="text-xs font-black text-emerald-400 py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">+15-18%</span>
        </div>
      </div>
    </div>
  );
};

export default AIStrategy;

