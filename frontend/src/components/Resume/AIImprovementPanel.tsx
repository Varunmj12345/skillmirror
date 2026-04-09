import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

interface Props {
    skills?: string[];
    role?: string;
}

const AIImprovementPanel: React.FC<Props> = ({ skills = [], role = 'Software Developer' }) => {
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
        indigo: 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30',
        emerald: 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30',
        amber: 'bg-amber-600/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30',
    };
    const activeMap: Record<string, string> = {
        indigo: 'bg-indigo-600 border-indigo-500 text-white',
        emerald: 'bg-emerald-600 border-emerald-500 text-white',
        amber: 'bg-amber-600 border-amber-500 text-white',
    };

    return (
        <div className="glass-panel p-6 border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-50 mb-5 flex items-center gap-2">
                <i className="fa-solid fa-brain text-purple-400 text-xs"></i>
                AI Improvement Engine
            </h3>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-5 flex-wrap">
                {MODES.map(m => (
                    <button
                        key={m.key}
                        onClick={() => setMode(m.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${mode === m.key ? activeMap[m.color] : colorMap[m.color]}`}
                    >
                        <i className={`fa-solid ${m.icon} text-[10px]`}></i>
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="space-y-3">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                        {mode === 'improve' ? 'Paste your resume section to improve' :
                            mode === 'summary' ? 'Paste your skills / experience context' :
                                'Paste your skills or target role text'}
                    </label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mode === 'improve'
                            ? 'Paste bullet points, summary, or experience section...'
                            : mode === 'summary'
                                ? 'e.g. 5yr exp in React, Node.js, AWS, led team of 4...'
                                : 'e.g. Frontend Developer with React, CSS, TypeScript...'}
                        rows={5}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-700 outline-none focus:border-indigo-500/50 resize-none transition-all"
                    />
                </div>

                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                    {loading
                        ? <><i className="fa-solid fa-circle-notch fa-spin"></i> AI is working...</>
                        : <><i className="fa-solid fa-sparkles"></i> Run AI Improvement</>}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className="mt-5 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Output</h4>
                        <button
                            onClick={() => navigator.clipboard.writeText(result)}
                            className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                            <i className="fa-solid fa-copy"></i> Copy
                        </button>
                    </div>
                    <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-xl text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIImprovementPanel;
