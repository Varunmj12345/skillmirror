import React, { useState } from 'react';

const ExportPanel: React.FC = () => {
    const [exporting, setExporting] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const FORMATS = [
        { key: 'pdf', label: 'PDF', icon: 'fa-file-pdf', color: 'rose', desc: 'Best for applications' },
        { key: 'docx', label: 'DOCX', icon: 'fa-file-word', color: 'sky', desc: 'Editable Word format' },
        { key: 'txt', label: 'TXT', icon: 'fa-file-lines', color: 'slate', desc: 'Plain text version' },
        { key: 'linkedin', label: 'LinkedIn', icon: 'fa-linkedin', color: 'blue', desc: 'Optimized version' },
    ];

    const colorMap: Record<string, string> = {
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20',
        sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20',
        slate: 'bg-slate-700/20 border-slate-600/30 text-slate-400 hover:bg-slate-700/30',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20',
    };

    const handleExport = async (key: string) => {
        setExporting(key);
        // Simulate export
        await new Promise(r => setTimeout(r, 1200));
        setExporting(null);
        setToast(`${key.toUpperCase()} export ready!`);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="glass-panel p-6 border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-50 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-download text-sky-400 text-xs"></i>
                Export Options
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-5">Download your resume in multiple formats</p>

            <div className="grid grid-cols-2 gap-3">
                {FORMATS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => handleExport(f.key)}
                        disabled={!!exporting}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-wait ${colorMap[f.color]}`}
                    >
                        {exporting === f.key ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                        ) : (
                            <i className={`fa-${f.key === 'linkedin' ? 'brands' : 'solid'} ${f.icon} text-xl group-hover:scale-110 transition-transform`}></i>
                        )}
                        <div className="text-center">
                            <div className="text-[11px] font-black uppercase tracking-widest">{f.label}</div>
                            <div className="text-[9px] opacity-60 font-bold">{f.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            {toast && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-[11px] font-black flex items-center gap-2">
                    <i className="fa-solid fa-circle-check"></i>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default ExportPanel;
