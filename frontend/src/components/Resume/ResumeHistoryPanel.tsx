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
        <div className="glass-panel p-6 border-slate-800/50 animate-pulse">
            <div className="h-5 w-40 bg-slate-800 rounded mb-4" />
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-900 rounded-xl mb-2" />)}
        </div>
    );

    return (
        <div className="glass-panel p-6 border-slate-800/50">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-50 flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-indigo-400 text-xs"></i>
                    Resume History
                </h3>
                {comparing.length === 2 && (
                    <button className="text-[10px] font-black px-3 py-1.5 bg-indigo-600 text-white rounded-lg uppercase tracking-widest hover:bg-indigo-500 transition-all">
                        Compare Selected
                    </button>
                )}
            </div>

            {!history.length ? (
                <div className="py-10 text-center text-slate-600 text-[11px] font-bold uppercase tracking-widest">
                    <i className="fa-solid fa-folder-open text-2xl mb-3 block"></i>
                    No resume history yet
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-4 pb-2 border-b border-slate-800">
                        <span className="col-span-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">File</span>
                        <span className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Date</span>
                        <span className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">ATS</span>
                        <span className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Match</span>
                        <span className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">Actions</span>
                    </div>

                    {history.map((entry, idx) => {
                        const diff = getScoreDiff(idx);
                        const isComparing = comparing.includes(entry.id);
                        return (
                            <div key={entry.id} className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl border transition-all ${isComparing ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'}`}>
                                <div className="col-span-4 flex items-center gap-2">
                                    <i className="fa-solid fa-file-pdf text-rose-400/60 text-xs shrink-0"></i>
                                    <span className="text-[11px] font-bold text-slate-200 truncate">{entry.file_name}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-[10px] text-slate-500">{new Date(entry.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-xs font-black ${entry.ats_score >= 80 ? 'text-emerald-400' : entry.ats_score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {Math.round(entry.ats_score)}%
                                        </span>
                                        {diff !== null && (
                                            <span className={`text-[8px] font-black ${diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {diff > 0 ? '↑' : '↓'} {Math.abs(Math.round(diff))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span className="text-xs font-black text-indigo-400">{Math.round(entry.job_match_score)}%</span>
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-1">
                                    <button onClick={() => onView(entry)} title="View" className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all">
                                        <i className="fa-solid fa-eye text-[10px]"></i>
                                    </button>
                                    <button onClick={() => toggleCompare(entry.id)} title="Compare" className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isComparing ? 'bg-indigo-500/30 text-indigo-400' : 'bg-slate-800 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'}`}>
                                        <i className="fa-solid fa-code-compare text-[10px]"></i>
                                    </button>
                                    <button onClick={() => handleDelete(entry.id)} title="Delete" className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all">
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
