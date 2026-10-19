import React from 'react';

interface ATSData {
    ats_score: number;
    keyword_score: number;
    formatting_score: number;
    readability_score: number;
    target_job: string;
    heatmap: {
        technical: number;
        soft: number;
        tools: number;
    };
    missing_critical: string[];
    suggestions: string[];
}

interface Props {
    data?: ATSData;
    loading?: boolean;
    onAnalyze: () => void;
}

const RING_SIZE = 80;
const STROKE = 6;

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
    const r = (RING_SIZE - STROKE * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    const colorMap: Record<string, { stroke: string; text: string }> = {
        indigo: { stroke: '#f59e0b', text: 'text-amber-400' },
        emerald: { stroke: '#10b981', text: 'text-emerald-400' },
        amber: { stroke: '#e4e4e7', text: 'text-zinc-200' },
        sky: { stroke: '#a1a1aa', text: 'text-zinc-400' },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className="flex flex-col items-center gap-2 font-mono">
            <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
                <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
                    <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" stroke="#27272a" strokeWidth={STROKE} />
                    <circle
                        cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
                        fill="none" stroke={c.stroke} strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${c.text}`}>{score}</span>
                </div>
            </div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center leading-tight">{label}</span>
        </div>
    );
}

const ATSScorePanel: React.FC<Props> = ({ data, loading, onAnalyze }) => {
    return (
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                            ATS Optimization Engine
                        </h3>
                    </div>
                    {data && (
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            Target: <span className="text-amber-400 font-bold">{data.target_job}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={onAnalyze}
                    disabled={loading}
                    className="text-[10px] font-mono font-bold px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-magnifying-glass text-[10px]"></i>}
                    <span>{loading ? 'Scanning...' : 'Run ATS Scan'}</span>
                </button>
            </div>

            {!data ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 text-lg">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Run an ATS scan to see your optimization scores</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Score rings row */}
                    <div className="flex justify-around py-4 px-2 bg-zinc-950 rounded-xl border border-zinc-800">
                        <ScoreRing score={data.ats_score} label="ATS Score" color="indigo" />
                        <ScoreRing score={data.keyword_score} label="Keywords" color="emerald" />
                        <ScoreRing score={data.formatting_score} label="Formatting" color="amber" />
                        <ScoreRing score={data.readability_score} label="Readability" color="sky" />
                    </div>

                    {/* Heatmap Section */}
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3 font-mono">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span> Keyword Coverage Heatmap
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5">
                            {[
                                { key: 'technical', label: 'Technical Core', color: 'bg-amber-400', value: data.heatmap?.technical || 0 },
                                { key: 'soft', label: 'Soft Skills', color: 'bg-emerald-400', value: data.heatmap?.soft || 0 },
                                { key: 'tools', label: 'Tools & Ecosystem', color: 'bg-zinc-400', value: data.heatmap?.tools || 0 },
                            ].map(cluster => (
                                <div key={cluster.key} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-zinc-500 uppercase">{cluster.label}</span>
                                        <span className="text-zinc-300 font-bold">{cluster.value}% Match</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${cluster.color} transition-all duration-1000 ease-out`} 
                                            style={{ width: `${cluster.value}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Critical Gaps */}
                    {data.missing_critical?.length > 0 && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl font-mono">
                            <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-sm bg-rose-400"></span> Critical Skill Gaps
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                                {data.missing_critical.map(gap => (
                                    <span key={gap} className="px-2 py-0.5 bg-zinc-950 border border-rose-500/30 rounded text-[10px] text-rose-300">
                                        {gap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overall verdict */}
                    <div className={`p-3 rounded-xl border flex items-center gap-3 font-mono ${data.ats_score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : data.ats_score >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                        <i className={`fa-solid ${data.ats_score >= 80 ? 'fa-circle-check text-emerald-400' : data.ats_score >= 60 ? 'fa-circle-exclamation text-amber-400' : 'fa-circle-xmark text-rose-400'} text-xs`}></i>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${data.ats_score >= 80 ? 'text-emerald-400' : data.ats_score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {data.ats_score >= 80 ? 'ATS Compliant' : data.ats_score >= 60 ? 'Moderate Optimization' : 'Critical Parser Warnings'}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                {data.ats_score >= 80 ? 'Your resume passes major parsing filters.' : 'Review targeted action items below to boost standing.'}
                            </p>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                        <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Optimization Actions</h4>
                        <div className="space-y-2">
                            {data.suggestions.map((s, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group font-mono">
                                    <div className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 text-[9px] shrink-0 mt-0.5">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-snug group-hover:text-zinc-200 transition-colors">{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ATSScorePanel;
