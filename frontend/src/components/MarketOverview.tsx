import React from 'react';
import { formatINR } from '../utils/formatters';

interface MarketOverviewProps {
    data: {
        total_open_jobs: number;
        avg_salary_min: number;
        avg_salary_max: number;
        remote_ratio: number;
        onsite_ratio: number;
        top_companies: string[];
        growth_rate?: number;
    } | null;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
    if (!data) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-zinc-900/90 border border-zinc-800 h-28 rounded-2xl"></div>
            ))}
        </div>
    );

    const cards = [
        {
            title: 'Active Openings',
            value: data.total_open_jobs.toLocaleString(),
            trend: '+12%',
            trendColor: 'text-emerald-400',
            icon: 'fa-briefcase',
        },
        {
            title: 'Compensation Band',
            value: `${formatINR(data.avg_salary_min)} - ${formatINR(data.avg_salary_max)}`,
            trend: '+5%',
            trendColor: 'text-emerald-400',
            icon: 'fa-indian-rupee-sign',
        },
        {
            title: 'Distributed Ratio',
            value: `${data.remote_ratio}%`,
            trend: '+2.4%',
            trendColor: 'text-amber-400',
            icon: 'fa-house-laptop',
        },
        {
            title: 'Top Enterprise Node',
            value: data.top_companies[0] || 'N/A',
            trend: 'Active',
            trendColor: 'text-zinc-400',
            icon: 'fa-building',
        },
        {
            title: 'Market Velocity',
            value: `${data.growth_rate || 0}%`,
            trend: 'YoY',
            trendColor: 'text-emerald-400',
            icon: 'fa-chart-line',
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 font-mono">
            {cards.map((card, index) => (
                <div 
                    key={index} 
                    className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {card.title}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <i className={`fa-solid ${card.icon} text-xs`}></i>
                        </div>
                    </div>

                    <div className="text-lg font-bold text-zinc-100 tracking-tight tabular-nums truncate my-1">
                        {card.value}
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px]">
                        <span className={`flex items-center gap-1 font-bold ${card.trendColor}`}>
                            <i className="fa-solid fa-arrow-trend-up text-[9px]"></i>
                            {card.trend}
                        </span>
                        <span className="text-zinc-600 uppercase">Cycle</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MarketOverview;
