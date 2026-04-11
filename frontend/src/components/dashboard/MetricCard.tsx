import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  color: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'blue' | 'cyan' | 'orange';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorMap = {
  indigo: { bg: 'bg-brand-neural/10', text: 'text-brand-neural', glow: 'from-brand-neural/5' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'from-cyan-500/5' },
  emerald: { bg: 'bg-brand-emerald/10', text: 'text-brand-emerald', glow: 'from-brand-emerald/5' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'from-amber-500/5' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', glow: 'from-orange-500/5' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', glow: 'from-violet-500/5' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'from-rose-500/5' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', glow: 'from-sky-500/5' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'from-blue-500/5' },
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '', icon, color, trend }) => {
  const styles = colorMap[color] || colorMap.indigo;

  return (
    <div className={`group sm-glass p-6 rounded-[1.5rem] relative overflow-hidden transition-all duration-500 hover:border-brand-neural/30`}>
      {/* 1. Animated Background Sparkline Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none">
           <path 
             d="M0 40 Q 25 35, 50 45 T 100 38 T 150 42 T 200 35 V 100 H 0 Z" 
             fill="currentColor" 
             className={styles.text}
           />
        </svg>
      </div>

      <div className="relative z-10 flex justify-between items-start mb-6">
        <span className="sm-nano opacity-60">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
           <i className={`fa-solid ${icon} text-sm`} />
        </div>
      </div>

      <div className="relative z-10 flex items-baseline gap-1">
        <span className="text-4xl font-black text-white tracking-ultra-tight">{value}</span>
        <span className="text-sm font-bold text-slate-500">{suffix}</span>
      </div>

      {trend && (
         <div className={`mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${trend.isUp ? 'text-brand-emerald' : 'text-rose-400'}`}>
            <span className={`px-1.5 py-0.5 rounded-md ${trend.isUp ? 'bg-brand-emerald/10' : 'bg-rose-500/10'}`}>
               {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="opacity-40">Velocity</span>
         </div>
      )}

      {/* Hover Spotlight */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${styles.glow} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};

export default MetricCard;
