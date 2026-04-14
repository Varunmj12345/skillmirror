import React from 'react';
import type { BuilderFormData } from './ResumeBuilderForm';
import type { TemplateConfig } from './TemplateGallery';

interface Props {
    data: BuilderFormData;
    template: TemplateConfig;
}

const ResumePreview: React.FC<Props> = ({ data, template }) => {
    const accent = template.color || '#6366f1';
    const font = template.font || 'Inter';
    const is2Col = template.layout === '2-col';

    // A4 dimensions at 96 DPI: 794px x 1123px (approx)
    // We'll place a page break indicator at 1100px to be safe.
    const A4_HEIGHT = 1080; 

    const sectionTitle = (title: string) => (
        <div className="flex flex-col gap-1 mb-3 mt-5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-2" style={{ color: accent, fontFamily: 'Merriweather, serif' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                {title}
            </h3>
            <div className="h-px w-full bg-slate-100" />
        </div>
    );

    const mainContent = (
        <div className="space-y-4">
            {/* Summary */}
            {data.summary && (
                <div className="mb-6">
                    {sectionTitle('Professional Profile')}
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                        {data.summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {data.experience.some(e => e.company || e.role) && (
                <div className="mb-6">
                    {sectionTitle('Work Experience')}
                    <div className="space-y-5">
                        {data.experience.filter(e => e.company || e.role).map((exp, i) => (
                            <div key={i} className="relative pl-4 border-l border-slate-100 last:border-0 pb-1">
                                <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: accent }} />
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <div className="text-[11px] font-black text-slate-800 tracking-tight" style={{ fontFamily: 'Merriweather, serif' }}>{exp.role || 'Role'}</div>
                                        <div className="text-[10px] text-slate-500 font-bold tracking-wide italic">{exp.company}</div>
                                    </div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full">{exp.duration}</div>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {exp.bullets.filter(b => b).map((b, bi) => (
                                        <li key={bi} className="text-[9px] text-slate-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:bg-slate-300 before:rounded-full">
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {data.projects.some(p => p.name) && (
                <div className="mb-6">
                    {sectionTitle('Strategic Projects')}
                    <div className="grid grid-cols-1 gap-4">
                        {data.projects.filter(p => p.name).map((proj, i) => (
                            <div key={i} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-800" style={{ fontFamily: 'Merriweather, serif' }}>{proj.name}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">{proj.tech}</span>
                                </div>
                                {proj.description && <p className="text-[9px] text-slate-500 leading-normal italic">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {data.education.some(e => e.institution) && (
                <div className="mb-6">
                    {sectionTitle('Education')}
                    <div className="space-y-3">
                        {data.education.filter(e => e.institution).map((edu, i) => (
                            <div key={i} className="flex justify-between">
                                <div>
                                    <div className="text-[10px] font-black text-slate-800" style={{ fontFamily: 'Merriweather, serif' }}>{edu.degree}</div>
                                    <div className="text-[9px] text-slate-500 font-bold">{edu.institution}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-slate-400">{edu.year}</div>
                                    {edu.gpa && <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">GPA: {edu.gpa}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {data.certifications.some(c => c.name) && (
                <div className="mb-6">
                    {sectionTitle('Certifications')}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {data.certifications.filter(c => c.name).map((cert, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <i className="fa-solid fa-ribbon text-[8px]" style={{ color: accent }}></i>
                                <div>
                                    <div className="text-[9px] font-black text-slate-700 leading-tight">{cert.name}</div>
                                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{cert.issuer}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const sidebar = (
        <div className="space-y-6">
            {/* Contact */}
            <div className="space-y-2 px-1">
                {data.personal.email && (
                    <div className="flex items-center gap-2.5 group">
                        <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                             <i className="fa-solid fa-envelope text-[8px] text-slate-400"></i>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold truncate">{data.personal.email}</span>
                    </div>
                )}
                {data.personal.phone && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                             <i className="fa-solid fa-phone text-[8px] text-slate-400"></i>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold">{data.personal.phone}</span>
                    </div>
                )}
                {data.personal.location && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                             <i className="fa-solid fa-location-dot text-[8px] text-slate-400"></i>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold">{data.personal.location}</span>
                    </div>
                )}
                {data.personal.linkedin && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                             <i className="fa-brands fa-linkedin text-[8px] text-slate-400"></i>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold truncate underline decoration-slate-200">LinkedIn Profile</span>
                    </div>
                )}
                {data.personal.github && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                             <i className="fa-brands fa-github text-[8px] text-slate-400"></i>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold truncate">GitHub Profile</span>
                    </div>
                )}
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400" >Core Expertise</div>
                    <div className="flex flex-wrap gap-1.5">
                        {data.skills.map(s => (
                            <span key={s} className="text-[8px] font-black px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 uppercase tracking-tighter">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {data.achievements.some(a => a) && (
                <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400">Key Achievements</div>
                    <div className="space-y-3">
                        {data.achievements.filter(a => a).map((a, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-[8px] font-bold text-indigo-500 bg-indigo-50 w-4 h-4 rounded flex items-center justify-center shrink-0">✦</span>
                                <p className="text-[9px] text-slate-500 font-bold leading-tight">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div id="resume-export-container" className="relative bg-white rounded-xl shadow-2xl overflow-hidden text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Page Break Indicator (Visual only, relative to container) */}
            <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400/30 z-10 pointer-events-none flex items-center justify-center"
                style={{ top: A4_HEIGHT }}
            >
                <span className="bg-rose-50 text-rose-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest -mt-2">
                    A4 Page Break (Content may span 2 pages upon export)
                </span>
            </div>

            {/* Header */}
            <div className="px-8 py-10 flex border-b-4" style={{ borderColor: accent }}>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tighter mb-1" style={{ color: '#0f172a', fontFamily: 'Merriweather, serif' }}>
                        {data.personal.name || 'Your Name'}
                    </h1>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {/* Inline contact for 1-col or just job title placeholder */}
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Software Developer</span>
                    </div>
                </div>
                {/* Visual accent box */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: accent }}>
                    <i className="fa-solid fa-user-tie text-white text-xl"></i>
                </div>
            </div>

            {/* Body */}
            <div className={`px-8 py-8 ${is2Col ? 'flex gap-10' : ''}`}>
                {is2Col ? (
                    <>
                        <div className="w-[180px] shrink-0">{sidebar}</div>
                        <div className="flex-1 border-l border-slate-50 pl-10 -ml-5">{mainContent}</div>
                    </>
                ) : (
                    <div className="space-y-2">
                        {/* Header contact inline for 1-col */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                <i className="fa-solid fa-envelope text-slate-300"></i> {data.personal.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                <i className="fa-solid fa-phone text-slate-300"></i> {data.personal.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                <i className="fa-solid fa-location-dot text-slate-300"></i> {data.personal.location}
                            </div>
                        </div>
                        {mainContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumePreview;
