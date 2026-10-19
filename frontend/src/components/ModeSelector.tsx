import React from 'react';

interface ModeSelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  const modes = [
    { id: 'career',   label: 'STRATEGY', icon: 'fa-chess-knight' },
    { id: 'learning', label: 'LEARNING', icon: 'fa-book-open' },
    { id: 'quick',    label: 'RAPID DIAG', icon: 'fa-bolt-lightning' },
  ];

  return (
    <div className="flex gap-1.5 p-1 bg-zinc-950 border border-zinc-800">
      {modes.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex-1 py-1.5 px-2 text-[10px] font-mono font-bold uppercase tracking-wider
              transition-all flex items-center justify-center gap-1.5 border
              ${isActive
                ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }
            `}
          >
            <i className={`fa-solid ${mode.icon} text-[10px] ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
