import React, { useState } from 'react';
import { ActionPlan, Project, Certification } from './types';

interface ActionEngineProps {
    plan?: ActionPlan;
    onStartLearning: (skill: string) => void;
}

const ActionEngine: React.FC<ActionEngineProps> = ({ plan, onStartLearning }) => {
    const [loading, setLoading] = useState(false);

    if (!plan) return null;

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <i className="fa-solid fa-bolt-lightning text-sm"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-50 tracking-tight">Smart Action Plan</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Breakdown */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel p-6 border-slate-800/50">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Next 7 Days Intensity</h4>
                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-md">
                                {plan.daily_commitment || 0} HRS / DAY
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(plan.weekly_breakdown || []).map((day, i) => (
                                <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-3 hover:border-indigo-500/30 transition-all cursor-default group">
                                    <div className="text-[10px] font-black text-indigo-500 w-10 shrink-0 mt-0.5">{day.day}</div>
                                    <p className="text-[11px] text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">{day.task}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-panel p-6 border-slate-800/50">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-flask-vial text-sky-400"></i> Project Recommendations
                            </h4>
                            <div className="space-y-3">
                                {(plan.projects || []).map((proj, i) => (
                                    <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg group hover:bg-slate-800/50 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[11px] font-bold text-slate-200 group-hover:text-sky-400 transition-colors">{proj.name}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${proj.difficulty === 'Advanced' ? 'bg-rose-500/10 text-rose-400' :
                                                proj.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                {proj.difficulty}
                                            </span>
                                        </div>
                                        {proj.description && <p className="text-[10px] text-slate-500 line-clamp-1 italic">{proj.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-6 border-slate-800/50">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-certificate text-amber-400"></i> Certification Roadmap
                            </h4>
                            <div className="space-y-3">
                                {(plan.certifications || []).map((cert, i) => (
                                    <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/30 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-slate-200">{cert.name}</span>
                                            <i className="fa-solid fa-award text-amber-500/50 text-xs"></i>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase">{cert.provider}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase">{cert.duration || '4-6 Weeks'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Call */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-8 border-indigo-500/20 bg-indigo-500/5 h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse">
                            <i className="fa-solid fa-graduation-cap text-3xl"></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-50 mb-2">Ready to Bridge the Gap?</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-tighter">
                                Automatically add these targeted skills to your personalized roadmap and start tracked learning sessions.
                            </p>
                        </div>
                        <button
                            onClick={() => onStartLearning('Roadmap Update')}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            Start Learning Now
                            <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </button>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                            Success probability increases by 40% with structured tracking
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionEngine;
