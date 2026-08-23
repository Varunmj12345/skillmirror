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
            <div className="rounded-3xl bg-card border border-emerald-300/40 dark:border-emerald-500/20 shadow-light-card dark:shadow-none overflow-hidden">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i> Matched Competencies
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-widest">
                        {matched.length} Skills
                    </span>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {matched.length > 0 ? matched.map((s, i) => (
                            <div key={i} className="group relative flex flex-col p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all cursor-default w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] shadow-sm">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 truncate">{s.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 shadow-sm" style={{ width: `${((s.user_level || 3) / 5) * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Lvl {s.user_level || 3}</span>
                                </div>
                                <div className="mt-2 text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-tighter">{s.category}</div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic py-4">No significant matches detected yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Missing Skills Panel */}
            <div className="rounded-3xl bg-card border border-rose-300/40 dark:border-rose-500/20 shadow-light-card dark:shadow-none overflow-hidden">
                <div className="p-4 bg-rose-50/80 dark:bg-rose-500/10 border-b border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i> Critical Skill Gaps
                    </h4>
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20 uppercase tracking-widest">
                        {missing.length} Missing
                    </span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {missing.length > 0 ? missing.map((s, i) => (
                            <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-500/30 transition-all group shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.name}</h5>
                                    <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 rounded border border-rose-200 dark:border-rose-500/20">Req Lvl {s.required}</span>
                                </div>
                                <button
                                    onClick={() => window.open(`https://www.coursera.org/search?query=${s.name}`, '_blank')}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-[10px] font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    Bridge Gap <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                                </button>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic py-4 text-center w-full">Perfect! You meet all core requirements.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SkillComparisonPanels;
