import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'amber'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'info'
    | 'cyan'
    | 'outline'
    | 'outline-success'
    | 'outline-warning'
    | 'outline-cyan'
    | 'outline-destructive'
    | 'pill';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

const badgeVariants: Record<string, string> = {
  default:
    'bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-sm',
  secondary:
    'bg-zinc-800/60 border border-zinc-700 text-zinc-300',
  primary:
    'bg-amber-500/15 border border-amber-500/40 text-amber-500 shadow-sm',
  amber:
    'bg-amber-500/15 border border-amber-500/40 text-amber-500 shadow-sm',
  success:
    'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm',
  warning:
    'bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-sm',
  destructive:
    'bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-sm',
  info:
    'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-sm',
  cyan:
    'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-sm',
  outline:
    'bg-transparent border border-zinc-700 text-zinc-300',
  'outline-success':
    'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  'outline-warning':
    'bg-amber-500/10 border border-amber-500/30 text-amber-400',
  'outline-cyan':
    'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300',
  'outline-destructive':
    'bg-rose-500/10 border border-rose-500/30 text-rose-400',
  pill:
    'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full',
};

const dotColors: Record<string, string> = {
  default: 'bg-zinc-400',
  secondary: 'bg-zinc-400',
  primary: 'bg-amber-500',
  amber: 'bg-amber-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-rose-500',
  info: 'bg-cyan-400',
  cyan: 'bg-cyan-400',
  outline: 'bg-zinc-400',
  'outline-success': 'bg-emerald-500',
  'outline-warning': 'bg-amber-500',
  'outline-cyan': 'bg-cyan-400',
  'outline-destructive': 'bg-rose-500',
  pill: 'bg-zinc-400',
};

const badgeSizes: Record<string, string> = {
  xs: 'px-1.5 py-0.5 text-[9px] gap-1',
  sm: 'px-2 py-0.5 text-[10px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const resolvedVariant = badgeVariants[variant] || badgeVariants.default;
  const resolvedSize = badgeSizes[size] || badgeSizes.sm;
  const resolvedDot = dotColors[variant] || dotColors.default;

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-sm select-none transition-colors duration-150',
        resolvedVariant,
        resolvedSize,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0',
            resolvedDot
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
