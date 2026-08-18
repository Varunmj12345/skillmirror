// @ts-nocheck
import React from 'react';
import { LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, AreaChart as RechartsAreaChart, Area as RechartsArea } from 'recharts';
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

const JobDemandTrends: React.FC<JobDemandTrendsProps> = ({ trends }) => {
    if (!trends || trends.length === 0) return <div className="p-4 text-center text-gray-500">Loading trends...</div>;

    const processedTrends = React.useMemo(() => {
        if (!trends || trends.length === 0) return [];

        // 1. Group raw hiring events by YYYY-MM
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

        // 2. Sort month keys in chronological order
        const sortedMonthKeys = Object.keys(monthlyMap).sort();

        // 3. Extract monthly aggregated hiring totals
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

        // 4. Guarantee exactly 6 unique chronological month slots
        const last6 = aggregated.slice(-6);

        // Deduplicate month labels if year boundaries overlap
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Job Demand Trend */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Job Demand Trend</h3>
                        <p className="text-xs text-gray-500">6 Month hiring velocity</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">+15% Growth</span>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedTrends}>
                            <defs>
                                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                labelStyle={{ color: '#6B7280', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="demand_score" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Salary Trend */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Salary Trend</h3>
                        <p className="text-xs text-gray-500">Monthly average compensation</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">+8% Growth</span>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedTrends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={(val: number) => formatINR(val)} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(val: any) => [val ? formatINR(Number(val)) : '₹0', 'Salary']}
                            />
                            <Line type="monotone" dataKey="avg_salary" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default JobDemandTrends;
