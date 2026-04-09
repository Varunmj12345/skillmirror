import React from 'react';

interface AIStrategyProps {
    strategy: string;
}

const AIStrategy: React.FC<AIStrategyProps> = ({ strategy }) => {
    return (
        <div className="glass-panel p-6 border-indigo-500/20 bg-gradient-to-r from-slate-900 to-indigo-900/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16" />
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                    <i className="fa-solid fa-wand-magic-sparkles animate-pulse" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white leading-tight">Weekly AI Strategic Insight</h2>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">Autonomous Decision Support Engine</p>
                </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-xl relative z-10">
                <div className="flex gap-4">
                    <div className="w-1 bg-indigo-500 rounded-full my-1 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                        "{strategy}"
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 relative z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Predicted Readiness Impact</span>
                <span className="text-xs font-black text-emerald-400">+15-18%</span>
            </div>
        </div>
    );
};

export default AIStrategy;
