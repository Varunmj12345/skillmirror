import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewService, AIEngineResponse, MarketIntelligence, EvaluationMetrics } from '../../services/interviewService';

interface Props {
    interviewId: number;
    role?: string;
    level?: string;
    skills?: string[];
    onComplete: (report: any) => void;
}

const LiveInterviewSystem: React.FC<Props> = ({ 
    interviewId, 
    role = "Software Engineer", 
    level = "Mid", 
    skills = [], 
    onComplete 
}) => {
    // Session State
    const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking'>('idle');
    const [currentQuestion, setCurrentQuestion] = useState<string>("");
    const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
    const [qIndex, setQIndex] = useState(0);
    const totalQuestions = 5;

    // Intelligence State
    const [aiReport, setAiReport] = useState<AIEngineResponse | null>(null);
    const [marketPulse, setMarketPulse] = useState<MarketIntelligence | null>(null);
    const [behavioral, setBehavioral] = useState<EvaluationMetrics | null>(null);
    const [transcript, setTranscript] = useState('');

    // Audio/Video Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        startCamera();
        setupSpeechRecognition();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error('Camera access denied', err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const setupSpeechRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + event.results[i][0].transcript);
                    } else {
                        currentTranscript += event.results[i][0].transcript;
                    }
                }
            };
        }
    };

    const speak = (text: string) => {
        setStatus('speaking');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onend = () => {
            setStatus('recording');
            setTranscript('');
            if (recognitionRef.current) recognitionRef.current.start();
        };
        window.speechSynthesis.speak(utterance);
    };

    const startInterview = async () => {
        setStatus('thinking');
        try {
            const res = await interviewService.callAIEngine({
                role, level, skills,
                history: [],
                answer: "",
                index: 0,
                total: totalQuestions
            });
            if (res.question) {
                setCurrentQuestion(res.question);
                speak(res.question);
            }
        } catch (err) {
            console.error("Failed to start engine", err);
        }
    };

    const handleFinishAnswer = async () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setStatus('thinking');

        try {
            const res = await interviewService.callAIEngine({
                role, level, skills,
                history,
                answer: transcript,
                index: qIndex,
                total: totalQuestions
            });

            // Update Intelligence
            if (res.market_intelligence) setMarketPulse(res.market_intelligence);
            if (res.evaluation) setBehavioral(res.evaluation);
            setAiReport(res);

            // Update History
            const updatedHistory = [...history, { question: currentQuestion, answer: transcript }];
            setHistory(updatedHistory);

            if (res.stage === 'final_report') {
                setStatus('idle');
                onComplete(res);
                return;
            }

            // Move to Next Question (Adaptive or Mandatory)
            const nextQ = res.next_question?.question || res.question;
            if (nextQ) {
                setQIndex(prev => prev + 1);
                setCurrentQuestion(nextQ);
                speak(nextQ);
            }
        } catch (err) {
            console.error("Engine evaluation failed", err);
            setStatus('recording');
        }
    };

    return (
        <div className="relative min-h-[700px] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col font-sans">
            {/* 1. Market Intelligence Ticker (Predictive Footer) */}
            <AnimatePresence>
                {marketPulse && (
                    <motion.div 
                        initial={{ y: 50 }} animate={{ y: 0 }}
                        className="absolute bottom-0 left-0 w-full h-12 bg-indigo-600/90 backdrop-blur-xl z-50 flex items-center overflow-hidden border-t border-white/20"
                    >
                        <div className="flex gap-12 whitespace-nowrap animate-marquee px-8">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-12 items-center">
                                    <span className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                                        <i className="fa-solid fa-chart-line text-emerald-300"></i> Market Demand: {marketPulse.market_demand}
                                    </span>
                                    <span className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                                        <i className="fa-solid fa-money-bill-trend-up text-emerald-300"></i> Salary Index: {marketPulse.salary_projection}
                                    </span>
                                    <span className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                                        <i className="fa-solid fa-building text-indigo-300"></i> Hiring Now: {marketPulse.top_companies.join(", ")}
                                    </span>
                                    <span className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                                        <i className="fa-solid fa-arrow-trend-up text-emerald-300"></i> Growth: {marketPulse.growth_forecast}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Main Sandbox Workspace */}
            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* Left: Performance Metrics (Behavioral Pulse) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.02]">
                        <h4 className="text-slate-500 font-black text-[9px] uppercase tracking-widest mb-6">Behavioral Pulse</h4>
                        <div className="space-y-6">
                            {[
                                { label: 'Clarity', val: behavioral?.clarity || 0, color: 'bg-indigo-500' },
                                { label: 'Tech Accuracy', val: behavioral?.technical_accuracy || 0, color: 'bg-emerald-500' },
                                { label: 'Confidence', val: behavioral?.confidence || 0, color: 'bg-sky-500' }
                            ].map(m => (
                                <div key={m.label}>
                                    <div className="flex justify-between text-[10px] font-bold text-white mb-2">
                                        <span>{m.label}</span>
                                        <span>{m.val}/10</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: `${m.val * 10}%` }} className={`h-full ${m.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {behavioral?.filler_words && behavioral.filler_words.length > 0 && (
                            <div className="mt-8 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Hesitation Detected</p>
                                <div className="flex flex-wrap gap-2 text-[10px] text-white/50">
                                    {behavioral.filler_words.join(", ")}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.02]">
                        <h4 className="text-slate-500 font-black text-[9px] uppercase tracking-widest mb-6">Skill Gap Alerts</h4>
                        <div className="space-y-3">
                            {aiReport?.skill_gap_analysis?.missing_skills?.map(skill => (
                                <div key={skill} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-300 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-triangle-exclamation"></i> {skill}
                                </div>
                            )) || <p className="text-[10px] text-slate-600 italic">No critical gaps identified yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Center: Live Feeds */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="relative rounded-[3rem] overflow-hidden border border-white/10 aspect-video bg-[#0a0f1e] shadow-2xl">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-[9px] text-white font-black uppercase tracking-widest">
                                {status === 'recording' ? 'Live Intake' : 'Proctor Idle'}
                            </span>
                        </div>
                        
                        {/* Detection Overlay */}
                        {status === 'recording' && (
                            <div className="absolute top-6 right-6 px-4 py-1.5 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                                Analyzing Clarity...
                            </div>
                        )}
                    </div>

                    {/* Interaction Console */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-white/[0.04] backdrop-blur-3xl min-h-[200px] flex flex-col justify-center gap-4">
                        <AnimatePresence exitBeforeEnter>
                            <motion.div 
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="relative py-4"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded">AI Proctor Intelligence</span>
                                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Q{qIndex + 1} of {totalQuestions}</span>
                                </div>
                                <h2 className="text-xl text-white font-bold leading-relaxed">
                                    {currentQuestion || "Ready when you are. Start with a professional introduction."}
                                </h2>
                            </motion.div>
                        </AnimatePresence>

                        <div className="h-px w-full bg-white/5" />

                        <p className="text-sm text-slate-400 font-medium italic min-h-[1.5rem]">
                            {status === 'recording' ? `"${transcript || 'Listening to your response...'}"` : status === 'thinking' ? 'AI synthesizing evaluation...' : ''}
                        </p>
                    </div>
                </div>

                {/* Right: AI Proctor Feed */}
                <div className="lg:col-span-3 flex flex-col">
                    <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-white/10 bg-[#020617] flex flex-col items-center justify-center p-8 group shadow-2xl">
                        <div className="absolute inset-0 spotlight-bg opacity-20" />
                        <motion.div 
                            animate={status === 'speaking' ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                            className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${status === 'speaking' ? 'bg-indigo-500/20 border-2 border-indigo-400/50 shadow-[0_0_50px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border border-white/5'}`}
                        >
                            <i className={`fa-solid fa-robot text-5xl ${status === 'speaking' ? 'text-indigo-400' : 'text-slate-800'}`}></i>
                        </motion.div>
                        <div className="mt-8 text-center">
                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-2">Master Intelligence Engine</p>
                            <div className="flex items-center justify-center gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <motion.div 
                                        key={i} 
                                        animate={status === 'speaking' ? { height: [4, 12, 4] } : { height: 4 }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        className="w-1 bg-indigo-500 rounded-full" 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Adaptive Status Pill */}
                        <div className="absolute bottom-8 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                                Mode: {qIndex < 3 ? 'Mandatory Core' : 'Adaptive Branching'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        {status === 'idle' ? (
                            <button onClick={startInterview} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20">
                                Start Sandbox session
                            </button>
                        ) : (
                            <button 
                                onClick={handleFinishAnswer} 
                                disabled={status !== 'recording'}
                                className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-500/20 hover:border-rose-500/30 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                            >
                                <i className={`fa-solid ${status === 'thinking' ? 'fa-spinner fa-spin' : 'fa-stop text-rose-500'}`}></i>
                                {status === 'thinking' ? 'Synthesizing...' : 'Finish Answer'}
                            </button>
                        )}
                        <button onClick={() => onComplete(aiReport)} className="w-full py-4 text-slate-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.3em]">
                            Terminate & View Insights
                        </button>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}} />
        </div>
    );
};

export default LiveInterviewSystem;
