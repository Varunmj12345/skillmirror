import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService } from '../../services/interviewService';
import PerformanceRadar from '../../components/Interview/PerformanceRadar';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const QuestionCard: React.FC<{ q: any; index: number }> = ({ q, index }) => {
    const [isExpanded, setIsExpanded] = useState(index === 0);

    return (
        <div className="rounded-xl border border-zinc-800 transition-all hover:border-zinc-700 bg-zinc-900/90 overflow-hidden font-mono mb-3">
            <div
                className="p-4 sm:p-5 cursor-pointer flex justify-between items-center gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold uppercase bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                            QUESTION {index + 1}
                        </span>
                        <span className="text-[9px] font-bold uppercase bg-zinc-950 text-amber-400 px-2 py-0.5 rounded border border-zinc-800">
                            {q.category}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            q.score >= 8 
                                ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30' 
                                : 'bg-zinc-950 text-rose-400 border-rose-500/30'
                        }`}>
                            SCORE: {Math.round(q.score)}/10
                        </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">{q.question_text}</h3>
                </div>
                <motion.i animate={{ rotate: isExpanded ? 180 : 0 }} className="fa-solid fa-chevron-down text-zinc-500 text-xs"></motion.i>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-5 space-y-4 border-t border-zinc-800 bg-zinc-950/60">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Candidate Transcript</p>
                                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                                        "{q.user_answer || "No candidate output recorded."}"
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Model Reference</p>
                                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-emerald-300/90 leading-relaxed italic">
                                        "{q.sample_answer || q.improved_answer || "Synthesizing depth..."}"
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                    <span>AI Diagnostic Feedback</span>
                                </h4>
                                <p className="text-xs text-zinc-300 leading-relaxed">{q.feedback}</p>
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
                    <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Compiling Session Telemetry...</p>
                </div>
            </Layout>
        );
    }

    const radarData = [
        { subject: 'Accuracy', A: interview.technical_accuracy / 10 || 0, fullMark: 10 },
        { subject: 'Depth', A: interview.depth_of_knowledge / 10 || 0, fullMark: 10 },
        { subject: 'Clarity', A: interview.clarity_score / 10 || 0, fullMark: 10 },
        { subject: 'Confidence', A: interview.communication_score / 10 || 0, fullMark: 10 },
        { subject: 'Market Match', A: (interview.total_score / 10) || 0, fullMark: 10 },
    ];

    return (
        <Layout>
            <Head>
                <title>Intelligence Report • SkillMirror OS</title>
            </Head>

            <CyberPageShell
                moduleCode="INT-REP"
                section="AI CAREER ENGINE"
                badge="TELEMETRY SYNTHESIS: COMPLETE"
                title="INTELLIGENCE REPORT"
                subtitle="Multi-axis competency radar, transcript audit, and algorithmic hiring match index."
                stats={
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <PageStatChip label="Score" value={`${Math.round(interview.total_score)}%`} color="emerald" icon="fa-chart-line" />
                        <PageStatChip label="Target Role" value={interview.role} color="amber" icon="fa-briefcase" />
                        <PageStatChip label="Questions" value={`${interview.questions.length} Items`} color="slate" icon="fa-list-check" />
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 font-mono space-y-6">
                {/* 1. Header Overview & Score Card */}
                <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    SESSION ID #{id} · {interview.experience_level?.toUpperCase()} TIER
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 uppercase tracking-tight mb-2">
                                {interview.role}
                            </h2>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Evaluated on {new Date(interview.created_at).toLocaleDateString()} against industry benchmark parameters.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-zinc-800 flex flex-wrap gap-2 text-xs text-zinc-400">
                            <span className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-md">
                                Technical Accuracy: <strong className="text-zinc-200">{Math.round(interview.technical_accuracy)}%</strong>
                            </span>
                            <span className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-md">
                                Delivery Cadence: <strong className="text-zinc-200">{Math.round(interview.communication_score)}%</strong>
                            </span>
                        </div>
                    </div>

                    {/* Overall Score Card */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Hireability Score</p>
                            <div className="text-5xl sm:text-6xl font-bold text-zinc-100 tabular-nums">
                                {Math.round(interview.total_score)}
                                <span className="text-xl text-zinc-500 font-normal">%</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <div className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                                interview.total_score >= 80 
                                    ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-zinc-950 text-amber-400 border-amber-500/30'
                            }`}>
                                {interview.total_score >= 80 ? 'HIGH · JOB READY' : 'INTERMEDIATE · EXPAND'}
                            </div>
                            <p className="text-[10px] text-zinc-500">Market Baseline: 72%</p>
                        </div>
                    </div>
                </div>

                {/* 2. Market Intelligence Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Salary Range', val: '₹12 - ₹18 LPA', sub: 'Market Target Benchmark' },
                        { label: 'Market Demand', val: 'High / Critical', sub: 'Active Requisition Load' },
                        { label: 'Velocity Vector', val: '+45% YoY', sub: '3-Year Architecture Trajectory' },
                        { label: 'Screening Match', val: 'Top 15%', sub: 'AI Algorithmic Match' }
                    ].map((m, i) => (
                        <div key={i} className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.label}</p>
                            <h3 className="text-xl font-bold text-zinc-100 tabular-nums">{m.val}</h3>
                            <p className="text-[10px] text-zinc-400">{m.sub}</p>
                        </div>
                    ))}
                </div>

                {/* 3. Deep Performance Analytics & AI Synthesis */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Radar Chart Section */}
                    <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Performance Spectrum</h3>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase">5-AXIS RADAR</span>
                        </div>
                        <PerformanceRadar data={radarData} />
                        <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Technical Core</p>
                                <p className="text-xl font-bold text-zinc-100 mt-1 tabular-nums">{Math.round(interview.technical_accuracy)}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase">Behavioral Sync</p>
                                <p className="text-xl font-bold text-zinc-100 mt-1 tabular-nums">{Math.round(interview.communication_score)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Synthesis Report */}
                    <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-5">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                    <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">AI Synthesis Report</h3>
                                </div>
                                <span className="text-[10px] text-zinc-500 uppercase">EXECUTIVE SUMMARY</span>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                                {interview.ai_summary || "The evaluation model has compiled candidate performance based on technical depth, trade-offs, and communication consistency."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified Strengths</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(interview.strengths || []).map((s: string) => (
                                        <span key={s} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-md text-[10px] text-zinc-300 font-bold uppercase">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Growth Focus</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(interview.weaknesses || []).map((w: string) => (
                                        <span key={w} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-md text-[10px] text-zinc-300 font-bold uppercase">
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase">Trajectory Outcome</p>
                                <h4 className="text-xs font-bold text-zinc-200 mt-0.5">Potential Senior Lead within 2.5 years.</h4>
                            </div>
                            <button
                                onClick={() => router.push('/roadmap')}
                                className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                                View Roadmap
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Question Breakdown & Skill Gap Side-Panel */}
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-3">
                        <div className="flex items-center justify-between pb-2">
                            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Question Narrative Log</h2>
                            <span className="text-[10px] text-zinc-500 uppercase">{interview.questions.length} Items</span>
                        </div>
                        {interview.questions.map((q: any, i: number) => (
                            <QuestionCard key={q.id || i} q={q} index={i} />
                        ))}
                    </div>

                    {/* Skill Gap Side-Panel */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-sm bg-rose-400"></span>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Gap Telemetry</h3>
                            </div>
                            <div className="space-y-3">
                                {(interview.improvement_areas || ["System Design", "Error Handling Strategy", "Modern ES6 Syntax"]).map((area: string) => (
                                    <div key={area} className="space-y-1">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-zinc-300">{area}</span>
                                            <span className="text-[9px] text-rose-400 font-bold uppercase">Action Req</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500/50 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Coaching Directive</p>
                                <p className="text-xs text-zinc-400 italic">
                                    "Target **{interview.improvement_areas?.[0] || 'Modern Architecture'}** to boost your hireability index beyond 85%."
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => router.push('/mock-interview')}
                                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm text-center"
                            >
                                Launch New Session
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-2.5 px-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                            >
                                Return to Command Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default withAuth(MockInterviewResult);
