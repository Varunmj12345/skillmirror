import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import { interviewService } from '../../services/interviewService';

const MockInterviewSession: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [interview, setInterview] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingNext, setFetchingNext] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [isThinking, setIsThinking] = useState(false);
    const [interviewSession, setInterviewSession] = useState<any[]>([]);
    const [lastEvaluation, setLastEvaluation] = useState<any>(null);
    const [wasSkipped, setWasSkipped] = useState(false);

    useEffect(() => {
        if (id) {
            loadInterview();
        }
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const loadInterview = async () => {
        setLoading(true);
        try {
            const res = await interviewService.getDetail(parseInt(id as string));
            const data = res as any;
            setInterview(data);

            const existingAnswers = data.questions
                .filter((q: any) => q.is_answered)
                .map((q: any) => ({
                    question: q.question_text,
                    user_answer: q.user_answer,
                    ai_answer: q.sample_answer,
                    score: q.score,
                    feedback: q.feedback
                }));
            setInterviewSession(existingAnswers);

            const index = data.questions.findIndex((q: any) => !q.is_answered);
            setCurrentQuestionIndex(index !== -1 ? index : 0);
        } catch (err) {
            console.error('Failed to load interview', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || submitting) return;

        setSubmitting(true);
        setIsThinking(true);
        try {
            const currentQ = interview.questions[currentQuestionIndex];
            const res = await interviewService.submitAnswer(currentQ.id, answer);
            const evalData = res as any;

            const sessionEntry = {
                question: currentQ.question_text,
                user_answer: answer,
                ai_answer: evalData.ai_answer,
                score: evalData.score,
                feedback: evalData.feedback
            };
            setInterviewSession(prev => [...prev, sessionEntry]);
            setLastEvaluation(evalData);

            if (evalData.follow_up) {
                const newQuestions = [...interview.questions];
                newQuestions.splice(currentQuestionIndex + 1, 0, evalData.follow_up);
                setInterview({ ...interview, questions: newQuestions });
            }

            if (!interview.instant_feedback) {
                proceedAfterAnswer();
            }
        } catch (err) {
            console.error('Failed to submit answer', err);
        } finally {
            setSubmitting(false);
            setIsThinking(false);
        }
    };

    const handleRetry = () => {
        setAnswer('');
        setLastEvaluation(null);
    };

    const proceedAfterAnswer = async () => {
        setAnswer('');
        setLastEvaluation(null);
        setWasSkipped(false);
        setFetchingNext(true);

        try {
            const nextRes = await interviewService.getNextQuestion(interview.id);
            const nextData = nextRes as any;

            if (nextData.next_available) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                finalizeAndExit();
            }
        } catch (err) {
            console.error("Failed to fetch next question", err);
            if (currentQuestionIndex < interview.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                finalizeAndExit();
            }
        } finally {
            setFetchingNext(false);
        }
    };

    const finalizeAndExit = async () => {
        setLoading(true);
        try {
            await interviewService.finalizeInterview(interview.id);
            router.push(`/mock-interview/result?id=${id}`);
        } catch (err) {
            console.error('Finalization failed', err);
            router.push(`/mock-interview/result?id=${id}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        const currentQ = interview.questions[currentQuestionIndex];
        setIsThinking(true);
        try {
            const res = await interviewService.skipQuestion(currentQ.id) as any;
            const sessionEntry = {
                question: currentQ.question_text,
                user_answer: '',
                ai_answer: res.ai_answer,
                score: 0,
                feedback: res.feedback
            };
            setInterviewSession(prev => [...prev, sessionEntry]);
            setWasSkipped(true);
            setLastEvaluation(res);
        } catch (err) {
            console.error('Skip question failed', err);
            proceedAfterAnswer();
        } finally {
            setIsThinking(false);
        }
    };

    if (loading || !interview) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Synchronizing Session Environment...</p>
                </div>
            </Layout>
        );
    }

    const currentQ = interview.questions[currentQuestionIndex];

    return (
        <Layout>
            <Head>
                <title>Interview Session • SkillMirror OS</title>
            </Head>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Header with Title and Timer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-sm bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                                SIMULATION ACTIVE · #{id}
                            </span>
                        </div>
                        <h2 className="text-lg font-mono font-bold text-zinc-100 uppercase tracking-tight">
                            {interview.role}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            Q {currentQuestionIndex + 1} OF {interview.questions.length}
                        </span>
                        <div className="bg-zinc-950 border border-zinc-800 px-4 py-1.5 rounded-xl flex items-center gap-2">
                            <i className="fa-solid fa-clock text-amber-400 text-xs"></i>
                            <span className="font-mono text-zinc-100 text-sm font-bold tabular-nums">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Line */}
                <div className="w-full h-1 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                <AnimatePresence>
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Meta Tags & Question */}
                        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                                    {currentQ.category || 'TECHNICAL'}
                                </span>
                                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md border ${
                                    currentQ.difficulty_badge === 'Expert' || currentQ.difficulty_badge === 'Hard'
                                        ? 'bg-zinc-950 text-rose-400 border-rose-500/30'
                                        : 'bg-zinc-950 text-emerald-400 border-emerald-500/30'
                                }`}>
                                    {currentQ.difficulty_badge || 'MODERATE'}
                                </span>
                            </div>

                            <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-100 leading-snug">
                                {currentQ.question_text}
                            </div>
                        </div>

                        {interview.instant_feedback && lastEvaluation ? (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-5"
                            >
                                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>
                                        <h4 className="text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider">
                                            AI Evaluation Telemetry
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        {wasSkipped && (
                                            <span className="px-2.5 py-0.5 bg-zinc-950 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase">
                                                Skipped
                                            </span>
                                        )}
                                        <div className="px-3.5 py-1 bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono font-bold text-base tabular-nums rounded-lg">
                                            {wasSkipped ? '0' : Math.round(lastEvaluation.score)} / 10
                                        </div>
                                    </div>
                                </div>

                                {wasSkipped && (
                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/20 text-xs font-mono text-zinc-400">
                                        <p className="text-amber-400 font-bold mb-1 uppercase text-[10px]">Question Skipped</p>
                                        Study the model reference answer below to incorporate architecture patterns in subsequent queries.
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                                        <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Observed Strengths</p>
                                        <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                                            {wasSkipped ? <span className="text-zinc-600 italic">No candidate output provided</span> : (lastEvaluation.question?.strengths || lastEvaluation.strengths)}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                                        <p className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">Optimization Directives</p>
                                        <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                                            {lastEvaluation.question?.weaknesses?.split('.')[0] || lastEvaluation.feedback}.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Principal Reference Architecture</p>
                                    <p className="text-xs font-mono text-zinc-300 leading-relaxed italic">"{lastEvaluation.ai_answer}"</p>
                                </div>

                                <button
                                    onClick={proceedAfterAnswer}
                                    className="w-full py-3.5 px-6 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                >
                                    <span>{currentQuestionIndex === interview.questions.length - 1 ? 'Finalize Session & Synthesize Report' : 'Proceed to Next Step'}</span>
                                    <i className={`fa-solid ${currentQuestionIndex === interview.questions.length - 1 ? 'fa-check-double' : 'fa-arrow-right'} text-xs`}></i>
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        className={`w-full min-h-[220px] bg-zinc-900/90 border border-zinc-800 focus:border-amber-400 rounded-2xl p-5 text-sm font-mono text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 ${isThinking || fetchingNext ? 'opacity-30 pointer-events-none' : ''}`}
                                        placeholder="Formulate your technical explanation, architectural trade-offs, and design patterns here..."
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        disabled={submitting || fetchingNext}
                                    />

                                    {isThinking && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/70 rounded-2xl">
                                            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <p className="text-amber-400 font-mono text-xs uppercase tracking-widest">Evaluating Candidate Logic...</p>
                                        </div>
                                    )}

                                    {fetchingNext && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/70 rounded-2xl">
                                            <p className="text-amber-400 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Next Challenge...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleSkip}
                                            disabled={submitting || fetchingNext || isThinking}
                                            className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl font-mono font-bold text-xs uppercase tracking-wider hover:border-zinc-700 transition-all disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <i className="fa-solid fa-forward text-[10px]"></i>
                                            <span>Skip Question</span>
                                        </button>
                                        <button
                                            onClick={handleRetry}
                                            disabled={!answer || submitting || fetchingNext}
                                            className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl font-mono font-bold text-xs uppercase tracking-wider hover:border-zinc-700 transition-all disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <i className="fa-solid fa-rotate-left text-[10px]"></i>
                                            <span>Clear</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!answer.trim() || submitting || fetchingNext}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                    >
                                        <span>{currentQuestionIndex === interview.questions.length - 1 ? 'Submit & Finalize' : 'Submit Response'}</span>
                                        <i className="fa-solid fa-paper-plane text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default withAuth(MockInterviewSession);
