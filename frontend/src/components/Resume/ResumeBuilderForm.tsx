import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

export interface BuilderFormData {
    personal: {
        name: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        github: string;
        portfolio: string;
    };
    summary: string;
    skills: string[];
    experience: { company: string; role: string; duration: string; bullets: string[] }[];
    education: { institution: string; degree: string; year: string; gpa?: string }[];
    projects: { name: string; description: string; tech: string }[];
    certifications: { name: string; issuer: string; year: string }[];
    achievements: string[];
}

const EMPTY_FORM: BuilderFormData = {
    personal: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
    summary: '',
    skills: [],
    experience: [{ company: '', role: '', duration: '', bullets: [''] }],
    education: [{ institution: '', degree: '', year: '' }],
    projects: [{ name: '', description: '', tech: '' }],
    certifications: [{ name: '', issuer: '', year: '' }],
    achievements: [''],
};

interface Props {
    value: BuilderFormData;
    onChange: (v: BuilderFormData) => void;
    role?: string;
}

const ResumeBuilderForm: React.FC<Props> = ({ value, onChange, role = 'Software Developer' }) => {
    const [open, setOpen] = useState<string>('personal');
    const [aiLoading, setAILoading] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState('');

    const set = (path: string, val: any) => {
        const keys = path.split('.');
        const clone = JSON.parse(JSON.stringify(value));
        let cur: any = clone;
        for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
        cur[keys[keys.length - 1]] = val;
        onChange(clone);
    };

    const runAI = async (section: string, extraContent?: string) => {
        setAILoading(section);
        try {
            const content = extraContent || value.skills.join(', ') || role;
            const res = await apiClient.post('/api/skills/resume/ai-improve/', {
                action: section === 'summary' ? 'summary' : 'improve',
                content,
                role
            }) as any;
            if (section === 'summary') set('summary', res.result);
        } catch { }
        finally { setAILoading(null); }
    };

    const SECTIONS = [
        { key: 'personal', label: 'Personal Details', icon: 'fa-user' },
        { key: 'summary', label: 'Professional Summary', icon: 'fa-align-left' },
        { key: 'skills', label: 'Skills', icon: 'fa-code' },
        { key: 'experience', label: 'Experience', icon: 'fa-briefcase' },
        { key: 'education', label: 'Education', icon: 'fa-graduation-cap' },
        { key: 'projects', label: 'Projects', icon: 'fa-folder-open' },
        { key: 'certifications', label: 'Certifications', icon: 'fa-certificate' },
        { key: 'achievements', label: 'Achievements', icon: 'fa-trophy' },
    ];

    const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all";

    return (
        <div className="space-y-2">
            {SECTIONS.map(sec => (
                <div key={sec.key} className="glass-panel border-slate-800/50 overflow-hidden">
                    <button
                        onClick={() => setOpen(open === sec.key ? '' : sec.key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/30 transition-all"
                    >
                        <span className="flex items-center gap-3">
                            <i className={`fa-solid ${sec.icon} text-indigo-400 text-xs w-4`}></i>
                            <span className="text-sm font-bold text-slate-200">{sec.label}</span>
                        </span>
                        <i className={`fa-solid fa-chevron-${open === sec.key ? 'up' : 'down'} text-slate-600 text-xs transition-transform`}></i>
                    </button>

                    {open === sec.key && (
                        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4 animate-in fade-in duration-200">
                            {/* Personal Details */}
                            {sec.key === 'personal' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(value.personal).map(([k, v]) => (
                                        <div key={k}>
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">{k.replace('_', ' ')}</label>
                                            <input value={v} onChange={e => set(`personal.${k}`, e.target.value)} placeholder={k} className={inputCls} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Summary */}
                            {sec.key === 'summary' && (
                                <div className="space-y-3">
                                    <textarea
                                        value={value.summary}
                                        onChange={e => set('summary', e.target.value)}
                                        rows={5}
                                        placeholder="Write a compelling professional summary..."
                                        className={inputCls + ' resize-none'}
                                    />
                                    <button
                                        onClick={() => runAI('summary')}
                                        disabled={aiLoading === 'summary'}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-500/30 transition-all disabled:opacity-50"
                                    >
                                        {aiLoading === 'summary' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                        Generate with AI
                                    </button>
                                </div>
                            )}

                            {/* Skills */}
                            {sec.key === 'skills' && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {value.skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                                                {s}
                                                <button onClick={() => set('skills', value.skills.filter((_, j) => j !== i))} className="text-slate-500 hover:text-rose-400">
                                                    <i className="fa-solid fa-xmark text-[8px]"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newSkill.trim()) { set('skills', [...value.skills, newSkill.trim()]); setNewSkill(''); } }} placeholder="Type a skill and press Enter..." className={inputCls + ' flex-1'} />
                                        <button onClick={() => { if (newSkill.trim()) { set('skills', [...value.skills, newSkill.trim()]); setNewSkill(''); } }} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all text-sm">+</button>
                                    </div>
                                </div>
                            )}

                            {/* Experience */}
                            {sec.key === 'experience' && (
                                <div className="space-y-4">
                                    {value.experience.map((exp, i) => (
                                        <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                                            <div className="grid grid-cols-3 gap-3">
                                                <input value={exp.role} onChange={e => { const n = [...value.experience]; n[i].role = e.target.value; set('experience', n); }} placeholder="Role / Title" className={inputCls} />
                                                <input value={exp.company} onChange={e => { const n = [...value.experience]; n[i].company = e.target.value; set('experience', n); }} placeholder="Company" className={inputCls} />
                                                <input value={exp.duration} onChange={e => { const n = [...value.experience]; n[i].duration = e.target.value; set('experience', n); }} placeholder="Jan 2022 – Present" className={inputCls} />
                                            </div>
                                            {exp.bullets.map((b, bi) => (
                                                <div key={bi} className="flex items-center gap-2">
                                                    <span className="text-indigo-500 text-xs">•</span>
                                                    <input value={b} onChange={e => { const n = JSON.parse(JSON.stringify(value.experience)); n[i].bullets[bi] = e.target.value; set('experience', n); }} placeholder="Describe impact..." className={inputCls} />
                                                </div>
                                            ))}
                                            <button onClick={() => { const n = JSON.parse(JSON.stringify(value.experience)); n[i].bullets.push(''); set('experience', n); }} className="text-[10px] font-black text-slate-600 hover:text-indigo-400 transition-colors">+ Add bullet</button>
                                        </div>
                                    ))}
                                    <button onClick={() => set('experience', [...value.experience, { company: '', role: '', duration: '', bullets: [''] }])} className="w-full py-2 bg-slate-900 border border-dashed border-slate-700 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-500/50 hover:text-indigo-400 transition-all">+ Add Experience</button>
                                </div>
                            )}

                            {/* Education */}
                            {sec.key === 'education' && (
                                <div className="space-y-3">
                                    {value.education.map((edu, i) => (
                                        <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
                                            <input value={edu.institution} onChange={e => { const n = [...value.education]; n[i].institution = e.target.value; set('education', n); }} placeholder="Institution" className={inputCls} />
                                            <input value={edu.degree} onChange={e => { const n = [...value.education]; n[i].degree = e.target.value; set('education', n); }} placeholder="Degree / Field" className={inputCls} />
                                            <input value={edu.year} onChange={e => { const n = [...value.education]; n[i].year = e.target.value; set('education', n); }} placeholder="Graduation Year" className={inputCls} />
                                            <input value={edu.gpa || ''} onChange={e => { const n = [...value.education]; n[i].gpa = e.target.value; set('education', n); }} placeholder="GPA (optional)" className={inputCls} />
                                        </div>
                                    ))}
                                    <button onClick={() => set('education', [...value.education, { institution: '', degree: '', year: '' }])} className="w-full py-2 bg-slate-900 border border-dashed border-slate-700 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-500/50 hover:text-indigo-400 transition-all">+ Add Education</button>
                                </div>
                            )}

                            {/* Projects */}
                            {sec.key === 'projects' && (
                                <div className="space-y-3">
                                    {value.projects.map((proj, i) => (
                                        <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                                            <input value={proj.name} onChange={e => { const n = [...value.projects]; n[i].name = e.target.value; set('projects', n); }} placeholder="Project Name" className={inputCls} />
                                            <input value={proj.tech} onChange={e => { const n = [...value.projects]; n[i].tech = e.target.value; set('projects', n); }} placeholder="Technologies used" className={inputCls} />
                                            <textarea value={proj.description} onChange={e => { const n = [...value.projects]; n[i].description = e.target.value; set('projects', n); }} placeholder="Describe the project and your impact..." rows={3} className={inputCls + ' resize-none'} />
                                        </div>
                                    ))}
                                    <button onClick={() => set('projects', [...value.projects, { name: '', description: '', tech: '' }])} className="w-full py-2 bg-slate-900 border border-dashed border-slate-700 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-500/50 hover:text-indigo-400 transition-all">+ Add Project</button>
                                </div>
                            )}

                            {/* Certifications */}
                            {sec.key === 'certifications' && (
                                <div className="space-y-3">
                                    {value.certifications.map((cert, i) => (
                                        <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 grid grid-cols-3 gap-3">
                                            <input value={cert.name} onChange={e => { const n = [...value.certifications]; n[i].name = e.target.value; set('certifications', n); }} placeholder="Certification Name" className={inputCls} />
                                            <input value={cert.issuer} onChange={e => { const n = [...value.certifications]; n[i].issuer = e.target.value; set('certifications', n); }} placeholder="Issuing Authority" className={inputCls} />
                                            <input value={cert.year} onChange={e => { const n = [...value.certifications]; n[i].year = e.target.value; set('certifications', n); }} placeholder="Year" className={inputCls} />
                                        </div>
                                    ))}
                                    <button onClick={() => set('certifications', [...value.certifications, { name: '', issuer: '', year: '' }])} className="w-full py-2 bg-slate-900 border border-dashed border-slate-700 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-500/50 hover:text-indigo-400 transition-all">+ Add Certification</button>
                                </div>
                            )}

                            {/* Achievements */}
                            {sec.key === 'achievements' && (
                                <div className="space-y-2">
                                    {value.achievements.map((ach, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <i className="fa-solid fa-trophy text-amber-400/60 text-xs shrink-0"></i>
                                            <input value={ach} onChange={e => { const n = [...value.achievements]; n[i] = e.target.value; set('achievements', n); }} placeholder="Describe an achievement..." className={inputCls} />
                                        </div>
                                    ))}
                                    <button onClick={() => set('achievements', [...value.achievements, ''])} className="text-[10px] font-black text-slate-600 hover:text-amber-400 transition-colors">+ Add Achievement</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export { EMPTY_FORM };
export default ResumeBuilderForm;
