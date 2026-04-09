import React from 'react';

interface GrowthForecastProps {
    data: { day: string; score: number }[];
}

const GrowthForecast: React.FC<GrowthForecastProps> = ({ data }) => {
    return (
        <div className="glass-panel p-6 border-emerald-500/10 hover:border-emerald-500/30 transition-all">
            <h2 className="text-sm font-bold text-slate-50 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-emerald-400"></i>
                30-Day Growth Forecast
            </h2>
            <div className="flex items-end justify-between h-32 gap-2 px-2">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative flex items-end justify-center h-full">
                            <div
                                className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 border-t-2 border-emerald-500/50 transition-all rounded-t-sm"
                                style={{ height: `${item.score}%` }}
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 text-white text-[9px] font-black rounded shadow-lg transition-opacity whitespace-nowrap">
                                    {item.score}%
                                </div>
                            </div>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{item.day}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] text-emerald-300 font-medium italic leading-relaxed text-center">
                    "Maintaining current consistency will elevate your readiness by 12% in 3 weeks."
                </p>
            </div>
        </div>
    );
};

export default GrowthForecast;
