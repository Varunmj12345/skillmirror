import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skill } from './types';

interface HeatmapProps {
    data: Skill[];
}

function GapHeatmap({ data }: HeatmapProps): React.ReactElement {
    const [filter, setFilter] = useState<'all' | 'critical' | 'technical' | 'soft'>('all');

    // Calculate gap intensity
    const allData = data.map(s => ({
        name: s.name,
        gap: Math.max(0, (s.required || 3) - (s.user_level || 0)),
        category: s.category || 'Technical',
        original: s
    })).filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap);

    const filteredData = allData.filter(s => {
        if (filter === 'critical') return s.gap >= 3;
        if (filter === 'technical') return s.category?.toLowerCase().includes('tech') || s.category === 'Technical';
        if (filter === 'soft') return s.category?.toLowerCase().includes('soft') || s.category?.toLowerCase().includes('behav') || s.category === 'Soft Skill';
        return true;
    });

    const getBarColor = (gap: number) => {
        if (gap >= 3) return '#f43f5e'; // Critical (rose-500)
        if (gap >= 2) return '#f59e0b'; // Moderate (amber-500)
        return '#eab308'; // Minor (yellow-500)
    };

    return (
        <div className="glass-panel p-6 border-slate-800/50 h-[450px] flex flex-col relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-fire text-rose-500"></i> Gap Severity Heatmap
                </h4>

                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
                    {(['all', 'critical', 'technical', 'soft'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-slate-600 hover:text-slate-400'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full pb-8">
                {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={filteredData}
                            margin={{ left: 10, right: 30 }}
                        >
                            <XAxis type="number" hide domain={[0, 5]} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={110}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length && payload[0]) {
                                        const item = payload[0];
                                        const value = typeof item.value === 'number' ? item.value : 0;
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-3 shadow-2xl rounded-xl min-w-[140px]">
                                                <p className="text-xs font-black text-slate-50 mb-2 border-b border-slate-800 pb-1">{item.payload?.name || 'Skill'}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getBarColor(value) }}></div>
                                                    <p className="text-[10px] font-black uppercase" style={{ color: getBarColor(value) }}>
                                                        {value >= 3 ? 'Critical' : value >= 2 ? 'Moderate' : 'Minor'} Gap
                                                    </p>
                                                </div>
                                                <p className="text-[9px] text-slate-500 mt-1 font-bold">Deficit: {value} Levels</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="gap" radius={[0, 4, 4, 0]} barSize={16}>
                                {filteredData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.gap)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 mb-4 border border-slate-800 border-dashed">
                            <i className="fa-solid fa-filter-circle-xmark text-2xl opacity-20"></i>
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest max-w-[200px]">No matches for current filter</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[9px] font-black text-slate-600 uppercase">Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-[9px] font-black text-slate-600 uppercase">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-[9px] font-black text-slate-600 uppercase">Minor</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GapHeatmap;
