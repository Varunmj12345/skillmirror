// @ts-nocheck
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

    if (!matchData) return <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 animate-pulse h-80"></div>;

    const score = matchData.match_score;
    const data = [
        { name: 'Match', value: score },
        { name: 'Gap', value: 100 - score },
    ];
    // Vibrant gradient-like colors for the chart
    const COLORS = ['#6366f1', '#f3f4f6'];

    const handleApply = (job: any) => {
        const applyLink = job.job_apply_link || job.redirect_url || job.url;

        // Simple URL validation
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-link-slash text-2xl"></i>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">Link Unavailable</h4>
                            <p className="text-sm text-gray-500 mb-6">
                                We couldn't find a direct application link for <span className="font-semibold text-gray-700">{selectedJob?.title}</span>. Would you like to search for it on LinkedIn?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLinkedInSearch}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200"
                                >
                                    Try LinkedIn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative top bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">Smart Job Match</h3>
                    <p className="text-xs text-gray-500 font-medium">Profile vs Market Alignment</p>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                    AI Analysis
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Circular Score */}
                <div className="flex flex-col items-center justify-center relative h-56 w-full">
                    {/* Glow effect behind the chart */}
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full transform scale-75"></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-extrabold text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {score}%
                        </span>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Match</span>
                    </div>
                </div>

                {/* Skills Lists */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                <i className="fa-solid fa-check text-green-600 text-xs"></i>
                            </span>
                            Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {matchData.matched_skills && matchData.matched_skills.length > 0 ? (
                                matchData.matched_skills.map((skill, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-white text-green-700 text-xs font-semibold rounded-md border border-green-200 shadow-sm">
                                        {skill}
                                    </span>
                                ))
                            ) : <span className="text-xs text-gray-400">No matches found</span>}
                        </div>
                    </div>

                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                <i className="fa-solid fa-bolt text-amber-600 text-xs"></i>
                            </span>
                            Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {matchData.missing_skills && matchData.missing_skills.length > 0 ? (
                                matchData.missing_skills.map((skill, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-white text-amber-700 text-xs font-semibold rounded-md border border-amber-200 shadow-sm">
                                        {skill}
                                    </span>
                                ))
                            ) : <span className="text-xs text-gray-400">No missing skills!</span>}
                        </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 mt-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-50">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-800">Suggested to Learn</h4>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Boost Score +15%</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {matchData.suggested_skills && matchData.suggested_skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    onClick={() => window.open(`https://www.coursera.org/search?query=${skill}`, '_blank')}
                                    className="group flex items-center px-3 py-1.5 bg-white text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100 shadow-sm cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
                                >
                                    <i className="fa-solid fa-plus mr-1.5 opacity-50 group-hover:opacity-100"></i>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Jobs Preview */}
            {matchData.recommended_jobs && matchData.recommended_jobs.length > 0 && (
                <div className="bg-gradient-to-b from-white to-gray-50 p-5 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Job Fits for You</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {matchData.recommended_jobs.map((job, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{job.title}</h5>
                                        <p className="text-xs text-gray-500 font-medium">{job.company} • {job.location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApply(job)}
                                    className="text-xs font-bold px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200 hover:shadow-indigo-200"
                                >
                                    Apply Now
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
