import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

interface Props {
    skills?: string[];
    role?: string;
    injections?: string[];
}

const AIImprovementPanel: React.FC<Props> = ({ skills = [], role = 'Software Developer', injections = [] }) => {
    const [mode, setMode] = useState<'improve' | 'summary' | 'keywords'>('improve');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const MODES = [
        { key: 'improve', label: 'Auto Improve', icon: 'fa-wand-magic-sparkles', color: 'indigo' },
        { key: 'summary', label: 'Generate Summary', icon: 'fa-align-left', color: 'emerald' },
        { key: 'keywords', label: 'Suggest Keywords', icon: 'fa-key', color: 'amber' },
    ] as const;

    const handleRun = async () => {
        setLoading(true);
        setResult('');
        const content = input || skills.join(', ');
        try {
            const res = await apiClient.post('/api/skills/resume/ai-improve/', {
                action: mode,
                content,
                role
            }) as any;
            setResult(res.result || 'No result returned.');
        } catch (e: any) {
            setResult('AI improvement failed. Please check your API key.');
        } finally {
            setLoading(false);
        }
    };

    const colorMap: Record<string, string> = {
        indigo: 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700',
        emerald: 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700',
        amber: 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700',
    };
    const activeMap: Record<string, string> = {
        indigo: 'bg-zinc-800 border-amber-400/40 text-amber-400 font-bold shadow-sm',
        emerald: 'bg-zinc-800 border-amber-400/40 text-amber-400 font-bold shadow-sm',
        amber: 'bg-zinc-800 border-amber-400/40 text-amber-400 font-bold shadow-sm',
    };

    return (
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 font-mono">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                    AI Improvement Engine
                </h3>
            </div>

            {/* Keyword Injections */}
            {injections.length > 0 && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2.5">
                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-syringe text-xs"></i> High-Impact Keyword Injections
                    </h4>
                    <div className="space-y-1.5">
                        {injections.map((inj, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                                <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                                    {idx + 1}
                                </div>
                                <p>{inj}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mode Selector */}
            <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                    {MODES.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setMode(m.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border transition-all ${mode === m.key ? activeMap[m.color] : colorMap[m.color]}`}
                        >
                            <i className={`fa-solid ${m.icon} text-[10px]`}></i>
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1.5">
                            {mode === 'improve' ? 'Paste resume section to improve' :
                                mode === 'summary' ? 'Paste skills or experience context' :
                                    'Paste targeted role text'}
                        </label>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={mode === 'improve'
                                ? 'Paste bullet points, summary, or experience section...'
                                : mode === 'summary'
                                    ? 'e.g. 5yr exp in React, Node.js, AWS, led engineering squad...'
                                    : 'e.g. Frontend Developer with React, CSS, TypeScript...'}
                            rows={5}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-400 resize-none transition-all"
                        />
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading
                            ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                            : <><i className="fa-solid fa-wand-magic-sparkles"></i> Run AI Optimization</>}
                    </button>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className="animate-in fade-in duration-300 pt-2">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">AI Synthesized Output</h4>
                        <button
                            onClick={() => navigator.clipboard.writeText(result)}
                            className="text-[9px] text-amber-400 hover:underline uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                            <i className="fa-solid fa-copy"></i> Copy Output
                        </button>
                    </div>
                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIImprovementPanel;
