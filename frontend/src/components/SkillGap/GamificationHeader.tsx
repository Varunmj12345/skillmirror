import React from 'react';

interface GamificationProps {
    xp: number;
    rank: string;
    streak: number;
}

const GamificationHeader: React.FC<GamificationProps> = ({ xp, rank, streak }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 group hover:border-zinc-700 transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs shrink-0">
                    <i className="fa-solid fa-bolt-lightning"></i>
                </div>
                <div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">XP Points</p>
                    <p className="text-base font-black font-mono text-white tracking-tight">{xp.toLocaleString()}</p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 group hover:border-zinc-700 transition-all">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs shrink-0">
                    <i className="fa-solid fa-crown"></i>
                </div>
                <div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Skill Rank</p>
                    <p className="text-base font-bold text-white tracking-tight">{rank}</p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 group hover:border-zinc-700 transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs shrink-0">
                    <i className="fa-solid fa-fire-flame-curved"></i>
                </div>
                <div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Streak Bonus</p>
                    <p className="text-base font-black font-mono text-white tracking-tight">{streak} Days</p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 group hover:border-zinc-700 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">
                    <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">AI Badge</p>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>
                        <p className="text-base font-bold text-white tracking-tight">Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationHeader;
