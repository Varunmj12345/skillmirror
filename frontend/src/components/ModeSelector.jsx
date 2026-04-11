import React from 'react';

const ModeSelector = ({ selectedMode, onModeChange }) => {
  const modes = [
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'quick', label: 'Quick', icon: '⚡' },
  ];

  return (
    <div className="flex gap-3 mb-6">
      {modes.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex flex-1 items-center justify-center gap-2 px-4 py-2.5 
              rounded-xl text-sm font-bold transition-all duration-300
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
              }
            `}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
