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

            if (res.market_intelligence) setMarketPulse(res.market_intelligence);
            if (res.evaluation) setBehavioral(res.evaluation);
            setAiReport(res);

            const updatedHistory = [...history, { question: currentQuestion, answer: transcript }];
            setHistory(updatedHistory);

            if (res.stage === 'final_report') {
                setStatus('idle');
                onComplete(res);
                return;
            }

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
        <div className="relative min-h-[640px] bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col font-mono">
            {/* Main Sandbox Workspace */}
            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                {/* Left: Performance Metrics (Behavioral Pulse) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                            <h4 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Behavioral Pulse</h4>
                        </div>
                        <div className="space-y-4 pt-1">
                            {[
                                { label: 'Clarity Index', val: behavioral?.clarity || 0, color: 'bg-amber-400' },
                                { label: 'Technical Depth', val: behavioral?.technical_accuracy || 0, color: 'bg-emerald-400' },
                                { label: 'Delivery Cadence', val: behavioral?.confidence || 0, color: 'bg-zinc-200' }
                            ].map(m => (
                                <div key={m.label} className="space-y-1">
                                    <div className="flex justify-between text-[11px] text-zinc-400">
                                        <span>{m.label}</span>
                                        <span className="text-zinc-200 font-bold tabular-nums">{m.val} / 10</span>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: `${m.val * 10}%` }} className={`h-full ${m.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {behavioral?.filler_words && behavioral.filler_words.length > 0 && (
                            <div className="mt-4 p-2.5 bg-zinc-900 border border-amber-500/30 rounded-lg">
                                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Hesitation Triggers</p>
                                <div className="text-[10px] text-zinc-400">
                                    {behavioral.filler_words.join(", ")}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-rose-400"></span>
                            <h4 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Gap Telemetry</h4>
                        </div>
                        <div className="space-y-2">
                            {aiReport?.skill_gap_analysis?.missing_skills?.map(skill => (
                                <div key={skill} className="px-3 py-1.5 bg-zinc-900 border border-rose-500/30 rounded-lg text-[10px] text-rose-300 font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-triangle-exclamation text-[9px]"></i> {skill}
                                </div>
                            )) || <p className="text-[11px] text-zinc-500 italic">No critical anomalies flagged yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Center: Live Feeds */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-lg border border-zinc-800 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-sm ${status === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-600'}`} />
                            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                                {status === 'recording' ? 'Audio Stream: Active' : 'Camera Ready'}
                            </span>
                        </div>
                        
                        {status === 'recording' && (
                            <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-zinc-950 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                Ingesting STT...
                            </div>
                        )}
                    </div>

                    {/* Interaction Console */}
                    <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 min-h-[160px] flex flex-col justify-center gap-3">
                        <AnimatePresence>
                            <motion.div 
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-amber-400 text-[9px] font-bold uppercase tracking-wider rounded">
                                        PROCTOR DIRECTIVE
                                    </span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Q{qIndex + 1} OF {totalQuestions}</span>
                                </div>
                                <h2 className="text-base sm:text-lg text-zinc-100 font-bold leading-snug">
                                    {currentQuestion || "Environment armed. Initialize the session to receive your first architecture scenario."}
                                </h2>
                            </motion.div>
                        </AnimatePresence>

                        <div className="h-px w-full bg-zinc-850" />

                        <p className="text-xs text-zinc-400 italic min-h-[1.5rem]">
                            {status === 'recording' ? `"${transcript || 'Streaming spoken response...'}"` : status === 'thinking' ? 'Synthesizing technical evaluation...' : ''}
                        </p>
                    </div>
                </div>

                {/* Right: AI Proctor Feed */}
                <div className="lg:col-span-3 flex flex-col justify-between gap-4">
                    <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${status === 'speaking' ? 'bg-amber-400/10 border border-amber-400/40 text-amber-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-600'}`}>
                            <i className="fa-solid fa-microchip text-3xl"></i>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">AI Proctor State</p>
                            <span className="text-xs text-zinc-200 font-bold uppercase tracking-wider">
                                {status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {status === 'idle' ? (
                            <button onClick={startInterview} className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm">
                                Start Session Loop
                            </button>
                        ) : (
                            <button 
                                onClick={handleFinishAnswer} 
                                disabled={status !== 'recording'}
                                className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                            >
                                <i className={`fa-solid ${status === 'thinking' ? 'fa-spinner fa-spin' : 'fa-check text-xs'}`}></i>
                                <span>{status === 'thinking' ? 'Synthesizing...' : 'Complete Response'}</span>
                            </button>
                        )}
                        <button onClick={() => onComplete(aiReport)} className="w-full py-2.5 text-zinc-500 hover:text-zinc-200 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                            Terminate & View Telemetry
                        </button>
                    </div>
                </div>
            </div>

            {/* Market Intelligence Ticker */}
            {marketPulse && (
                <div className="w-full py-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center overflow-hidden">
                    <div className="flex gap-8 whitespace-nowrap px-6 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-chart-line text-emerald-400"></i> Market Demand: <strong className="text-zinc-200">{marketPulse.market_demand}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-money-bill-trend-up text-amber-400"></i> Salary Index: <strong className="text-zinc-200">{marketPulse.salary_projection}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-building text-zinc-400"></i> Target Cos: <strong className="text-zinc-200">{marketPulse.top_companies?.join(", ")}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-arrow-trend-up text-emerald-400"></i> Growth: <strong className="text-zinc-200">{marketPulse.growth_forecast}</strong>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveInterviewSystem;
