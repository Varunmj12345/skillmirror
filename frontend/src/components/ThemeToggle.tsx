import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'pill' | 'compact';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  className = '',
  showLabel = false,
}) => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'pill') {
    const modes: { id: ThemeMode; label: string; icon: string }[] = [
      { id: 'dark', label: 'Dark', icon: 'fa-moon' },
      { id: 'light', label: 'Light', icon: 'fa-sun' },
      { id: 'system', label: 'System', icon: 'fa-desktop' },
    ];

    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/[0.08] backdrop-blur-xl ${className}`}>
        {modes.map((m) => {
          const isActive = theme === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setTheme(m.id)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-blue-600 dark:text-cyan-300 shadow-light-sm dark:shadow-[0_0_12px_rgba(0,217,255,0.25)]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeThemePill"
                  className="absolute inset-0 bg-white dark:bg-cyan-500/20 border border-blue-200 dark:border-cyan-400/60 rounded-lg -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <i className={`fa-solid ${m.icon} text-[11px]`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const isDark = effectiveTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative group inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300 border ${
        isDark
          ? 'bg-slate-900/80 border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300'
          : 'bg-slate-100 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 shadow-sm'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center text-xs"
      >
        {isDark ? (
          <i className="fa-solid fa-sun text-amber-400 text-sm group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <i className="fa-solid fa-moon text-indigo-500 text-sm group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </motion.div>

      {showLabel && (
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
