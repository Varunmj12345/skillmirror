import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewService } from '../../services/interviewService';

interface Props {
    interviewId: number;
    roomId?: string;
    onComplete: () => void;
}

const LiveInterviewSystem: React.FC<Props> = ({ interviewId, roomId, onComplete }) => {
    const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking'>('idle');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [isAIVoiceActive, setIsAIVoiceActive] = useState(false);

    // WebRTC & Audio Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        startCamera();
        setupSpeechRecognition();
        return () => {
            stopCamera();
        };
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
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
            };
        }
    };

    const speak = (text: string) => {
        setIsAIVoiceActive(true);
        setStatus('speaking');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setIsAIVoiceActive(false);
            setStatus('recording');
            startRecording();
        };
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        setTranscript('');
        if (recognitionRef.current) recognitionRef.current.start();

        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = handleRecordingStop;
            mediaRecorderRef.current.start();
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        setStatus('thinking');
    };

    const handleRecordingStop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        setStatus('thinking');

        try {
            const currentQ = questions[currentQIndex];

            // 1. Fire background tasks (Don't hold up UI)
            if (currentQ?.id && transcript) {
                interviewService.evaluateAnswer(currentQ.id, transcript).catch(e => console.error("Eval Error", e));
                // interviewService.processAudio(currentQ.id, audioBlob).catch(e => console.error("Audio Error", e));
            }

            // 2. Move to the next pre-generated question
            const nextIdx = currentQIndex + 1;
            if (nextIdx < questions.length) {
                setCurrentQIndex(nextIdx);
                speak(questions[nextIdx].question_text);
            } else {
                // Interview complete!
                setStatus('idle');
                onComplete();
            }
        } catch (err) {
            console.error('Processing failed', err);
            setStatus('idle');
        }
    };

    const initializeInterview = async () => {
        // Mock starter question or load from interviewId
        const res = await interviewService.getDetail(interviewId);
        const data = res as any;
        setQuestions(data.questions);
        if (data.questions.length > 0) {
            speak(data.questions[0].question_text);
        }
    };

    return (
        <div className="relative min-h-[600px] bg-slate-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="relative z-10 p-8 flex flex-col h-full h-[600px]">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <i className="fa-solid fa-robot text-indigo-400 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-white font-bold tracking-tight">SkillMirror AI Interviewer</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Secure Real-time Session</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                    {/* User Feed - Left */}
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0f1e] group shadow-2xl">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />

                        <div className="absolute top-6 left-6">
                            <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[9px] text-white font-black uppercase tracking-widest">Candidate Feed</span>
                            </div>
                        </div>

                        {/* Audio Waveform Simulation */}
                        {status === 'recording' && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-16">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [10, Math.random() * 50 + 10, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                                        className="w-2 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Interviewer Feed - Right */}
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#020617] flex flex-col items-center justify-center group shadow-2xl">
                        <div className="absolute inset-0 spotlight-bg opacity-40" />

                        {/* Avatar Simulation */}
                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                animate={status === 'speaking' ? {
                                    scale: [1, 1.05, 1],
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={`w-44 h-44 rounded-[3rem] flex items-center justify-center transition-all duration-1000 relative ${status === 'speaking' ? 'bg-indigo-600/20 shadow-[0_0_80px_rgba(99,102,241,0.5)] border-2 border-indigo-400' : 'bg-slate-900 border-2 border-white/5'}`}
                            >
                                <div className="absolute inset-3 border border-white/5 rounded-[2.5rem]" />
                                <i className={`fa-solid fa-headset text-6xl ${status === 'speaking' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
                            </motion.div>

                            <div className="mt-12 text-center">
                                <p className="text-xs text-indigo-200 font-black uppercase tracking-[0.5em] mb-3">AI PROCTOR</p>
                            </div>
                        </div>

                        {/* Thinking Overlay */}
                        <AnimatePresence>
                            {status === 'thinking' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-20"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-8 scale-125">
                                            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                            <i className="fa-solid fa-brain text-indigo-400 text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] text-glow-premium animate-pulse">Neural synthesis...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Interaction Console */}
                <div className="mt-8 p-8 glass-panel border-white/10 bg-white/[0.04] backdrop-blur-3xl flex flex-col items-center gap-8 rounded-[2rem]">

                    {/* Persistent Question Display */}
                    {(status === 'recording' || status === 'speaking' || status === 'thinking') && questions[currentQIndex] && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-4xl p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <div className="flex items-center gap-3 mb-3">
                                <div className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">Question {currentQIndex + 1}</div>
                                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI Deep Feedback
                                </span>
                            </div>
                            <p className="text-lg text-white font-bold leading-relaxed">
                                {questions[currentQIndex]?.question_text}
                            </p>

                            {status === 'speaking' && (
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute top-4 right-4 text-indigo-400"
                                >
                                    <i className="fa-solid fa-volume-high"></i>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
                        <div className="flex-1 w-full max-w-3xl">
                            {status === 'recording' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative py-4 px-6 bg-rose-500/5 rounded-[1.5rem] border border-rose-500/20 shadow-inner"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">LIVE TRANSCRIPTION (YOUR RESPONSE)</span>
                                        </div>
                                    </div>
                                    <p className="text-base text-slate-200 font-medium leading-relaxed italic line-clamp-1">
                                        "{transcript || 'Listening for your response...'}"
                                    </p>
                                </motion.div>
                            ) : status === 'speaking' ? (
                                <div className="flex items-center gap-4 text-indigo-400">
                                    <i className="fa-solid fa-volume-high animate-pulse"></i>
                                    <p className="text-sm font-bold uppercase tracking-widest text-[10px]">AI Interviewer is speaking... Please listen and respond.</p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 font-medium">Ready to start your high-fidelity practice session.</p>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            {status === 'idle' ? (
                                <button
                                    onClick={initializeInterview}
                                    className="px-12 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:scale-[1.05] transition-all shadow-2xl shadow-indigo-600/40"
                                >
                                    Start Interview
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={stopRecording}
                                        disabled={status !== 'recording'}
                                        className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all disabled:opacity-20 flex items-center gap-4"
                                    >
                                        <i className="fa-solid fa-stop text-rose-500"></i>
                                        Finish Answer
                                    </button>
                                    <button
                                        onClick={onComplete}
                                        className="px-8 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl flex items-center gap-3"
                                    >
                                        End & Analyze <i className="fa-solid fa-chart-line"></i>
                                    </button>
                                </div>
                            )}
                            <button onClick={onComplete} title="Complete Session" className="w-14 h-14 flex items-center justify-center rounded-[1.8rem] bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-lg hover:shadow-rose-500/40">
                                <i className="fa-solid fa-phone-slash text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveInterviewSystem;
