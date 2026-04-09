import React from 'react';

interface AdaptiveDifficultyProps {
    level: 'beginner' | 'intermediate' | 'advanced';
}

const AdaptiveDifficulty: React.FC<AdaptiveDifficultyProps> = ({ level }) => {
    const config = {
        beginner: { label: 'Foundational', color: 'emerald', icon: 'fa-seedling' },
        intermediate: { label: 'Intermediate', color: 'indigo', icon: 'fa-rocket' },
        advanced: { label: 'Advanced', color: 'violet', icon: 'fa-brain-circuit' }
    };

    const { label, color, icon } = config[level] || config.intermediate;

    return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg bg-${color}-500/5 border border-${color}-500/20`}>
            <i className={`fa-solid ${icon} text-${color}-400 text-[10px]`}></i>
            <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-300`}>{label}</span>
        </div>
    );
};

export default AdaptiveDifficulty;
