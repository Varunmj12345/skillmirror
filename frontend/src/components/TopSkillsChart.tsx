import React from 'react';
import { 
    BarChart as RechartsBarChart, Bar as RechartsBar, 
    XAxis as RechartsXAxis, YAxis as RechartsYAxis, 
    CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer as RechartsResponsiveContainer, Cell as RechartsCell 
} from 'recharts';

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
                <div className="bg-zinc-950 text-zinc-100 p-3 rounded-xl border border-zinc-800 font-mono text-xs shadow-xl">
                    <p className="font-bold text-zinc-100 mb-1">{label}</p>
                    <p className="text-zinc-400">
                        Demand Frequency: <span className="text-amber-400 font-bold">{payload[0].value}%</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                        Trend: <span className={payload[0].payload.status === 'rising' ? 'text-emerald-400 font-bold' : payload[0].payload.status === 'declining' ? 'text-rose-400 font-bold' : 'text-zinc-400 font-bold'}>{payload[0].payload.status}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800 mb-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">MARKET FREQUENCY</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">Top Required Tech Stack</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Frequency index extracted across verified live role postings</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span> Rising
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-sm bg-zinc-600"></span> Stable
                    </span>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={skillData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={90}
                            tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'monospace' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                        <Bar dataKey="demand" radius={[0, 4, 4, 0]} barSize={16}>
                            {skillData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.status === 'rising' ? '#f59e0b' :
                                            entry.status === 'declining' ? '#f43f5e' :
                                                '#52525b'
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
