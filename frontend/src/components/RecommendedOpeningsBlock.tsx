import React, { useState, useMemo } from 'react';
import { jobService, ScoutAgentStatus } from '../services/jobService';
import { useToast } from './motion/Toast';

export interface RecommendedJob {
    id?: string;
    title: string;
    company: string;
    location: string;
    url: string;
    official_portal_url?: string;
    salary?: string | number;
    match_score?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    skills?: string[];
    bids?: string;
    source?: string;
    source_type?: string;
    is_official?: boolean;
    is_scraped?: boolean;
}

export interface SourcesBreakdown {
    all?: number;
    official?: number;
    freelancer?: number;
    remoteok?: number;
    remotive?: number;
    arbeitnow?: number;
}

interface RecommendedOpeningsBlockProps {
    jobs: RecommendedJob[];
    sourcesBreakdown?: SourcesBreakdown;
    agentStatus?: ScoutAgentStatus | null;
    role: string;
    loading?: boolean;
    onRefresh?: () => void;
}

const RecommendedOpeningsBlock: React.FC<RecommendedOpeningsBlockProps> = ({
    jobs = [],
    sourcesBreakdown,
    agentStatus,
    role,
    loading = false,
    onRefresh,
}) => {
    const { addToast } = useToast();
    const [selectedSource, setSelectedSource] = useState<string>('all');
    const [isSweeping, setIsSweeping] = useState(false);
    const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Compute dynamic breakdown if not provided by backend
    const computedBreakdown = useMemo(() => {
        return {
            all: jobs.length,
            official: jobs.filter(j => j.is_official).length,
            freelancer: jobs.filter(j => j.source_type === 'FREELANCER').length,
            remoteok: jobs.filter(j => j.source_type === 'REMOTEOK').length,
            remotive: jobs.filter(j => j.source_type === 'REMOTIVE').length,
            arbeitnow: jobs.filter(j => j.source_type === 'ARBEITNOW').length,
            ...(sourcesBreakdown || {})
        };
    }, [jobs, sourcesBreakdown]);

    // Filter jobs by selected source tab
    const filteredJobs = useMemo(() => {
        if (selectedSource === 'all') return jobs;
        if (selectedSource === 'official') return jobs.filter(j => j.is_official);
        return jobs.filter(j => (j.source_type || '').toLowerCase() === selectedSource.toLowerCase());
    }, [jobs, selectedSource]);

    const handleCheckOut = (job: RecommendedJob) => {
        const link = job.url || job.official_portal_url;
        if (link && link.startsWith('http')) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            setSelectedJob(job);
            setIsModalOpen(true);
        }
    };

    const handleRunScoutSweep = async () => {
        setIsSweeping(true);
        try {
            const res = await jobService.runScoutSweep();
            addToast({
                type: 'success',
                title: 'Official Career Scout Sweep Complete',
                message: `Scanned 10 official portals & tech hiring feeds. Indexed ${res?.total_indexed || 'fresh'} openings.`
            });
            if (onRefresh) onRefresh();
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Scout Agent Sweep Error',
                message: 'Unable to reach official portals right now. Please retry in a moment.'
            });
        } finally {
            setIsSweeping(false);
        }
    };

    const getSourceBadge = (job: RecommendedJob) => {
        if (job.is_official) {
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/40 flex items-center gap-1 shadow-sm shadow-cyan-500/10">
                    <i className="fa-solid fa-shield-halved text-[9px] text-cyan-400"></i>
                    <span>OFFICIAL PORTAL</span>
                </span>
            );
        }
        const st = (job.source_type || '').toUpperCase();
        if (st === 'FREELANCER') {
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                    <i className="fa-solid fa-bolt text-[9px]"></i>
                    <span>FREELANCER GIG</span>
                </span>
            );
        }
        if (st === 'REMOTEOK') {
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/70 text-indigo-400 border border-indigo-500/40 flex items-center gap-1">
                    <i className="fa-solid fa-globe text-[9px]"></i>
                    <span>REMOTEOK LIVE</span>
                </span>
            );
        }
        if (st === 'REMOTIVE') {
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <i className="fa-solid fa-laptop-code text-[9px]"></i>
                    <span>REMOTIVE TECH</span>
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                <i className="fa-solid fa-briefcase text-[9px]"></i>
                <span>{job.source || 'JOB BOARD'}</span>
            </span>
        );
    };

    return (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 font-mono mb-6 shadow-xl relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Modal for Fallback Routing */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
                        <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
                            <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-zinc-100 mb-1">External Requisition Route</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Proceed to requisition for <span className="text-amber-400">{selectedJob?.title}</span>?
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl hover:border-zinc-700 transition-colors uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedJob) {
                                        const query = encodeURIComponent(`${selectedJob.title} ${selectedJob.company}`);
                                        window.open(`https://www.google.com/search?q=${query}+jobs`, '_blank');
                                    }
                                    setIsModalOpen(false);
                                }}
                                className="flex-1 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold rounded-xl transition-all uppercase"
                            >
                                Search Portal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                            AGENT-REACH MULTI-SOURCE CRAWLER
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded">
                            OFFICIAL WEBSITES & MULTI-BOARD
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-950/40 text-amber-400 border border-amber-800/60 rounded">
                            FREELANCER LIVE
                        </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                        RECOMMENDED CURRENT OPENINGS (WEB-SCRAPED)
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Live openings aggregated from official company portals (Stripe, Figma, Vercel, Cloudflare, GitLab...) and tech hiring networks matching{' '}
                        <span className="text-amber-400 font-semibold">{role}</span>.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        onClick={handleRunScoutSweep}
                        disabled={isSweeping || loading}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-500/10 cursor-pointer"
                        title="Command the Scout Agent to sweep official company career portals"
                    >
                        <i className={`fa-solid fa-robot text-xs text-cyan-400 ${isSweeping ? 'animate-bounce' : ''}`} />
                        <span>{isSweeping ? 'Scouting Portals...' : 'Run Scout Sweep ⚡'}</span>
                    </button>

                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={loading || isSweeping}
                            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Refresh active listings feed"
                        >
                            <i className={`fa-solid fa-arrows-rotate text-xs text-amber-400 ${loading ? 'fa-spin' : ''}`} />
                            <span>{loading ? 'Syncing...' : 'Sync Feed'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Official Career Scout Agent Telemetry Banner */}
            <div className="my-4 p-3.5 rounded-xl bg-zinc-950/80 border border-cyan-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <i className="fa-solid fa-robot text-sm"></i>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200">
                                Official Career Scout Agent
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                                {agentStatus?.state || 'ONLINE'}
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                            Regularly monitoring {agentStatus?.monitored_portals_count || 10}+ official tech portals (Stripe, Figma, Vercel, Cloudflare, GitLab, Reddit, Airbnb, Canonical, Elastic...)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-zinc-400 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-shield-halved text-cyan-400"></i>
                        <span>{agentStatus?.official_openings_indexed || computedBreakdown.official || 0} Official Openings</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-database text-amber-400"></i>
                        <span>{agentStatus?.total_openings_indexed || computedBreakdown.all || jobs.length} Total Indexed</span>
                    </div>
                </div>
            </div>

            {/* Source Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-800/60 no-scrollbar">
                <button
                    onClick={() => setSelectedSource('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedSource === 'all'
                            ? 'bg-amber-400 text-zinc-950 shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                >
                    ALL SOURCES ({computedBreakdown.all || 0})
                </button>
                <button
                    onClick={() => setSelectedSource('official')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        selectedSource === 'official'
                            ? 'bg-cyan-400 text-zinc-950 shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:text-cyan-300 border border-zinc-800'
                    }`}
                >
                    <i className="fa-solid fa-shield-halved text-[10px]"></i>
                    <span>OFFICIAL PORTALS ({computedBreakdown.official || 0})</span>
                </button>
                <button
                    onClick={() => setSelectedSource('freelancer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        selectedSource === 'freelancer'
                            ? 'bg-amber-400 text-zinc-950 shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:text-amber-300 border border-zinc-800'
                    }`}
                >
                    <i className="fa-solid fa-bolt text-[10px]"></i>
                    <span>FREELANCER ({computedBreakdown.freelancer || 0})</span>
                </button>
                <button
                    onClick={() => setSelectedSource('remoteok')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        selectedSource === 'remoteok'
                            ? 'bg-indigo-400 text-zinc-950 shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:text-indigo-300 border border-zinc-800'
                    }`}
                >
                    <i className="fa-solid fa-globe text-[10px]"></i>
                    <span>REMOTEOK ({computedBreakdown.remoteok || 0})</span>
                </button>
                <button
                    onClick={() => setSelectedSource('remotive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        selectedSource === 'remotive'
                            ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:text-emerald-300 border border-zinc-800'
                    }`}
                >
                    <i className="fa-solid fa-laptop-code text-[10px]"></i>
                    <span>REMOTIVE ({computedBreakdown.remotive || 0})</span>
                </button>
            </div>

            {/* Openings Grid */}
            <div className="pt-5">
                {filteredJobs.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-3">
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 text-cyan-400 rounded-xl flex items-center justify-center mx-auto">
                            <i className="fa-solid fa-satellite-dish text-base"></i>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-200">
                            No Openings In Selected Filter for {role}
                        </h4>
                        <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
                            Run an immediate sweep across official company portals and hiring feeds to index active roles.
                        </p>
                        <button
                            onClick={handleRunScoutSweep}
                            disabled={isSweeping}
                            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                        >
                            Scout Official Portals Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredJobs.map((job, idx) => {
                            const skillsList = job.matched_skills?.length
                                ? job.matched_skills
                                : (job.skills || ['Full-Stack', 'Problem Solving']);

                            return (
                                <div
                                    key={job.id || idx}
                                    className={`bg-zinc-950 p-4 rounded-xl border transition-all flex flex-col justify-between group space-y-4 ${
                                        job.is_official
                                            ? 'border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-cyan-500/5'
                                            : 'border-zinc-800 hover:border-amber-500/50 hover:shadow-amber-500/5'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        {/* Top Meta Line */}
                                        <div className="flex items-center justify-between gap-2">
                                            {getSourceBadge(job)}
                                            {job.match_score && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                                                    {job.match_score}% MATCH
                                                </span>
                                            )}
                                        </div>

                                        {/* Job Title */}
                                        <div>
                                            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                                                {job.title}
                                            </h3>
                                            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                                                <span className="font-semibold text-zinc-300">{job.company}</span>
                                                <span>•</span>
                                                <span className="truncate">{job.location || 'Remote'}</span>
                                            </p>
                                        </div>

                                        {/* Compensation & Bids / ATS Status */}
                                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                            {job.salary && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-amber-400">
                                                    <i className="fa-solid fa-tag text-[9px] mr-1" />
                                                    {job.salary}
                                                </span>
                                            )}
                                            {job.bids && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400">
                                                    <i className="fa-solid fa-shield text-[9px] mr-1 text-cyan-400" />
                                                    {job.bids}
                                                </span>
                                            )}
                                        </div>

                                        {/* Skill Tags */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {skillsList.slice(0, 3).map((s, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="px-2 py-0.5 rounded bg-zinc-900/80 text-[10px] text-emerald-400 border border-emerald-800/30 font-medium"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                            {skillsList.length > 3 && (
                                                <span className="px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
                                                    +{skillsList.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-3 border-t border-zinc-800/80">
                                        <button
                                            onClick={() => handleCheckOut(job)}
                                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                                job.is_official
                                                    ? 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 group-hover:shadow-cyan-500/10'
                                                    : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 group-hover:shadow-amber-500/10'
                                            }`}
                                        >
                                            <span>{job.is_official ? 'Apply on Official Site' : 'Check Out Opening'}</span>
                                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendedOpeningsBlock;
