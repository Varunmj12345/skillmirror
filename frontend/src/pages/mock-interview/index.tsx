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
                moduleCode="MOD-04"
                title="MOCK INTERVIEW ENGINE"
                subtitle="Real-time AI interviewer with instant feedback, technical evaluation, and performance tracking."
                badge="AI REALTIME"
                badgeVariant="outline-cyan"
                bulletVariant="cyan"
                glowColor="indigo"
                stats={
                    <>
                        <PageStatChip label="Sessions" value={totalCompleted} icon="fa-headset" color="cyan" />
                        <PageStatChip label="Avg Score" value={avgScore ? `${avgScore}%` : '—'} icon="fa-chart-line" color="emerald" />
                        <PageStatChip label="Best Role" value={bestTopic} icon="fa-trophy" color="amber" />
                    </>
                }
            />
            <div className="max-w-[900px] mx-auto px-6 pb-10 space-y-8">
                <div className="rounded-2xl bg-pop border border-white/[0.07] overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="p-8 space-y-8">
                        <div className="form-group">
                            <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Target Job Role</label>
                            <input
                                type="text"
                                className="sm-input px-4 py-3 text-sm w-full"
                                placeholder="e.g. Senior Frontend Developer"
                                value={setup.role}
                                onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="form-group">
                                <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Experience Level</label>
                                <select
                                    className="sm-input px-4 py-3 text-sm w-full bg-slate-900"
                                    value={setup.experience_level}
                                    onChange={(e) => setSetup({ ...setup, experience_level: e.target.value as any })}
                                >
                                    <option value="Entry">Entry (0-1 year)</option>
                                    <option value="Mid">Mid (2-5 years)</option>
                                    <option value="Senior">Senior (5+ years)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Interview Type</label>
                                <select
                                    className="sm-input px-4 py-3 text-sm w-full bg-slate-900"
                                    value={setup.interview_type}
                                    onChange={(e) => setSetup({ ...setup, interview_type: e.target.value as any })}
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="Behavioral">Behavioral / HR</option>
                                    <option value="Mixed">Mixed (Recommended)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Difficulty</label>
                                <select
                                    className="sm-input px-4 py-3 text-sm w-full bg-slate-900"
                                    value={setup.difficulty}
                                    onChange={(e) => setSetup({ ...setup, difficulty: e.target.value as any })}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Interview Mode</label>
                                <select
                                    className="sm-input px-4 py-3 text-sm w-full bg-slate-900"
                                    value={setup.interview_mode}
                                    onChange={(e) => setSetup({ ...setup, interview_mode: e.target.value as any })}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="rapid_fire">Rapid Fire (Quick)</option>
                                    <option value="deep_dive">Deep Dive (Complex)</option>
                                    <option value="hr_simulation">HR Simulation</option>
                                    <option value="technical_panel">Technical Panel</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Instant Feedback</label>
                                <div
                                    onClick={() => setSetup({ ...setup, instant_feedback: !setup.instant_feedback })}
                                    className={`relative w-full h-11 rounded-xl border flex items-center px-4 cursor-pointer transition-all ${setup.instant_feedback ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                                >
                                    <i className={`fa-solid ${setup.instant_feedback ? 'fa-toggle-on text-emerald-400' : 'fa-toggle-off'} mr-3 text-lg`}></i>
                                    <span className="text-xs font-bold uppercase tracking-wider">{setup.instant_feedback ? 'Enabled' : 'Disabled'}</span>
                                    {setup.instant_feedback && <span className="ml-auto text-[9px] font-black text-emerald-300">TIPS AFTER EACH Q</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Question Count</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[5, 10, 15].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setSetup({ ...setup, question_count: c })}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${setup.question_count === c ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                        >
                                            {c} Qs
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2">Job Description (Optional Context)</label>
                            <textarea
                                className="sm-input h-28 px-4 py-3 text-xs resize-none w-full"
                                placeholder="Paste the JD here to generate custom questions matched to the role's specific requirements."
                                value={setup.job_description}
                                onChange={(e) => setSetup({ ...setup, job_description: e.target.value })}
                            />
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <i className="fa-solid fa-circle-info text-indigo-400" />
                                What happens next?
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-400">
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                                    <span>Select role & options</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                                    <span>Answer AI scenarios</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                                    <span>Real-time feedback</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                                    <span>Detailed score breakdown</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                onClick={() => handleStart(false)}
                                disabled={loading || !setup.role}
                                className="sm-btn-primary flex-1 py-4 text-sm flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-spinner fa-spin"></i> Initializing...
                                    </span>
                                ) : (
                                    "Start Standard Session (Text)"
                                )}
                            </button>
                            <button
                                onClick={() => handleStart(true)}
                                disabled={loading || !setup.role}
                                className="sm-btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 flex-1 py-4 text-sm flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-video text-base"></i>
                                Start Live Video Interview
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sm-glass p-6 rounded-3xl border border-slate-800/60 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <i className="fa-solid fa-chart-simple text-indigo-400" />
                        Your Interview Intelligence Stats
                    </h3>

                    {statsLoading ? (
                        <div className="text-xs text-slate-500 animate-pulse">Loading interview stats...</div>
                    ) : totalCompleted === 0 ? (
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                            Start your first interview to unlock analytics.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Completed</p>
                                <p className="text-xl font-black text-white mt-1">{totalCompleted}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Average Score</p>
                                <p className="text-xl font-black text-emerald-400 mt-1">{avgScore}%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Best Topic</p>
                                <p className="text-sm font-black text-cyan-300 mt-1 truncate" title={bestTopic}>{bestTopic}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Streak</p>
                                <p className="text-xl font-black text-amber-400 mt-1">{totalCompleted > 0 ? `${totalCompleted} 🔥` : '0'}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={() => router.push('/mock-interview/history')}
                        className="text-slate-400 hover:text-indigo-400 font-bold text-xs transition-colors flex items-center gap-2 mb-3"
                    >
                        <i className="fa-solid fa-clock-rotate-left"></i> View Interview History
                    </button>
                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest text-center">
                        Pro Tip: Use headphones for the best AI voice experience. Ensure you are in a well-lit environment for behavioral analysis.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default withAuth(MockInterviewSetup);
