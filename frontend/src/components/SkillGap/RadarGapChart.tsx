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
        <div className="glass-panel p-6 border-slate-800/50 h-[450px] flex flex-col">
            <h4 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-crosshairs text-sky-400"></i> Skill Level Comparison
            </h4>
            <div className="flex-1 w-full pb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Tooltip
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length && payload[0]) {
                                    const p = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 p-4 shadow-2xl rounded-2xl border border-slate-700 text-slate-200 min-w-[180px]">
                                            <p className="text-xs font-black text-slate-50 mb-3 pb-2 border-b border-slate-800">{p.subject}</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-500 font-bold uppercase">Your Level</span>
                                                    <span className="font-black text-sky-400">{p.A} / 5</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-500 font-bold uppercase">Required</span>
                                                    <span className="font-black text-indigo-400">{p.B} / 5</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800/50">
                                                    <span className="text-slate-500 font-bold uppercase">Gap Size</span>
                                                    <span className={`font-black ${p.gap > 2 ? 'text-rose-400' : p.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {p.gap} Levels
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-500 font-bold uppercase">Est. Learning</span>
                                                    <span className="font-black text-slate-300">{p.hours} Hours</span>
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
                            stroke="#38bdf8"
                            fill="#38bdf8"
                            fillOpacity={0.5}
                        />
                        <Radar
                            name="Required"
                            dataKey="B"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Level</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500/50 rounded-full"></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Requirement</span>
                </div>
            </div>
        </div>
    );
}

export default RadarGapChart;
