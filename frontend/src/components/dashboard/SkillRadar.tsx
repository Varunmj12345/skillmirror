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
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-light-float dark:shadow-2xl">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-white/5 pb-1">
          {payload[0].payload.name}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] font-mono font-bold uppercase text-blue-600 dark:text-indigo-400">Market Demand</span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{payload[0].value}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">Your Match</span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{payload[1]?.value}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-light-card dark:shadow-none relative overflow-hidden group min-h-[400px]">
      {/* Decorative background effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-indigo-500/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[60px] -ml-16 -mb-16 pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <i className="fa-solid fa-compass-drafting text-[10px] text-blue-600 dark:text-indigo-400 animate-pulse"></i>
          </div>
          Skill Intelligence Radar
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-indigo-500 shadow-sm" />
            <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Market</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Match</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
            <defs>
              <linearGradient id="gradientDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? "#6366f1" : "#2563eb"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={isDark ? "#818cf8" : "#60a5fa"} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gradientMatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <PolarGrid stroke={isDark ? "#ffffff10" : "#e2e8f0"} strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 700, textAnchor: 'middle' }}
              dy={5}
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
              stroke={isDark ? "#6366f1" : "#2563eb"}
              strokeWidth={2}
              fill="url(#gradientDemand)"
              fillOpacity={0.5}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Radar
              name="Your Match"
              dataKey="match"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradientMatch)"
              fillOpacity={0.5}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
          <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-circle-nodes text-[10px] text-blue-600 dark:text-indigo-400" />
          </div>
          <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 leading-relaxed italic">
            Wedge analysis shows a <span className="text-slate-900 dark:text-white font-bold">14% delta</span> in core architectural alignment. Predicted efficiency will increase as your <span className="text-emerald-700 dark:text-emerald-400 font-bold">match wedge</span> expands.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillRadar;
