import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'blue' | 'cyan' | 'orange';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '', icon, trend }) => {
  const isNumber = typeof value === 'number';
  const { count, elementRef } = useCountUp(isNumber ? (value as number) : 0, 1000);
  const displayValue = isNumber ? count : value;

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className="group relative border border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition-colors p-5 sm:p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            {label}
          </span>
        </div>
        <div className="w-8 h-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
          <i className={`fa-solid ${icon} text-xs`} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-normal tracking-tight text-white tabular-nums">
          {displayValue}
        </span>
        {suffix && (
          <span className="text-sm font-mono text-zinc-400">{suffix}</span>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className={`flex items-center gap-1 ${trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </span>
          <span className="text-zinc-400 uppercase tracking-widest text-[10px]">VELOCITY</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

