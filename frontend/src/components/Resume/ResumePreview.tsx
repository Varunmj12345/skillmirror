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

    const sectionTitle = (title: string) => (
        <div className="flex items-center gap-2 mb-2 mt-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>{title}</h3>
            <div className="flex-1 h-px" style={{ backgroundColor: accent + '40' }} />
        </div>
    );

    const mainContent = (
        <div className="space-y-1">
            {/* Summary */}
            {data.summary && (
                <>
                    {sectionTitle('Professional Summary')}
                    <p className="text-[10px] text-slate-600 leading-relaxed">{data.summary}</p>
                </>
            )}

            {/* Experience */}
            {data.experience.some(e => e.company || e.role) && (
                <>
                    {sectionTitle('Experience')}
                    <div className="space-y-3">
                        {data.experience.filter(e => e.company || e.role).map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[11px] font-black text-slate-800">{exp.role || 'Role'}</div>
                                        <div className="text-[10px] text-slate-500 font-bold">{exp.company}</div>
                                    </div>
                                    <div className="text-[9px] text-slate-400">{exp.duration}</div>
                                </div>
                                <ul className="mt-1 space-y-0.5">
                                    {exp.bullets.filter(b => b).map((b, bi) => (
                                        <li key={bi} className="text-[9px] text-slate-500 pl-3 relative before:content-['•'] before:absolute before:left-0" style={{ color: '#4a5568', '--tw-content': '"•"' } as any}>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Projects */}
            {data.projects.some(p => p.name) && (
                <>
                    {sectionTitle('Projects')}
                    <div className="space-y-2">
                        {data.projects.filter(p => p.name).map((proj, i) => (
                            <div key={i}>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-slate-700">{proj.name}</span>
                                    <span className="text-[9px]" style={{ color: accent + 'cc' }}>{proj.tech}</span>
                                </div>
                                {proj.description && <p className="text-[9px] text-slate-500 mt-0.5">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Education */}
            {data.education.some(e => e.institution) && (
                <>
                    {sectionTitle('Education')}
                    {data.education.filter(e => e.institution).map((edu, i) => (
                        <div key={i} className="flex justify-between">
                            <div>
                                <div className="text-[10px] font-black text-slate-700">{edu.degree}</div>
                                <div className="text-[9px] text-slate-500">{edu.institution}</div>
                            </div>
                            <div className="text-[9px] text-slate-400">{edu.year}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</div>
                        </div>
                    ))}
                </>
            )}

            {/* Certifications */}
            {data.certifications.some(c => c.name) && (
                <>
                    {sectionTitle('Certifications')}
                    <div className="space-y-1">
                        {data.certifications.filter(c => c.name).map((cert, i) => (
                            <div key={i} className="flex justify-between">
                                <span className="text-[10px] font-bold text-slate-700">{cert.name}</span>
                                <span className="text-[9px] text-slate-400">{cert.issuer} · {cert.year}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Achievements */}
            {data.achievements.some(a => a) && (
                <>
                    {sectionTitle('Achievements')}
                    <ul className="space-y-0.5">
                        {data.achievements.filter(a => a).map((a, i) => (
                            <li key={i} className="text-[9px] text-slate-500 pl-3 relative">
                                <span className="absolute left-0" style={{ color: accent }}>✦</span>
                                {a}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );

    const sidebar = (
        <div className="space-y-4">
            {/* Contact */}
            <div className="space-y-1">
                {data.personal.email && <div className="text-[9px] text-slate-600 break-all">{data.personal.email}</div>}
                {data.personal.phone && <div className="text-[9px] text-slate-600">{data.personal.phone}</div>}
                {data.personal.location && <div className="text-[9px] text-slate-600">{data.personal.location}</div>}
                {data.personal.linkedin && <div className="text-[9px] text-slate-600 break-all">{data.personal.linkedin}</div>}
                {data.personal.github && <div className="text-[9px] text-slate-600">{data.personal.github}</div>}
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
                <div>
                    <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: accent }}>Skills</div>
                    <div className="flex flex-wrap gap-1">
                        {data.skills.map(s => (
                            <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: accent + '20', color: accent }}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div id="resume-export-container" className="bg-white rounded-xl shadow-2xl overflow-hidden text-slate-800" style={{ fontFamily: font }}>
            {/* Header */}
            <div className="px-6 py-5" style={{ backgroundColor: accent + '15', borderBottom: `2px solid ${accent}30` }}>
                <h1 className="text-base font-black" style={{ color: accent }}>
                    {data.personal.name || 'Your Name'}
                </h1>
                {!is2Col && (
                    <div className="flex flex-wrap gap-3 mt-1">
                        {data.personal.email && <span className="text-[9px] text-slate-500">{data.personal.email}</span>}
                        {data.personal.phone && <span className="text-[9px] text-slate-500">{data.personal.phone}</span>}
                        {data.personal.location && <span className="text-[9px] text-slate-500">{data.personal.location}</span>}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className={`p-6 ${is2Col ? 'flex gap-6' : ''}`}>
                {is2Col ? (
                    <>
                        <div className="w-1/3 shrink-0">{sidebar}</div>
                        <div className="flex-1">{mainContent}</div>
                    </>
                ) : (
                    <>
                        {mainContent}
                        {/* Skills inline for 1-col */}
                        {data.skills.length > 0 && (
                            <>
                                {sectionTitle('Skills')}
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {data.skills.map(s => (
                                        <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: accent + '20', color: accent }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResumePreview;
