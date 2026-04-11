import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService, InterviewSetup } from '../../services/interviewService';

const MockInterviewSetup: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [setup, setSetup] = useState<InterviewSetup>({
        role: '',
        experience_level: 'Entry',
        interview_type: 'Mixed',
        difficulty: 'Moderate',
        interview_mode: 'standard',
        question_count: 5,
        instant_feedback: false,
        job_description: ''
    });

    useEffect(() => {
        // Try to pre-fill from profile/skill-gap
        const savedRole = localStorage.getItem('dream_job');
        if (savedRole) {
            setSetup(prev => ({ ...prev, role: savedRole }));
        }
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

    return (
        <Layout>
            <Head>
                <title>Mock Interview Setup • SkillMirror</title>
                <link rel="stylesheet" href="/styles/mock-interview.css" />
            </Head>

            <div className="interview-container">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-4">
                        AI <span className="text-indigo-500">Mock Interview</span> Engine
                    </h1>
                    <p className="text-slate-400">
                        Practice with our advanced AI interviewer. Get real-time feedback and technical evaluation.
                    </p>
                </div>

                <div className="setup-card">
                    <div className="space-y-8">
                        <div className="form-group">
                            <label className="form-label">Target Job Role</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Senior Frontend Developer"
                                value={setup.role}
                                onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                            />
                        </div>

                        <div className="option-grid">
                            <div className="form-group">
                                <label className="form-label">Experience Level</label>
                                <select
                                    className="form-select"
                                    value={setup.experience_level}
                                    onChange={(e) => setSetup({ ...setup, experience_level: e.target.value as any })}
                                >
                                    <option value="Entry">Entry (0-1 year)</option>
                                    <option value="Mid">Mid (2-5 years)</option>
                                    <option value="Senior">Senior (5+ years)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Interview Type</label>
                                <select
                                    className="form-select"
                                    value={setup.interview_type}
                                    onChange={(e) => setSetup({ ...setup, interview_type: e.target.value as any })}
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="Behavioral">Behavioral / HR</option>
                                    <option value="Mixed">Mixed (Recommended)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Difficulty</label>
                                <select
                                    className="form-select"
                                    value={setup.difficulty}
                                    onChange={(e) => setSetup({ ...setup, difficulty: e.target.value as any })}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Interview Mode</label>
                                <select
                                    className="form-select"
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
                                <label className="form-label">Instant Feedback</label>
                                <div
                                    onClick={() => setSetup({ ...setup, instant_feedback: !setup.instant_feedback })}
                                    className={`relative w-full h-12 rounded-xl border flex items-center px-4 cursor-pointer transition-all ${setup.instant_feedback ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                                >
                                    <i className={`fa-solid ${setup.instant_feedback ? 'fa-toggle-on' : 'fa-toggle-off'} mr-3 text-lg`}></i>
                                    <span className="text-xs font-bold uppercase tracking-wider">{setup.instant_feedback ? 'Enabled' : 'Disabled'}</span>
                                    {setup.instant_feedback && <span className="ml-auto text-[10px] font-black">GET TIPS AFTER EACH Q</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Question Count</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[5, 10, 15].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setSetup({ ...setup, question_count: c })}
                                        className={`py-3 rounded-xl font-bold border transition-all ${setup.question_count === c ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        {c} Questions
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Description (Optional Context)</label>
                            <textarea
                                className="form-textarea h-32"
                                placeholder="Paste the JD here to generate custom questions matched to the role's specific requirements."
                                value={setup.job_description}
                                onChange={(e) => setSetup({ ...setup, job_description: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleStart(false)}
                                disabled={loading || !setup.role}
                                className="flex-1 start-btn text-lg"
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
                                className="flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3"
                            >
                                <i className="fa-solid fa-video text-base"></i>
                                Start Live Video Interview
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">


                    <div className="flex flex-col justify-center">
                        <button
                            onClick={() => router.push('/mock-interview/history')}
                            className="text-slate-500 hover:text-indigo-400 font-bold transition-colors flex items-center gap-2 mb-4"
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i> View Interview History
                        </button>
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest leading-relaxed">
                            Pro Tip: Use headphones for the best AI voice experience. Ensure you are in a well-lit environment for behavioral analysis.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @import url('/styles/mock-interview.css');
            `}</style>
        </Layout>
    );
};

export default withAuth(MockInterviewSetup);
