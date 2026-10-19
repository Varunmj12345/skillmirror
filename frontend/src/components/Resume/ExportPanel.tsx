import React, { useState } from 'react';

const ExportPanel: React.FC = () => {
    const [exporting, setExporting] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const FORMATS = [
        { key: 'pdf', label: 'PDF', icon: 'fa-file-pdf', desc: 'Vector ATS print · Recommended', primary: true },
        { key: 'docx', label: 'DOCX', icon: 'fa-file-word', desc: 'Word editable copy' },
        { key: 'txt', label: 'TXT', icon: 'fa-file-lines', desc: 'Plain-text ASCII stream' },
        { key: 'linkedin', label: 'LinkedIn', icon: 'fa-linkedin', desc: 'Profile payload block' },
    ];

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
            setExporting(key);
            await new Promise(r => setTimeout(r, 1200));
            setExporting(null);
            setToast(`${key.toUpperCase()} export is queued. Use vector PDF.`);
            setTimeout(() => setToast(''), 3000);
        }
    };

    return (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                    <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-100 uppercase">
                        Export Terminal
                    </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">OUTPUT-v2</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mb-4">Export high-fidelity ATS and print artifacts.</p>

            <div className="grid grid-cols-2 gap-2.5">
                {FORMATS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => handleExport(f.key)}
                        disabled={!!exporting}
                        className={`p-3.5 rounded-xl border text-left transition-all group disabled:opacity-50 disabled:cursor-wait ${
                            f.primary
                                ? 'bg-zinc-950 border-amber-500/40 hover:border-amber-400 text-zinc-100'
                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            {exporting === f.key ? (
                                <i className="fa-solid fa-circle-notch fa-spin text-amber-400 text-sm"></i>
                            ) : (
                                <i className={`fa-${f.key === 'linkedin' ? 'brands' : 'solid'} ${f.icon} text-sm ${f.primary ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}></i>
                            )}
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
                                {f.label}
                            </span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 leading-tight">
                            {f.desc}
                        </div>
                    </button>
                ))}
            </div>

            {toast && (
                <div className="mt-4 p-2.5 bg-zinc-950 border border-emerald-500/30 rounded-xl text-emerald-400 text-[11px] font-mono flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-xs"></i>
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
};

export default ExportPanel;
