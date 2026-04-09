import React from 'react';

interface MetricCardProps {
    label: string;
    value: string | number;
    suffix?: string;
    icon: string;
    color: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '%', icon, color, trend }) => {
    return (
        <div className="glass-panel p-6 border-slate-800/60 hover:border-indigo-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-400 group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${icon} text-xs`} />
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{value}</span>
                <span className="text-sm font-bold text-slate-500">{suffix}</span>
            </div>
            {trend && (
                <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <i className={`fa-solid fa-arrow-${trend.isUp ? 'up' : 'down'}`} />
                    <span>{trend.value}% vs last week</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
