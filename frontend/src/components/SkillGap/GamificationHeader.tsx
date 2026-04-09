import React from 'react';

interface GamificationProps {
    xp: number;
    rank: string;
    streak: number;
}

const GamificationHeader: React.FC<GamificationProps> = ({ xp, rank, streak }) => {
    return (
        <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 min-w-[120px] glass-panel px-4 py-3 border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3 group hover:border-emerald-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-bolt-lightning text-xs"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">XP Points</p>
                    <p className="text-sm font-black text-slate-100">{xp.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex-1 min-w-[120px] glass-panel px-4 py-3 border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3 group hover:border-indigo-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-crown text-xs"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Skill Rank</p>
                    <p className="text-sm font-black text-slate-100">{rank}</p>
                </div>
            </div>

            <div className="flex-1 min-w-[120px] glass-panel px-4 py-3 border-amber-500/20 bg-amber-500/5 flex items-center gap-3 group hover:border-amber-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-fire-flame-curved text-xs"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Streak Bonus</p>
                    <p className="text-sm font-black text-slate-100">{streak} Days</p>
                </div>
            </div>

            <div className="flex-1 min-w-[120px] glass-panel px-4 py-3 border-sky-500/20 bg-sky-500/5 flex items-center gap-3 group hover:border-sky-500/40 transition-all">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-shield-halved text-xs"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">AI Badge</p>
                    <p className="text-sm font-black text-slate-100">Verified</p>
                </div>
            </div>
        </div>
    );
};

export default GamificationHeader;
