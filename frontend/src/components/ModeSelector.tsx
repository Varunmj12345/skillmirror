import React from 'react';

interface ModeSelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  const modes = [
    { id: 'career',   label: 'Strategy', icon: 'fa-chess-knight' },
    { id: 'learning', label: 'Learning', icon: 'fa-book-open' },
    { id: 'quick',    label: 'Quick',    icon: 'fa-bolt-lightning' },
  ];

  return (
    <div className="flex gap-2 mb-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
      {modes.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              relative flex flex-1 items-center justify-center gap-2 py-2.5
              rounded-[14px] text-[11px] font-black uppercase tracking-widest select-none
              transition-all duration-300 ease-out z-10 overflow-hidden group
              ${isActive
                ? 'text-white shadow-lg'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {/* Active Background */}
            {isActive && (
              <div aria-hidden className="absolute inset-0 bg-brand-neural/20 border border-brand-neural/30 rounded-[14px] pointer-events-none shadow-inner" />
            )}
            
            {/* Active Soft Shimmer Sweep */}
            {isActive && (
              <span aria-hidden className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
              </span>
            )}
            
            <i className={`fa-solid ${mode.icon} text-xs transition-transform duration-300 ${isActive ? 'text-brand-neural scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110'}`} />
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
