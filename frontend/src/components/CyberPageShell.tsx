/**
 * CyberPageShell — shared header chrome for all AI Career Engine pages.
 * Renders a consistent cyber-industrial page header with:
 *   - section breadcrumb with live bullet
 *   - large page title + subtitle
 *   - optional right-side action slot
 *   - subtle top highlight line
 *   - ambient background orbs
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

interface CyberPageShellProps {
  /** Module code shown in breadcrumb, e.g. "MOD-02" */
  moduleCode: string;
  /** Section breadcrumb label, e.g. "AI CAREER ENGINE" */
  section?: string;
  /** Main page title */
  title: string;
  /** Subtitle / description */
  subtitle: string;
  /** Badge text shown next to breadcrumb */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'outline-cyan' | 'outline-success' | 'outline-warning';
  /** Bullet color variant for the breadcrumb dot */
  bulletVariant?: 'cyan' | 'success' | 'warning' | 'default';
  /** Optional right-side actions (buttons, selects, etc.) */
  actions?: React.ReactNode;
  /** Optional bottom stats/chips row */
  stats?: React.ReactNode;
  /** Ambient glow color (tailwind class fragment like 'cyan' | 'indigo' | 'emerald' | 'amber') */
  glowColor?: 'cyan' | 'indigo' | 'emerald' | 'amber';
  children?: React.ReactNode;
}

const GLOW_MAP = {
  cyan:    'bg-cyan-500/6',
  indigo:  'bg-indigo-600/6',
  emerald: 'bg-emerald-500/6',
  amber:   'bg-amber-500/6',
};

export const CyberPageShell: React.FC<CyberPageShellProps> = ({
  moduleCode,
  section = 'AI CAREER ENGINE',
  title,
  subtitle,
  badge,
  badgeVariant = 'outline-cyan',
  bulletVariant = 'cyan',
  actions,
  stats,
  glowColor = 'cyan',
  children,
}) => {
  return (
    <div className="relative z-10 px-6 pt-8 pb-4 max-w-[1400px] mx-auto">
      {/* Ambient radial glow */}
      <div className={`absolute top-0 right-1/4 w-[600px] h-[200px] ${GLOW_MAP[glowColor]} blur-[140px] rounded-full pointer-events-none`} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* ── Header card ── */}
        <div className="rounded-2xl bg-card dark:bg-pop border border-border shadow-light-card dark:shadow-sm overflow-hidden mb-8 relative">
          <TVNoise opacity={0.02} intensity={0.12} speed={55} />
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${glowColor === 'cyan' ? 'via-blue-500/40 dark:via-cyan-500/60' : glowColor === 'emerald' ? 'via-emerald-500/40 dark:via-emerald-500/60' : glowColor === 'amber' ? 'via-amber-500/40 dark:via-amber-500/60' : 'via-indigo-500/40 dark:via-indigo-500/60'} to-transparent`} />

          <div className="px-6 py-5 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: breadcrumb + title */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bullet variant={bulletVariant} size="sm" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {section}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">•</span>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{moduleCode}</span>
                  {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-black text-foreground tracking-tight mb-1.5">
                  {title}
                </h1>
                <p className="text-xs font-mono text-muted-foreground max-w-xl">{subtitle}</p>
              </div>

              {/* Right: actions slot */}
              {actions && (
                <div className="flex flex-wrap items-center gap-3">
                  {actions}
                </div>
              )}
            </div>

            {/* Stats / chips row */}
            {stats && (
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                {stats}
              </div>
            )}
          </div>
        </div>

        {children}
      </motion.div>
    </div>
  );
};

/** Reusable stat chip for the stats row in CyberPageShell */
export const PageStatChip: React.FC<{
  label: string;
  value: string | number;
  icon?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'slate' | 'rose';
  suffix?: string;
}> = ({ label, value, icon, color = 'slate', suffix }) => {
  const colorMap = {
    cyan:    'text-blue-700 dark:text-cyan-300 bg-blue-50/90 dark:bg-slate-900/90 dark:border-cyan-500/30 border-blue-200 shadow-light-sm dark:shadow-none',
    emerald: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-slate-900/90 dark:border-emerald-500/30 border-emerald-200 shadow-light-sm dark:shadow-none',
    amber:   'text-amber-700 dark:text-amber-300 bg-amber-50/90 dark:bg-slate-900/90 dark:border-amber-500/30 border-amber-200 shadow-light-sm dark:shadow-none',
    rose:    'text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-slate-900/90 dark:border-rose-500/30 border-rose-200 shadow-light-sm dark:shadow-none',
    slate:   'text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-900/90 dark:border-white/[0.08] border-slate-200 shadow-light-sm dark:shadow-none',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${colorMap[color]}`}>
      {icon && <i className={`fa-solid ${icon} text-[10px]`} />}
      <span className="font-bold text-slate-900 dark:text-white">{value}{suffix ? ` ${suffix}` : ''}</span>
      <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
    </div>
  );
};

export default CyberPageShell;
