import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

interface ResumeHistoryEntry {
    id: number;
    file_name: string;
    created_at: string;
    ats_score: number;
    job_match_score: number;
}

interface Props {
    onView: (entry: ResumeHistoryEntry) => void;
    refreshTrigger?: number;
}

const ResumeHistoryPanel: React.FC<Props> = ({ onView, refreshTrigger }) => {
    const [history, setHistory] = useState<ResumeHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [comparing, setComparing] = useState<number[]>([]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/skills/resume/history/') as any;
            setHistory(res || []);
        } catch { setHistory([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHistory(); }, [refreshTrigger]);

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/api/skills/resume/history/${id}/`);
            setHistory(prev => prev.filter(r => r.id !== id));
        } catch { }
    };

    const toggleCompare = (id: number) => {
        setComparing(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev);
    };

    const getScoreDiff = (idx: number) => {
        if (idx === history.length - 1) return null;
        const diff = history[idx].ats_score - history[idx + 1].ats_score;
        return diff;
    };

    if (loading) return (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 animate-pulse">
            <div className="h-4 w-40 bg-zinc-800 rounded mb-4" />
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-950/80 rounded-xl mb-2 border border-zinc-800/60" />)}
        </div>
    );

    return (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                    <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                        Version Telemetry & History
                    </h3>
                </div>
                {comparing.length === 2 && (
                    <button className="text-[10px] font-mono font-bold px-3 py-1 bg-amber-400 text-zinc-950 rounded-lg uppercase tracking-wider hover:bg-amber-300 transition-all">
                        Compare Selected (2)
                    </button>
                )}
            </div>

            {!history.length ? (
                <div className="py-8 text-center text-zinc-500 text-[11px] font-mono uppercase tracking-wider">
                    <i className="fa-solid fa-folder-open text-xl mb-2 block text-zinc-600"></i>
                    No archived telemetry snapshots found
                </div>
            ) : (
                <div className="space-y-1.5">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-3 pb-2 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                        <span className="col-span-5">File Reference</span>
                        <span className="col-span-2 text-center">Timestamp</span>
                        <span className="col-span-2 text-center">ATS Index</span>
                        <span className="col-span-1 text-center">Match</span>
                        <span className="col-span-2 text-right">Actions</span>
                    </div>

                    {history.map((entry, idx) => {
                        const diff = getScoreDiff(idx);
                        const isComparing = comparing.includes(entry.id);
                        return (
                            <div
                                key={entry.id}
                                className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border transition-all text-xs font-mono ${
                                    isComparing
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                                }`}
                            >
                                <div className="col-span-5 flex items-center gap-2 truncate pr-2">
                                    <i className="fa-solid fa-file-lines text-amber-400/80 text-xs shrink-0"></i>
                                    <span className="text-zinc-200 truncate">{entry.file_name}</span>
                                </div>
                                <div className="col-span-2 text-center text-[10px] text-zinc-500">
                                    {new Date(entry.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                </div>
                                <div className="col-span-2 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className={`font-bold tabular-nums ${entry.ats_score >= 80 ? 'text-emerald-400' : entry.ats_score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {Math.round(entry.ats_score)}%
                                        </span>
                                        {diff !== null && (
                                            <span className={`text-[9px] font-mono ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {diff > 0 ? `+${Math.round(diff)}` : Math.round(diff)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-1 text-center font-bold text-zinc-300 tabular-nums">
                                    {Math.round(entry.job_match_score)}%
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-1.5">
                                    <button
                                        onClick={() => onView(entry)}
                                        title="View Artifact"
                                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all"
                                    >
                                        <i className="fa-solid fa-eye text-[10px]"></i>
                                    </button>
                                    <button
                                        onClick={() => toggleCompare(entry.id)}
                                        title="Compare Snapshot"
                                        className={`w-6 h-6 flex items-center justify-center rounded-lg border transition-all ${
                                            isComparing
                                                ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                                                : 'bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-zinc-700'
                                        }`}
                                    >
                                        <i className="fa-solid fa-code-compare text-[10px]"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        title="Purge"
                                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-850 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition-all"
                                    >
                                        <i className="fa-solid fa-trash text-[9px]"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ResumeHistoryPanel;
