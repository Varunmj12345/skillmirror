import React from 'react';

interface AdaptiveDifficultyProps {
  level: 'beginner' | 'intermediate' | 'advanced';
}

const AdaptiveDifficulty: React.FC<AdaptiveDifficultyProps> = ({ level }) => {
  const config = {
    beginner: { label: 'Foundational', color: 'text-emerald-400', dot: 'bg-emerald-500' },
    intermediate: { label: 'Intermediate', color: 'text-amber-400', dot: 'bg-amber-500' },
    advanced: { label: 'Advanced', color: 'text-rose-400', dot: 'bg-rose-500' },
  };

  const { label, color, dot } = config[level] || config.intermediate;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 border border-zinc-800 bg-zinc-950">
      <div className={`w-1.5 h-1.5 ${dot}`} />
      <span className={`text-[10px] font-mono uppercase tracking-widest ${color}`}>{label}</span>
    </div>
  );
};

export default AdaptiveDifficulty;

