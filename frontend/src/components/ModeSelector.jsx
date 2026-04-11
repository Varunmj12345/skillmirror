import React from 'react';

const ModeSelector = ({ selectedMode, onModeChange }) => {
  const modes = [
    { id: 'career',   label: 'Career',   icon: '💼' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'quick',    label: 'Quick',    icon: '⚡' },
  ];

  return (
    <div className="flex gap-2.5 mb-5">
      {modes.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              relative flex flex-1 items-center justify-center gap-2 px-3 py-2.5
              rounded-xl text-sm font-bold select-none
              transition-all duration-200 ease-out
              active:scale-95
              ${isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 scale-105'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-[1.02]'
              }
            `}
          >
            {/* Soft shimmer sweep on active */}
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
              </span>
            )}
            <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {mode.icon}
            </span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
