import React from 'react';

interface SkillHeatmapProps {
    skills: { name: string; demand: number; match: number }[];
}

const SkillHeatmap: React.FC<SkillHeatmapProps> = ({ skills }) => {
    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-fire-flame-curved text-orange-400"></i>
                    Skill Demand Heatmap
                </h2>
                <span className="text-[9px] font-bold text-slate-500">Target Role Intelligence</span>
            </div>

            <div className="space-y-4">
                {skills.map((skill, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-slate-200">{skill.name}</span>
                            <div className="flex gap-2 text-[8px] font-black uppercase tracking-tighter">
                                <span className="text-orange-400">Demand: {skill.demand}%</span>
                                <span className="text-slate-500">Match: {skill.match}%</span>
                            </div>
                        </div>
                        <div className="h-3 flex gap-0.5 rounded-sm overflow-hidden border border-slate-900 shadow-inner">
                            <div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-1000" style={{ width: `${skill.demand}%` }} />
                            <div className="flex-1 bg-slate-900" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/60">
                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-lightbulb text-amber-400 text-xs mt-1" />
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        Market trends indicate a <span className="text-white font-bold">22% surge</span> in demand for these core technologies in the coming quarter.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SkillHeatmap;
