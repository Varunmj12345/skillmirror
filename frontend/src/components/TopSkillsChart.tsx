// @ts-nocheck
import React from 'react';
import { BarChart as RechartsBarChart, Bar as RechartsBar, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, Cell as RechartsCell } from 'recharts';

const BarChart = RechartsBarChart as any;
const Bar = RechartsBar as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const CartesianGrid = RechartsCartesianGrid as any;
const Tooltip = RechartsTooltip as any;
const ResponsiveContainer = RechartsResponsiveContainer as any;
const Cell = RechartsCell as any;

const TopSkillsChart: React.FC = () => {
    // Mock Data
    const skillData = [
        { name: 'React.js', demand: 85, status: 'rising' },
        { name: 'TypeScript', demand: 78, status: 'rising' },
        { name: 'Node.js', demand: 72, status: 'stable' },
        { name: 'AWS', demand: 65, status: 'rising' },
        { name: 'GraphQL', demand: 58, status: 'rising' },
        { name: 'Docker', demand: 55, status: 'stable' },
        { name: 'Python', demand: 45, status: 'declining' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
                    <p className="font-bold text-sm mb-1">{label}</p>
                    <p className="text-xs text-gray-300">
                        Demand Score: <span className="text-emerald-400 font-bold">{payload[0].value}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 capitalize">
                        Trend: {payload[0].payload.status}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Top Required Skills</h3>
                    <p className="text-xs text-gray-500">Skills most frequently mentioned in job descriptions</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Rising
                    </span>
                    <span className="flex items-center text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100 font-bold">
                        <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span> Stable
                    </span>
                </div>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={skillData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12, fill: '#4B5563', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                        <Bar dataKey="demand" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                            {skillData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.status === 'rising' ? '#10B981' :
                                            entry.status === 'declining' ? '#F43F5E' :
                                                '#6B7280'
                                    }
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TopSkillsChart;
