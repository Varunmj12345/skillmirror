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
        if (key === 'pdf') {
            const element = document.getElementById('resume-export-container');
            if (!element) {
                setToast('Error: Resume preview not found');
                setTimeout(() => setToast(''), 3000);
                return;
            }
            setExporting(key);
            try {
                const existing = document.getElementById('resume-print-iframe');
                if (existing) existing.remove();

                const printIframe = document.createElement('iframe');
                printIframe.id = 'resume-print-iframe';
                printIframe.style.position = 'fixed';
                printIframe.style.right = '0';
                printIframe.style.bottom = '0';
                printIframe.style.width = '0';
                printIframe.style.height = '0';
                printIframe.style.border = '0';
                document.body.appendChild(printIframe);

                const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
                    .map((el) => el.outerHTML)
                    .join('\n');

                const doc = printIframe.contentWindow?.document;
                if (!doc) {
                    window.print();
                    return;
                }

                doc.open();
                doc.write(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>SkillMirror_Resume</title>
                      ${styles}
                      <style>
                        @page { size: A4 portrait; margin: 0; }
                        html, body {
                          margin: 0 !important;
                          padding: 0 !important;
                          background: #ffffff !important;
                          color: #000000 !important;
                          width: 100% !important;
                          height: 100% !important;
                          -webkit-print-color-adjust: exact !important;
                          print-color-adjust: exact !important;
                        }
                        #resume-export-container {
                          width: 100% !important;
                          max-width: 100% !important;
                          margin: 0 !important;
                          box-shadow: none !important;
                          border: none !important;
                          border-radius: 0 !important;
                          background: #ffffff !important;
                        }
                      </style>
                    </head>
                    <body>
                      ${element.outerHTML}
                    </body>
                  </html>
                `);
                doc.close();

                setTimeout(() => {
                    try {
                        printIframe.contentWindow?.focus();
                        printIframe.contentWindow?.print();
                    } catch {
                        window.print();
                    }
                    setToast('Vector PDF print ready!');
                }, 350);
            } catch (err) {
                console.error(err);
                setToast('Failed to generate PDF');
            } finally {
                setExporting(null);
                setTimeout(() => setToast(''), 3000);
            }
        } else if (key === 'txt') {
            const dataRaw = document.getElementById('resume-export-container')?.innerText || "Failed to extract text.";
            const blob = new Blob([dataRaw], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'SkillMirror_Resume.txt';
            a.click();
            URL.revokeObjectURL(url);
            setToast('TXT exported successfully!');
            setTimeout(() => setToast(''), 3000);
        } else {
            // Document/TXT fallbacks in future iterations
            setExporting(key);
            await new Promise(r => setTimeout(r, 1200));
            setExporting(null);
            setToast(`${key.toUpperCase()} export is coming soon. Use PDF.`);
            setTimeout(() => setToast(''), 3000);
        }
    };

    return (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-light-card dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-download text-blue-600 dark:text-sky-400 text-xs"></i>
                Export Options
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-5">Download your resume in multiple formats</p>

            <div className="grid grid-cols-2 gap-3">
                {FORMATS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => handleExport(f.key)}
                        disabled={!!exporting}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-wait shadow-sm ${colorMap[f.color]}`}
                    >
                        {exporting === f.key ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                        ) : (
                            <i className={`fa-${f.key === 'linkedin' ? 'brands' : 'solid'} ${f.icon} text-xl group-hover:scale-110 transition-transform`}></i>
                        )}
                        <div className="text-center">
                            <div className="text-xs font-black uppercase tracking-widest">{f.label}</div>
                            <div className="text-[9px] opacity-70 font-bold">{f.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            {toast && (
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-[11px] font-black flex items-center gap-2 shadow-sm">
                    <i className="fa-solid fa-circle-check"></i>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default ExportPanel;
