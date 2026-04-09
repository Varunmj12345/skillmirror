import React from 'react';

interface AchievementBadgesProps {
    badges: { title: string; badge_type: string; earned_at: string }[];
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ badges }) => {
    return (
        <div className="glass-panel p-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <i className="fa-solid fa-medal text-amber-500"></i>
                Achievement Badges
            </h2>

            <div className="flex flex-wrap gap-4">
                {badges.length > 0 ? (
                    badges.map((badge, i) => (
                        <div key={i} className="group relative">
                            <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-xl text-amber-400 shadow-lg group-hover:border-amber-500/50 group-hover:scale-110 transition-all cursor-help overflow-hidden">
                                <i className={`fa-solid ${badge.badge_type === 'rising_talent' ? 'fa-rocket' :
                                        badge.badge_type === 'skill_builder' ? 'fa-hammer' :
                                            'fa-star'
                                    }`} />
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                {badge.title}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full flex flex-col items-center py-4 border border-dashed border-slate-800 rounded-2xl">
                        <i className="fa-solid fa-lock text-slate-700 text-xl mb-2" />
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">Complete activities to unlock badges</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementBadges;
