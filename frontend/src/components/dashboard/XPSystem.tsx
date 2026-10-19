import React from 'react';

interface XPSystemProps {
  level: number;
  totalXp: number;
  progress: number;
  nextLevelAt: number;
  username: string;
  rankTitle?: string;
}

const XPSystem: React.FC<XPSystemProps> = ({ level, totalXp, progress, nextLevelAt, username, rankTitle }) => {
  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/90 relative">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-amber-500 font-mono text-base font-medium">
            L{level}
          </div>
          <div>
            <h3 className="text-sm font-normal tracking-tight text-white">{username}</h3>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              {rankTitle || 'Skill Explorer'} • Level {level}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">TOTAL ACCRUED</span>
          <span className="text-xs font-mono font-medium text-amber-500">{totalXp.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Tier Completion</span>
          <span className="text-white tabular-nums">
            {totalXp.toLocaleString()} / {nextLevelAt.toLocaleString()} XP
          </span>
        </div>

        <div className="h-2 w-full bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1">
          <span>PROGRESS: {Math.round(progress)}%</span>
          <span>{Math.max(0, nextLevelAt - totalXp).toLocaleString()} XP TO NEXT LEVEL</span>
        </div>
      </div>
    </div>
  );
};

export default XPSystem;


