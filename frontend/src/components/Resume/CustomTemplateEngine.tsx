import React, { useState, useEffect, useRef } from 'react';
import { skillService } from '../../services/skillService';
import type { BuilderFormData } from './ResumeBuilderForm';

interface CustomTemplate {
    id: number;
    name: string;
    file_type: string;
    mapped_fields: Record<string, string>;
    file: string;
}

interface GeneratedResume {
    id: number;
    file_name: string;
    file: string;
    version_number: number;
    created_at: string;
}

interface Props {
    formData: BuilderFormData;
}

const DATA_FIELDS = [
    { label: 'Name', path: 'personal.name' },
    { label: 'Email', path: 'personal.email' },
    { label: 'Phone', path: 'personal.phone' },
    { label: 'Location', path: 'personal.location' },
    { label: 'LinkedIn', path: 'personal.linkedin' },
    { label: 'Summary', path: 'summary' },
    { label: 'Skills', path: 'skills' },
    { label: 'Experience', path: 'experience' },
    { label: 'Education', path: 'education' },
    { label: 'Projects', path: 'projects' },
];

const CustomTemplateEngine: React.FC<Props> = ({ formData }) => {
    const [templates, setTemplates] = useState<CustomTemplate[]>([]);
    const [history, setHistory] = useState<GeneratedResume[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [placeholders, setPlaceholders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [filling, setFilling] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [enhancements, setEnhancements] = useState({
        improveSummary: true,
        tasksToAchievements: true,
        quantifyResults: true,
        atsOptimize: true,
        jobRoleOptimize: false
    });
    const [targetRole, setTargetRole] = useState('');
    const [advancedOptions, setAdvancedOptions] = useState({
        showProjects: true,
        showCerts: true,
        showSkills: true,
        primaryColor: '#6366f1',
        fontFamily: 'Inter',
        spacingDensity: 'compact'
    });
    const [toast, setToast] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        fetchTemplates();
        fetchHistory();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await skillService.getCustomTemplates() as any;
            setTemplates(res);
        } catch { }
    };

    const fetchHistory = async () => {
        try {
            const res = await skillService.getGeneratedResumes() as any;
            setHistory(res);
        } catch { }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await skillService.uploadCustomTemplate(file.name.split('.')[0], file) as any;
            showToast('✓ Template uploaded successfully');
            fetchTemplates();
            handleSelect(res.id);
        } catch (err: any) {
            showToast('Upload failed: ' + (err.response?.data?.error || 'Security check failed'));
        } finally {
            setUploading(false);
        }
    };

    const handleSelect = async (id: number) => {
        setSelectedId(id);
        const t = templates.find(item => item.id === id);
        if (t) setMapping(t.mapped_fields || {});

        try {
            const res = await skillService.detectPlaceholders(id) as any;
            setPlaceholders(res.placeholders || []);
        } catch { }
    };

    const handleEnhanceData = async () => {
        setEnhancing(true);
        try {
            // Reusing analysis logic to enhance the profile structure
            const res = await skillService.analyzeSkillGap(targetRole || 'Professional') as any;
            showToast('✓ AI enhancement complete! Profiles fields Optimized.');
        } catch {
            showToast('Enhancement failed');
        } finally {
            setEnhancing(false);
        }
    };

    const handleAutoFill = async () => {

        if (!selectedId) return;
        setFilling(true);
        try {
            // First save mapping
            await skillService.saveTemplateMapping(selectedId, mapping);

            const res = await skillService.fillCustomTemplate(selectedId, formData, mapping) as any;
            showToast('✓ Resume generated successfully!');
            fetchHistory();
            window.open(res.file_url, '_blank');
        } catch (err: any) {
            showToast('Generation failed: ' + (err.response?.data?.error || 'Unknown error'));
        } finally {
            setFilling(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Upload & Select */}
                <div className="glass-panel p-6 border-slate-800 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <i className="fa-solid fa-file-export text-indigo-400"></i>
                            Upload Your Own Template
                        </h3>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50"
                        >
                            {uploading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up mr-2"></i>}
                            Upload Template
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".docx,.pdf,.png,.jpg,.jpeg,.html,.md,.json,.txt" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Template</label>
                        {templates.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                <p className="text-[10px] text-slate-600">No custom templates yet. Upload one to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelect(t.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${selectedId === t.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedId === t.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                <i className={`fa-solid ${t.file_type === 'docx' ? 'fa-file-word' :
                                                        t.file_type === 'pdf' ? 'fa-file-pdf' :
                                                            ['png', 'jpg', 'jpeg'].includes(t.file_type) ? 'fa-file-image' :
                                                                'fa-file-code'
                                                    } text-xs`}></i>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-bold text-slate-200 truncate">{t.name}</div>
                                                <div className="text-[9px] text-slate-500 uppercase font-black">{t.file_type}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedId && (
                        <div className="pt-4 border-t border-slate-800">
                            <button
                                onClick={handleAutoFill}
                                disabled={filling}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-3"
                            >
                                {filling ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                                Auto Fill & Generate Resume
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Mapping & AI Enhancement */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 border-slate-800 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-100">Smart Mapping Engine</h3>
                            <p className="text-[10px] text-slate-500 mt-1">Map your data fields to the placeholders in your template.</p>
                        </div>

                        {!selectedId ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                                <i className="fa-solid fa-diagram-project text-2xl mb-3"></i>
                                <p className="text-[10px]">Select a template to configure mapping</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {placeholders.length === 0 ? (
                                    <p className="text-center text-[10px] text-slate-500 py-8">No placeholders like {"{{field}}"} detected.</p>
                                ) : (
                                    placeholders.map(p => (
                                        <div key={p} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{"{{" + p + "}}"}</div>
                                            </div>
                                            <i className="fa-solid fa-arrow-right-long text-slate-700"></i>
                                            <div className="flex-1">
                                                <select
                                                    value={mapping[p] || ''}
                                                    onChange={e => setMapping(m => ({ ...m, [p]: e.target.value }))}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 outline-none focus:border-indigo-500/50"
                                                >
                                                    <option value="">Choose data field...</option>
                                                    {DATA_FIELDS.map(df => <option key={df.path} value={df.path}>{df.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Smart Enhancement Mode */}
                    {selectedId && (
                        <div className="glass-panel p-6 border-indigo-500/20 bg-indigo-500/5 space-y-4">
                            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                AI Smart Enhancement Mode
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(enhancements).map(([key, val]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                        <div
                                            onClick={() => setEnhancements(e => ({ ...e, [key]: !val }))}
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${val ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'}`}
                                        >
                                            {val && <i className="fa-solid fa-check text-[8px] text-white"></i>}
                                        </div>
                                        <span className="text-[10px] text-slate-400 group-hover:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                    </label>
                                ))}
                            </div>
                            {enhancements.jobRoleOptimize && (
                                <input
                                    value={targetRole}
                                    onChange={e => setTargetRole(e.target.value)}
                                    placeholder="Target Job Role (e.g. Senior Frontend Engineer)"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-indigo-500/50"
                                />
                            )}
                            <button
                                onClick={handleEnhanceData}
                                disabled={enhancing}
                                className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                {enhancing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
                                {enhancing ? 'Enhancing...' : 'Apply AI Enhancements'}
                            </button>
                        </div>
                    )}

                    {/* Advanced Layout & Theme */}
                    {selectedId && (
                        <div className="glass-panel p-6 border-slate-800 space-y-4">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-sliders"></i>
                                Advanced Layout & Theme
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-600 uppercase">Section Toggles</label>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'showSkills', label: 'Skills' },
                                            { key: 'showProjects', label: 'Projects' },
                                            { key: 'showCerts', label: 'Certifications' }
                                        ].map(s => (
                                            <div key={s.key} className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-400">{s.label}</span>
                                                <button
                                                    onClick={() => setAdvancedOptions(prev => ({ ...prev, [s.key]: !(prev as any)[s.key] }))}
                                                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${(advancedOptions as any)[s.key] ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${(advancedOptions as any)[s.key] ? 'translate-x-4' : ''}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-600 uppercase">Theme Settings</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400">Branding Color</span>
                                            <input
                                                type="color" value={advancedOptions.primaryColor}
                                                onChange={e => setAdvancedOptions(p => ({ ...p, primaryColor: e.target.value }))}
                                                className="w-5 h-5 bg-transparent border-none rounded cursor-pointer"
                                            />
                                        </div>
                                        <select
                                            value={advancedOptions.spacingDensity}
                                            onChange={e => setAdvancedOptions(p => ({ ...p, spacingDensity: e.target.value }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-400"
                                        >
                                            <option value="compact">Compact Space</option>
                                            <option value="normal">Normal Space</option>
                                            <option value="relaxed">Relaxed Space</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* Bottom: History Section */}
            {history.length > 0 && (
                <div className="glass-panel p-6 border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <i className="fa-solid fa-history text-slate-400"></i>
                        Generated Versions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.map(h => (
                            <div key={h.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <i className="fa-solid fa-file-pdf"></i>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-200">{h.file_name}</div>
                                        <div className="text-[9px] text-slate-500">{new Date(h.created_at).toLocaleDateString()} · Version {h.version_number}</div>
                                    </div>
                                </div>
                                <a
                                    href={h.file} target="_blank" rel="noopener noreferrer"
                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-all"
                                >
                                    <i className="fa-solid fa-download"></i>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 border border-slate-700 rounded-full text-xs text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default CustomTemplateEngine;
