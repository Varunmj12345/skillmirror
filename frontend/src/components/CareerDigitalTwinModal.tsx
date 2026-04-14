import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { getCareerDigitalTwinReport } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';

interface CareerDigitalTwinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BOOT_SEQUENCE = [
    'Initializing Digital Twin Engine...',
    'Loading Neural Career Graph...',
    'Mapping Skill Topology...',
    'Simulating Market Trajectories...',
    'Computing Decay Vectors...',
    'Synthesizing Twin Intelligence...',
    'Finalizing Simulation Output...',
];

const CareerDigitalTwinModal: React.FC<CareerDigitalTwinModalProps> = ({ isOpen, onClose }) => {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(BOOT_SEQUENCE[0]);
    const [statusIdx, setStatusIdx] = useState(0);
    const [metrics, setMetrics] = useState<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isOpen) runSimulation();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isOpen]);

    const runSimulation = async () => {
        setLoading(true);
        setReport(null);
        setMetrics(null);
        setStatusIdx(0);
        setStatus(BOOT_SEQUENCE[0]);

        let idx = 0;
        timerRef.current = setInterval(() => {
            idx = Math.min(idx + 1, BOOT_SEQUENCE.length - 1);
            setStatusIdx(idx);
            setStatus(BOOT_SEQUENCE[idx]);
        }, 1800);

        try {
            const data = await getCareerDigitalTwinReport();
            setReport(data.report);
            setMetrics(data.metrics);
        } catch {
            // Never show a raw error — generate a minimal local twin output
            setReport(`⚠️ SYSTEM STATUS
- Live AI: Unavailable
- Mode: Fallback Simulation

---

### 1. 🧬 Digital Twin Identity

- **Current State:** Developing
- **Stability Level:** Medium
- **Adaptability:** Medium

---

### 2. ⚙️ Computed Behavioral Summary

- **Learning Activity Level:** System sync pending
- **Market Alignment Level:** Awaiting metrics
- **Competitive Standing:** Handshake required

---

### 5. 🚧 System Limitation Notice

- Detailed AI interpretation is unavailable
- Advanced insights and strategic recommendations are temporarily disabled

---

### 6. 🔁 Recovery Instruction

- Restore AI functionality by configuring \`GROQ_API_KEY\` in backend environment

---

*[Digital Twin Engine — Connection unavailable]*`);
        } finally {
            setLoading(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 24 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-4xl max-h-[92vh] bg-[#080d18] border border-cyan-500/20 rounded-[2rem] shadow-[0_0_80px_-20px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col"
                >
                    {/* Scan line animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-[scan_4s_linear_infinite]" style={{ top: '30%' }} />
                    </div>

                    {/* Header */}
                    <div className="relative px-8 py-5 border-b border-cyan-500/10 flex justify-between items-center bg-cyan-500/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <i className="fa-solid fa-dna text-cyan-400 text-lg" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white tracking-tight uppercase">Career Digital Twin Engine</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${loading ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                        {loading ? 'SIMULATION RUNNING' : 'TWIN SYNC COMPLETE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 space-y-10">
                                {/* Twin animation */}
                                <div className="relative w-28 h-28">
                                    <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
                                    <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-4 rounded-full border border-cyan-300/20 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <i className="fa-solid fa-dna text-cyan-400 text-2xl animate-pulse" />
                                    </div>
                                </div>

                                <div className="text-center space-y-2 max-w-sm">
                                    <p className="text-white font-semibold tracking-wide">{status}</p>
                                    <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
                                        TWIN_NODE_{statusIdx + 1}/{BOOT_SEQUENCE.length}_INITIALIZING
                                    </p>
                                    {/* Boot steps */}
                                    <div className="mt-6 space-y-1 text-left">
                                        {BOOT_SEQUENCE.slice(0, statusIdx + 1).map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px]">
                                                <i className={`fa-solid fa-check text-[8px] ${i < statusIdx ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'}`} />
                                                <span className={i < statusIdx ? 'text-slate-500' : 'text-slate-300'}>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8">
                                <div className="prose prose-invert max-w-none twin-report">
                                    <ReactMarkdown>{report || ''}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && (
                        <div className="px-8 py-4 border-t border-cyan-500/10 bg-cyan-500/[0.02] flex justify-between items-center">
                            <p className="text-[10px] text-slate-600 font-mono">TWIN_ENGINE_v1.0 · SIMULATION_COMPLETE</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={runSimulation}
                                    className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-rotate-right" />
                                    Re-Simulate
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-[10px] font-black text-slate-950 uppercase tracking-widest transition-all"
                                >
                                    Acknowledge Twin
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <style jsx global>{`
                .twin-report h2 {
                    color: #22d3ee;
                    font-size: 0.9rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(6, 182, 212, 0.15);
                }
                .twin-report h3 {
                    color: #67e8f9;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .twin-report p {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    line-height: 1.7;
                    margin-bottom: 0.75rem;
                }
                .twin-report li {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    margin-bottom: 0.3rem;
                    list-style: none;
                    padding-left: 0;
                }
                .twin-report li::before {
                    content: '▸ ';
                    color: #22d3ee;
                    font-weight: bold;
                }
                .twin-report strong {
                    color: #e2e8f0;
                    font-weight: 700;
                }
                .twin-report hr {
                    border-color: rgba(6, 182, 212, 0.1);
                    margin: 1.5rem 0;
                }
                .twin-report blockquote {
                    border-left: 2px solid #22d3ee;
                    padding-left: 1rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-style: italic;
                }
                @keyframes scan {
                    0% { top: -5%; }
                    100% { top: 105%; }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default CareerDigitalTwinModal;
