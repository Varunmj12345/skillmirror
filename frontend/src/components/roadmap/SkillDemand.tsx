import React from 'react';

interface SkillDemandProps {
    demand: Record<string, string>;
}

const SkillDemand: React.FC<SkillDemandProps> = ({ demand }) => {
    if (!demand || Object.keys(demand).length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(demand).map(([skill, level]) => (
                <div key={skill} className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                    <span className="text-[9px] font-bold text-slate-400">{skill}</span>
                    <span className="text-[9px]">{level}</span>
                </div>
            ))}
        </div>
    );
};

export default SkillDemand;
