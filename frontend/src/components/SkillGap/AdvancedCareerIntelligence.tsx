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

    const demandColor = data.market_demand === 'High' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' :
        data.market_demand === 'Medium' ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10' : 'text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10';

    return (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 dark:from-indigo-600/20 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-500/30 shadow-light-card dark:shadow-none relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-indigo-500 dark:to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                            <i className="fa-solid fa-robot text-2xl"></i>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Career Intelligence Pro</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${demandColor}`}>
                                    {data.market_demand} Demand
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    Trend: <span className="text-emerald-600 dark:text-emerald-400 font-black">+{data.hiring_trend}%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">AI Confidence</span>
                                <div className="group/tooltip relative">
                                    <i className="fa-solid fa-circle-info text-[10px] text-slate-400 dark:text-slate-600 cursor-help"></i>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 dark:bg-slate-800 text-[9px] text-slate-100 dark:text-slate-300 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-700">
                                        Calculated based on your skill match, profile completeness, and current market volatility indices.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{data.confidence_score}%</span>
                                <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 overflow-hidden">
                                    <div className="h-full bg-blue-600 dark:bg-indigo-500" style={{ width: `${data.confidence_score}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black block mb-1">Automation Risk</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${data.automation_risk < 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {data.automation_risk}%
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold leading-tight uppercase tracking-tighter">
                                    Stability: <br /> <span className="text-slate-800 dark:text-slate-300">{data.job_stability}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

                <div className="flex-1 space-y-4">
                    <h5 className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Salary Impact Estimator</h5>
                    <div className="space-y-3">
                        {Object.entries(data.salary_impact).map(([skill, impact]) => (
                            <div key={skill} className="flex items-center justify-between p-3.5 bg-white dark:bg-indigo-500/5 border border-slate-200 dark:border-indigo-500/10 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-indigo-400"></div>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Close {skill} gap</span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">+{impact}% Range</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-600 italic">
                        * Estimates based on real-time hiring data for your target role and region.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCareerIntelligence;
