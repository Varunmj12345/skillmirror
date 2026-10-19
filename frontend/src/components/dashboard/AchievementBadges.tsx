import React from 'react';

interface AchievementBadgesProps {
  badges: { title: string; badge_type: string; earned_at: string }[];
}

const ALL_MILESTONES = [
  { title: 'First Interview', badge_type: 'mock_interview', criteria: 'Complete first mock interview', icon: 'fa-microphone' },
  { title: 'Skill Builder', badge_type: 'skill_builder', criteria: 'Complete learning activity', icon: 'fa-hammer' },
  { title: 'Resume Ready', badge_type: 'resume_ready', criteria: 'Complete resume analysis', icon: 'fa-file-check' },
  { title: 'Problem Solver', badge_type: 'problem_solver', criteria: 'Complete project milestone', icon: 'fa-code-branch' },
];

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ badges = [] }) => {
  const earnedTypes = new Set(badges.map(b => b.badge_type));

  return (
    <div className="p-6 border border-zinc-800 bg-zinc-900/90 relative">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 bg-amber-500" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Achievement Badges
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          {badges.length}/{ALL_MILESTONES.length} UNLOCKED
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ALL_MILESTONES.map((m, i) => {
          const isUnlocked = earnedTypes.has(m.badge_type) || badges.some(b => b.title === m.title);
          return (
            <div
              key={i}
              className={`p-3 border transition-colors ${
                isUnlocked
                  ? 'border-amber-500/40 bg-zinc-950 text-white'
                  : 'border-zinc-800/60 bg-zinc-950/40 text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 border flex items-center justify-center text-xs shrink-0 ${
                    isUnlocked
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                  }`}
                >
                  <i className={`fa-solid ${isUnlocked ? m.icon : 'fa-lock'} text-[10px]`} />
                </div>
                <div className="overflow-hidden">
                  <p className={`text-[11px] font-mono font-medium truncate ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                    {isUnlocked ? '✓ ' : ''}{m.title}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">{m.criteria}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;

