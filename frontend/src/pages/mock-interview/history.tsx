import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService } from '../../services/interviewService';

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

    return (
        <Layout>
            <Head>
                <title>Interview History • SkillMirror</title>
                <link rel="stylesheet" href="/styles/mock-interview.css" />
            </Head>

            <div className="interview-container">
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">Interview <span className="text-indigo-500">History</span></h1>
                        <p className="text-slate-500 mt-1">Review your past performance and growth.</p>
                    </div>
                    <button
                        onClick={() => router.push('/mock-interview')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        New Interview
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-24 text-center glass-panel border-dashed border-slate-800">
                        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-700 text-3xl">
                            <i className="fa-solid fa-microphone-slash"></i>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">No interviews yet</h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start your first AI mock interview to begin tracking your readiness.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="glass-panel p-6 border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                onClick={() => router.push(`/mock-interview/result?id=${item.id}`)}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                                        <span className="text-xs font-bold text-indigo-400 capitalize">{item.experience_level}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">{item.role}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                <i className="fa-solid fa-calendar mr-1"></i> {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                <i className="fa-solid fa-layer-group mr-1"></i> {item.interview_type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className={`text-2xl font-black ${item.total_score >= 70 ? 'text-emerald-500' : item.total_score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {Math.round(item.total_score)}%
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Score</div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-700 group-hover:text-indigo-500 transition-colors"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @import url('/styles/mock-interview.css');
            `}</style>
        </Layout>
    );
};

export default withAuth(MockInterviewHistory);
