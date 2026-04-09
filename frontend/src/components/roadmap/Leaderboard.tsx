import React from 'react';

const Leaderboard: React.FC = () => {
    const leaders = [
        { name: 'You', points: 1250, rank: 4, isUser: true },
        { name: 'Sarah K.', points: 2840, rank: 1, isUser: false },
        { name: 'James L.', points: 2100, rank: 2, isUser: false },
        { name: 'Anita R.', points: 1950, rank: 3, isUser: false },
        { name: 'Mike D.', points: 1100, rank: 5, isUser: false },
    ];

    return (
        <div className="glass-panel p-6 bg-slate-900/40 border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-ranking-star text-amber-400"></i>
                    Global Leaderboard
                </h2>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wide px-2 py-1 bg-indigo-500/10 rounded-lg">Top 10%</span>
            </div>

            <div className="space-y-4">
                {leaders.map((leader, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${leader.isUser ? 'bg-indigo-600/10 border-indigo-500/40 shadow-xl shadow-indigo-500/5' : 'bg-slate-950/40 border-slate-800/40'}`}>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black w-5 ${leader.rank === 1 ? 'text-amber-400' : 'text-slate-500'}`}>{leader.rank}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${leader.isUser ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                {leader.name.charAt(0)}
                            </div>
                            <span className={`text-xs font-bold ${leader.isUser ? 'text-white' : 'text-slate-300'}`}>{leader.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{leader.points} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
