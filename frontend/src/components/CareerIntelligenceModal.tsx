import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getCareerIntelligenceReport } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';

interface CareerIntelligenceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CareerIntelligenceModal: React.FC<CareerIntelligenceModalProps> = ({ isOpen, onClose }) => {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing Intelligence Engine...');

    useEffect(() => {
        if (isOpen) {
            generateReport();
        }
    }, [isOpen]);

    const generateReport = async () => {
        setLoading(true);
        setReport(null);
        setStatus('Initializing Intelligence Node...');
        
        // Visual status updates for "System Feel"
        const statuses = [
            'Analyzing User Skill Matrix...',
            'Calculating Market Alignment Index...',
            'Computing Career Risk Score...',
            'Simulating Future Scenarios...',
            'Synthesizing Analytical Insights...'
        ];

        let statusIdx = 0;
        const interval = setInterval(() => {
            if (statusIdx < statuses.length) {
                setStatus(statuses[statusIdx]);
                statusIdx++;
            } else {
                clearInterval(interval);
            }
        }, 1200);

        try {
            const data = await getCareerIntelligenceReport();
            setReport(data.report);
        } catch (error) {
            setReport('### ⚠️ System Error\nFailed to establish neural connection to the Career Intelligence Engine. Please verify your connection and try again.');
        } finally {
            setLoading(false);
            clearInterval(interval);
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
                    className="absolute inset-0 bg-brand-obsidian/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] sm-glass bg-brand-obsidian/95 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-neural/20 flex items-center justify-center border border-brand-neural/30 shadow-glass-glow shadow-brand-neural/20">
                                <i className="fa-solid fa-microchip-ai text-brand-neural text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">AI Career Intelligence Report</h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-brand-neural animate-pulse' : 'bg-brand-emerald'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${loading ? 'text-brand-neural' : 'text-brand-emerald'}`}>
                                        {loading ? 'Processing Analysis' : 'Analysis Complete'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-8 py-12">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-t-2 border-brand-neural animate-spin" />
                                    <i className="fa-solid fa-brain text-brand-neural text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white text-lg font-medium tracking-wide">{status}</p>
                                    <p className="text-slate-500 text-sm mt-2 font-mono">NEURAL_TRAJECTORY_SIMULATION_ACTIVE</p>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none pt-2 animate-fade-in">
                                <div className="report-markdown text-slate-300 leading-relaxed font-outfit">
                                    <ReactMarkdown>{report || ''}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Actions */}
                    {!loading && (
                        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <p className="text-xs text-slate-500 font-medium">Generated by SkillMirror Intelligence Engine v1.1</p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => window.print()}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-file-pdf" />
                                    Export PDF
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-brand-neural hover:shadow-glass-glow shadow-brand-neural/40 rounded-xl text-xs font-bold text-white transition-all"
                                >
                                    Acknowledge Insights
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <style jsx global>{`
                .report-markdown h1 { @apply text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4; }
                .report-markdown h2 { @apply text-2xl font-bold text-brand-neural mt-10 mb-4 flex items-center; }
                .report-markdown h3 { @apply text-xl font-bold text-white mt-8 mb-3; }
                .report-markdown p { @apply mb-5 text-slate-300; }
                .report-markdown ul { @apply space-y-3 mb-6 list-none pl-0; }
                .report-markdown li { @apply flex items-start gap-3 text-slate-400; }
                .report-markdown li:before { content: '→'; @apply text-brand-neural font-bold; }
                .report-markdown strong { @apply text-white font-semibold; }
                .report-markdown hr { @apply border-white/5 my-8; }
                
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default CareerIntelligenceModal;
