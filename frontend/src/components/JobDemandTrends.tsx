import React from 'react';
import { 
    LineChart as RechartsLineChart, Line as RechartsLine, 
    XAxis as RechartsXAxis, YAxis as RechartsYAxis, 
    CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer as RechartsResponsiveContainer, 
    AreaChart as RechartsAreaChart, Area as RechartsArea 
} from 'recharts';
import { formatINR } from '../utils/formatters';

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
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl font-mono text-xs shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
                <p className="font-bold text-zinc-200">
                    {isSalary ? 'Avg Comp: ' : 'Demand Index: '}
                    <span className={isSalary ? 'text-emerald-400' : 'text-amber-400'}>
                        {isSalary ? formatINR(payload[0].value) : payload[0].value}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

/** Compute % change from first to last point. Returns e.g. "+15.2%" or "-3.1%" */
function growthLabel(values: number[]): string {
    if (values.length < 2 || values[0] === 0) return 'N/A';
    const pct = ((values[values.length - 1] - values[0]) / values[0]) * 100;
    return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
}

const JobDemandTrends: React.FC<JobDemandTrendsProps> = ({ trends }) => {
    if (!trends || trends.length === 0) return <div className="p-4 text-center font-mono text-xs text-zinc-500">Synchronizing market trend telemetry...</div>;

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

        const sortedKeys = Object.keys(monthlyMap).sort();

        return sortedKeys.map(key => {
            const entry = monthlyMap[key];
            const avgDemand = entry.demand_scores.length
                ? Math.round(entry.demand_scores.reduce((a, b) => a + b, 0) / entry.demand_scores.length)
                : 0;
            const avgSalary = entry.avg_salaries.length
                ? Math.round(entry.avg_salaries.reduce((a, b) => a + b, 0) / entry.avg_salaries.length)
                : 0;

            const monthLabel = entry.sampleDate.toLocaleDateString('en-US', { month: 'short' });

            return {
                monthKey: key,
                monthLabel,
                demand_score: avgDemand,
                avg_salary: avgSalary
            };
        });
    }, [trends]);

    const demandGrowth = growthLabel(processedTrends.map(t => t.demand_score));
    const salaryGrowth = growthLabel(processedTrends.map(t => t.avg_salary));

    const gridColor = '#27272a';
    const axisLineColor = '#27272a';
    const tickColor = '#71717a';
    const demandColor = '#f59e0b';
    const salaryColor = '#10b981';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 font-mono">
            {/* Job Demand Trend */}
            <div className="bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">HIRING VELOCITY</span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100">Job Demand Trajectory</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-950 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                        {demandGrowth} Growth
                    </span>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedTrends}>
                            <defs>
                                <linearGradient id="cyberDemandGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={demandColor} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={demandColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis 
                                dataKey="monthLabel" 
                                tick={{ fontSize: 10, fill: tickColor, fontFamily: 'monospace' }} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 10, fill: tickColor, fontFamily: 'monospace' }} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <Tooltip content={<CyberTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="demand_score" 
                                stroke={demandColor} 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#cyberDemandGrad)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Salary Trend */}
            <div className="bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">COMPENSATION INDEX</span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100">Salary Band Dynamics</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        {salaryGrowth} YoY
                    </span>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedTrends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis 
                                dataKey="monthLabel" 
                                tick={{ fontSize: 10, fill: tickColor, fontFamily: 'monospace' }} 
                                axisLine={{ stroke: axisLineColor }}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 10, fill: tickColor, fontFamily: 'monospace' }} 
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
                                strokeWidth={2} 
                                dot={{ r: 3, fill: salaryColor, stroke: '#09090b', strokeWidth: 2 }} 
                                activeDot={{ r: 5, fill: salaryColor, stroke: '#09090b', strokeWidth: 2 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default JobDemandTrends;
