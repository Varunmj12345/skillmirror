import React from 'react';

interface AIStrategyProps {
  strategy: string;
}

const AIStrategy: React.FC<AIStrategyProps> = ({ strategy }) => {
  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/90 relative">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-amber-500">
            <i className="fa-solid fa-wand-magic-sparkles text-xs" />
          </div>
          <div>
            <h2 className="text-sm font-normal tracking-tight text-white">
              Autonomous Strategy Engine
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              STRATEGY VECTOR v4.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 border border-zinc-800 bg-zinc-950 text-[10px] font-mono text-emerald-400">
          <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
          <span>OPTIMIZED</span>
        </div>
      </div>

      <div className="p-4 border border-zinc-800 bg-zinc-950 border-l-2 border-l-amber-500 my-4">
        <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
          "{strategy}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-zinc-500">
        <span className="uppercase tracking-wider text-[10px]">READINESS BOOST</span>
        <span className="text-emerald-400 font-medium">+15-18% Target Uplift</span>
      </div>
    </div>
  );
};

export default AIStrategy;


