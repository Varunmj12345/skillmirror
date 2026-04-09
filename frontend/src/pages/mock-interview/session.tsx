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
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins default
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

            // Reconstruct session from existing answers if any
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

            // Find first unanswered question
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
            console.log(`Submitting answer for question index: ${currentQuestionIndex}, ID: ${currentQ.id}`);

            const res = await interviewService.submitAnswer(currentQ.id, answer);
            const evalData = res as any;

            console.log("API Response:", evalData);

            // Store in session state as requested
            const sessionEntry = {
                question: currentQ.question_text,
                user_answer: answer,
                ai_answer: evalData.ai_answer,
                score: evalData.score,
                feedback: evalData.feedback
            };
            setInterviewSession(prev => [...prev, sessionEntry]);

            setLastEvaluation(evalData);

            // Check for follow-up from backend
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
            // Use backend sync to get next question as requested
            const nextRes = await interviewService.getNextQuestion(interview.id);
            const nextData = nextRes as any;

            if (nextData.next_available) {
                console.log("Moving to next question:", nextData.question_id);
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                console.log("No more questions. Finalizing...");
                finalizeAndExit();
            }
        } catch (err) {
            console.error("Failed to fetch next question", err);
            // Fallback to local index increment if API fails
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
            // Store skipped entry in session
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
            // Fallback: just move to next question if API fails
            proceedAfterAnswer();
        } finally {
            setIsThinking(false);
        }
    };

    if (loading || !interview) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
                </div>
            </Layout>
        );
    }

    const currentQ = interview.questions[currentQuestionIndex];

    return (
        <Layout>
            <Head>
                <title>Interview Session • SkillMirror</title>
                <link rel="stylesheet" href="/styles/mock-interview.css" />
            </Head>

            <div className="interview-container max-w-5xl mx-auto px-4 py-8">
                <div className="session-header flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                            {interview.role}
                        </h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
                            Step {currentQuestionIndex + 1} <span className="text-slate-700 mx-2">/</span> {interview.questions.length}
                        </p>
                    </div>
                    <div className="timer-pill bg-slate-900 border border-white/5 px-6 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
                        <i className="fa-solid fa-clock text-indigo-400"></i>
                        <span className="font-mono text-white text-lg font-bold">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="progress-bar w-full h-1.5 bg-slate-900 rounded-full mb-12 overflow-hidden border border-white/5">
                    <motion.div
                        className="progress-fill h-full bg-gradient-to-r from-indigo-600 to-violet-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                    ></motion.div>
                </div>

                <AnimatePresence>
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-indigo-500/20 shadow-sm">
                                {currentQ.category || 'TECHNICAL'}
                            </span>
                            <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border shadow-sm ${currentQ.difficulty_badge === 'Expert' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                currentQ.difficulty_badge === 'Hard' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                {currentQ.difficulty_badge || 'MODERATE'}
                            </span>
                        </div>

                        <div className="question-text text-3xl font-bold text-white leading-tight mb-12">
                            {currentQ.question_text}
                        </div>

                        {interview.instant_feedback && lastEvaluation ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]" />

                                <div className="flex justify-between items-center mb-8">
                                    <h4 className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs flex items-center gap-3">
                                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI Deep Feedback
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        {wasSkipped && (
                                            <div className="px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2">
                                                <i className="fa-solid fa-forward"></i> Skipped
                                            </div>
                                        )}
                                        <div className="px-6 py-2 bg-emerald-500 text-white font-black text-xl rounded-2xl shadow-lg shadow-emerald-500/20">
                                            {wasSkipped ? '0' : Math.round(lastEvaluation.score)}/10
                                        </div>
                                    </div>
                                </div>

                                {wasSkipped && (
                                    <div className="mb-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <i className="fa-solid fa-triangle-exclamation"></i> Question Skipped
                                        </p>
                                        <p className="text-sm text-slate-400">You didn't answer this question. Study the AI's ideal answer below to prepare for similar questions in real interviews.</p>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-10 mb-10">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Key Strengths</p>
                                        <p className="text-base text-slate-200 leading-relaxed font-medium">
                                            {wasSkipped ? <span className="text-slate-500 italic">No answer provided</span> : (lastEvaluation.question?.strengths || lastEvaluation.strengths)}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest">Points for Growth</p>
                                        <p className="text-base text-slate-200 leading-relaxed font-medium">{lastEvaluation.question?.weaknesses?.split('.')[0] || lastEvaluation.feedback}.</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 mb-8">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Interviewer's Ideal Perspective</p>
                                    <p className="text-sm text-slate-300 italic">"{lastEvaluation.ai_answer}"</p>
                                </div>

                                <button
                                    onClick={proceedAfterAnswer}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:scale-[1.02] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {currentQuestionIndex === interview.questions.length - 1 ? 'Finish & See Report' : 'Proceed to Next Step'}
                                    <i className={`fa-solid ${currentQuestionIndex === interview.questions.length - 1 ? 'fa-check-double' : 'fa-arrow-right'}`}></i>
                                </button>
                            </motion.div>
                        ) : (
                            <div className="relative group">
                                <textarea
                                    className={`answer-area w-full min-h-[250px] bg-slate-900/50 backdrop-blur-xl border-2 border-white/5 rounded-[2.5rem] p-8 text-lg text-slate-200 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-700 ${isThinking || fetchingNext ? 'opacity-30 pointer-events-none' : ''}`}
                                    placeholder="Synthesize your detailed technical response here..."
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    disabled={submitting || fetchingNext}
                                ></textarea>

                                {isThinking && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="relative mb-6">
                                            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <i className="fa-solid fa-brain text-indigo-400 text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></i>
                                        </div>
                                        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] text-glow-premium">Analyzing Technical Depth...</p>
                                    </div>
                                )}

                                {fetchingNext && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Next Challenge...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="session-footer flex flex-col md:flex-row gap-6 items-center justify-between mt-12 pt-8 border-t border-white/5">
                    <div className="flex gap-4">
                        {!lastEvaluation && (
                            <button
                                onClick={handleSkip}
                                disabled={submitting || fetchingNext || isThinking}
                                className="px-8 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-20 flex items-center gap-2"
                            >
                                {isThinking ? <><i className="fa-solid fa-spinner animate-spin"></i> Getting AI Answer...</> : <>Skip Concept</>}
                            </button>
                        )}
                        {!lastEvaluation && (
                            <button
                                onClick={handleRetry}
                                disabled={!answer || submitting || fetchingNext}
                                className="px-8 py-4 bg-amber-500/5 border border-amber-500/10 text-amber-500/60 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/10 transition-all disabled:opacity-20"
                            >
                                <i className="fa-solid fa-rotate-left mr-2"></i> Retry Question
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 items-center">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mr-4 hidden lg:block">Press Alt + Enter to Submit</p>
                        {!lastEvaluation && (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!answer.trim() || submitting || fetchingNext}
                                className="px-12 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:scale-[1.05] transition-all shadow-2xl shadow-indigo-600/30 disabled:opacity-20 flex items-center gap-4"
                            >
                                {currentQuestionIndex === interview.questions.length - 1 ? 'COMPLETE SESSION' : 'SUBMIT ANSWER'}
                                <i className="fa-solid fa-paper-plane text-[10px]"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .text-glow-premium {
                    text-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
                }
                textarea::placeholder {
                    opacity: 0.5;
                }
            `}</style>
        </Layout>
    );
};

export default withAuth(MockInterviewSession);
