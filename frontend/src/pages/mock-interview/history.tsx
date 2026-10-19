import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService } from '../../services/interviewService';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const MockInterviewHistory: React.FC = () => {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await interviewService.getHistory();
            setHistory(res as unknown as any[]);
        } catch (err) {
            console.error('Failed to load history', err);
        } finally {
            setLoading(false);
        }
    };

    const avgScore = history.length > 0
        ? Math.round(history.reduce((acc, curr) => acc + (curr.total_score || curr.score || 0), 0) / history.length)
        : 0;

    return (
        <Layout>
            <Head>
                <title>Interview Archive • SkillMirror OS</title>
            </Head>

            <CyberPageShell
                moduleCode="INT-HIST"
                section="AI CAREER ENGINE"
                badge="ARCHIVE LOGS: ACTIVE"
                title="INTERVIEW ARCHIVE"
                subtitle="Historical telemetry, performance logs, and past simulation evaluations."
                stats={
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <PageStatChip label="Total Sessions" value={history.length} color="slate" icon="fa-folder-closed" />
                        <PageStatChip label="Mean Score" value={avgScore ? `${avgScore}%` : '—'} color="emerald" icon="fa-chart-line" />
                    </div>
                }
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 font-mono space-y-6">
                <div className="flex justify-between items-center pb-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Historical Logs</h2>
                    </div>
                    <button
                        onClick={() => router.push('/mock-interview')}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus text-[10px]"></i>
                        <span>New Simulation</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-16 text-center p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 text-xl">
                            <i className="fa-solid fa-microphone-slash"></i>
                        </div>
                        <h3 className="text-zinc-200 font-bold text-sm uppercase">No Simulated Sessions Found</h3>
                        <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                            Launch your initial AI mock interview to generate competency benchmarks.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 sm:p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                                onClick={() => router.push(`/mock-interview/result?id=${item.id}`)}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-amber-400 uppercase">{item.experience_level || 'Mid'}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-zinc-100 font-bold text-sm group-hover:text-amber-400 transition-colors truncate">
                                            {item.role || item.job_role || 'General Engineering'}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                                            <span>
                                                <i className="fa-solid fa-calendar mr-1"></i> {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <span>
                                                <i className="fa-solid fa-layer-group mr-1"></i> {item.interview_type || 'Mixed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                                    <div className="text-left md:text-right">
                                        <div className={`text-xl font-bold tabular-nums ${
                                            (item.total_score || item.score || 0) >= 70 
                                                ? 'text-emerald-400' 
                                                : (item.total_score || item.score || 0) >= 40 
                                                ? 'text-amber-400' 
                                                : 'text-rose-400'
                                        }`}>
                                            {Math.round(item.total_score || item.score || 0)}%
                                        </div>
                                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Score</div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-zinc-600 group-hover:text-zinc-300 transition-colors text-xs"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default withAuth(MockInterviewHistory);
