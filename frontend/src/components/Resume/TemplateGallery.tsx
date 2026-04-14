import React, { useState } from 'react';

export interface TemplateConfig {
    id: string;
    name: string;
    category: string;
    color: string;
    font: string;
    layout: '1-col' | '2-col';
    accent: string;
}

interface Props {
    selected: TemplateConfig;
    onSelect: (t: TemplateConfig) => void;
}

import CommunityGallery from './CommunityGallery';

const CATEGORIES = ['All', 'Modern', 'ATS-Friendly', 'Minimal', 'Creative', 'Corporate', 'Tech'];

const COLORS = [
    { name: 'Midnight', value: '#1e293b' },
    { name: 'Indigo Pro', value: '#4f46e5' },
    { name: 'Sky Tech', value: '#0ea5e9' },
    { name: 'Emerald Soft', value: '#059669' },
    { name: 'Slate Gold', value: '#475569' },
];

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Source Sans', 'Merriweather'];

const TEMPLATES: Omit<TemplateConfig, 'color' | 'font' | 'layout'>[] = [
    { id: 't1', name: 'Nova', category: 'Modern', accent: '#4f46e5' },
    { id: 't2', name: 'Apex', category: 'Modern', accent: '#0ea5e9' },
    { id: 't3', name: 'Clean Pro', category: 'ATS-Friendly', accent: '#059669' },
    { id: 't4', name: 'ATS Max', category: 'ATS-Friendly', accent: '#64748b' },
    { id: 't5', name: 'Zen', category: 'Minimal', accent: '#1e293b' },
    { id: 't6', name: 'Pure', category: 'Minimal', accent: '#94a3b8' },
    { id: 't7', name: 'Slate', category: 'Minimal', accent: '#475569' },
    { id: 't8', name: 'Vivid', category: 'Creative', accent: '#f43f5e' },
    { id: 't9', name: 'Spectrum', category: 'Creative', accent: '#a855f7' },
    { id: 't10', name: 'Canvas', category: 'Creative', accent: '#f59e0b' },
    { id: 't11', name: 'Executive', category: 'Corporate', accent: '#1e40af' },
    { id: 't12', name: 'Summit', category: 'Corporate', accent: '#1e3a5f' },
    { id: 't13', name: 'Prestige', category: 'Corporate', accent: '#0f172a' },
    { id: 't14', name: 'Binary', category: 'Tech', accent: '#4f46e5' },
    { id: 't15', name: 'Stack', category: 'Tech', accent: '#22d3ee' },
    { id: 't16', name: 'Deploy', category: 'Tech', accent: '#059669' },
    { id: 't17', name: 'Circuit', category: 'Tech', accent: '#a855f7' },
    { id: 't18', name: 'Lumina', category: 'Modern', accent: '#f59e0b' },
    { id: 't19', name: 'Clarity', category: 'ATS-Friendly', accent: '#0ea5e9' },
    { id: 't20', name: 'Forma', category: 'Corporate', accent: '#334155' },
    { id: 't21', name: 'Pulse', category: 'Modern', accent: '#ec4899' },
    { id: 't22', name: 'Aegis', category: 'Creative', accent: '#7c3aed' },
];

const TemplateGallery: React.FC<Props> = ({ selected, onSelect }) => {
    const [view, setView] = useState<'standard' | 'community'>('standard');
    const [requestedShare, setRequestedShare] = useState(false);
    const [filter, setFilter] = useState('All');

    const [globalColor, setGlobalColor] = useState(selected.color);
    const [globalFont, setGlobalFont] = useState(selected.font);
    const [globalLayout, setGlobalLayout] = useState<'1-col' | '2-col'>(selected.layout);

    const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

    const selectTemplate = (t: typeof TEMPLATES[0]) => {
        const newLayout = (t.category === 'Creative' || t.category === 'Tech') ? '2-col' : '1-col';
        const newColor = t.accent;
        const newFont = (t.category === 'Corporate' || t.category === 'Modern' || t.category === 'Tech') ? 'Merriweather' : 'Inter';
        setGlobalLayout(newLayout);
        setGlobalColor(newColor);
        setGlobalFont(newFont);
        onSelect({ id: t.id, name: t.name, category: t.category, accent: t.accent, color: newColor, font: newFont, layout: newLayout } as TemplateConfig);
    };

    return (
        <div className="space-y-6">
            {/* Gallery Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
                {(['standard', 'community'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {v === 'standard' ? 'Standard Templates' : 'Community Gallery'}
                    </button>
                ))}
            </div>

            {view === 'standard' ? (
                <>
                    {/* Controls */}
                    <div className="glass-panel p-5 border-slate-800/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Template Controls</h4>
                            <button
                                onClick={() => { setView('community'); setRequestedShare(true); }}
                                className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                            >
                                <i className="fa-solid fa-cloud-arrow-up text-[9px]"></i>
                                Upload to Community
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Color */}
                            <div>
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Accent Color</label>
                                <div className="flex gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => { setGlobalColor(c.value); onSelect({ ...selected, color: c.value }); }}
                                            title={c.name}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${globalColor === c.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Font */}
                            <div>
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Font Style</label>
                                <select
                                    value={globalFont}
                                    onChange={e => { setGlobalFont(e.target.value); onSelect({ ...selected, font: e.target.value }); }}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 outline-none"
                                >
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            {/* Layout */}
                            <div>
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Layout</label>
                                <div className="flex gap-2">
                                    {(['1-col', '2-col'] as const).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => { setGlobalLayout(l); onSelect({ ...selected, layout: l }); }}
                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-tight ${globalLayout === l ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                        >
                                            <i className={`fa-solid ${l === '1-col' ? 'fa-grip-lines' : 'fa-table-columns'} mr-1.5`}></i>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Template Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(t => {
                            const isSelected = selected.id === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => selectTemplate(t)}
                                    className={`group relative rounded-2xl border overflow-hidden transition-all ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]' : 'border-slate-800 hover:border-slate-600'}`}
                                >
                                    {/* Template Preview Mockup */}
                                    <div className="h-36 bg-slate-950 p-3 relative flex gap-2 overflow-hidden">
                                        {t.category === 'Creative' || globalLayout === '2-col' ? (
                                            <>
                                                <div className="w-1/3 rounded-lg flex flex-col gap-1.5" style={{ backgroundColor: `${t.accent}20` }}>
                                                    <div className="h-8 w-8 rounded-full mx-auto mt-2" style={{ backgroundColor: t.accent + '40' }} />
                                                    {[1, 2, 3].map(i => <div key={i} className="h-1 w-3/4 mx-auto rounded-full bg-slate-800" />)}
                                                </div>
                                                <div className="flex-1 flex flex-col gap-1.5 pt-1">
                                                    <div className="h-2 w-3/4 rounded" style={{ backgroundColor: t.accent + '60' }} />
                                                    <div className="h-1 w-1/2 bg-slate-800 rounded" />
                                                    <div className="h-px w-full bg-slate-800 my-0.5" />
                                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-1 rounded"
                                                        style={{ width: `${60 + (i % 3) * 10}%`, backgroundColor: '#1e293b' }} />)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full flex flex-col gap-1">
                                                <div className="h-6 flex items-center gap-2 border-b-2 mb-1" style={{ borderColor: t.accent }}>
                                                    <div className="h-2 w-16 rounded bg-slate-800" />
                                                </div>
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="space-y-1 mt-1">
                                                        <div className="h-1 w-8 rounded" style={{ backgroundColor: t.accent + '40' }} />
                                                        <div className="h-0.5 w-full bg-slate-900 rounded" />
                                                        <div className="h-0.5 w-3/4 bg-slate-900 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                                                <i className="fa-solid fa-check text-white text-[8px]"></i>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Use Template</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 text-left">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-200">{t.name}</span>
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }}></span>
                                        </div>
                                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{t.category}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : (
                <CommunityGallery
                    currentConfig={selected}
                    onApply={onSelect}
                    autoOpenShare={requestedShare}
                    onShareHandled={() => setRequestedShare(false)}
                />
            )}
        </div>
    );
};

export default TemplateGallery;
