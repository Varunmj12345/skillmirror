import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService } from '../../services/interviewService';

const QuestionCard: React.FC<{ q: any; index: number }> = ({ q, index }) => {
    const [isExpanded, setIsExpanded] = useState(index === 0);

    return (
        <div className="glass-panel overflow-hidden border-slate-800 mb-6 transition-all hover:border-slate-700">
            <div
                className="p-6 cursor-pointer flex justify-between items-center gap-4 bg-white/[0.02]"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10">QUESTION {index + 1}</span>
                        <span className="text-[9px] font-black uppercase bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-700">{q.category}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${q.score >= 8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                                q.score >= 5 ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                                    'bg-rose-500/10 text-rose-400 border-rose-500/10'
                            }`}>SCORE: {Math.round(q.score)}/10</span>
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-open:hidden">{q.question_text}</h3>
                </div>
                <motion.i
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="fa-solid fa-chevron-down text-slate-600"
                ></motion.i>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-8 space-y-8 border-t border-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black text-white mb-4 line-height-relaxed">{q.question_text}</h3>
                                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Interviewer Intent</p>
                                    <p className="text-sm text-slate-400 italic">"{q.reviewer_intent || "Testing fundamental expertise and practical application."}"</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Answer</p>
                                    </div>
                                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed min-h-[100px]">
                                        {q.user_answer || <span className="text-slate-600 italic">Skipped</span>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Ideal Answer</p>
                                    </div>
                                    <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-sm text-emerald-200/80 leading-relaxed min-h-[100px]">
                                        {q.sample_answer || q.improved_answer || "No sample answer available."}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-3xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI Deep Feedback
                                    </h4>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{q.feedback}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MockInterviewResult: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [interview, setInterview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadResult();
        }
    }, [id]);

    const loadResult = async () => {
        setLoading(true);
        try {
            // Using the new interview-result API
            const res = await interviewService.getInterviewResult(parseInt(id as string));
            const data = res as any;
            setInterview({
                ...data.interview,
                questions: data.questions
            });
        } catch (err) {
            console.error('Failed to load results', err);
            // Fallback
            const res = await interviewService.getDetail(parseInt(id as string));
            setInterview(res as any);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !interview) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Compiling Interview Intelligence...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Interview Report • SkillMirror</title>
                <link rel="stylesheet" href="/styles/mock-interview.css" />
            </Head>

            <div className="interview-container max-w-6xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8"
                >
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-indigo-500/20">
                                {interview.interview_mode?.replace('_', ' ')} MODE
                            </span>
                            <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/5">
                                {interview.difficulty} LEVEL
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Interview <span className="text-indigo-500">Report</span></h1>
                        <p className="text-slate-500 font-medium">{interview.role} • Session generated on {new Date(interview.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="flex items-center gap-8 bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="text-center group">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 group-hover:text-indigo-400 transition-all">Overall Score</p>
                            <div className="text-5xl font-black text-white flex items-baseline gap-1">
                                {Math.round(interview.total_score)}
                                <span className="text-lg text-slate-700">%</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-16 bg-white/5"></div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">Status</p>
                            <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${interview.confidence_level?.includes('High') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                                    interview.confidence_level?.includes('Moderate') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {interview.confidence_level?.split('-')[0] || 'COMPLETED'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Score Breakdown Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Technical Accuracy', score: interview.technical_accuracy, icon: 'fa-code', color: 'indigo' },
                        { label: 'Communication', score: interview.communication_score, icon: 'fa-comments', color: 'emerald' },
                        { label: 'Depth of Knowledge', score: interview.depth_of_knowledge, icon: 'fa-brain', color: 'amber' },
                        { label: 'Structural Clarity', score: interview.clarity_score, icon: 'fa-layer-group', color: 'rose' }
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-6 border-slate-800 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full bg-${m.color}-500 opacity-20`} />
                            <i className={`fa-solid ${m.icon} text-${m.color}-500/40 mb-4 text-xl group-hover:scale-110 transition-transform`}></i>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</h3>
                            <div className="text-3xl font-black text-white mb-3">{Math.round(m.score)}%</div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className={`h-full bg-${m.color}-500 rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.score}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12 mb-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Summary & Insights */}
                        <div className="glass-panel p-10 border-indigo-500/10 bg-indigo-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />

                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                <i className="fa-solid fa-sparkles text-indigo-400"></i> AI Synthesis Report
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-10 font-medium">
                                {interview.ai_summary}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 shadow-inner">
                                    <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-4">
                                        {(interview.strengths || ["Technical Vocabulary", "Structural Organization", "Problem Framing"]).map((s: any, i: number) => (
                                            <li key={i} className="text-sm text-slate-300 flex gap-4">
                                                <i className="fa-solid fa-circle-check text-emerald-500/40 mt-1"></i>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 shadow-inner">
                                    <h3 className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Focus Areas
                                    </h3>
                                    <ul className="space-y-4">
                                        {(interview.weaknesses || ["Deep Implementation Details", "Concrete Use-case Examples", "Alternative Solution Trade-offs"]).map((w: any, i: number) => (
                                            <li key={i} className="text-sm text-slate-300 flex gap-4">
                                                <i className="fa-solid fa-circle-exclamation text-rose-500/40 mt-1"></i>
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Question Review */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4 px-2">
                                <i className="fa-solid fa-layer-group text-indigo-400"></i> Question Analytics
                            </h2>
                            <div className="space-y-4">
                                {interview.questions.map((q: any, i: number) => (
                                    <QuestionCard key={q.id || i} q={q} index={i} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Performance Intelligence */}
                        <div className="glass-panel p-8 border-white/5 bg-slate-900/30 sticky top-8">
                            <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-dna text-indigo-400"></i> Skill Match
                            </h3>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                        <span className="text-slate-500">Technical Mastery</span>
                                        <span className="text-indigo-400">{Math.round(interview.technical_readiness)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${interview.technical_readiness}%` }}
                                            transition={{ duration: 2 }}
                                            className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                        <span className="text-slate-500">Communication Flow</span>
                                        <span className="text-emerald-400">{Math.round(interview.communication_readiness)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${interview.communication_readiness}%` }}
                                            transition={{ duration: 2 }}
                                            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-chart-simple"></i> Benchmarking
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                                    "Your {interview.role} alignment is currently at {Math.round(interview.total_score)}%. Users in similar brackets typically move to hired status at 82%."
                                </p>
                            </div>

                            <div className="mt-12 flex flex-col gap-4">
                                <button
                                    onClick={() => router.push('/mock-interview')}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    Practice New Role
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-5 bg-slate-800 text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:text-white transition-all active:scale-95"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default withAuth(MockInterviewResult);
