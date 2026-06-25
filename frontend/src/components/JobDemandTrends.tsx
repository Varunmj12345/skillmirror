// @ts-nocheck
import React from 'react';
import { LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, AreaChart as RechartsAreaChart, Area as RechartsArea } from 'recharts';

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

    const formatIndianRupee = (val: number | null | undefined): string => {
        if (val === null || val === undefined || isNaN(val)) return '₹0';
        if (val < 100000) {
            return `₹${Math.round(val).toLocaleString('en-IN')}`;
        } else if (val < 10000000) {
            const lakhs = val / 100000;
            const formatted = parseFloat(lakhs.toFixed(2));
            return `₹${formatted}L`;
        } else {
            const crores = val / 10000000;
            const formatted = parseFloat(crores.toFixed(2));
            return `₹${formatted}Cr`;
        }
    };

    const processedTrends = React.useMemo(() => {
        if (!trends || trends.length === 0) return [];

        const monthlyGroups: { [key: string]: { demand_score: number[]; avg_salary: number[]; date: string } } = {};
        
        trends.forEach(item => {
            const dateObj = new Date(item.date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;
            
            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = {
                    demand_score: [],
                    avg_salary: [],
                    date: item.date
                };
            }
            monthlyGroups[monthKey].demand_score.push(item.demand_score);
            monthlyGroups[monthKey].avg_salary.push(item.avg_salary);
        });
        
        const aggregated = Object.keys(monthlyGroups)
            .sort()
            .map(monthKey => {
                const group = monthlyGroups[monthKey];
                const avgDemand = group.demand_score.reduce((sum, val) => sum + val, 0) / group.demand_score.length;
                const avgSalary = group.avg_salary.reduce((sum, val) => sum + val, 0) / group.avg_salary.length;
                
                const parts = group.date.split('T')[0].split('-');
                let monthLabel = '';
                if (parts.length >= 2) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parts.length > 2 ? parseInt(parts[2], 10) : 1;
                    const localDate = new Date(year, month, day);
                    monthLabel = localDate.toLocaleDateString('en-US', { month: 'short' });
                } else {
                    monthLabel = new Date(group.date).toLocaleDateString('en-US', { month: 'short' });
                }
                
                return {
                    monthLabel,
                    demand_score: Math.round(avgDemand),
                    avg_salary: Math.round(avgSalary)
                };
            });
            
        return aggregated.slice(-6);
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
                            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={(val: number) => formatIndianRupee(val)} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(val: any) => [val ? formatIndianRupee(Number(val)) : '₹0', 'Salary']}
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
