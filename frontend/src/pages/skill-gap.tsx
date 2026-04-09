import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';
import SkillGapScoreCards from '../components/SkillGap/SkillGapScoreCards';
import RadarGapChart from '../components/SkillGap/RadarGapChart';
import GapHeatmap from '../components/SkillGap/GapHeatmap';
import SkillComparisonPanels from '../components/SkillGap/SkillComparisonPanels';
import AIRecommendations from '../components/SkillGap/AIRecommendations';
import AdvancedCareerIntelligence from '../components/SkillGap/AdvancedCareerIntelligence';
import ActionEngine from '../components/SkillGap/ActionEngine';
import SmartNotifications from '../components/SkillGap/SmartNotifications';
import GamificationHeader from '../components/SkillGap/GamificationHeader';
import { skillService } from '../services/skillService';
import { Skill, AIRecommendationsData, ActionPlan } from '../components/SkillGap/types';

// Extended report type for the new UI
interface EnhancedSkillGapReport {
    readiness_score: number;
    technical_score: number;
    soft_skill_score: number;
    strong_matches: Skill[];
    partial_matches: Skill[];
    missing_skills: Skill[];
    ai_insight: string;
    priority_learning: string;
    priority_skills: string[];
    improvement_impact: number;
    roadmap?: any[];
    ai_career_intelligence?: any;
    readiness_metrics?: any;
}

const ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'DevOps Engineer', 'UI/UX Designer', 'Product Manager',
    'AI Engineer', 'Mobile Developer', 'Cybersecurity Analyst'
];

const INDUSTRIES = ['Tech', 'Finance', 'Healthcare', 'E-commerce', 'Entertainment', 'Automotive'];

const SKILL_DATABASE: Record<string, string[]> = {
    'Frontend Developer': ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux', 'GraphQL', 'Jest', 'Web Performance', 'Accessibility', 'Figma'],
    'Backend Developer': ['Node.js', 'Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Microservices', 'System Design'],
    'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'System Design', 'CI/CD', 'GraphQL', 'Next.js'],
    'Data Scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'Data Visualization', 'Statistics', 'NLP'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Jenkins', 'Linux', 'Monitoring', 'Python', 'Scripting'],
    'UI/UX Designer': ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing', 'Typography', 'Color Theory', 'Interaction Design', 'Usability Testing'],
    'Product Manager': ['Agile', 'Scrum', 'Product Strategy', 'Roadmapping', 'User Analytics', 'A/B Testing', 'Stakeholder Management', 'SQL', 'Jira'],
    'AI Engineer': ['Python', 'Deep Learning', 'Neural Networks', 'LangChain', 'OpenAI API', 'Vector Databases', 'PyTorch', 'Math & Statistics'],
    'Mobile Developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI Design', 'Firebase', 'App Store Deployment', 'Performance Optimization'],
    'Cybersecurity Analyst': ['Network Security', 'Penetration Testing', 'SIEM', 'Incident Response', 'Cryptography', 'Cloud Security', 'Compliance', 'Ethical Hacking']
};

const SkillGapPage: React.FC = () => {
    // Config state
    const [role, setRole] = useState('Frontend Developer');
    const [expLevel, setExpLevel] = useState('Mid');
    const [industry, setIndustry] = useState('Tech');
    const [jobDescription, setJobDescription] = useState('');

    // Skills state
    const [manualSkills, setManualSkills] = useState<{ name: string, level: string }[]>([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

    // Data state
    const [resumeStatus, setResumeStatus] = useState<{ exists: boolean, skills: string[] } | null>(null);
    const [report, setReport] = useState<EnhancedSkillGapReport | null>(null);
    const [recommendations, setRecommendations] = useState<AIRecommendationsData | null>(null);
    const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractedJDSkills, setExtractedJDSkills] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = newSkillName.length > 0
        ? (SKILL_DATABASE[role] || []).filter(s => s.toLowerCase().includes(newSkillName.toLowerCase()) && !manualSkills.some(ms => ms.name === s))
        : [];

    const totalSkillCount = (resumeStatus?.skills?.length || 0) + manualSkills.length;

    useEffect(() => {
        const check = async () => {
            try {
                const res = await skillService.checkResumeStatus() as any;
                setResumeStatus(res);

                // Fetch basic analytics for gamification
                const { fetchDashboard } = await import('../services/dashboard');
                const dashData = await fetchDashboard() as any;
                setAnalytics(dashData.xp_system);
            } catch (err) {
                console.error(err);
            }
        };
        check();
    }, []);

    const addManualSkill = (name?: string, level?: string) => {
        const sName = name || newSkillName;
        const sLevel = level || newSkillLevel;
        if (!sName.trim()) return;
        if (manualSkills.find(s => s.name.toLowerCase() === sName.toLowerCase())) return;
        setManualSkills([...manualSkills, { name: sName.trim(), level: sLevel }]);
        if (!name) setNewSkillName('');
        setShowSuggestions(false);
    };

    const removeManualSkill = (name: string) => {
        setManualSkills(manualSkills.filter(s => s.name !== name));
    };

    const handleExtractJD = async () => {
        if (!jobDescription.trim()) return;
        setExtracting(true);
        setExtractedJDSkills([]);
        try {
            const res = await skillService.extractSkills(jobDescription) as any;
            setExtractedJDSkills(res.skills);
        } catch (err) {
            console.error('Extraction failed', err);
        } finally {
            setExtracting(false);
        }
    };

    const handleAnalyze = async () => {
        if (totalSkillCount === 0) return;
        setLoading(true);
        setReport(null);
        try {
            const res = await skillService.analyzeSkillGap(role, jobDescription, expLevel, industry, manualSkills) as any;

            // Mock intelligence layers
            res.ai_career_intelligence = {
                confidence_score: 87,
                market_demand: 'High',
                hiring_trend: 15.5,
                salary_impact: { [res.priority_skills?.[0] || 'React']: 18, [res.priority_skills?.[1] || 'Node']: 12 },
                automation_risk: 12.0,
                job_stability: 'High'
            };
            res.readiness_metrics = {
                readiness_change: 5,
                technical_change: 3,
                soft_change: 8,
                market_average: 65,
                percentile: 24
            };

            setReport(res);

            const missing = [...(res.missing_skills || []), ...(res.partial_matches || [])];
            if (missing.length > 0) {
                const recsRes = await skillService.recommendLearning(role, missing) as any;
                setRecommendations(recsRes);

                // Fetch Action Plan
                const planRes = await skillService.generateActionPlan(role, missing.map(s => s.name)) as any;
                setActionPlan(planRes);
            }
        } catch (err) {
            console.error('Analysis failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportToRoadmap = async () => {
        if (!report || report.missing_skills.length === 0) return;
        setLoading(true);
        try {
            const missingNames = report.missing_skills.map(s => s.name);
            const { generateRoadmap } = await import('../services/roadmap');
            await generateRoadmap(role, missingNames);
            alert('Missing skills successfully exported to your Career Roadmap and Action Plan!');
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to export. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Intelligent Skill Gap • SkillMirror</title>
            </Head>

            <SmartNotifications />

            <div className="space-y-8 pb-20">
                {/* Gamification Strip */}
                <GamificationHeader
                    xp={analytics?.total_xp || 12500}
                    rank={analytics?.level === 1 ? 'Beginner' : analytics?.level > 5 ? 'Expert' : 'Intermediate'}
                    streak={7}
                />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-sky-400">
                                Career Intelligence 2.0
                            </p>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">
                            Smart Gap <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 text-glow">Analyser</span>
                        </h1>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || totalSkillCount === 0}
                        className="group relative px-8 py-4 bg-indigo-600 rounded-2xl font-black text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <span className="flex items-center gap-2 uppercase tracking-widest text-[11px] font-black">
                            {loading ? (
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            ) : (
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                            )}
                            Analyze Readiness
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 border-slate-800/50">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-bullseye text-sky-400"></i> Target Goal
                            </h3>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 ml-1">Job Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 ml-1">Experience Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Entry', 'Mid', 'Senior'].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setExpLevel(lvl)}
                                                className={`py-2 rounded-lg text-xs font-bold border transition-all ${expLevel === lvl ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                                    }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 ml-1">Industry (Optional)</label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    >
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 border-slate-800/50 bg-indigo-600/5">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-file-invoice text-indigo-400"></i> Job Description Scan
                            </h3>
                            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium uppercase tracking-tighter">
                                Paste a specific job description to find niche requirements and tools.
                            </p>
                            <div className="space-y-4">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste JD here..."
                                    className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder:text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                />
                                <button
                                    onClick={handleExtractJD}
                                    disabled={extracting || !jobDescription.trim()}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {extracting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-sparkles"></i>}
                                    Extract Skills
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel p-6 border-slate-800/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-brain text-emerald-400"></i> Active Profile Skills
                                </h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Count: <span className="text-slate-300 font-black">{totalSkillCount}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 min-h-[100px] p-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                {(resumeStatus?.skills || []).map(s => (
                                    <div key={s} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/50 group">
                                        <i className="fa-solid fa-star text-[10px] text-emerald-500/50"></i>
                                        {s}
                                        <span className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity italic">CV</span>
                                    </div>
                                ))}
                                {manualSkills.map(s => (
                                    <div key={s.name} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-indigo-500/30 group">
                                        {s.name}
                                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 rounded-md font-bold uppercase tracking-tighter">{s.level[0]}</span>
                                        <button onClick={() => removeManualSkill(s.name)} className="text-slate-500 hover:text-rose-400 transition-colors">
                                            <i className="fa-solid fa-xmark text-[10px]"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 relative">
                                <div className="flex-1 relative">
                                    <i className="fa-solid fa-plus absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                                    <input
                                        type="text"
                                        value={newSkillName}
                                        onChange={(e) => {
                                            setNewSkillName(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        onKeyDown={(e) => e.key === 'Enter' && addManualSkill()}
                                        placeholder="Add skill (e.g. AWS, Figma, Python)..."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all text-sm"
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="absolute z-50 bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                            {filteredSuggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => addManualSkill(s)}
                                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 border-b border-slate-800/50 last:border-0 transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <select
                                    value={newSkillLevel}
                                    onChange={(e) => setNewSkillLevel(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                                <button
                                    onClick={() => addManualSkill()}
                                    className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700/50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Analysis Results View */}
                        {report && !loading && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

                                <AdvancedCareerIntelligence data={report.ai_career_intelligence} />

                                <SkillGapScoreCards
                                    scores={{
                                        readiness: report.readiness_score,
                                        technical: report.technical_score,
                                        soft: report.soft_skill_score
                                    }}
                                    intelligence={report.readiness_metrics}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <RadarGapChart data={[...report.strong_matches, ...report.partial_matches, ...report.missing_skills]} />
                                    <GapHeatmap data={report.missing_skills} />
                                </div>

                                <ActionEngine plan={actionPlan || undefined} onStartLearning={handleExportToRoadmap} />

                                <SkillComparisonPanels
                                    matched={[...report.strong_matches, ...report.partial_matches]}
                                    missing={report.missing_skills}
                                />

                                <AIRecommendations data={recommendations} />

                                <div className="flex justify-center pt-8">
                                    <button
                                        onClick={handleExportToRoadmap}
                                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group uppercase tracking-[0.2em] text-[11px]"
                                    >
                                        <i className="fa-solid fa-map-location-dot text-indigo-400 group-hover:scale-110 transition-transform"></i>
                                        Export Gaps to Roadmap
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-slate-500 font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Simulating Career Future...</p>
                            </div>
                        )}

                        {!report && !loading && (
                            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 glass-panel border-dashed border-slate-800 bg-transparent">
                                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 text-3xl">
                                    <i className="fa-solid fa-magnifying-glass-chart"></i>
                                </div>
                                <div className="max-w-xs">
                                    <h4 className="text-slate-300 font-bold text-lg mb-2">Ready to Analyze?</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                        Run the <strong className="text-indigo-400">Readiness Analysis</strong> to unlock deep intelligence and learning strategies.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default withAuth(SkillGapPage);
