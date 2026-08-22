import React from 'react';
import { formatINR } from '../utils/formatters';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] h-32 rounded-2xl"></div>
            ))}
        </div>
    );

    const cards = [
        {
            title: 'Total Open Jobs',
            value: data.total_open_jobs.toLocaleString(),
            trend: '+12%',
            trendColor: 'text-emerald-400',
            accent: 'cyan',
            icon: 'fa-briefcase',
            borderGlow: 'via-cyan-500/40',
            badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        },
        {
            title: 'Avg Salary Range',
            value: `${formatINR(data.avg_salary_min)} - ${formatINR(data.avg_salary_max)}`,
            trend: '+5%',
            trendColor: 'text-emerald-400',
            accent: 'emerald',
            icon: 'fa-indian-rupee-sign',
            borderGlow: 'via-emerald-500/40',
            badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        },
        {
            title: 'Remote Ratio',
            value: `${data.remote_ratio}%`,
            trend: '+2.4%',
            trendColor: 'text-cyan-400',
            accent: 'indigo',
            icon: 'fa-house-laptop',
            borderGlow: 'via-indigo-500/40',
            badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
        },
        {
            title: 'Top Hiring Node',
            value: data.top_companies[0] || 'N/A',
            trend: 'Active',
            trendColor: 'text-amber-400',
            accent: 'amber',
            icon: 'fa-building',
            borderGlow: 'via-amber-500/40',
            badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        },
        {
            title: 'Market Velocity',
            value: `${data.growth_rate || 0}%`,
            trend: 'YoY',
            trendColor: 'text-emerald-400',
            accent: 'rose',
            icon: 'fa-chart-line',
            borderGlow: 'via-rose-500/40',
            badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((card, index) => (
                <div 
                    key={index} 
                    className="relative rounded-2xl p-5 bg-pop border border-white/[0.07] overflow-hidden group hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1 shadow-lg"
                >
                    {/* Top gradient highlight line */}
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${card.borderGlow} to-transparent`} />
                    <TVNoise opacity={0.02} />

                    <div className="relative z-10 flex justify-between items-start mb-3">
                        <div>
                            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500">
                                {card.title}
                            </p>
                            <h3 className="text-xl font-display font-black text-white mt-1 tracking-tight truncate">
                                {card.value}
                            </h3>
                        </div>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.badgeBg}`}>
                            <i className={`fa-solid ${card.icon} text-sm`}></i>
                        </div>
                    </div>

                    <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
                        <span className={`flex items-center gap-1 font-bold ${card.trendColor}`}>
                            <i className="fa-solid fa-arrow-trend-up text-[10px]"></i>
                            {card.trend}
                        </span>
                        <span className="text-[10px] text-slate-600 uppercase tracking-wider">vs prev cycle</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MarketOverview;
