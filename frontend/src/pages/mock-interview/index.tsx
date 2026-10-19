import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService, InterviewSetup } from '../../services/interviewService';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';

const MockInterviewSetup: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const [setup, setSetup] = useState<InterviewSetup>({
        role: '',
        experience_level: 'Entry',
        interview_type: 'Mixed',
        difficulty: 'Moderate',
        interview_mode: 'standard',
        question_count: 5,
        instant_feedback: true,
        job_description: ''
    });

    useEffect(() => {
        const savedRole = localStorage.getItem('dream_job');
        if (savedRole) {
            setSetup(prev => ({ ...prev, role: savedRole }));
        }

        const loadHistory = async () => {
            try {
                const res: any = await interviewService.getHistory();
                const items = Array.isArray(res) ? res : (res?.results || []);
                setHistory(items);
            } catch (e) {
                console.error(e);
            } finally {
                setStatsLoading(false);
            }
        };
        loadHistory();
    }, []);

    const handleStart = async (isLive: boolean = false) => {
        if (!setup.role) return;
        setLoading(true);
        try {
            const res = await interviewService.startInterview({ ...setup, interview_mode: isLive ? 'technical_panel' : setup.interview_mode });
            const data = res as any;
            if (isLive) {
                router.push(`/mock-interview/live?id=${data.interview_id}`);
            } else {
                router.push(`/mock-interview/session?id=${data.interview_id}`);
            }
        } catch (err) {
            console.error('Failed to start interview', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const completedInterviews = history.filter(i => i.is_completed || i.score !== undefined);
    const totalCompleted = completedInterviews.length;
    const avgScore = totalCompleted > 0 
        ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.score || curr.overall_score || 0), 0) / totalCompleted)
        : 0;

    const topicScores: Record<string, number[]> = {};
    completedInterviews.forEach(i => {
        const r = i.role || i.job_role || 'General';
        if (!topicScores[r]) topicScores[r] = [];
        topicScores[r].push(i.score || i.overall_score || 0);
    });

    let bestTopic = 'N/A';
    let highestAvg = 0;
    Object.keys(topicScores).forEach(topic => {
        const avg = topicScores[topic].reduce((a, b) => a + b, 0) / topicScores[topic].length;
        if (avg > highestAvg) {
            highestAvg = avg;
            bestTopic = topic;
        }
    });

    return (
        <Layout>
            <Head><title>Mock Interview Engine • SkillMirror OS</title></Head>
            <CyberPageShell
                moduleCode="INT-01"
                section="AI CAREER ENGINE"
                badge="SIMULATION MATRIX: ACTIVE"
                title="MOCK INTERVIEW ENGINE"
                subtitle="Synthetic technical evaluation, live adaptive panel proctoring, and competency telemetry."
                stats={
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <PageStatChip label="Sessions" value={totalCompleted} icon="fa-headset" color="slate" />
                        <PageStatChip label="Avg Score" value={avgScore ? `${avgScore}%` : '—'} icon="fa-chart-line" color="emerald" />
                        <PageStatChip label="Best Role" value={bestTopic} icon="fa-trophy" color="amber" />
                    </div>
                }
            />
            <div className="max-w-[960px] mx-auto px-4 sm:px-6 pb-12 space-y-6">
                {/* Configuration Panel */}
                <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                            <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                                Simulation Parameters
                            </h2>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">CONFIG-v2</span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold tracking-wider text-zinc-300 block uppercase">
                            Target Job Role
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
                            placeholder="e.g. Senior Backend / Distributed Systems Engineer"
                            value={setup.role}
                            onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                                Experience Tier
                            </label>
                            <select
                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs font-mono text-zinc-200 outline-none transition-colors"
                                value={setup.experience_level}
                                onChange={(e) => setSetup({ ...setup, experience_level: e.target.value as any })}
                            >
                                <option value="Entry">Entry (0-1 yr)</option>
                                <option value="Mid">Mid (2-5 yrs)</option>
                                <option value="Senior">Senior (5+ yrs)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                                Interview Track
                            </label>
                            <select
                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs font-mono text-zinc-200 outline-none transition-colors"
                                value={setup.interview_type}
                                onChange={(e) => setSetup({ ...setup, interview_type: e.target.value as any })}
                            >
                                <option value="Technical">Technical Deep Dive</option>
                                <option value="Behavioral">Behavioral & Leadership</option>
                                <option value="Mixed">Mixed (Standard Loop)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                                Rigor Rating
                            </label>
                            <select
                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs font-mono text-zinc-200 outline-none transition-colors"
                                value={setup.difficulty}
                                onChange={(e) => setSetup({ ...setup, difficulty: e.target.value as any })}
                            >
                                <option value="Easy">Standard</option>
                                <option value="Moderate">Moderate (Industry Default)</option>
                                <option value="Hard">Staff / Principal Level</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                                Delivery Engine
                            </label>
                            <select
                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs font-mono text-zinc-200 outline-none transition-colors"
                                value={setup.interview_mode}
                                onChange={(e) => setSetup({ ...setup, interview_mode: e.target.value as any })}
                            >
                                <option value="standard">Standard Interactive</option>
                                <option value="rapid_fire">Rapid Fire (Time-Constrained)</option>
                                <option value="deep_dive">Architecture Deep Dive</option>
                                <option value="hr_simulation">HR Panel Simulation</option>
                                <option value="technical_panel">Technical Panel</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                                Realtime Feedback
                            </label>
                            <div
                                onClick={() => setSetup({ ...setup, instant_feedback: !setup.instant_feedback })}
                                className={`w-full h-[42px] rounded-xl border flex items-center px-3.5 cursor-pointer transition-all ${
                                    setup.instant_feedback
                                        ? 'bg-zinc-950 border-amber-500/40 text-amber-400'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-sm mr-2.5 ${setup.instant_feedback ? 'bg-amber-400' : 'bg-zinc-700'}`}></span>
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                                    {setup.instant_feedback ? 'Active' : 'Disabled'}
                                </span>
                                {setup.instant_feedback && (
                                    <span className="ml-auto text-[9px] font-mono text-zinc-400">INSTANT HINTS</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                                Question Count
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 15].map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSetup({ ...setup, question_count: c })}
                                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                                            setup.question_count === c
                                                ? 'bg-amber-400 border-amber-400 text-zinc-950'
                                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                    >
                                        {c} Qs
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                            Job Description Specification (Optional Payload)
                        </label>
                        <textarea
                            className="w-full h-24 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-xs font-mono text-zinc-200 resize-none outline-none transition-colors placeholder:text-zinc-600"
                            placeholder="Paste specific JD requirements or architecture bullets here to direct AI questioning."
                            value={setup.job_description}
                            onChange={(e) => setSetup({ ...setup, job_description: e.target.value })}
                        />
                    </div>

                    {/* Next Steps Infographic */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-zinc-400"></span>
                            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                                Execution Pipeline
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono text-zinc-400 pt-1">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-[9px] shrink-0">1</span>
                                <span>Compile params</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-[9px] shrink-0">2</span>
                                <span>Answer AI prompt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-[9px] shrink-0">3</span>
                                <span>Deep evaluation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-[9px] shrink-0">4</span>
                                <span>Telemetry synthesis</span>
                            </div>
                        </div>
                    </div>

                    {/* Launch Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => handleStart(false)}
                            disabled={loading || !setup.role}
                            className="flex-1 py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-spinner fa-spin"></i> Initializing Environment...
                                </span>
                            ) : (
                                <>
                                    <i className="fa-solid fa-terminal text-xs"></i>
                                    <span>Launch Standard Terminal Session</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleStart(true)}
                            disabled={loading || !setup.role}
                            className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            <i className="fa-solid fa-video text-xs"></i>
                            <span>Launch Live Audio / Video Panel</span>
                        </button>
                    </div>
                </div>

                {/* Intelligence Stats */}
                <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                            <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                                Historical Telemetry & Performance
                            </h3>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">ANALYTICS</span>
                    </div>

                    {statsLoading ? (
                        <div className="text-xs font-mono text-zinc-500 animate-pulse">Syncing interview telemetry...</div>
                    ) : totalCompleted === 0 ? (
                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs font-mono text-zinc-500">
                            Complete your initial simulation session to unlock benchmark intelligence.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Sessions Done</p>
                                <p className="text-xl font-mono font-bold text-zinc-100 mt-1 tabular-nums">{totalCompleted}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Mean Score</p>
                                <p className="text-xl font-mono font-bold text-emerald-400 mt-1 tabular-nums">{avgScore}%</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Top Track</p>
                                <p className="text-sm font-mono font-bold text-amber-400 mt-1 truncate" title={bestTopic}>{bestTopic}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Active Streak</p>
                                <p className="text-xl font-mono font-bold text-zinc-100 mt-1 tabular-nums">{totalCompleted > 0 ? `${totalCompleted} 🔥` : '0'}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center pt-2">
                    <button
                        onClick={() => router.push('/mock-interview/history')}
                        className="text-zinc-400 hover:text-zinc-100 font-mono text-xs transition-colors flex items-center gap-2 mb-2 cursor-pointer"
                    >
                        <i className="fa-solid fa-clock-rotate-left text-[11px]"></i>
                        <span>Inspect Complete Session History</span>
                    </button>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider text-center">
                        Pro Tip: Speak clearly with technical conciseness. Answers are evaluated for architectural trade-offs.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default withAuth(MockInterviewSetup);
