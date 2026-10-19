/**
 * SentinelPageShell (formerly CyberPageShell) — Shared Skydda-styled header chrome
 * for all AI Career Engine pages.
 * Clean, high-contrast, distraction-free architecture with:
 *   - Skydda square-dot section indicator
 *   - Stark typography
 *   - Minimalist action and telemetry stat slots
 *   - Zero TV noise or flickering grain
 */
import React from 'react';
import { motion } from 'framer-motion';

interface PageShellProps {
  /** Module code shown in breadcrumb, e.g. "MOD-02" */
  moduleCode?: string;
  /** Section breadcrumb label, e.g. "AI CAREER ENGINE" */
  section?: string;
  /** Main page title */
  title: string;
  /** Subtitle / description */
  subtitle?: string;
  /** Alias for subtitle */
  description?: string;
  /** Badge text shown next to breadcrumb */
  badge?: string;
  /** Badge variant */
  badgeVariant?: string;
  /** Bullet color variant for the breadcrumb dot */
  bulletVariant?: string;
  /** Optional right-side actions (buttons, selects, etc.) */
  actions?: React.ReactNode;
  /** Optional bottom stats/chips row */
  stats?: React.ReactNode;
  /** Alias for stats */
  extraHeader?: React.ReactNode;
  /** Ambient glow color */
  glowColor?: string;
  children?: React.ReactNode;
}

export const SentinelPageShell: React.FC<PageShellProps> = ({
  moduleCode = 'MOD-01',
  section = 'AI CAREER ENGINE',
  title,
  subtitle,
  description,
  badge,
  actions,
  stats,
  extraHeader,
  children,
}) => {
  const displaySubtitle = subtitle || description || '';
  const displayStats = stats || extraHeader;

  return (
    <div className="relative z-10 px-4 sm:px-6 pt-6 pb-6 max-w-[1400px] mx-auto">

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative"
      >
        {/* ── Skydda Header card ── */}
        <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 mb-8 relative rounded-none shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Pre-heading indicator + title + subtitle */}
            <div>
              <div className="flex items-center gap-2.5 px-3 py-1 border border-zinc-800 bg-zinc-950/70 w-fit mb-3 rounded-none">
                <div className="w-2 h-2 bg-amber-500 animate-pulse" />
                <span className="text-caption font-mono uppercase tracking-widest text-zinc-400">
                  {section} {moduleCode ? `• ${moduleCode}` : ''}
                </span>
                {badge && (
                  <span className="text-caption font-mono px-1.5 py-0.5 border border-zinc-700 bg-zinc-800 text-zinc-300 ml-1 rounded-none">
                    {badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-zinc-100 mb-2">
                {title}
              </h1>

              {displaySubtitle && (
                <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl leading-relaxed">
                  {displaySubtitle}
                </p>
              )}
            </div>

            {/* Right: actions slot */}
            {actions && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>

          {/* Stats / chips row */}
          {displayStats && (
            <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-wrap items-center gap-3">
              {displayStats}
            </div>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
};

/** Reusable stat chip for the stats row in PageShell */
export const PageStatChip: React.FC<{
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  suffix?: string;
}> = ({ label, value, icon, suffix }) => {
  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 border border-zinc-800 bg-zinc-950 text-xs font-mono transition-colors rounded-none">
      {icon && <i className={`fa-solid ${icon} text-[10px] text-amber-500`} />}
      <span className="font-semibold text-zinc-100">
        {value}
        {suffix ? ` ${suffix}` : ''}
      </span>
      <span className="text-zinc-400 font-normal">{label}</span>
    </div>
  );
};

// Aliases for backwards compatibility with existing imports
export const CyberPageShell = SentinelPageShell;
export default SentinelPageShell;
