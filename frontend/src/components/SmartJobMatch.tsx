// @ts-nocheck
import React from 'react';
import { PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ResponsiveContainer as RechartsResponsiveContainer } from 'recharts';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

const PieChart = RechartsPieChart as any;
const Pie = RechartsPie as any;
const Cell = RechartsCell as any;
const ResponsiveContainer = RechartsResponsiveContainer as any;

interface MatchData {
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    suggested_skills: string[];
    recommended_jobs: any[];
}

interface SmartJobMatchProps {
    matchData: MatchData | null;
}

const SmartJobMatch: React.FC<SmartJobMatchProps> = ({ matchData }) => {
    const [selectedJob, setSelectedJob] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    if (!matchData) return <div className="p-6 bg-pop rounded-2xl border border-white/[0.07] animate-pulse h-80"></div>;

    const score = matchData.match_score;
    const data = [
        { name: 'Match', value: score },
        { name: 'Gap', value: 100 - score },
    ];
    const COLORS = ['#00d9ff', 'rgba(255,255,255,0.06)'];

    const handleApply = (job: any) => {
        const applyLink = job.job_apply_link || job.redirect_url || job.url;

        if (applyLink && applyLink.startsWith('http')) {
            window.open(applyLink, '_blank', 'noopener,noreferrer');
        } else {
            setSelectedJob(job);
            setIsModalOpen(true);
        }
    };

    const handleLinkedInSearch = () => {
        if (selectedJob) {
            const query = encodeURIComponent(`Apply for ${selectedJob.title} at ${selectedJob.company} India`);
            window.open(`https://www.linkedin.com/jobs/search/?keywords=${query}`, '_blank');
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-pop rounded-2xl border border-white/[0.07] overflow-hidden relative mb-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <TVNoise opacity={0.02} />

            {/* Cyber Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0d13]/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-pop border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-link-slash text-xl"></i>
                            </div>
                            <h4 className="text-base font-display font-black text-white mb-2">Direct Link Unavailable</h4>
                            <p className="text-xs font-mono text-slate-400 mb-6 leading-relaxed">
                                Direct application link for <span className="font-bold text-cyan-300">{selectedJob?.title}</span> requires neural external routing. Query LinkedIn career nodes?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs font-mono font-bold rounded-xl hover:bg-white/[0.08] transition-colors uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLinkedInSearch}
                                    className="sm-btn-primary flex-1 py-2.5 text-xs uppercase tracking-wider"
                                >
                                    Try LinkedIn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bullet variant="cyan" size="sm" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">VECTOR ALIGNMENT</span>
                    </div>
                    <h3 className="text-base font-display font-black text-white">Smart Job Match</h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">Profile vector vs real-time market requirements</p>
                </div>
                <Badge variant="outline-cyan">AI MATCH</Badge>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
                {/* Circular Score */}
                <div className="flex flex-col items-center justify-center relative h-52 w-full">
                    <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full transform scale-75"></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={82}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={4}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-display font-black text-cyan-400 tracking-tight">
                            {score}%
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-0.5">MATCH INDEX</span>
                    </div>
                </div>

                {/* Skills Lists */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                        <h4 className="text-xs font-mono font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                                <i className="fa-solid fa-check text-[10px]"></i>
                            </span>
                            Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {matchData.matched_skills && matchData.matched_skills.length > 0 ? (
                                matchData.matched_skills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-[11px] font-mono font-bold rounded-md border border-emerald-500/20">
                                        {skill}
                                    </span>
                                ))
                            ) : <span className="text-xs font-mono text-slate-500">No matches found</span>}
                        </div>
                    </div>

                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                        <h4 className="text-xs font-mono font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                                <i className="fa-solid fa-bolt text-[10px]"></i>
                            </span>
                            Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {matchData.missing_skills && matchData.missing_skills.length > 0 ? (
                                matchData.missing_skills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-amber-500/10 text-amber-300 text-[11px] font-mono font-bold rounded-md border border-amber-500/20">
                                        {skill}
                                    </span>
                                ))
                            ) : <span className="text-xs font-mono text-slate-500">No missing skills!</span>}
                        </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">Suggested Skill Additions</h4>
                            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                +15% MATCH BOOST
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {matchData.suggested_skills && matchData.suggested_skills.map((skill, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => window.open(`https://www.coursera.org/search?query=${skill}`, '_blank')}
                                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] text-indigo-300 text-[11px] font-mono font-bold rounded-lg border border-indigo-500/25 hover:bg-indigo-500/20 hover:text-white transition-all"
                                >
                                    <i className="fa-solid fa-plus text-[9px] text-indigo-400 group-hover:rotate-90 transition-transform"></i>
                                    <span>{skill}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Jobs Preview */}
            {matchData.recommended_jobs && matchData.recommended_jobs.length > 0 && (
                <div className="p-6 border-t border-white/[0.05] bg-white/[0.01] relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Bullet variant="warning" size="sm" />
                        <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            RECOMMENDED CAREER FITS
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {matchData.recommended_jobs.map((job, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.05] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-display font-black text-xs group-hover:scale-105 transition-transform">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-display font-black text-white group-hover:text-cyan-300 transition-colors">{job.title}</h5>
                                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{job.company} • {job.location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApply(job)}
                                    className="sm-btn-neon !py-2 !px-3.5 text-[11px]"
                                >
                                    Apply Node →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartJobMatch;
