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
      <div className={`inline-flex items-center p-1 bg-zinc-950 border border-zinc-800 ${className}`}>
        {modes.map((m) => {
          const isActive = theme === m.id;
          return (
            <button
              key={m.id}
              onClick={(e) => setTheme(m.id, e)}
              className={`relative px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <i className={`fa-solid ${m.icon} text-[11px] ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
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
      onClick={(e) => toggleTheme(e)}
      type="button"
      className={`relative inline-flex items-center justify-center gap-2 p-2 bg-zinc-950 border border-zinc-800 hover:border-amber-400 text-zinc-400 hover:text-amber-400 transition-all font-mono text-xs uppercase ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center text-xs"
      >
        {isDark ? (
          <i className="fa-solid fa-sun text-amber-400 text-xs" />
        ) : (
          <i className="fa-solid fa-moon text-amber-500 text-xs" />
        )}
      </motion.div>

      {showLabel && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
          {isDark ? 'LIGHT' : 'DARK'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
