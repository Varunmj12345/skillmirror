import React from 'react';

interface AchievementBadgesProps {
  badges: { title: string; badge_type: string; earned_at: string }[];
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ badges }) => {
  return (
    <div className="glass-panel p-6 border-white/5 bg-slate-900/40 sm-card relative overflow-hidden group">
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-8 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <i className="fa-solid fa-medal text-[10px] text-amber-500 animate-[pulse_2s_infinite]"></i>
        </div>
        Achievement Badges
      </h2>

      <div className="flex flex-wrap gap-5">
        {badges.length > 0 ? (
          badges.map((badge, i) => (
            <div key={i} className="group/badge relative sm-tooltip-trigger">
              <div className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-white/5 flex items-center justify-center text-xl text-amber-400 shadow-2xl shadow-black/40 group-hover/badge:border-amber-500/30 group-hover/badge:scale-110 transition-all cursor-help overflow-hidden relative">
                {/* Inner radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-amber-500/5 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                
                <i className={`fa-solid relative z-10 ${badge.badge_type === 'rising_talent' ? 'fa-rocket' :
                    badge.badge_type === 'skill_builder' ? 'fa-hammer' :
                      'fa-star'
                  }`} />
                
                {/* Border shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/badge:animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
              
              {/* Premium Tooltip */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white text-slate-900 text-[10px] font-black rounded-lg shadow-2xl z-50 sm-tooltip pointer-events-none uppercase tracking-widest border border-white/10">
                {badge.title}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
              </div>
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-3">
              <i className="fa-solid fa-lock text-slate-700 text-sm" />
            </div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] text-center max-w-[140px]">
              Complete activities to unlock intelligence badges
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadges;

