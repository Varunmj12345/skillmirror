import React from 'react';
import { Skill } from './types';

interface PanelsProps {
    matched: Skill[];
    missing: Skill[];
}

function SkillComparisonPanels({ matched, missing }: PanelsProps): React.ReactElement {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Matched Skills Panel */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
                <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>
                        <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                            Matched Competencies
                        </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                        {matched.length} Skills
                    </span>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {matched.length > 0 ? matched.map((s, i) => (
                            <div key={i} className="group relative flex flex-col p-3 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-default w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)]">
                                <span className="text-xs font-bold text-zinc-200 mb-2 truncate">{s.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400" style={{ width: `${((s.user_level || 3) / 5) * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">L{s.user_level || 3}</span>
                                </div>
                                <div className="mt-2 text-[9px] font-mono text-zinc-500 uppercase tracking-wider truncate">{s.category}</div>
                            </div>
                        )) : (
                            <p className="text-xs font-mono text-zinc-500 italic py-4">No significant matches detected yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Missing Skills Panel */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
                <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-rose-400"></span>
                        <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                            Critical Skill Gaps
                        </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">
                        {missing.length} Missing
                    </span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {missing.length > 0 ? missing.map((s, i) => (
                            <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h5 className="text-xs font-bold text-zinc-200">{s.name}</h5>
                                    <span className="text-[9px] font-mono font-bold text-rose-400 px-1.5 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">Req L{s.required}</span>
                                </div>
                                <button
                                    onClick={() => window.open(`https://www.coursera.org/search?query=${s.name}`, '_blank')}
                                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-lg transition-all border border-zinc-700 flex items-center justify-center gap-2"
                                >
                                    Bridge Gap <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                                </button>
                            </div>
                        )) : (
                            <p className="text-xs font-mono text-zinc-500 italic py-4 text-center w-full">All core role requirements met.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SkillComparisonPanels;
