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

    const demandColor = data.market_demand === 'High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
        data.market_demand === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-zinc-400 bg-zinc-800 border-zinc-700';

    return (
        <div className="p-6 lg:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 text-lg shrink-0">
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                <h4 className="text-base font-bold text-white tracking-tight">Career Intelligence Pro</h4>
                            </div>
                            <div className="flex items-center gap-2 mt-1 font-mono">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${demandColor}`}>
                                    {data.market_demand} Demand
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                    Trend: <span className="text-emerald-400 font-bold">+{data.hiring_trend}%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">AI Confidence</span>
                                <div className="group/tooltip relative">
                                    <i className="fa-solid fa-circle-info text-[10px] text-zinc-600 cursor-help"></i>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 text-[9px] font-mono text-zinc-300 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-zinc-800">
                                        Calculated based on your skill match, profile completeness, and market volatility indices.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black font-mono text-white tracking-tight">{data.confidence_score}%</span>
                                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                                    <div className="h-full bg-amber-400" style={{ width: `${data.confidence_score}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">Automation Risk</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black font-mono tracking-tight ${data.automation_risk < 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {data.automation_risk}%
                                </span>
                                <span className="text-[9px] font-mono text-zinc-500 leading-tight uppercase">
                                    Stability: <br /> <span className="text-zinc-200 font-bold">{data.job_stability}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-zinc-800 hidden md:block"></div>

                <div className="flex-1 space-y-4">
                    <h5 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Salary Impact Estimator</h5>
                    <div className="space-y-2.5">
                        {Object.entries(data.salary_impact).map(([skill, impact]) => (
                            <div key={skill} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                    <span className="text-xs font-bold text-zinc-200">Close {skill} gap</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-400">+{impact}% Range</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 italic">
                        * Estimates based on real-time hiring data for your target role.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCareerIntelligence;
