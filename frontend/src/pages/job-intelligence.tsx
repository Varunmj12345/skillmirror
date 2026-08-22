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
import { Bullet } from '../components/ui/bullet';
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
                moduleCode="MOD-05"
                title="LIVE JOB INTELLIGENCE"
                subtitle="Real-time market insights, hiring velocity, AI demand forecasts & smart role matching powered by Agent-Reach."
                badge="LIVE FEED"
                badgeVariant="outline-cyan"
                bulletVariant="cyan"
                glowColor="cyan"
                actions={
                    <>
                        <select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="sm-input !py-2 !px-3 text-xs min-w-[180px]"
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
                            className="sm-btn-neon !py-2.5 !px-3 text-xs flex items-center gap-1.5"
                            title="Rescrape and sync live market intelligence"
                        >
                            <i className={`fa-solid fa-arrows-rotate text-xs ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                            <span>{isRefreshing ? 'Syncing...' : 'Sync Feed'}</span>
                        </button>
                        <button onClick={handleDownloadReport} className="sm-btn-neon !py-2.5 !px-4 text-xs">
                            <i className="fa-solid fa-download text-xs" /> Report
                        </button>
                        <button onClick={() => router.push('/skill-gap')} className="sm-btn-primary !py-2.5 !px-4 text-xs">
                            <i className="fa-solid fa-magnifying-glass-chart text-xs" /> Analyze Gap
                        </button>
                    </>
                }
                stats={
                    <>
                        <PageStatChip label="Role" value={selectedRole} icon="fa-briefcase" color="cyan" />
                        <PageStatChip 
                            label="Total Postings" 
                            value={marketData?.total_open_jobs ? marketData.total_open_jobs.toLocaleString() : '50k+'} 
                            icon="fa-database" 
                            color="emerald" 
                        />
                        <PageStatChip label="Feed Status" value="Agent-Reach Active" icon="fa-circle" color="amber" />
                    </>
                }
            />
            <div className="px-6 pb-20 max-w-[1400px] mx-auto">

                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => <SkeletonCard key={i} className="!h-24" />)}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <SkeletonCard className="lg:col-span-2 !h-[400px]" />
                            <SkeletonCard className="!h-[400px]" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex flex-col items-center">
                        <i className="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                        <span className="font-semibold">{error}</span>
                        <button
                            onClick={() => fetchData(selectedRole)}
                            className="mt-3 sm-btn-primary px-4 py-2 bg-red-600 hover:bg-red-700 text-white shadow-none"
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

                                {/* AI Prediction Card — cyber themed */}
                                <div className="rounded-2xl bg-pop border border-indigo-500/25 p-5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                                    <div className="absolute top-3 right-3 opacity-5">
                                        <i className="fa-solid fa-brain text-8xl text-indigo-400" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bullet variant="default" size="sm" />
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">AI FORECAST ENGINE</span>
                                    </div>
                                    <h3 className="text-sm font-display font-black text-white mb-1">12-Month Demand Prediction</h3>
                                    <p className="text-[11px] font-mono text-slate-500 mb-4">Market forecast for {selectedRole}</p>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[11px] font-mono text-slate-400">Growth Forecast</span>
                                            <span className="text-lg font-display font-black text-emerald-400">
                                                {aiPrediction?.predicted_growth > 0 ? '+' : ''}{aiPrediction?.predicted_growth}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/[0.04] rounded-full h-1">
                                            <div className="bg-emerald-400 h-1 rounded-full transition-all duration-700"
                                                style={{ width: `${Math.min(Math.max((aiPrediction?.predicted_growth || 0) + 50, 0), 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4 text-[11px] font-mono">
                                        <span className="text-slate-400">Stability Score</span>
                                        <span className="font-bold text-white">{aiPrediction?.stability_score}/100</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 mb-3">
                                        <p className="text-xs font-mono text-indigo-300 italic leading-relaxed">"{aiPrediction?.insight}"</p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-slate-500">RISK ASSESSMENT</span>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                                            aiPrediction?.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                                            aiPrediction?.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                                            'bg-red-500/10 text-red-300 border-red-500/30'
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
