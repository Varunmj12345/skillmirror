import React from 'react';

interface BenchmarkingProps {
    userScore: number;
    marketAvg: number;
    percentile: number;
}

const Benchmarking: React.FC<BenchmarkingProps> = ({ userScore, marketAvg, percentile }) => {
    return (
        <div className="glass-panel p-6 border-slate-800">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <i className="fa-solid fa-users-viewfinder text-indigo-400"></i>
                Competitive Benchmarking
            </h2>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-2xl font-black text-white">{percentile}th</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Global Percentile</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400">Top {100 - percentile}%</p>
                        <p className="text-[9px] font-medium text-slate-500">In your target role</p>
                    </div>
                </div>

                <div className="relative h-12 flex items-center pt-2">
                    <div className="absolute inset-0 bg-slate-900/50 rounded-lg border border-slate-800" />

                    {/* Market Average Line */}
                    <div
                        className="absolute h-10 border-l-2 border-dashed border-slate-600 top-1 z-10"
                        style={{ left: `${marketAvg}%` }}
                    >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-500 bg-slate-950 px-1 border border-slate-800 rounded">MARKET AVG ({marketAvg})</span>
                    </div>

                    {/* User Progress Bar */}
                    <div
                        className="h-4 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-lg relative z-20 ml-1 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-1000"
                        style={{ width: `calc(${userScore}% - 8px)` }}
                    >
                        <div className="absolute -top-6 right-0 text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1 border border-indigo-500/30 rounded shadow-glow-indigo">YOU ({userScore})</div>
                    </div>
                </div>

                <ul className="space-y-3 pt-2">
                    {[
                        { label: 'Technical Accuracy', value: userScore + 5, market: marketAvg - 2 },
                        { label: 'Market Visibility', value: Math.max(0, userScore - 15), market: marketAvg + 10 }
                    ].map((item, i) => (
                        <li key={i} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[9px] font-black tracking-wider uppercase">
                                <span className="text-slate-400">{item.label}</span>
                                <span className={item.value > item.market ? 'text-emerald-400' : 'text-amber-400'}>
                                    {item.value > item.market ? '+' : ''}{item.value - item.market}% vs Market
                                </span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-700" style={{ width: `${item.market}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Benchmarking;
