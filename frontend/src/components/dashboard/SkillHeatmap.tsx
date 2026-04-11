import React from 'react';

interface SkillHeatmapProps {
  skills: { name: string; demand: number; match: number }[];
}

const SkillHeatmap: React.FC<SkillHeatmapProps> = ({ skills }) => {
  return (
    <div className="glass-panel p-6 border-white/5 bg-slate-900/40 sm-card relative overflow-hidden group">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <i className="fa-solid fa-fire-flame-curved text-[10px] text-orange-400"></i>
          </div>
          Skill Demand Matrix
        </h2>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Market IQ</span>
      </div>

      <div className="space-y-6 relative z-10">
        {skills.map((skill, i) => (
          <div key={i} className="space-y-2.5 group/skill">
            <div className="flex justify-between items-end">
              <span className="text-xs font-black text-white tracking-tight group-hover/skill:text-orange-300 transition-colors uppercase">{skill.name}</span>
              <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest">
                <span className="text-orange-400/80">Demand: {skill.demand}%</span>
                <span className="text-slate-500">Match: {skill.match}%</span>
              </div>
            </div>
            
            <div className="h-2 flex gap-1 rounded-full overflow-hidden bg-slate-950/50 border border-white/5 p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-1000 ease-out relative overflow-hidden" 
                style={{ width: `${skill.demand}%` }} 
              >
                {/* Internal pulse sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/skill:animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-orange-500/[0.02] border border-orange-500/10">
          <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-lightbulb text-[10px] text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Market trends indicate a <span className="text-white font-black">22% surge</span> in demand for these technologies in the coming quarter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillHeatmap;

