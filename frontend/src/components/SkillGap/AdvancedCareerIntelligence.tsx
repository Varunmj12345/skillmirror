import React from 'react';

interface CareerIntelligenceProps {
    data?: {
        confidence_score: number;
        market_demand: 'High' | 'Medium' | 'Low';
        hiring_trend: number;
        salary_impact: Record<string, number>;
        automation_risk: number;
        job_stability: string;
    };
}

const AdvancedCareerIntelligence: React.FC<CareerIntelligenceProps> = ({ data }) => {
    if (!data) return null;

    const demandColor = data.market_demand === 'High' ? 'text-emerald-400 bg-emerald-500/10' :
        data.market_demand === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10';

    return (
        <div className="glass-panel p-8 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-900 border-indigo-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa-solid fa-sparkles text-8xl text-indigo-400"></i>
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 shrink-0">
                            <i className="fa-solid fa-robot text-2xl"></i>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-50">Career Intelligence Pro</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${demandColor}`}>
                                    {data.market_demand} Demand
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold">
                                    Trend: <span className="text-emerald-400">+{data.hiring_trend}%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-slate-500 uppercase font-black">AI Confidence</span>
                                <div className="group/tooltip relative">
                                    <i className="fa-solid fa-circle-info text-[10px] text-slate-600 cursor-help"></i>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-[9px] text-slate-300 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-700">
                                        Calculated based on your skill match, profile completeness, and current market volatility indices.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-slate-100">{data.confidence_score}%</span>
                                <div className="h-2 flex-1 bg-slate-800 rounded-full mb-2 overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${data.confidence_score}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Automation Risk</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${data.automation_risk < 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {data.automation_risk}%
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold leading-tight uppercase tracking-tighter">
                                    Stability: <br /> <span className="text-slate-300">{data.job_stability}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-slate-800 hidden md:block"></div>

                <div className="flex-1 space-y-4">
                    <h5 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Salary Impact Estimator</h5>
                    <div className="space-y-3">
                        {Object.entries(data.salary_impact).map(([skill, impact]) => (
                            <div key={skill} className="flex items-center justify-between p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                    <span className="text-xs font-bold text-slate-300">Close {skill} gap</span>
                                </div>
                                <span className="text-xs font-black text-emerald-400">+{impact}% Range</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-slate-600 italic">
                        * Estimates based on real-time hiring data for your target role and region.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCareerIntelligence;
