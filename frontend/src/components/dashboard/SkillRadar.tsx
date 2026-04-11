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

interface SkillRadarProps {
  skills: { name: string; demand: number; match: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-white/5 pb-1">
          {payload[0].payload.name}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] font-black uppercase text-indigo-400">Market Demand</span>
            <span className="text-xs font-black text-white">{payload[0].value}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] font-black uppercase text-emerald-400">Your Match</span>
            <span className="text-xs font-black text-white">{payload[1]?.value}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  return (
    <div className="glass-panel p-6 border-white/5 bg-slate-900/40 sm-card relative overflow-hidden group min-h-[400px]">
      {/* Decorative background effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[60px] -ml-16 -mb-16 pointer-events-none" />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <i className="fa-solid fa-compass-drafting text-[10px] text-indigo-400 animate-pulse"></i>
          </div>
          Skill Intelligence Radar
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Market</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Match</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
            <defs>
              <linearGradient id="gradientDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gradientMatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <PolarGrid stroke="#ffffff10" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900, textAnchor: 'middle' }}
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
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradientDemand)"
              fillOpacity={0.6}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Radar
              name="Your Match"
              dataKey="match"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradientMatch)"
              fillOpacity={0.6}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-circle-nodes text-[10px] text-indigo-400" />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Wedge analysis shows a <span className="text-white font-black">14% delta</span> in core architectural alignment. Predicted efficiency will increase as your <span className="text-emerald-400 font-black">match wedge</span> expands.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillRadar;
