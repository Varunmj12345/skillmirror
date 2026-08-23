import React from 'react';

interface AchievementBadgesProps {
  badges: { title: string; badge_type: string; earned_at: string }[];
}

const ALL_MILESTONES = [
  { title: "First Interview", badge_type: "mock_interview", criteria: "Complete your first mock interview", icon: "fa-microphone" },
  { title: "Skill Builder", badge_type: "skill_builder", criteria: "Complete your first learning activity", icon: "fa-hammer" },
  { title: "Resume Ready", badge_type: "resume_ready", criteria: "Complete resume analysis", icon: "fa-file-check" },
  { title: "Problem Solver", badge_type: "problem_solver", criteria: "Complete your first real-world project task", icon: "fa-code-branch" },
];

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ badges = [] }) => {
  const earnedTypes = new Set(badges.map(b => b.badge_type));

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-light-card dark:shadow-none relative overflow-hidden group">
      <h2 className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <i className="fa-solid fa-medal text-[10px] text-amber-600 dark:text-amber-500 animate-[pulse_2s_infinite]"></i>
        </div>
        Achievement Badges
      </h2>

      <div className="grid grid-cols-2 gap-2.5">
        {ALL_MILESTONES.map((m, i) => {
          const isUnlocked = earnedTypes.has(m.badge_type) || badges.some(b => b.title === m.title);
          return (
            <div
              key={i}
              className={`p-3 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-amber-50/80 border-amber-200/80 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 shadow-light-sm dark:shadow-none'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/80 text-slate-400 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isUnlocked ? 'bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-400 shadow-sm' : 'bg-slate-200/70 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-300/60 dark:border-slate-800'
                  }`}
                >
                  <i className={`fa-solid ${isUnlocked ? m.icon : 'fa-lock'}`}></i>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-xs font-mono font-bold truncate ${isUnlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {isUnlocked ? '✓ ' : '🔒 '}{m.title}
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 truncate mt-0.5">{m.criteria}</p>
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
