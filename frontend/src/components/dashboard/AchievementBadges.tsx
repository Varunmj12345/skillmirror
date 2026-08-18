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
    <div className="glass-panel p-6 border-white/5 bg-slate-900/40 sm-card relative overflow-hidden group">
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <i className="fa-solid fa-medal text-[10px] text-amber-500 animate-[pulse_2s_infinite]"></i>
        </div>
        Achievement Badges
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {ALL_MILESTONES.map((m, i) => {
          const isUnlocked = earnedTypes.has(m.badge_type) || badges.some(b => b.title === m.title);
          return (
            <div
              key={i}
              className={`p-3 rounded-2xl border transition-all ${
                isUnlocked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  <i className={`fa-solid ${isUnlocked ? m.icon : 'fa-lock'}`}></i>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-xs font-bold truncate ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                    {isUnlocked ? '✓ ' : '🔒 '}{m.title}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{m.criteria}</p>
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
