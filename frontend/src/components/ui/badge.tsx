import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline-success' | 'outline-warning' | 'outline-cyan' | 'outline-destructive' | 'pill';
}

const badgeVariants: Record<string, string> = {
  default: 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-primary/20 dark:border-primary/40 dark:text-blue-300',
  secondary: 'bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/[0.06] dark:border-white/[0.08] dark:text-slate-300',
  'outline-success': 'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400',
  'outline-warning': 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400',
  'outline-cyan': 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-cyan-500/10 dark:border-cyan-500/40 dark:text-cyan-300',
  'outline-destructive': 'bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400',
  pill: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-transparent rounded-full',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${badgeVariants[variant] || badgeVariants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
