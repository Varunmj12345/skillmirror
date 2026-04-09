import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

interface PhaseMiniMockProps {
    stepId: number;
    stepTitle: string;
}

const PhaseMiniMock: React.FC<PhaseMiniMockProps> = ({ stepId, stepTitle }) => {
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const startMock = async () => {
        setLoading(true);
        try {
            const res: any = await apiClient.get(`/roadmaps/mini-mock/?step_id=${stepId}`);
            setQuestions(res.questions || []);
            setStarted(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const submitMock = async () => {
        const mockScore = 85; // Simulated scoring logic
        setLoading(true);
        try {
            await apiClient.post('/roadmaps/mini-mock/', { step_id: stepId, score: mockScore });
            setScore(mockScore);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (score !== null) {
        return (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center animate-in zoom-in-95 duration-300">
                <i className="fa-solid fa-circle-check text-emerald-400 text-2xl mb-2"></i>
                <p className="text-xs font-black text-white uppercase tracking-widest">Phase Validated</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Simulated Score: {score}% • Mastery Updated</p>
            </div>
        );
    }

    if (started) {
        return (
            <div className="glass-panel p-5 border-indigo-500/30 bg-slate-900/60 animate-in fade-in duration-500">
                <h6 className="text-xs font-black text-white uppercase tracking-widest mb-4">Phase Validation: {stepTitle}</h6>
                <ul className="space-y-4 mb-6">
                    {questions.map((q, i) => (
                        <li key={i} className="text-[11px] text-slate-300 font-medium leading-relaxed flex gap-3">
                            <span className="text-indigo-400 font-black">{i + 1}.</span>
                            {q}
                        </li>
                    ))}
                </ul>
                <button
                    onClick={submitMock}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    {loading ? 'Evaluating...' : 'Submit Session'}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-2xl border border-dashed border-slate-800 text-center group hover:border-indigo-500/40 transition-all">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">AI Phase Validation Available</p>
            <button
                onClick={startMock}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
            >
                {loading ? 'Generating...' : 'Start AI Mini-Mock'}
            </button>
        </div>
    );
};

export default PhaseMiniMock;
