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
        <div className="mt-8 p-6 lg:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden text-white">
            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                                Learning Path Pro
                            </h3>
                        </div>
                        <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <p className="text-zinc-400 text-xs mb-5 leading-relaxed font-mono">
                                AI has synthesized a sequenced learning schedule targeted directly at your detected gaps.
                            </p>
                            <div className="grid grid-cols-2 gap-4 font-mono">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white">{data.estimated_time}</span>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Est. Duration</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-amber-400">3-4 WEEKS</span>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Target Pace</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-link text-[10px] text-amber-400"></i> Skill Dependencies
                        </h4>
                        <div className="space-y-2.5 font-mono text-[10px]">
                            <div className="flex items-center gap-3">
                                <span className="text-zinc-300">Auth Module</span>
                                <div className="h-px flex-1 bg-zinc-800 relative">
                                    <i className="fa-solid fa-chevron-right absolute right-0 top-1/2 -translate-y-1/2 text-[6px] text-zinc-600"></i>
                                </div>
                                <span className="text-zinc-500">Node API</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-zinc-300">Next.js</span>
                                <div className="h-px flex-1 bg-zinc-800 relative">
                                    <i className="fa-solid fa-chevron-right absolute right-0 top-1/2 -translate-y-1/2 text-[6px] text-zinc-600"></i>
                                </div>
                                <span className="text-zinc-500">Redux State</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-2/3 grid grid-cols-1 gap-8">
                    {/* Roadmap Phases */}
                    {data.roadmap && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                    Phase Progression
                                </h4>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    {completedPhases.size} / {data.roadmap.length} Phases Complete
                                </span>
                            </div>

                            <div className="relative space-y-0">
                                {/* Connection Line */}
                                <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-zinc-800"></div>

                                {data.roadmap.map((phase: RoadmapPhase, idx: number) => {
                                    const isLocked = idx > 0 && !completedPhases.has(idx - 1);
                                    const isDone = completedPhases.has(idx);

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative pl-10 pb-7 transition-all duration-300 ${isLocked ? 'opacity-40' : 'opacity-100'}`}
                                        >
                                            {/* Step Hub */}
                                            <div
                                                onClick={() => !isLocked && togglePhase(idx)}
                                                className={`absolute left-0 top-1 w-4 h-4 rounded-sm border z-10 cursor-pointer transition-all flex items-center justify-center ${
                                                    isDone
                                                        ? 'bg-emerald-400 border-emerald-400 text-zinc-950'
                                                        : isLocked
                                                        ? 'bg-zinc-900 border-zinc-700'
                                                        : 'bg-zinc-950 border-amber-400'
                                                }`}
                                            >
                                                {isDone && <i className="fa-solid fa-check text-[8px]"></i>}
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h5 className={`text-xs font-bold mb-2 transition-colors ${isDone ? 'text-zinc-500 line-through' : isLocked ? 'text-zinc-600' : 'text-zinc-100'}`}>
                                                        {phase.name}
                                                    </h5>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {phase.skills.map((skill: string) => (
                                                            <span
                                                                key={skill}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                                                    isDone
                                                                        ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                                                        : isLocked
                                                                        ? 'bg-zinc-950 border-zinc-800 text-zinc-600'
                                                                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                                                                }`}
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {!isLocked && !isDone && (
                                                    <div className="flex flex-col items-end shrink-0 font-mono">
                                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Est Duration</span>
                                                        <span className="text-xs font-bold text-amber-400">2.5 Weeks</span>
                                                    </div>
                                                )}
                                                {isLocked && (
                                                    <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[10px]">
                                                        <i className="fa-solid fa-lock text-[9px]"></i>
                                                        <span className="uppercase tracking-widest">Locked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800">
                        <div>
                            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                Recommended Courses
                            </h4>
                            <div className="space-y-2.5">
                                {data.courses.map((c: Course, i: number) => (
                                    <a
                                        key={i}
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-amber-400 transition-colors">{c.name}</span>
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">{c.platform} • {c.level}</span>
                                        </div>
                                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-zinc-600 group-hover:text-amber-400 transition-colors"></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                Hands-on Projects
                            </h4>
                            <div className="space-y-2.5">
                                {data.projects.map((p: Project, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
                                        <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 text-xs shrink-0">
                                            <i className="fa-solid fa-code"></i>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-zinc-200 truncate">{p.name}</span>
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">{p.difficulty}</span>
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
