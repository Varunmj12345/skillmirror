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

    const colorMap: Record<string, { stroke: string; glow: string; text: string }> = {
        indigo: { stroke: '#6366f1', glow: 'rgba(99,102,241,0.3)', text: 'text-indigo-400' },
        emerald: { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', text: 'text-emerald-400' },
        amber: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-400' },
        sky: { stroke: '#38bdf8', glow: 'rgba(56,189,248,0.3)', text: 'text-sky-400' },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
                <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
                    <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={STROKE} />
                    <circle
                        cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
                        fill="none" stroke={c.stroke} strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ filter: `drop-shadow(0 0 6px ${c.glow})`, transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-black ${c.text}`}>{score}</span>
                </div>
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">{label}</span>
        </div>
    );
}

const ICONS: Record<string, string> = {
    'verb': 'fa-bolt',
    'bullet': 'fa-list',
    'metric': 'fa-chart-line',
    'summary': 'fa-align-left',
    'keyword': 'fa-key',
};

const ATSScorePanel: React.FC<Props> = ({ data, loading, onAnalyze }) => {
    return (
        <div className="glass-panel p-6 border-slate-800/50">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-50 flex items-center gap-2">
                        <i className="fa-solid fa-robot text-emerald-400 text-xs"></i>
                        ATS Optimization Engine
                    </h3>
                    {data && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                            Target: <span className="text-indigo-400">{data.target_job}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={onAnalyze}
                    disabled={loading}
                    className="text-[10px] font-black px-4 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl uppercase tracking-widest hover:bg-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i> : <i className="fa-solid fa-magnifying-glass text-[10px]"></i>}
                    {loading ? 'Scanning...' : 'Run ATS Scan'}
                </button>
            </div>

            {!data ? (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 text-2xl">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Run an ATS scan to see your optimization scores</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Score rings row */}
                    <div className="flex justify-around py-4 px-2 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                        <ScoreRing score={data.ats_score} label="ATS Score" color="indigo" />
                        <ScoreRing score={data.keyword_score} label="Keyword Match" color="emerald" />
                        <ScoreRing score={data.formatting_score} label="Formatting" color="amber" />
                        <ScoreRing score={data.readability_score} label="Readability" color="sky" />
                    </div>

                    {/* Heatmap Section */}
                    <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/60 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-layer-group text-indigo-400"></i> Keyword Coverage Heatmap
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { key: 'technical', label: 'Technical Core', color: 'bg-indigo-500', value: data.heatmap?.technical || 0 },
                                { key: 'soft', label: 'Soft Skills', color: 'bg-emerald-500', value: data.heatmap?.soft || 0 },
                                { key: 'tools', label: 'Tools & Ecosystem', color: 'bg-amber-500', value: data.heatmap?.tools || 0 },
                            ].map(cluster => (
                                <div key={cluster.key} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-400">{cluster.label}</span>
                                        <span className="text-slate-200">{cluster.value}% Match</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${cluster.color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]`} 
                                            style={{ width: `${cluster.value}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Critical Gaps */}
                    {data.missing_critical?.length > 0 && (
                        <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                            <h5 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <i className="fa-solid fa-circle-exclamation"></i> Critical Skill Gaps
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {data.missing_critical.map(gap => (
                                    <span key={gap} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-bold text-rose-300">
                                        {gap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overall verdict */}
                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${data.ats_score >= 80 ? 'bg-emerald-500/5 border-emerald-500/20' : data.ats_score >= 60 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <i className={`fa-solid ${data.ats_score >= 80 ? 'fa-circle-check text-emerald-400' : data.ats_score >= 60 ? 'fa-circle-exclamation text-amber-400' : 'fa-circle-xmark text-rose-400'} text-sm`}></i>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${data.ats_score >= 80 ? 'text-emerald-400' : data.ats_score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {data.ats_score >= 80 ? 'ATS Ready' : data.ats_score >= 60 ? 'Needs Improvement' : 'Critical Issues Found'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {data.ats_score >= 80 ? 'Your resume passes most ATS filters.' : 'Address the suggestions below to improve your score.'}
                            </p>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Improvement Actions</h4>
                        <div className="space-y-2">
                            {data.suggestions.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="w-6 h-6 mt-0.5 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-triangle-exclamation text-rose-400 text-[9px]"></i>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">{s}</p>
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
