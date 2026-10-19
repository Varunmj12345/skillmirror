import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import MarketOverview from '../components/MarketOverview';
import JobDemandTrends from '../components/JobDemandTrends';
import SmartJobMatch from '../components/SmartJobMatch';
import TopSkillsChart from '../components/TopSkillsChart';
import LocationDemand from '../components/LocationDemand';
import { jobService } from '../services/jobService';
import { analyticsService } from '../services/analyticsService';
import { aiService } from '../services/aiService';
import withAuth from '../components/withAuth';
import { SkeletonCard } from '../components/motion/Skeleton';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';
import { useToast } from '../components/motion/Toast';

const JobIntelligencePage: React.FC = () => {
    const router = useRouter();
    const { addToast } = useToast();
    const [selectedRole, setSelectedRole] = useState('Data Scientist');
    const [marketData, setMarketData] = useState<any>(null);
    const [trendData, setTrendData] = useState([]);
    const [matchData, setMatchData] = useState(null);
    const [aiPrediction, setAiPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData(selectedRole);
    }, [selectedRole]);

    const fetchData = async (role: string, forceRefresh: boolean = false) => {
        if (forceRefresh) setIsRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const [marketRes, trendRes, matchRes, aiRes] = await Promise.all([
                jobService.fetchLiveJobs(role, forceRefresh),
                analyticsService.getJobTrends(role),
                jobService.getJobMatch(role),
                aiService.predictDemand(role)
            ]);

            setMarketData(marketRes);
            setTrendData(trendRes);
            setMatchData(matchRes);
            setAiPrediction(aiRes);

            if (forceRefresh) {
                addToast({
                    type: 'success',
                    title: 'Live Market Intelligence Synced',
                    message: `Indexed ${marketRes?.total_open_jobs?.toLocaleString() || 'real-time'} active openings for ${role}.`
                });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch job intelligence data. Please check your connection.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(e.target.value);
    };

    const handleDownloadReport = () => {
        window.print();
    };

    return (
        <Layout>
            <Head><title>Job Intelligence Engine • SkillMirror OS</title></Head>
            <CyberPageShell
                moduleCode="JOB-01"
                section="AI CAREER ENGINE"
                badge="AGENT-REACH: ACTIVE"
                title="LIVE JOB INTELLIGENCE"
                subtitle="Real-time market insights, hiring velocity, AI demand forecasts & smart role matching powered by Agent-Reach."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 focus:border-amber-400 outline-none"
                        >
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Product Manager">Product Manager</option>
                        </select>
                        <button 
                            onClick={() => fetchData(selectedRole, true)} 
                            disabled={isRefreshing}
                            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            title="Rescrape and sync live market intelligence"
                        >
                            <i className={`fa-solid fa-arrows-rotate text-xs ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                            <span>{isRefreshing ? 'Syncing...' : 'Sync Feed'}</span>
                        </button>
                        <button onClick={handleDownloadReport} className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono font-bold text-xs cursor-pointer">
                            <i className="fa-solid fa-download text-xs mr-1" /> Report
                        </button>
                        <button onClick={() => router.push('/skill-gap')} className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs cursor-pointer shadow-sm">
                            <i className="fa-solid fa-magnifying-glass-chart text-xs mr-1" /> Analyze Gap
                        </button>
                    </div>
                }
                stats={
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        <PageStatChip label="Role Target" value={selectedRole} icon="fa-briefcase" color="slate" />
                        <PageStatChip 
                            label="Active Postings" 
                            value={marketData?.total_open_jobs ? marketData.total_open_jobs.toLocaleString() : '50k+'} 
                            icon="fa-database" 
                            color="emerald" 
                        />
                        <PageStatChip label="Crawler Feed" value="Agent-Reach Active" icon="fa-circle" color="amber" />
                    </div>
                }
            />
            <div className="px-4 sm:px-6 pb-20 max-w-[1400px] mx-auto font-mono">
                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {[...Array(5)].map((_, i) => <SkeletonCard key={i} className="!h-24" />)}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <SkeletonCard className="lg:col-span-2 !h-[360px]" />
                            <SkeletonCard className="!h-[360px]" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-zinc-900 border border-rose-500/40 text-rose-400 px-6 py-6 rounded-2xl flex flex-col items-center">
                        <i className="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                        <span className="font-semibold text-xs">{error}</span>
                        <button
                            onClick={() => fetchData(selectedRole)}
                            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <ScrollReveal className="space-y-6">
                        <MarketOverview data={marketData} />

                        {/* Charts Section */}
                        <JobDemandTrends trends={trendData} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Skills & Location */}
                            <div className="lg:col-span-2 space-y-6">
                                <TopSkillsChart />
                                <LocationDemand />
                            </div>

                            {/* Smart Match & AI Prediction */}
                            <div className="space-y-6">
                                <SmartJobMatch matchData={matchData} />

                                {/* AI Prediction Card */}
                                <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI FORECAST ENGINE</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase">12-MO HORIZON</span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-100">12-Month Demand Projection</h3>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">Market trajectory for {selectedRole}</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[11px] text-zinc-400">Growth Forecast</span>
                                            <span className="text-base font-bold text-emerald-400 tabular-nums">
                                                {aiPrediction?.predicted_growth > 0 ? '+' : ''}{aiPrediction?.predicted_growth}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                                                style={{ width: `${Math.min(Math.max((aiPrediction?.predicted_growth || 0) + 50, 0), 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-zinc-400">Stability Score</span>
                                        <span className="font-bold text-zinc-100 tabular-nums">{aiPrediction?.stability_score}/100</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                                        <p className="text-xs text-zinc-300 italic leading-relaxed">"{aiPrediction?.insight}"</p>
                                    </div>

                                    <div className="flex justify-between items-center pt-1 border-t border-zinc-800">
                                        <span className="text-[10px] text-zinc-500 uppercase">RISK INDEX</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            aiPrediction?.risk_level === 'Low' ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30' :
                                            aiPrediction?.risk_level === 'Medium' ? 'bg-zinc-950 text-amber-400 border-amber-500/30' :
                                            'bg-zinc-950 text-rose-400 border-rose-500/30'
                                        }`}>
                                            {aiPrediction?.risk_level || 'Low'} Risk
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                )}
            </div>
        </Layout>
    );
};

export default withAuth(JobIntelligencePage);
