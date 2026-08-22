import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline-success' | 'outline-warning' | 'outline-cyan' | 'outline-destructive' | 'pill';
}

const badgeVariants: Record<string, string> = {
  default: 'bg-primary/20 border border-primary/40 text-primary-foreground text-blue-300',
  secondary: 'bg-white/[0.06] border border-white/[0.08] text-slate-300',
  'outline-success': 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  'outline-warning': 'bg-amber-500/10 border border-amber-500/30 text-amber-400',
  'outline-cyan': 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300',
  'outline-destructive': 'bg-rose-500/10 border border-rose-500/30 text-rose-400',
  pill: 'bg-white/10 text-white rounded-full',
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
