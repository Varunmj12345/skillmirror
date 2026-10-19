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
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 h-[450px] flex flex-col relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-rose-400"></span>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Gap Severity Heatmap
                    </h4>
                </div>

                <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
                    {(['all', 'critical', 'technical', 'soft'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                filter === f
                                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300'
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
                                tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length && payload[0]) {
                                        const item = payload[0];
                                        const value = typeof item.value === 'number' ? item.value : 0;
                                        return (
                                            <div className="bg-zinc-950 border border-zinc-800 p-3 shadow-2xl rounded-xl min-w-[140px] font-mono text-[10px]">
                                                <p className="font-bold text-white mb-2 border-b border-zinc-800 pb-1">{item.payload?.name || 'Skill'}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: getBarColor(value) }}></div>
                                                    <p className="font-bold uppercase" style={{ color: getBarColor(value) }}>
                                                        {value >= 3 ? 'Critical' : value >= 2 ? 'Moderate' : 'Minor'} Gap
                                                    </p>
                                                </div>
                                                <p className="text-zinc-500 mt-1 font-bold">Deficit: {value} Levels</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="gap" radius={[0, 3, 3, 0]} barSize={14}>
                                {filteredData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.gap)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-14 h-14 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-700 mb-3 border border-zinc-800 border-dashed">
                            <i className="fa-solid fa-filter-circle-xmark text-lg opacity-40"></i>
                        </div>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest max-w-[200px]">No matches for filter</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-zinc-800 font-mono text-[9px]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-sm bg-rose-500"></div>
                        <span className="text-zinc-500 uppercase tracking-wider">Critical</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-sm bg-amber-500"></div>
                        <span className="text-zinc-500 uppercase tracking-wider">Moderate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-sm bg-yellow-500"></div>
                        <span className="text-zinc-500 uppercase tracking-wider">Minor</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GapHeatmap;
