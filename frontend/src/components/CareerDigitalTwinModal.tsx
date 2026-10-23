import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getCareerDigitalTwinReport } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';
import CareerDigitalTwin from './CareerDigitalTwin';

interface CareerDigitalTwinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BOOT_SEQUENCE = [
    'Initializing Career Simulation...',
    'Loading Neural Career Graph...',
    'Mapping Skill Topology...',
    'Simulating Market Trajectories...',
    'Computing Decay Vectors...',
    'Synthesizing Career Insights...',
    'Finalizing Simulation Output...',
];

const CareerDigitalTwinModal: React.FC<CareerDigitalTwinModalProps> = ({ isOpen, onClose }) => {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(BOOT_SEQUENCE[0]);
    const [statusIdx, setStatusIdx] = useState(0);
    const [metrics, setMetrics] = useState<any>(null);
    const router = useRouter();
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
            setMetrics({
                user_skills: "System Handshake, Connection Node",
                projects: "N/A",
                experience: "N/A",
                target_role: "N/A",
                risk_score: 50,
                confidence_score: 50,
                market_score: 50,
                activity_score: 0,
                competition_score: 50,
                no_action: { job_prob: "45%", salary: "Declining", risk_trend: "Critical" },
                moderate: { improvements: "Re-establishing connection", growth: "0%" },
                smart: { maximum_potential: "System Operator", improvement_vs_none: "0%" },
                trending_skills: "AI Infrastructure, DevOps",
                declining_skills: "Manual Configuration",
                percentile: 50,
                peer_gap: "Connection lost"
            });
            setReport(`⚠️ SYSTEM STATUS... (Fallback)`);
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
                    initial={{ scale: 0.96, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 16 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="relative px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-amber-500">
                                <i className="fa-solid fa-dna text-xs" />
                            </div>
                            <div>
                                <h2 className="text-sm font-normal text-white tracking-tight">Career Path Simulation</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-1.5 h-1.5 ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                                        {loading ? 'SIMULATION IN PROGRESS' : 'SIMULATION READY'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            title="Close"
                            className="w-8 h-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-xs" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 space-y-8">
                                <div className="w-16 h-16 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-amber-500">
                                    <i className="fa-solid fa-dna text-xl animate-pulse" />
                                </div>

                                <div className="text-center space-y-2 max-w-sm">
                                    <p className="text-white font-mono text-xs">{status}</p>
                                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                                        SIMULATION STEP {statusIdx + 1} OF {BOOT_SEQUENCE.length}
                                    </p>
                                    {/* Boot steps */}
                                    <div className="mt-6 space-y-1 text-left border border-zinc-800 bg-zinc-900/40 p-4">
                                        {BOOT_SEQUENCE.slice(0, statusIdx + 1).map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                                                <i className={`fa-solid fa-check text-[8px] ${i < statusIdx ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`} />
                                                <span className={i < statusIdx ? 'text-zinc-500' : 'text-zinc-300'}>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 md:p-8">
                                <CareerDigitalTwin 
                                    metrics={metrics} 
                                    onResimulate={runSimulation}
                                    onAccept={() => {
                                        onClose();
                                        router.push('/roadmap?generate=true');
                                    }} 
                                />
                            </div>
                        )}
                    </div>
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
