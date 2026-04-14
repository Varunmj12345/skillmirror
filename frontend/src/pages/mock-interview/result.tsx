import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService } from '../../services/interviewService';
import PerformanceRadar from '../../components/Interview/PerformanceRadar';

const QuestionCard: React.FC<{ q: any; index: number }> = ({ q, index }) => {
    const [isExpanded, setIsExpanded] = useState(index === 0);

    return (
        <div className="glass-panel overflow-hidden border-slate-800 mb-6 transition-all hover:border-slate-700 bg-white/[0.01]">
            <div
                className="p-6 cursor-pointer flex justify-between items-center gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10">QUESTION {index + 1}</span>
                        <span className="text-[9px] font-black uppercase bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-700">{q.category}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${q.score >= 8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border-rose-500/10'}`}>SCORE: {Math.round(q.score)}/10</span>
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{q.question_text}</h3>
                </div>
                <motion.i animate={{ rotate: isExpanded ? 180 : 0 }} className="fa-solid fa-chevron-down text-slate-600"></motion.i>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-8 space-y-8 border-t border-slate-800/50">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Transcript</p>
                                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed italic">
                                        "{q.user_answer || "No response recorded."}"
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Master's Insight</p>
                                    <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-sm text-emerald-200/80 leading-relaxed italic">
                                        "{q.sample_answer || q.improved_answer || "Analyzing depth..."}"
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI Deep Evaluation
                                </h4>
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
        if (id) loadResult();
    }, [id]);

    const loadResult = async () => {
        try {
            const res = await interviewService.getInterviewResult(parseInt(id as string));
            const data = res as any;
            setInterview({ ...data.interview, questions: data.questions });
        } catch (err) {
            console.error('Failed to load results', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !interview) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Synthesizing Master Intelligence Report...</p>
                </div>
            </Layout>
        );
    }

    const radarData = [
        { subject: 'Accuracy', A: interview.technical_accuracy / 10 || 0, fullMark: 10 },
        { subject: 'Depth', A: interview.depth_of_knowledge / 10 || 0, fullMark: 10 },
        { subject: 'Clarity', A: interview.clarity_score / 10 || 0, fullMark: 10 },
        { subject: 'Confid.', A: interview.communication_score / 10 || 0, fullMark: 10 },
        { subject: 'Market', A: (interview.total_score / 10) || 0, fullMark: 10 },
    ];

    return (
        <Layout>
            <Head>
                <title>Intelligence Report • SkillMirror</title>
            </Head>

            <div className="max-w-7xl mx-auto px-4 py-12 font-sans">
                {/* 1. Header & Primary Stats */}
                <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">AI MASTER ENGINE</span>
                            <span className="text-slate-500 font-bold text-[10px] uppercase">Session: #{id}</span>
                        </div>
                        <h1 className="text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                            Advanced <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 animate-gradient-x">Intelligence Report</span>
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                            {interview.role} • Level: {interview.experience_level} • Simulated on {new Date(interview.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Overall Score Card */}
                    <div className="lg:col-span-12 xl:col-span-5">
                        <div className="glass-panel p-8 bg-slate-900/50 backdrop-blur-3xl border-white/5 flex items-center justify-between rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Readiness Score</p>
                                <div className="text-7xl font-black text-white flex items-baseline gap-1">
                                    {Math.round(interview.total_score)}
                                    <span className="text-2xl text-slate-700 tracking-normal">%</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 text-right">
                                <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${interview.total_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {interview.total_score >= 80 ? 'High - Job Ready' : 'Moderate - Polishing Required'}
                                </div>
                                <p className="text-[10px] text-slate-600 font-bold uppercase">VS Market Avg: 72%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Market Intelligence Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Salary Forecast', val: '₹12 - ₹18 LPA', icon: 'fa-money-bill-trend-up', sub: 'Market Projection', color: 'indigo' },
                        { label: 'Market Demand', val: 'Critical (High)', icon: 'fa-chart-line', sub: 'Hiring Urgency', color: 'emerald' },
                        { label: 'Growth Rating', val: '+45%', icon: 'fa-arrow-trend-up', sub: '3-Year Career Path', color: 'sky' },
                        { label: 'Hiring Confidence', val: 'Premium', icon: 'fa-shield-halved', sub: 'AI Match Rating', color: 'purple' }
                    ].map((m, i) => (
                        <motion.div 
                            key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="group p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all cursor-default"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-${m.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <i className={`fa-solid ${m.icon} text-${m.color}-400 text-lg`}></i>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                            <h3 className="text-2xl font-black text-white mb-2">{m.val}</h3>
                            <p className="text-[10px] font-bold text-slate-700">{m.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* 3. Deep Performance Analytics */}
                <div className="grid lg:grid-cols-12 gap-12 mb-16">
                    {/* Radar Chart Section */}
                    <div className="lg:col-span-5 glass-panel p-10 border-white/5 bg-slate-900/20 rounded-[3rem]">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">Performance Spectrum</h3>
                        <PerformanceRadar data={radarData} />
                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Technical Core</p>
                                <p className="text-2xl font-black text-white">{Math.round(interview.technical_accuracy)}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Behavioral Sync</p>
                                <p className="text-2xl font-black text-white">{Math.round(interview.communication_score)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Synthesis Report */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="flex-1 glass-panel p-10 bg-indigo-500/5 border-indigo-500/10 rounded-[3rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-sparkles text-indigo-400"></i> AI Synthesis Report
                            </h3>
                            <p className="text-slate-300 text-xl leading-relaxed font-medium">
                                {interview.ai_summary || "Our engine is still compiling your holistic growth patterns..."}
                            </p>
                            
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mastered Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(interview.strengths || []).map((s: string) => (
                                            <span key={s} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-300 font-bold uppercase">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Growth Required</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(interview.weaknesses || []).map((w: string) => (
                                            <span key={w} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-300 font-bold uppercase">{w}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Career Projections */}
                        <div className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-sky-500/10 flex items-center justify-center">
                                    <i className="fa-solid fa-bolt text-sky-400 text-2xl"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Career Simulation Outcome</p>
                                    <h4 className="text-lg font-bold text-white">"Potential Senior Lead within 2.5 years."</h4>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">View Roadmap</button>
                        </div>
                    </div>
                </div>

                {/* 4. Question Breakdown */}
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between px-4 mb-4">
                            <h2 className="text-2xl font-black text-white">Question Narrative</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{interview.questions.length} Session Modules</p>
                        </div>
                        {interview.questions.map((q: any, i: number) => (
                            <QuestionCard key={q.id || i} q={q} index={i} />
                        ))}
                    </div>

                    {/* Skill Gap Side-Panel */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 space-y-8">
                            <div className="p-8 glass-panel border-white/5 bg-slate-900/20 rounded-[3rem]">
                                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                                    <i className="fa-solid fa-triangle-exclamation text-amber-500"></i> Skill Gap Tracker
                                </h3>
                                <div className="space-y-6">
                                    {(interview.improvement_areas || ["System Design", "Error Handling Strategy", "Modern ES6 Syntax"]).map((area: string) => (
                                        <div key={area} className="group cursor-default">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">{area}</span>
                                                <span className="text-[10px] font-black text-rose-400 uppercase">Action Req.</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-rose-500/30" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Priority Coaching</p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                                        "Focus on **{interview.improvement_areas?.[0] || 'Modern Architecture'}** to boost your hireability index beyond 85%."
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button onClick={() => router.push('/mock-interview')} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                                    Generate New Session
                                </button>
                                <button onClick={() => router.push('/dashboard')} className="w-full py-6 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all">
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
