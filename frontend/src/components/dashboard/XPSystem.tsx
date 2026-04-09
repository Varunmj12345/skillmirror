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
        <div className="glass-panel p-6 bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/20">
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-600/30">
                        {level}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-900 font-bold">
                        <i className="fa-solid fa-crown" />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Level {level} Professional</p>
                    <h3 className="text-lg font-bold text-white leading-tight">{username}</h3>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Experience Points</span>
                    <span className="text-indigo-400">{totalXp} / {nextLevelAt} XP</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-[9px] text-slate-500 font-bold italic text-right">
                    {nextLevelAt - totalXp} XP to reach Level {level + 1}
                </p>
            </div>
        </div>
    );
};

export default XPSystem;
