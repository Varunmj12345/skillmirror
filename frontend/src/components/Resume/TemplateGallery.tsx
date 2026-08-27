import React, { useState } from 'react';

export interface TemplateConfig {
    id: string;
    name: string;
    category: string;
    color: string;
    font: string;
    layout: '1-col' | '2-col';
    accent: string;
    atsScore?: number;
    atsBadge?: string;
}

interface Props {
    selected: TemplateConfig;
    onSelect: (t: TemplateConfig) => void;
}

import CommunityGallery from './CommunityGallery';

const CATEGORIES = ['All', 'ATS-Friendly', 'Modern', 'Minimal', 'Corporate', 'Tech', 'Creative'];

const COLORS = [
    { name: 'Midnight Obsidian', value: '#0f172a' },
    { name: 'Indigo Neural', value: '#4f46e5' },
    { name: 'Sky Tech', value: '#0ea5e9' },
    { name: 'Emerald Trust', value: '#059669' },
    { name: 'Slate Executive', value: '#334155' },
    { name: 'Rose Impact', value: '#e11d48' },
];

const FONTS = ['Inter', 'Roboto', 'Merriweather', 'Source Sans', 'Playfair Display'];

interface GalleryTemplateItem {
    id: string;
    name: string;
    category: string;
    accent: string;
    atsScore: number;
    atsBadge: string;
    layoutType?: '1-col' | '2-col';
    description?: string;
}

const TEMPLATES: GalleryTemplateItem[] = [
    // ATS-Friendly Premier Tier
    { id: 't1', name: 'Ivy League Classic', category: 'ATS-Friendly', accent: '#0f172a', atsScore: 100, atsBadge: '100% ATS Safe', layoutType: '1-col', description: 'Standard single column format approved by Fortune 500 ATS' },
    { id: 't2', name: 'FAANG Standard', category: 'ATS-Friendly', accent: '#2563eb', atsScore: 99, atsBadge: '99% ATS Safe', layoutType: '1-col', description: 'Optimized for high-tech recruitment scrapers' },
    { id: 't3', name: 'Clean Pro ATS', category: 'ATS-Friendly', accent: '#059669', atsScore: 99, atsBadge: '99% ATS Safe', layoutType: '1-col', description: 'Zero parsing errors with clear section hierarchy' },
    { id: 't4', name: 'ATS Maxima', category: 'ATS-Friendly', accent: '#475569', atsScore: 100, atsBadge: '100% ATS Safe', layoutType: '1-col', description: 'Strict parser compliant with keyword density' },
    { id: 't5', name: 'Clarity Elite', category: 'ATS-Friendly', accent: '#0891b2', atsScore: 98, atsBadge: '98% ATS Safe', layoutType: '1-col', description: 'Crystal clean typography & bullet structure' },

    // Tech & Engineering
    { id: 't6', name: 'Silicon Valley Dev', category: 'Tech', accent: '#4f46e5', atsScore: 98, atsBadge: '98% ATS Safe', layoutType: '1-col', description: 'Tailored for Software Engineers & Cloud Architects' },
    { id: 't7', name: 'Binary Pro', category: 'Tech', accent: '#0284c7', atsScore: 96, atsBadge: '96% ATS Safe', layoutType: '2-col', description: 'Sidebar for tools and primary stack' },
    { id: 't8', name: 'Stack Architect', category: 'Tech', accent: '#059669', atsScore: 97, atsBadge: '97% ATS Safe', layoutType: '1-col', description: 'Emphasizes system architecture & metrics' },
    { id: 't9', name: 'Deploy Matrix', category: 'Tech', accent: '#7c3aed', atsScore: 95, atsBadge: '95% ATS Safe', layoutType: '2-col', description: 'Highlighted project showcases and repo links' },

    // Modern & High Impact
    { id: 't10', name: 'Nova Modern', category: 'Modern', accent: '#6366f1', atsScore: 97, atsBadge: '97% ATS Safe', layoutType: '1-col', description: 'Sleek contemporary look with crisp dividers' },
    { id: 't11', name: 'Apex Dynamic', category: 'Modern', accent: '#0284c7', atsScore: 96, atsBadge: '96% ATS Safe', layoutType: '1-col', description: 'Balanced aesthetics with clean readable sections' },
    { id: 't12', name: 'Lumina Tech', category: 'Modern', accent: '#d97706', atsScore: 95, atsBadge: '95% ATS Safe', layoutType: '2-col', description: 'Warm accent styling with structured skill matrix' },
    { id: 't13', name: 'Pulse Vanguard', category: 'Modern', accent: '#ec4899', atsScore: 96, atsBadge: '96% ATS Safe', layoutType: '1-col', description: 'High-contrast headline accents for key achievements' },

    // Corporate & Executive
    { id: 't14', name: 'Executive C-Suite', category: 'Corporate', accent: '#1e3a8a', atsScore: 98, atsBadge: '98% ATS Safe', layoutType: '1-col', description: 'Authoritative style for leadership & management' },
    { id: 't15', name: 'Summit Global', category: 'Corporate', accent: '#0f172a', atsScore: 99, atsBadge: '99% ATS Safe', layoutType: '1-col', description: 'Prestigious corporate layout with serif headlines' },
    { id: 't16', name: 'Prestige Advisory', category: 'Corporate', accent: '#1e293b', atsScore: 98, atsBadge: '98% ATS Safe', layoutType: '1-col', description: 'Tailored for Consulting, Banking & Management' },
    { id: 't17', name: 'Forma Premier', category: 'Corporate', accent: '#334155', atsScore: 97, atsBadge: '97% ATS Safe', layoutType: '1-col', description: 'Subtle corporate borders and clear timeline' },

    // Minimalist Zen
    { id: 't18', name: 'Stanford Minimal', category: 'Minimal', accent: '#0f172a', atsScore: 99, atsBadge: '99% ATS Safe', layoutType: '1-col', description: 'Maximum white space and distilled high-impact text' },
    { id: 't19', name: 'Zen Obsidian', category: 'Minimal', accent: '#1e293b', atsScore: 99, atsBadge: '99% ATS Safe', layoutType: '1-col', description: 'Distraction-free layout with clean margins' },
    { id: 't20', name: 'Pure Monolith', category: 'Minimal', accent: '#64748b', atsScore: 98, atsBadge: '98% ATS Safe', layoutType: '1-col', description: 'Subtle monochrome aesthetic for rapid recruiter scanning' },

    // Creative & Design
    { id: 't21', name: 'Canvas Portfolio', category: 'Creative', accent: '#d97706', atsScore: 93, atsBadge: '93% ATS Safe', layoutType: '2-col', description: 'Designed for UI/UX, Product Designers & Creatives' },
    { id: 't22', name: 'Vivid Spectrum', category: 'Creative', accent: '#e11d48', atsScore: 92, atsBadge: '92% ATS Safe', layoutType: '2-col', description: 'Dynamic multi-column layout with visual badges' },
    { id: 't23', name: 'Aegis Studio', category: 'Creative', accent: '#7c3aed', atsScore: 94, atsBadge: '94% ATS Safe', layoutType: '2-col', description: 'Creative flair with high section demarcation' },
    { id: 't24', name: 'Prism Edge', category: 'Creative', accent: '#06b6d4', atsScore: 93, atsBadge: '93% ATS Safe', layoutType: '2-col', description: 'Modern asymmetrical sidebar for portfolio metrics' },
];

const TemplateGallery: React.FC<Props> = ({ selected, onSelect }) => {
    const [view, setView] = useState<'standard' | 'community'>('standard');
    const [requestedShare, setRequestedShare] = useState(false);
    const [filter, setFilter] = useState('All');

    const [globalColor, setGlobalColor] = useState(selected.color);
    const [globalFont, setGlobalFont] = useState(selected.font);
    const [globalLayout, setGlobalLayout] = useState<'1-col' | '2-col'>(selected.layout);

    const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

    const selectTemplate = (t: GalleryTemplateItem) => {
        const newLayout = t.layoutType || ((t.category === 'Creative' || t.category === 'Tech') ? '2-col' : '1-col');
        const newColor = t.accent;
        const newFont = (t.category === 'Corporate' || t.category === 'Modern') ? 'Merriweather' : 'Inter';
        setGlobalLayout(newLayout);
        setGlobalColor(newColor);
        setGlobalFont(newFont);
        onSelect({
            id: t.id,
            name: t.name,
            category: t.category,
            accent: t.accent,
            color: newColor,
            font: newFont,
            layout: newLayout,
            atsScore: t.atsScore,
            atsBadge: t.atsBadge
        } as TemplateConfig);
    };

    return (
        <div className="space-y-6">
            {/* Gallery Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
                    {(['standard', 'community'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${view === v ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <i className={`fa-solid ${v === 'standard' ? 'fa-palette' : 'fa-users'}`} />
                            <span>{v === 'standard' ? `Standard Templates (${TEMPLATES.length})` : 'Community Gallery (All Categories)'}</span>
                        </button>
                    ))}
                </div>

                {view === 'standard' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <i className="fa-solid fa-shield-check" />
                        <span>All Templates 92%+ ATS Parse Verified</span>
                    </div>
                )}
            </div>

            {view === 'standard' ? (
                <>
                    {/* Template Customizer Controls */}
                    <div className="p-5 rounded-3xl bg-card border border-border shadow-light-card dark:shadow-none space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <i className="fa-solid fa-sliders text-indigo-500" />
                                <span>Global Style Controls</span>
                            </h4>
                            <button
                                onClick={() => { setView('community'); setRequestedShare(true); }}
                                className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-1.5"
                            >
                                <i className="fa-solid fa-cloud-arrow-up text-xs" />
                                <span>Share Active Template</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* Color Picker */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Accent Palette</label>
                                <div className="flex gap-2.5 items-center">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => { setGlobalColor(c.value); onSelect({ ...selected, color: c.value }); }}
                                            title={c.name}
                                            className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm ${globalColor === c.value ? 'border-indigo-600 scale-110 ring-2 ring-indigo-500/30' : 'border-white dark:border-slate-800 hover:scale-105'}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Font Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Font Family</label>
                                <select
                                    value={globalFont}
                                    onChange={e => { setGlobalFont(e.target.value); onSelect({ ...selected, font: e.target.value }); }}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                                >
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            {/* Layout Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Column Layout</label>
                                <div className="flex gap-2">
                                    {(['1-col', '2-col'] as const).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => { setGlobalLayout(l); onSelect({ ...selected, layout: l }); }}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${globalLayout === l ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
                                        >
                                            <i className={`fa-solid ${l === '1-col' ? 'fa-grip-lines' : 'fa-table-columns'}`} />
                                            <span>{l === '1-col' ? 'Single (Max ATS)' : 'Two Column'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-card border border-border text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}
                            >
                                <span>{cat}</span>
                                {cat === 'ATS-Friendly' && <span className="ml-1.5 text-[10px] text-emerald-300">● 100% Safe</span>}
                            </button>
                        ))}
                    </div>

                    {/* Template Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map(t => {
                            const isSelected = selected.id === t.id;
                            const isTwoCol = t.layoutType === '2-col';
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => selectTemplate(t)}
                                    className={`group relative rounded-3xl border overflow-hidden cursor-pointer transition-all bg-card flex flex-col justify-between ${isSelected ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/40 scale-[1.02]' : 'border-border hover:border-indigo-400 dark:hover:border-indigo-500/40 shadow-light-card dark:shadow-none'}`}
                                >
                                    {/* Preview Mockup Canvas */}
                                    <div className="h-44 bg-slate-900/90 p-4 relative flex gap-2 overflow-hidden border-b border-border">
                                        {isTwoCol ? (
                                            <>
                                                <div className="w-1/3 rounded-xl p-2 flex flex-col gap-1.5" style={{ backgroundColor: `${t.accent}25` }}>
                                                    <div className="h-6 w-6 rounded-full mx-auto" style={{ backgroundColor: t.accent }} />
                                                    <div className="h-1 w-full bg-slate-700 rounded mt-1" />
                                                    <div className="h-1 w-3/4 bg-slate-700 rounded" />
                                                    <div className="h-1 w-2/3 bg-slate-700 rounded" />
                                                </div>
                                                <div className="flex-1 flex flex-col gap-2 pt-1">
                                                    <div className="h-2.5 w-3/4 rounded" style={{ backgroundColor: t.accent }} />
                                                    <div className="h-1.5 w-1/2 bg-slate-600 rounded" />
                                                    <div className="h-px w-full bg-slate-700 my-0.5" />
                                                    <div className="h-1.5 w-full bg-slate-800 rounded" />
                                                    <div className="h-1.5 w-5/6 bg-slate-800 rounded" />
                                                    <div className="h-1.5 w-4/5 bg-slate-800 rounded" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full flex flex-col gap-2">
                                                <div className="h-5 flex items-center justify-between border-b pb-1.5" style={{ borderColor: t.accent }}>
                                                    <div className="h-2.5 w-24 rounded" style={{ backgroundColor: t.accent }} />
                                                    <div className="h-1.5 w-12 bg-slate-600 rounded" />
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="h-1.5 w-16 rounded" style={{ backgroundColor: t.accent + '80' }} />
                                                    <div className="h-1 w-full bg-slate-700 rounded" />
                                                    <div className="h-1 w-4/5 bg-slate-700 rounded" />
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="h-1.5 w-20 rounded" style={{ backgroundColor: t.accent + '80' }} />
                                                    <div className="h-1 w-full bg-slate-800 rounded" />
                                                    <div className="h-1 w-3/4 bg-slate-800 rounded" />
                                                </div>
                                            </div>
                                        )}

                                        {/* ATS Score Floating Badge */}
                                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-black text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                                            <i className="fa-solid fa-shield-check text-[9px]" />
                                            <span>{t.atsScore}% ATS</span>
                                        </div>

                                        {/* Selected Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in">
                                                <i className="fa-solid fa-check text-xs" />
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-3 text-center">
                                            <span className="text-xs font-black uppercase tracking-wider bg-white text-slate-950 px-3 py-1 rounded-xl shadow-md">
                                                Select Template
                                            </span>
                                            <p className="text-[10px] text-slate-200 leading-snug">{t.description}</p>
                                        </div>
                                    </div>

                                    {/* Card Footer Details */}
                                    <div className="p-3.5 space-y-1 bg-card">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {t.name}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.category}</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.atsBadge}</span>
                                        </div>
                                    </div>
                                </div>
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
