import React from 'react';
import { PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ResponsiveContainer as RechartsResponsiveContainer } from 'recharts';

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

    if (!matchData) return <div className="p-6 bg-zinc-900/90 rounded-2xl border border-zinc-800 animate-pulse h-72 mb-6"></div>;

    const score = matchData.match_score;
    const data = [
        { name: 'Match', value: score },
        { name: 'Gap', value: 100 - score },
    ];
    const COLORS = ['#f59e0b', '#27272a'];

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
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden mb-6 font-mono">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
                        <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
                            <i className="fa-solid fa-link text-sm"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-zinc-100 mb-1">Direct Requisition Route</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                External portal URL for <span className="text-amber-400">{selectedJob?.title}</span> requires secondary routing. Search LinkedIn hiring boards?
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl hover:border-zinc-700 transition-colors cursor-pointer uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLinkedInSearch}
                                className="flex-1 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase"
                            >
                                LinkedIn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">VECTOR ALIGNMENT</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">Smart Role Match</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Profile vector vs live market requirements</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-amber-400 text-[10px] font-bold">
                    AI MATCH
                </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Circular Score */}
                <div className="flex flex-col items-center justify-center relative h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={74}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={3}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-zinc-100 tracking-tight tabular-nums">
                            {score}%
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">MATCH INDEX</span>
                    </div>
                </div>

                {/* Skills Lists */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>
                            Matched Competencies
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {matchData.matched_skills && matchData.matched_skills.length > 0 ? (
                                matchData.matched_skills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-zinc-900 text-emerald-400 text-[10px] rounded border border-emerald-500/20 font-bold">
                                        {skill}
                                    </span>
                                ))
                            ) : <span className="text-xs text-zinc-500">No overlapping skills</span>}
                        </div>
                    </div>

                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                            Missing Competencies
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {matchData.missing_skills && matchData.missing_skills.length > 0 ? (
                                matchData.missing_skills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-zinc-900 text-amber-400 text-[10px] rounded border border-amber-500/20 font-bold">
                                        {skill}
                                    </span>
                                ))
                            ) : <span className="text-xs text-zinc-500">Zero critical gaps!</span>}
                        </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <div className="flex justify-between items-center mb-2.5">
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Recommended Upskilling</h4>
                            <span className="text-[9px] font-bold text-amber-400">
                                +15% Match Boost
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {matchData.suggested_skills && matchData.suggested_skills.map((skill, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => window.open(`https://www.coursera.org/search?query=${skill}`, '_blank')}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-zinc-300 text-[10px] rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                                >
                                    <i className="fa-solid fa-plus text-[9px] text-amber-400"></i>
                                    <span>{skill}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Jobs Preview */}
            {matchData.recommended_jobs && matchData.recommended_jobs.length > 0 && (
                <div className="p-5 border-t border-zinc-800 bg-zinc-950/40">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            RECOMMENDED OPENINGS
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {matchData.recommended_jobs.map((job, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 font-bold text-xs">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-zinc-100">{job.title}</h5>
                                        <p className="text-[10px] text-zinc-500">{job.company} • {job.location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApply(job)}
                                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase transition-all cursor-pointer"
                                >
                                    Apply
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
