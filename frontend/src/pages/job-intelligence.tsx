import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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

const JobIntelligencePage: React.FC = () => {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState('Frontend Developer');
    const [marketData, setMarketData] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [matchData, setMatchData] = useState(null);
    const [aiPrediction, setAiPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData(selectedRole);
    }, [selectedRole]);

    const fetchData = async (role: string) => {
        setLoading(true);
        setError('');
        try {
            const [marketRes, trendRes, matchRes, aiRes] = await Promise.all([
                jobService.fetchLiveJobs(role),
                analyticsService.getJobTrends(role),
                jobService.getJobMatch(role),
                aiService.predictDemand(role)
            ]);

            setMarketData(marketRes);
            setTrendData(trendRes);
            setMatchData(matchRes);
            setAiPrediction(aiRes);

        } catch (err) {
            console.error(err);
            setError('Failed to fetch job intelligence data. Please check your connection.');
        } finally {
            setLoading(false);
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
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Live Job Intelligence Engine</h1>
                        <p className="text-gray-600 mt-2">Real-time market insights & AI-driven career guidance.</p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Product Manager">Product Manager</option>
                        </select>
                        <button
                            onClick={handleDownloadReport}
                            className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 shadow-sm font-bold text-sm"
                        >
                            <i className="fa-solid fa-download"></i> Report
                        </button>
                        <button
                            onClick={() => router.push('/skill-gap')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100 font-bold text-sm"
                        >
                            <i className="fa-solid fa-magnifying-glass-chart"></i> Analyze Gap
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-72 bg-gray-200 rounded-xl"></div>
                            <div className="h-72 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex flex-col items-center">
                        <i className="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                        <span className="font-semibold">{error}</span>
                        <button
                            onClick={() => fetchData(selectedRole)}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <>
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
                                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <i className="fa-solid fa-brain text-9xl"></i>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                        <i className="fa-solid fa-robot"></i> AI Future Prediction
                                    </h3>
                                    <p className="text-indigo-200 text-xs mb-4">Market forecast for next 12 months</p>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-indigo-100">Growth Forecast</span>
                                            <span className="text-xl font-bold text-green-400">
                                                {aiPrediction?.predicted_growth > 0 ? '+' : ''}{aiPrediction?.predicted_growth}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-indigo-800/50 rounded-full h-1.5">
                                            <div
                                                className="bg-green-400 h-1.5 rounded-full"
                                                style={{ width: `${Math.min(Math.max(aiPrediction?.predicted_growth + 50, 0), 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4 text-sm">
                                        <span className="text-indigo-100">Stability Score</span>
                                        <span className="font-semibold">{aiPrediction?.stability_score}/100</span>
                                    </div>

                                    <div className="bg-white/10 p-3 rounded-lg border border-white/10 mb-2">
                                        <p className="text-sm italic leading-relaxed">"{aiPrediction?.insight}"</p>
                                    </div>

                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs text-indigo-300">Risk Assessment</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${aiPrediction?.risk_level === 'Low' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                            aiPrediction?.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                'bg-red-500/20 text-red-300 border border-red-500/30'
                                            }`}>
                                            {aiPrediction?.risk_level} Risk
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default withAuth(JobIntelligencePage);
