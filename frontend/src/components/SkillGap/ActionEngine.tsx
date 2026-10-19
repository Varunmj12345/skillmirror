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
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                    Smart Action Plan
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Breakdown */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Next 7 Days Intensity</h4>
                            <span className="px-2 py-0.5 bg-zinc-950 text-amber-400 font-mono text-[10px] font-bold rounded border border-zinc-800">
                                {plan.daily_commitment || 0} HRS / DAY
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(plan.weekly_breakdown || []).map((day, i) => (
                                <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-3 hover:border-zinc-700 transition-all cursor-default group">
                                    <div className="text-[10px] font-mono font-bold text-amber-400 w-10 shrink-0 mt-0.5">{day.day}</div>
                                    <p className="text-xs text-zinc-300 leading-snug group-hover:text-white transition-colors">{day.task}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-flask-vial text-amber-400"></i> Project Recommendations
                            </h4>
                            <div className="space-y-2.5">
                                {(plan.projects || []).map((proj, i) => (
                                    <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl group hover:border-zinc-700 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">{proj.name}</span>
                                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                                proj.difficulty === 'Advanced' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                proj.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            }`}>
                                                {proj.difficulty}
                                            </span>
                                        </div>
                                        {proj.description && <p className="text-[10px] font-mono text-zinc-500 line-clamp-1 italic">{proj.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-certificate text-amber-400"></i> Certification Roadmap
                            </h4>
                            <div className="space-y-2.5">
                                {(plan.certifications || []).map((cert, i) => (
                                    <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-zinc-200">{cert.name}</span>
                                            <i className="fa-solid fa-award text-amber-400 text-xs"></i>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 font-mono text-[9px]">
                                            <span className="text-zinc-400 uppercase">{cert.provider}</span>
                                            <span className="w-1 h-1 rounded-sm bg-zinc-700"></span>
                                            <span className="text-zinc-500 uppercase">{cert.duration || '4-6 Weeks'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Call */}
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 h-full flex flex-col items-center justify-center text-center space-y-5">
                        <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 text-xl shrink-0">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-2">Bridge the Competency Gap</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                Automatically push detected delta skills to your personalized roadmap for structured milestones.
                            </p>
                        </div>
                        <button
                            onClick={() => onStartLearning('Roadmap Update')}
                            className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                            <span>Start Learning Track</span>
                            <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            Success rate increases 40% with structured tracking
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionEngine;
