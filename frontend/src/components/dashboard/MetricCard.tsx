import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  color: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'blue';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'hover:border-indigo-500/30', glow: 'from-indigo-500/5' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'hover:border-violet-500/30', glow: 'from-violet-500/5' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'hover:border-emerald-500/30', glow: 'from-emerald-500/5' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'hover:border-amber-500/30', glow: 'from-amber-500/5' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'hover:border-rose-500/30', glow: 'from-rose-500/5' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'hover:border-sky-500/30', glow: 'from-sky-500/5' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'hover:border-blue-500/30', glow: 'from-blue-500/5' },
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '%', icon, color, trend }) => {
  const styles = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden glass-panel p-6 border-slate-800/60 ${styles.border} transition-all group sm-card`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${styles.glow} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${styles.bg} ${styles.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <i className={`fa-solid ${icon} text-xs`} />
        </div>
      </div>

      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-0.5">{suffix}</span>
      </div>

      {trend && (
        <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider relative z-10 ${trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          <div className={`flex items-center justify-center w-4 h-4 rounded-full ${trend.isUp ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
            <i className={`fa-solid fa-arrow-${trend.isUp ? 'up' : 'down'} text-[8px]`} />
          </div>
          <span>{trend.value}% vs last week</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

