import React, { useState } from 'react';
import { AIRecommendationsData, RoadmapPhase, Course, Project } from './types';

interface RecommendationProps {
    data: AIRecommendationsData | null;
}

function AIRecommendations({ data }: RecommendationProps): React.ReactElement | null {
    const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());

    if (!data) return null;

    const togglePhase = (idx: number) => {
        const next = new Set(completedPhases);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setCompletedPhases(next);
    };

    return (
        <div className="mt-8 glass-panel p-8 border-white/10 relative overflow-hidden text-white bg-slate-900/40">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <i className="fa-solid fa-brain text-[200px]"></i>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3 space-y-6">
                    <div>
                        <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <span className="p-2 bg-indigo-500/20 rounded-lg">
                                <i className="fa-solid fa-robot text-indigo-400"></i>
                            </span>
                            Learning Path Pro
                        </h3>
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl backdrop-blur-sm">
                            <p className="text-slate-400 text-[11px] mb-6 leading-relaxed uppercase font-bold tracking-tighter">
                                AI has generated a <span className="text-white">dynamic learning sequence</span> based on your current gaps and daily availability.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-emerald-400">{data.estimated_time}</span>
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Total Est. Duration</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-indigo-400">Apr 15</span>
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Est. Completion</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-link text-[10px]"></i> Skill Dependencies
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-300">Auth Module</span>
                                <div className="h-px flex-1 bg-slate-800 relative">
                                    <i className="fa-solid fa-chevron-right absolute right-0 top-1/2 -translate-y-1/2 text-[6px] text-slate-700"></i>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">Node API</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-300">Next.js</span>
                                <div className="h-px flex-1 bg-slate-800 relative">
                                    <i className="fa-solid fa-chevron-right absolute right-0 top-1/2 -translate-y-1/2 text-[6px] text-slate-700"></i>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">Redux State</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-2/3 grid grid-cols-1 gap-12">
                    {/* Roadmap Phases */}
                    {data.roadmap && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Intelligent Phase Progression</h4>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    {completedPhases.size} / {data.roadmap.length} Phases Done
                                </span>
                            </div>

                            <div className="relative space-y-0">
                                {/* Connection Line */}
                                <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-slate-800"></div>

                                {data.roadmap.map((phase: RoadmapPhase, idx: number) => {
                                    const isLocked = idx > 0 && !completedPhases.has(idx - 1);
                                    const isDone = completedPhases.has(idx);

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative pl-10 pb-8 transition-all duration-500 ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}
                                        >
                                            {/* Step Hub */}
                                            <div
                                                onClick={() => !isLocked && togglePhase(idx)}
                                                className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-slate-900 z-10 cursor-pointer transition-all ${isDone ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                                                        isLocked ? 'bg-slate-700' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                                    }`}
                                            >
                                                {isDone && (
                                                    <i className="fa-solid fa-check absolute -right-6 top-0 text-emerald-400 text-[10px]"></i>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h5 className={`text-sm font-black mb-2 transition-colors ${isDone ? 'text-emerald-400 line-through' : isLocked ? 'text-slate-500' : 'text-slate-100'}`}>
                                                        {phase.name}
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {phase.skills.map((skill: string) => (
                                                            <span key={skill} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border transition-colors ${isDone ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500/70' :
                                                                    isLocked ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-900 border-indigo-500/20 text-indigo-300'
                                                                }`}>
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {!isLocked && !isDone && (
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Phase Time</span>
                                                        <span className="text-xs font-bold text-slate-300">2.5 Weeks</span>
                                                    </div>
                                                )}
                                                {isLocked && (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <i className="fa-solid fa-lock text-[10px]"></i>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Locked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/50">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Recommended Courses</h4>
                            <div className="space-y-3">
                                {data.courses.map((c: Course, i: number) => (
                                    <a
                                        key={i}
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-300 line-clamp-1 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{c.name}</span>
                                            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">{c.platform} • {c.level}</span>
                                        </div>
                                        <i className="fa-solid fa-up-right-from-square text-[10px] text-slate-700 group-hover:text-indigo-400 transition-colors"></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Hands-on Projects</h4>
                            <div className="space-y-3">
                                {data.projects.map((p: Project, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/20 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <i className="fa-solid fa-code text-[10px]"></i>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{p.name}</span>
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{p.difficulty}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIRecommendations;
