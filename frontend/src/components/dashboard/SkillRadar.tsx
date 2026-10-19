import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface SkillRadarProps {
  skills: { name: string; demand: number; match: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 shadow-xl">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 border-b border-zinc-800 pb-1">
          {payload[0].payload.name}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono text-amber-500">Market Demand</span>
            <span className="text-xs font-mono font-medium text-white">{payload[0].value}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono text-emerald-400">Your Match</span>
            <span className="text-xs font-mono font-medium text-white">{payload[1]?.value}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/90 relative min-h-[380px]">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 bg-amber-500" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Skill Intelligence Radar
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Market</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Match</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
            <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }}
              dy={4}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Market Demand"
              dataKey="demand"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="#f59e0b"
              fillOpacity={0.2}
              animationDuration={1000}
            />
            <Radar
              name="Your Match"
              dataKey="match"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="#10b981"
              fillOpacity={0.25}
              animationDuration={1200}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <div className="p-3 border border-zinc-800 bg-zinc-950 flex items-center gap-2.5">
          <i className="fa-solid fa-circle-nodes text-xs text-amber-500 shrink-0" />
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Wedge analysis shows a <span className="text-white font-medium">14% delta</span> in core architecture alignment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillRadar;

