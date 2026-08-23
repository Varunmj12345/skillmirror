import React from 'react';

interface AIStrategyProps {
  strategy: string;
}

const AIStrategy: React.FC<AIStrategyProps> = ({ strategy }) => {
  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shadow-light-card dark:shadow-none overflow-hidden relative group">
      {/* Decorative Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
      
      {/* Decorative glow element */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 dark:bg-indigo-500/5 blur-[60px] -mr-20 -mt-20 pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-indigo-600/10 flex items-center justify-center text-blue-600 dark:text-indigo-400 text-xl border border-blue-200 dark:border-indigo-500/20 shadow-sm group-hover:scale-105 transition-transform duration-500">
          <i className="fa-solid fa-wand-magic-sparkles animate-pulse" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white leading-tight tracking-tight">AI Strategic Intelligence</h2>
          <p className="text-[10px] text-blue-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-[0.2em] mt-0.5">Autonomous Strategy Engine v4.0</p>
        </div>
      </div>

      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A]/80 border border-slate-200/80 dark:border-white/5 shadow-light-sm dark:shadow-none relative z-10 transition-colors group-hover:border-blue-300 dark:group-hover:border-indigo-500/20">
        <div className="flex gap-4">
          <div className="w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full my-0.5 shadow-sm" />
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-[1.6] italic">
            "{strategy}"
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Engine Optimized</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Readiness Boost</span>
          <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 py-0.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">+15-18%</span>
        </div>
      </div>
    </div>
  );
};

export default AIStrategy;

