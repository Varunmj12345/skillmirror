import React from 'react';

interface GamificationProps {
    xp: number;
    rank: string;
    streak: number;
}

const GamificationHeader: React.FC<GamificationProps> = ({ xp, rank, streak }) => {
    return (
        <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-card border border-border shadow-light-card dark:shadow-none flex items-center gap-3.5 group hover:border-emerald-400/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-bolt-lightning text-sm"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">XP Points</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{xp.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-card border border-border shadow-light-card dark:shadow-none flex items-center gap-3.5 group hover:border-indigo-400/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-crown text-sm"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Skill Rank</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{rank}</p>
                </div>
            </div>

            <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-card border border-border shadow-light-card dark:shadow-none flex items-center gap-3.5 group hover:border-amber-400/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-fire-flame-curved text-sm"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Streak Bonus</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{streak} Days</p>
                </div>
            </div>

            <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-card border border-border shadow-light-card dark:shadow-none flex items-center gap-3.5 group hover:border-blue-400/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">AI Badge</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">Verified</p>
                </div>
            </div>
        </div>
    );
};

export default GamificationHeader;
