import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import type { TemplateConfig } from './TemplateGallery';

interface CommunityTemplate {
    id: number;
    name: string;
    description: string;
    category: string;
    config: Record<string, any>;
    use_count: number;
    created_at: string;
    created_by_name: string;
}

interface Props {
    currentConfig: TemplateConfig;
    onApply: (config: TemplateConfig) => void;
    autoOpenShare?: boolean;
    onShareHandled?: () => void;
}

const CATEGORY_TABS = ['All', 'Modern', 'ATS-Friendly', 'Minimal', 'Creative', 'Corporate', 'Tech'];

const CommunityGallery: React.FC<Props> = ({ currentConfig, onApply, autoOpenShare, onShareHandled }) => {
    const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [sharing, setSharing] = useState(false);
    const [shareForm, setShareForm] = useState({ name: '', description: '', category: 'Modern' });
    const [shareLoading, setShareLoading] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/skills/resume/community-templates/') as any;
            setTemplates(Array.isArray(res) ? res : res.results || []);
        } catch { setTemplates([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTemplates(); }, []);

    useEffect(() => {
        if (autoOpenShare) {
            setSharing(true);
            onShareHandled?.();
        }
    }, [autoOpenShare]);


    const handleApply = async (t: CommunityTemplate) => {
        try {
            // Increment use count
            await apiClient.get(`/api/skills/resume/community-templates/${t.id}/`);
        } catch { }
        const config: TemplateConfig = {
            id: `community-${t.id}`,
            name: t.name,
            category: t.category,
            accent: t.config.accent || '#6366f1',
            color: t.config.color || t.config.accent || '#6366f1',
            font: t.config.font || 'Inter',
            layout: t.config.layout || '1-col',
        };
        onApply(config);
        showToast(`✓ Applied "${t.name}" template`);
    };

    const handleShare = async () => {
        if (!shareForm.name.trim()) return;
        setShareLoading(true);
        try {
            await apiClient.post('/api/skills/resume/community-templates/', {
                name: shareForm.name,
                description: shareForm.description,
                category: shareForm.category,
                config: {
                    accent: currentConfig.accent || currentConfig.color,
                    color: currentConfig.color,
                    font: currentConfig.font,
                    layout: currentConfig.layout,
                    templateId: currentConfig.id,
                    templateName: currentConfig.name,
                }
            });
            showToast(`✓ Template "${shareForm.name}" shared with the community!`);
            setSharing(false);
            setShareForm({ name: '', description: '', category: 'Modern' });
            fetchTemplates();
        } catch (e: any) {
            showToast('Failed to share. Try again.');
        } finally { setShareLoading(false); }
    };

    const filtered = filter === 'All' ? templates : templates.filter(t => t.category === filter);

    return (
        <div className="space-y-5">
            {/* Header with Share CTA */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-50">Community Templates</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Templates created and shared by other users</p>
                </div>
                <button
                    onClick={() => setSharing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-500/30 transition-all"
                >
                    <i className="fa-solid fa-share-nodes text-[10px]"></i>
                    Share Mine
                </button>
            </div>

            {/* Share Modal */}
            {sharing && (
                <div className="p-5 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Share Your Current Template</h4>
                        <button onClick={() => setSharing(false)} className="text-slate-600 hover:text-slate-400 text-sm"><i className="fa-solid fa-xmark"></i></button>
                    </div>

                    {/* Preview of what will be shared */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentConfig.color + '20' }}>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: currentConfig.color }}></div>
                        </div>
                        <div>
                            <div className="text-[11px] font-bold text-slate-200">{currentConfig.name}</div>
                            <div className="text-[9px] text-slate-500">{currentConfig.font} · {currentConfig.layout} · <span style={{ color: currentConfig.color }}>{currentConfig.color}</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Template Name *</label>
                            <input
                                value={shareForm.name} onChange={e => setShareForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. My Dark Minimal template"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Category</label>
                            <select
                                value={shareForm.category} onChange={e => setShareForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none"
                            >
                                {CATEGORY_TABS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Description (optional)</label>
                        <input
                            value={shareForm.description} onChange={e => setShareForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="What makes this template special?"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setSharing(false)} className="flex-1 py-2 bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all">Cancel</button>
                        <button
                            onClick={handleShare} disabled={shareLoading || !shareForm.name.trim()}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {shareLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                            Share to Community
                        </button>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORY_TABS.map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-slate-900 rounded-2xl animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                    <i className="fa-solid fa-globe text-3xl text-slate-800 mb-4 block"></i>
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">No community templates yet</p>
                    <p className="text-[10px] text-slate-700 mt-1">Be the first to share yours!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filtered.map(t => {
                        const accent = t.config.accent || '#6366f1';
                        return (
                            <div key={t.id} className="group rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-600 transition-all">
                                {/* Mini Preview */}
                                <div className="h-28 bg-slate-950 p-3 flex flex-col gap-1.5">
                                    <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accent + '80' }}></div>
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-1 rounded bg-slate-800" style={{ width: `${50 + (i % 3) * 12}%` }} />)}
                                </div>
                                {/* Info */}
                                <div className="bg-slate-900 px-3 py-2.5">
                                    <div className="flex items-start justify-between gap-1">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-bold text-slate-200 truncate">{t.name}</div>
                                            <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{t.category}</div>
                                        </div>
                                        <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: accent }}></span>
                                    </div>
                                    {t.description && <p className="text-[9px] text-slate-500 mt-1 leading-snug line-clamp-1">{t.description}</p>}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1 text-[9px] text-slate-600">
                                            <i className="fa-solid fa-user text-[8px]"></i>
                                            {t.created_by_name}
                                            {t.use_count > 0 && <span className="ml-1 text-slate-700">· {t.use_count} uses</span>}
                                        </div>
                                        <button
                                            onClick={() => handleApply(t)}
                                            className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                                        >
                                            Use →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 px-5 py-2.5 rounded-full text-[11px] text-slate-100 shadow-2xl animate-in fade-in duration-200">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default CommunityGallery;
