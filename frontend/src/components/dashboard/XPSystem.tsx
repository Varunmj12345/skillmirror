import React from 'react';

interface XPSystemProps {
  level: number;
  totalXp: number;
  progress: number;
  nextLevelAt: number;
  username: string;
}

const XPSystem: React.FC<XPSystemProps> = ({ level, totalXp, progress, nextLevelAt, username }) => {
  return (
    <div className="glass-panel p-6 bg-gradient-to-br from-indigo-900/10 via-slate-900 to-slate-900 border-white/5 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-[80px] pointer-events-none" />

      <div className="flex items-center gap-5 mb-8 relative z-10">
        <div className="relative group-hover:scale-105 transition-transform duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_ease-in-out_infinite]" />
            {level}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-500 border-4 border-[#0F172A] flex items-center justify-center text-[11px] text-slate-900 font-black shadow-lg">
            <i className="fa-solid fa-crown" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
            Level {level} Professional
          </p>
          <h3 className="text-xl font-black text-white tracking-tight">{username}</h3>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.25em]">
          <span className="text-slate-500">Intelligence Level Progress</span>
          <span className="text-indigo-300">{totalXp.toLocaleString()} / {nextLevelAt.toLocaleString()} XP</span>
        </div>
        
        <div className="relative h-2.5 bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
          {/* Subtle ghost glow for progress */}
          <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.4)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* White beam on leading edge */}
            <div className="absolute top-0 right-0 h-full w-10 bg-gradient-to-r from-transparent to-white/20" />
          </div>
        </div>
        
        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-500 italic">
          <span>Rank: Intermediate</span>
          <span>{(nextLevelAt - totalXp).toLocaleString()} XP to Next Level</span>
        </div>
      </div>
    </div>
  );
};

export default XPSystem;

