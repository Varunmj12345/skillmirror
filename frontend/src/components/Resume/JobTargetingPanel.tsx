import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

interface JDAnalysis {
    match_pct: number;
    missing_skills: string[];
    suggestions: string[];
}

const JobTargetingPanel: React.FC = () => {
    const [jd, setJD] = useState('');
    const [loading, setLoading] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [result, setResult] = useState<JDAnalysis | null>(null);

    const handleCompare = async () => {
        if (!jd.trim()) return;
        setLoading(true);
        try {
            // Use existing extract + compare endpoints
            const res = await apiClient.post('/api/skills/extract/', { text: jd }) as any;
            const extracted: string[] = res.skills || [];

            // Fetch user skills from resume status
            const statusRes = await apiClient.get('/api/skills/resume/status/') as any;
            const userSkills: string[] = (statusRes.skills || []).map((s: string) => s.toLowerCase());

            const missing = extracted.filter(s => !userSkills.includes(s.toLowerCase()));
            const matched = extracted.filter(s => userSkills.includes(s.toLowerCase()));
            const matchPct = extracted.length > 0 ? Math.round((matched.length / extracted.length) * 100) : 0;

            setResult({
                match_pct: matchPct,
                missing_skills: missing.slice(0, 10),
                suggestions: [
                    `Add ${missing.slice(0, 3).join(', ')} to your skills section.`,
                    'Quantify your achievements with specific numbers.',
                    'Mirror the exact phrasing from the job description.',
                ]
            });
        } catch { }
        finally { setLoading(false); }
    };

    const handleOptimize = async () => {
        if (!result || !jd.trim()) return;
        setOptimizing(true);
        try {
            await apiClient.post('/api/skills/resume/ai-improve/', {
                action: 'improve',
                content: jd,
                role: 'target role'
            });
        } catch { }
        finally { setOptimizing(false); }
    };

    const matchColor = !result ? '' : result.match_pct >= 75 ? 'text-emerald-400' : result.match_pct >= 50 ? 'text-amber-400' : 'text-rose-400';
    const matchBg = !result ? '' : result.match_pct >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : result.match_pct >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

    return (
        <div className="glass-panel p-6 border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-50 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-bullseye text-rose-400 text-xs"></i>
                Job Targeting Mode
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-5">
                Paste a job description to see how well your resume matches
            </p>

            <div className="space-y-4">
                <textarea
                    value={jd}
                    onChange={e => setJD(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-700 outline-none focus:border-indigo-500/50 resize-none transition-all"
                />

                <button
                    onClick={handleCompare}
                    disabled={loading || !jd.trim()}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-[11px] font-black text-slate-300 uppercase tracking-widest rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
                    {loading ? 'Analyzing...' : 'Compare with My Resume'}
                </button>

                {result && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {/* Match Score */}
                        <div className={`p-5 rounded-2xl border ${matchBg} flex items-center gap-6`}>
                            <div className="text-center shrink-0">
                                <div className={`text-4xl font-black ${matchColor}`}>{result.match_pct}%</div>
                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Match</div>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${result.match_pct >= 75 ? 'bg-emerald-500' : result.match_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                        style={{ width: `${result.match_pct}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500">
                                    {result.match_pct >= 75 ? 'Excellent match — you are a strong candidate.' : result.match_pct >= 50 ? 'Good match — a few improvements can make you stand out.' : 'Low match — significant skill gaps detected.'}
                                </p>
                            </div>
                        </div>

                        {/* Missing Skills */}
                        {result.missing_skills.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Missing Skills ({result.missing_skills.length})</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_skills.map(s => (
                                        <span key={s} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black rounded-lg uppercase tracking-tight">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Suggested Improvements</h4>
                            <div className="space-y-2">
                                {result.suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                                        <i className="fa-solid fa-arrow-right text-indigo-400 text-[9px] mt-0.5 shrink-0"></i>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Optimize CTA */}
                        <button
                            onClick={handleOptimize}
                            disabled={optimizing}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            {optimizing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            Optimize for This Job
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobTargetingPanel;
