import React from 'react';

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
                <div key={i} className="bg-gray-200 h-32 rounded-2xl"></div>
            ))}
        </div>
    );

    const cards = [
        {
            title: 'Total Open Jobs',
            value: data.total_open_jobs.toLocaleString(),
            trend: '+12%',
            trendColor: 'text-emerald-400',
            bgGradient: 'from-blue-600 to-indigo-700',
            icon: 'fa-briefcase',
            textColor: 'text-white'
        },
        {
            title: 'Avg Salary Range',
            value: `₹${(data.avg_salary_min / 100000).toFixed(1)}L - ₹${(data.avg_salary_max / 100000).toFixed(1)}L`,
            trend: '+5%',
            trendColor: 'text-emerald-400',
            bgGradient: 'from-emerald-500 to-teal-600',
            icon: 'fa-indian-rupee-sign',
            textColor: 'text-white'
        },
        {
            title: 'Remote Jobs',
            value: `${data.remote_ratio}%`,
            trend: '+2.4%',
            trendColor: 'text-blue-200',
            bgGradient: 'from-violet-500 to-purple-600',
            icon: 'fa-house-laptop',
            textColor: 'text-white'
        },
        {
            title: 'Top Hiring',
            value: data.top_companies[0] || 'N/A',
            trend: 'Active',
            trendColor: 'text-amber-300',
            bgGradient: 'from-amber-500 to-orange-600',
            icon: 'fa-building',
            textColor: 'text-white'
        },
        {
            title: 'Market Growth',
            value: `${data.growth_rate || 0}%`,
            trend: 'YoY',
            trendColor: 'text-pink-200',
            bgGradient: 'from-pink-500 to-rose-600',
            icon: 'fa-chart-line',
            textColor: 'text-white'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {cards.map((card, index) => (
                <div key={index} className={`relative rounded-2xl p-5 shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${card.bgGradient}`}>
                    {/* Background Decorative Circle */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{card.title}</p>
                            <h3 className={`text-2xl font-extrabold mt-1 tracking-tight ${card.textColor} drop-shadow-sm`}>
                                {card.value}
                            </h3>
                        </div>
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                            <i className={`fa-solid ${card.icon} text-lg text-white`}></i>
                        </div>
                    </div>

                    <div className="relative z-10 mt-4 flex items-center text-xs font-medium">
                        <span className={`flex items-center ${card.trendColor} bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md`}>
                            <i className="fa-solid fa-arrow-trend-up mr-1.5 text-[10px]"></i>
                            {card.trend}
                        </span>
                        <span className="text-white/60 ml-2">vs last month</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MarketOverview;
