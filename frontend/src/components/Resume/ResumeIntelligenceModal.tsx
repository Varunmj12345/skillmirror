import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getResumeIntelligenceReport } from '../../services/ai';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeIntelligenceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ResumeIntelligenceModal: React.FC<ResumeIntelligenceModalProps> = ({ isOpen, onClose }) => {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing Intelligence Engine...');
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            generateReport();
        }
    }, [isOpen]);

    const generateReport = async () => {
        setLoading(true);
        setReport(null);
        setMetrics(null);
        setStatus('Initializing Intelligence Engine...');
        
        const statuses = [
            'Analyzing Skill Graph...',
            'Evaluating Market Signals...',
            'Simulating Career Outcomes...',
            'Generating Final Report...'
        ];

        let statusIdx = 0;
        const interval = setInterval(() => {
            if (statusIdx < statuses.length) {
                setStatus(statuses[statusIdx]);
                statusIdx++;
            } else {
                clearInterval(interval);
            }
        }, 1500);

        try {
            const data = await getResumeIntelligenceReport();
            setReport(data.report);
            setMetrics(data.metrics);
        } catch (error) {
            setReport('### ⚠️ Resume Engine Fault\nUnable to generate metrics. Please retry or check your network connection.');
        } finally {
            setLoading(false);
            clearInterval(interval);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <i className="fa-solid fa-file-waveform text-indigo-400 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Metrics (Computed)</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${loading ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                        {loading ? 'Analysis in Progress' : 'AI Analysis (Interpreted)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col md:flex-row">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-20">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-t-2 border-indigo-500 animate-spin" />
                                    <i className="fa-solid fa-microchip text-indigo-400 text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-200 text-lg font-medium">{status}</p>
                                    <p className="text-slate-500 text-sm mt-2 font-mono">RESUME_NODE_EVALUATION_ACTIVE</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Left Side: Strict Verdict Panel */}
                                <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-8 shrink-0 flex flex-col">
                                    <div className="mb-8">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">FINAL SYSTEM VERDICT</h3>
                                        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <p className="font-bold text-rose-400">At Risk</p>
                                            </div>
                                            <div className="h-px bg-indigo-500/10" />
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Urgency</p>
                                                <p className="font-bold text-amber-400">High</p>
                                            </div>
                                            <div className="h-px bg-indigo-500/10" />
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Opportunity</p>
                                                <p className="font-bold text-emerald-400">Medium</p>
                                            </div>
                                        </div>
                                    </div>

                                    {metrics && (
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Confidence</p>
                                                <div className="text-2xl font-black text-slate-100">{metrics.confidence_score}%</div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Raw ATS Input</p>
                                                <div className="text-2xl font-black text-slate-100">{metrics.resume_score}/100</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: LLM Markdown Report */}
                                <div className="flex-1 p-8 bg-slate-950/50">
                                    <div className="prose prose-invert prose-indigo max-w-none animate-fade-in report-markdown">
                                        <ReactMarkdown>{report || ''}</ReactMarkdown>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && (
                        <div className="px-8 py-5 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                            <p className="text-xs text-slate-500 font-medium">Resume Decision Support Engine v2.0</p>
                            <button 
                                onClick={onClose}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Acknowledge Protocol
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            <style jsx global>{`
                .report-markdown h1 { @apply text-2xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4; }
                .report-markdown h2 { @apply text-lg font-bold text-indigo-400 mt-10 mb-4 uppercase tracking-wider; }
                .report-markdown h3 { @apply text-base font-bold text-slate-200 mt-6 mb-3; }
                .report-markdown p { @apply mb-4 text-slate-400 text-sm leading-relaxed; }
                .report-markdown ul { @apply space-y-2 mb-6 list-none pl-0; }
                .report-markdown li { @apply flex items-start gap-3 text-slate-300 text-sm; }
                .report-markdown li:before { content: '▪'; @apply text-indigo-500 font-bold; }
                .report-markdown strong { @apply text-slate-200 font-semibold; }
                
                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default ResumeIntelligenceModal;
