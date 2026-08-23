import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

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
  indigo: { bg: 'bg-indigo-50 dark:bg-brand-neural/10 text-indigo-600 dark:text-brand-neural border border-indigo-100/80 dark:border-transparent', text: 'text-indigo-600 dark:text-brand-neural', glow: 'from-indigo-500/10 dark:from-brand-neural/5' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100/80 dark:border-transparent', text: 'text-cyan-600 dark:text-cyan-400', glow: 'from-cyan-500/10 dark:from-cyan-500/5' },
  emerald: { bg: 'bg-emerald-50 dark:bg-brand-emerald/10 text-emerald-600 dark:text-brand-emerald border border-emerald-100/80 dark:border-transparent', text: 'text-emerald-600 dark:text-brand-emerald', glow: 'from-emerald-500/10 dark:from-brand-emerald/5' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-transparent', text: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500/10 dark:from-amber-500/5' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100/80 dark:border-transparent', text: 'text-orange-600 dark:text-orange-400', glow: 'from-orange-500/10 dark:from-orange-500/5' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100/80 dark:border-transparent', text: 'text-violet-600 dark:text-violet-400', glow: 'from-violet-500/10 dark:from-violet-500/5' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100/80 dark:border-transparent', text: 'text-rose-600 dark:text-rose-400', glow: 'from-rose-500/10 dark:from-rose-500/5' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-100/80 dark:border-transparent', text: 'text-sky-600 dark:text-sky-400', glow: 'from-sky-500/10 dark:from-sky-500/5' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-transparent', text: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500/10 dark:from-blue-500/5' },
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '', icon, color, trend }) => {
  const styles = colorMap[color] || colorMap.indigo;
  const isNumber = typeof value === 'number';
  const { count, elementRef } = useCountUp(isNumber ? (value as number) : 0, 1000);
  const displayValue = isNumber ? count : value;

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className="group sm-glass p-6 rounded-2xl relative overflow-hidden sm-card-hover">
      {/* 1. Animated Background Sparkline Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none">
           <path 
             d="M0 40 Q 25 35, 50 45 T 100 38 T 150 42 T 200 35 V 100 H 0 Z" 
             fill="currentColor" 
             className={styles.text}
           />
        </svg>
      </div>

      <div className="relative z-10 flex justify-between items-start mb-5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${styles.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
           <i className={`fa-solid ${icon} text-sm`} />
        </div>
      </div>

      <div className="relative z-10 flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight tabular-nums">{displayValue}</span>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{suffix}</span>
      </div>

      {trend && (
         <div className={`mt-3 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest ${trend.isUp ? 'text-emerald-600 dark:text-brand-emerald' : 'text-rose-600 dark:text-rose-400'}`}>
            <span className={`px-1.5 py-0.5 rounded-md ${trend.isUp ? 'bg-emerald-50 text-emerald-700 dark:bg-brand-emerald/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
               {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="text-slate-400">Velocity</span>
         </div>
      )}

      {/* Hover Spotlight */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${styles.glow} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};

export default MetricCard;
