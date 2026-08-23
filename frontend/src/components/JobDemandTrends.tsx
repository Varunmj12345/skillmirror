import React from 'react';
import { 
    LineChart as RechartsLineChart, Line as RechartsLine, 
    XAxis as RechartsXAxis, YAxis as RechartsYAxis, 
    CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer as RechartsResponsiveContainer, 
    AreaChart as RechartsAreaChart, Area as RechartsArea 
} from 'recharts';
import { formatINR } from '../utils/formatters';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';
import { useTheme } from '../context/ThemeContext';

const LineChart = RechartsLineChart as any;
const Line = RechartsLine as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const CartesianGrid = RechartsCartesianGrid as any;
const Tooltip = RechartsTooltip as any;
const ResponsiveContainer = RechartsResponsiveContainer as any;
const AreaChart = RechartsAreaChart as any;
const Area = RechartsArea as any;

interface TrendData {
    job_role: string;
    date: string;
    demand_score: number;
    avg_salary: number;
}

interface JobDemandTrendsProps {
    trends: TrendData[];
}

const CyberTooltip = ({ active, payload, label, isSalary = false }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-[#0b0d13] border border-slate-200 dark:border-white/[0.1] p-3 rounded-xl shadow-light-float dark:shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-300">
                    {isSalary ? 'Avg Salary: ' : 'Demand Score: '}
                    <span className={isSalary ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-cyan-400'}>
                        {isSalary ? formatINR(payload[0].value) : payload[0].value}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

const JobDemandTrends: React.FC<JobDemandTrendsProps> = ({ trends }) => {
    const { effectiveTheme } = useTheme();
    const isDark = effectiveTheme === 'dark';

    if (!trends || trends.length === 0) return <div className="p-4 text-center font-mono text-xs text-slate-500">Synchronizing market trend telemetry...</div>;

    const processedTrends = React.useMemo(() => {
        if (!trends || trends.length === 0) return [];

        const monthlyMap: { [key: string]: { demand_scores: number[]; avg_salaries: number[]; sampleDate: Date } } = {};

        trends.forEach(item => {
            if (!item.date) return;
            const dateObj = new Date(item.date);
            if (isNaN(dateObj.getTime())) return;

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;

            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                    demand_scores: [],
                    avg_salaries: [],
                    sampleDate: new Date(year, dateObj.getMonth(), 1)
                };
            }
            if (typeof item.demand_score === 'number') monthlyMap[monthKey].demand_scores.push(item.demand_score);
            if (typeof item.avg_salary === 'number') monthlyMap[monthKey].avg_salaries.push(item.avg_salary);
        });

        const sortedMonthKeys = Object.keys(monthlyMap).sort();

        const aggregated = sortedMonthKeys.map(monthKey => {
            const data = monthlyMap[monthKey];
            const avgDemand = data.demand_scores.length > 0 
                ? data.demand_scores.reduce((a, b) => a + b, 0) / data.demand_scores.length 
                : 100;
            const avgSal = data.avg_salaries.length > 0 
                ? data.avg_salaries.reduce((a, b) => a + b, 0) / data.avg_salaries.length 
                : 800000;

            const monthLabel = data.sampleDate.toLocaleDateString('en-US', { month: 'short' });
            return {
                monthKey,
                monthLabel,
                demand_score: Math.round(avgDemand),
                avg_salary: Math.round(avgSal)
            };
        });

        const last6 = aggregated.slice(-6);

        const seenLabels = new Set();
        return last6.map(item => {
            let label = item.monthLabel;
            if (seenLabels.has(label)) {
                const yearShort = item.monthKey.split('-')[0].slice(-2);
                label = `${item.monthLabel} '${yearShort}`;
            }
            seenLabels.add(label);
            return {
                ...item,
                monthLabel: label
            };
        });
    }, [trends]);

    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const axisLineColor = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
    const tickColor = isDark ? '#64748b' : '#94a3b8';
    const demandColor = isDark ? '#00d9ff' : '#2563eb';
    const salaryColor = isDark ? '#10b981' : '#059669';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Job Demand Trend */}
            <div className="bg-card dark:bg-pop rounded-2xl p-6 border border-border shadow-light-card dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 dark:via-cyan-500/40 to-transparent" />
                <TVNoise opacity={0.02} />
                
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Bullet variant="cyan" size="sm" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">HIRING VELOCITY</span>
                        </div>
                        <h3 className="text-base font-display font-black text-slate-900 dark:text-white">Job Demand Trend</h3>
                    </div>
                    <Badge variant="outline-cyan">+15% Growth</Badge>
                </div>
                <div className="h-72 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedTrends}>
                            <defs>
                                <linearGradient id="cyberDemandGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={demandColor} stopOpacity={isDark ? 0.35 : 0.25} />
                                    <stop offset="95%" stopColor={demandColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis 
                                dataKey="monthLabel" 
                                tick={{ fontSize: 11, fill: tickColor, fontFamily: 'monospace' }} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 11, fill: tickColor, fontFamily: 'monospace' }} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <Tooltip content={<CyberTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="demand_score" 
                                stroke={demandColor} 
                                strokeWidth={2.5} 
                                fillOpacity={1} 
                                fill="url(#cyberDemandGrad)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Salary Trend */}
            <div className="bg-card dark:bg-pop rounded-2xl p-6 border border-border shadow-light-card dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                <TVNoise opacity={0.02} />
                
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Bullet variant="success" size="sm" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">COMPENSATION INDEX</span>
                        </div>
                        <h3 className="text-base font-display font-black text-slate-900 dark:text-white">Salary Curve</h3>
                    </div>
                    <Badge variant="outline-success">+8% YoY</Badge>
                </div>
                <div className="h-72 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedTrends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis 
                                dataKey="monthLabel" 
                                tick={{ fontSize: 11, fill: tickColor, fontFamily: 'monospace' }} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 11, fill: tickColor, fontFamily: 'monospace' }} 
                                domain={['auto', 'auto']} 
                                tickFormatter={(val: number) => formatINR(val)} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <Tooltip content={<CyberTooltip isSalary={true} />} />
                            <Line 
                                type="monotone" 
                                dataKey="avg_salary" 
                                stroke={salaryColor} 
                                strokeWidth={2.5} 
                                dot={{ r: 4, fill: salaryColor, stroke: isDark ? '#0b0d13' : '#ffffff', strokeWidth: 2 }} 
                                activeDot={{ r: 6, fill: salaryColor, stroke: isDark ? '#0b0d13' : '#ffffff', strokeWidth: 2 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default JobDemandTrends;
