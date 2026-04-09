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
                        <AreaChart data={trends}>
                            <defs>
                                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(val: string) => new Date(val).toLocaleDateString(undefined, { month: 'short' })} />
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
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(val: string) => new Date(val).toLocaleDateString(undefined, { month: 'short' })} />
                            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={(val: number) => `$${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(val: any) => [val ? `$${val.toLocaleString()}` : '$0', 'Salary']}
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
