// @ts-nocheck
import React from 'react';
import { 
    BarChart as RechartsBarChart, Bar as RechartsBar, 
    XAxis as RechartsXAxis, YAxis as RechartsYAxis, 
    CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer as RechartsResponsiveContainer, Cell as RechartsCell 
} from 'recharts';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

const BarChart = RechartsBarChart as any;
const Bar = RechartsBar as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const CartesianGrid = RechartsCartesianGrid as any;
const Tooltip = RechartsTooltip as any;
const ResponsiveContainer = RechartsResponsiveContainer as any;
const Cell = RechartsCell as any;

const TopSkillsChart: React.FC = () => {
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
                <div className="bg-[#0b0d13] text-white p-3 rounded-xl shadow-2xl border border-white/[0.1] backdrop-blur-xl">
                    <p className="font-mono font-bold text-xs text-white mb-1">{label}</p>
                    <p className="text-xs font-mono text-slate-400">
                        Demand Score: <span className="text-cyan-400 font-bold">{payload[0].value}/100</span>
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                        Trend: <span className={payload[0].payload.status === 'rising' ? 'text-emerald-400 font-bold' : payload[0].payload.status === 'declining' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>{payload[0].payload.status}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-pop rounded-2xl p-6 border border-white/[0.07] mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <TVNoise opacity={0.02} />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bullet variant="cyan" size="sm" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">MARKET FREQUENCY</span>
                    </div>
                    <h3 className="text-base font-display font-black text-white">Top Required Skills</h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">Skills most frequently extracted from active job feeds</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span> Rising
                    </Badge>
                    <Badge variant="secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span> Stable
                    </Badge>
                </div>
            </div>

            <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={skillData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="demand" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1200}>
                            {skillData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.status === 'rising' ? '#00d9ff' :
                                            entry.status === 'declining' ? '#f43f5e' :
                                                '#475569'
                                    }
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
