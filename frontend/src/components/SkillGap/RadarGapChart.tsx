import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Skill } from './types';

interface RadarProps {
    data: Skill[];
}

function RadarGapChart({ data }: RadarProps): React.ReactElement {
    // Transform data for radar
    const chartData = data.map(s => ({
        subject: s.name,
        A: s.user_level || 0,
        B: s.required || s.user_level || 1,
        gap: Math.max(0, (s.required || 0) - (s.user_level || 0)),
        hours: s.estimated_hours || Math.max(0, (s.required || 0) - (s.user_level || 0)) * 10,
        fullMark: 5,
    }));

    return (
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 h-[450px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                    Skill Level Comparison Radar
                </h4>
            </div>
            <div className="flex-1 w-full pb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Tooltip
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length && payload[0]) {
                                    const p = payload[0].payload;
                                    return (
                                        <div className="bg-zinc-950 p-4 shadow-2xl rounded-xl border border-zinc-800 text-zinc-200 min-w-[190px]">
                                            <p className="text-xs font-mono font-bold text-white mb-3 pb-2 border-b border-zinc-800">{p.subject}</p>
                                            <div className="space-y-2 font-mono text-[10px]">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-zinc-500 uppercase">Your Level</span>
                                                    <span className="font-bold text-amber-400">{p.A} / 5</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-zinc-500 uppercase">Required</span>
                                                    <span className="font-bold text-zinc-300">{p.B} / 5</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1 border-t border-zinc-800">
                                                    <span className="text-zinc-500 uppercase">Gap Size</span>
                                                    <span className={`font-bold ${p.gap > 2 ? 'text-rose-400' : p.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {p.gap} Levels
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-zinc-500 uppercase">Est. Learning</span>
                                                    <span className="font-bold text-zinc-300">{p.hours} Hours</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Radar
                            name="You"
                            dataKey="A"
                            stroke="#f59e0b"
                            fill="#f59e0b"
                            fillOpacity={0.35}
                        />
                        <Radar
                            name="Required"
                            dataKey="B"
                            stroke="#a1a1aa"
                            fill="#a1a1aa"
                            fillOpacity={0.15}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 pb-1 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-amber-400"></span>
                    <span className="text-zinc-400 uppercase tracking-wider">Your Level</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-zinc-500"></span>
                    <span className="text-zinc-400 uppercase tracking-wider">Target Requirement</span>
                </div>
            </div>
        </div>
    );
}

export default RadarGapChart;
