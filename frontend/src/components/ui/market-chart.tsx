import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardContent } from './card';
import { Bullet } from './bullet';
import { Badge } from './badge';

const chartDatasets = {
  week: [
    { date: 'Mon', salary: 110, demand: 75, match: 82 },
    { date: 'Tue', salary: 118, demand: 85, match: 86 },
    { date: 'Wed', salary: 125, demand: 80, match: 89 },
    { date: 'Thu', salary: 132, demand: 92, match: 91 },
    { date: 'Fri', salary: 140, demand: 88, match: 94 },
    { date: 'Sat', salary: 148, demand: 95, match: 96 },
    { date: 'Sun', salary: 155, demand: 98, match: 98 },
  ],
  month: [
    { date: 'Jan', salary: 95, demand: 60, match: 70 },
    { date: 'Feb', salary: 105, demand: 68, match: 75 },
    { date: 'Mar', salary: 115, demand: 74, match: 80 },
    { date: 'Apr', salary: 122, demand: 82, match: 85 },
    { date: 'May', salary: 135, demand: 88, match: 90 },
    { date: 'Jun', salary: 142, demand: 91, match: 93 },
    { date: 'Jul', salary: 155, demand: 98, match: 98 },
  ],
  year: [
    { date: '2022', salary: 75, demand: 50, match: 62 },
    { date: '2023', salary: 98, demand: 68, match: 74 },
    { date: '2024', salary: 120, demand: 82, match: 85 },
    { date: '2025', salary: 145, demand: 92, match: 94 },
    { date: '2026', salary: 168, demand: 99, match: 99 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0d13] border border-white/[0.12] p-3 rounded-lg shadow-xl text-xs font-mono">
        <div className="text-slate-400 font-bold mb-1">{label}</div>
        <div className="text-cyan-400">Salary Index: ${payload[0]?.value}k</div>
        <div className="text-emerald-400">Demand Score: {payload[1]?.value}%</div>
        <div className="text-indigo-400">ATS Match: {payload[2]?.value}%</div>
      </div>
    );
  }
  return null;
};

export const MarketChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const data = chartDatasets[timeframe];

  return (
    <Card className="w-full">
      <CardHeader
        title="CAREER DEMAND & COMPENSATION TRAJECTORY"
        bulletVariant="cyan"
        addon={
          <div className="flex items-center gap-1 bg-card p-1 rounded-md border border-white/[0.06]">
            {(['week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                  timeframe === t
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />
      <CardContent className="p-4 bg-card">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 mb-4 text-[11px] font-mono uppercase text-slate-400">
          <div className="flex items-center gap-1.5">
            <Bullet variant="cyan" size="sm" />
            <span>Salary Benchmark ($k)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bullet variant="success" size="sm" />
            <span>Job Demand Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bullet variant="default" size="sm" />
            <span>Profile Match Index</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                fontFamily="Roboto Mono"
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                fontFamily="Roboto Mono"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="salary"
                stroke="#00d9ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyanGrad)"
              />
              <Area
                type="monotone"
                dataKey="demand"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#emeraldGrad)"
              />
              <Area
                type="monotone"
                dataKey="match"
                stroke="#6366f1"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#indigoGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketChart;
