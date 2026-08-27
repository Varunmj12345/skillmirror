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
import { SkeletonCard } from '../components/motion/Skeleton';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';

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
    const [jdExtraction, setJdExtraction] = useState<{
        skills: string[];
        required_skills: string[];
        matched_skills: string[];
        gapped_skills: string[];
        match_percentage: number;
    } | null>(null);
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
        setJdExtraction(null);
        try {
            const res = await skillService.extractSkills(jobDescription) as any;
            const required = res.required_skills || res.skills || [];
            const userSkillsLower = [
                ...(resumeStatus?.skills || []),
                ...manualSkills.map(m => m.name)
            ].map(s => s.toLowerCase().trim());

            const matched = required.filter((s: string) => 
                userSkillsLower.some(u => u === s.toLowerCase().trim() || u.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(u))
            );
            const gapped = required.filter((s: string) => 
                !userSkillsLower.some(u => u === s.toLowerCase().trim() || u.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(u))
            );
            const matchPct = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0;

            setJdExtraction({
                skills: required,
                required_skills: required,
                matched_skills: matched,
                gapped_skills: gapped,
                match_percentage: matchPct
            });
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
            <Head><title>Skill Gap Radar • SkillMirror OS</title></Head>
            <SmartNotifications />
            <CyberPageShell
                moduleCode="MOD-02"
                title="SKILL GAP RADAR"
                subtitle="Deep neural graph evaluation benchmarking your skills against real-time market role requirements."
                badge="AI ANALYSIS"
                badgeVariant="outline-cyan"
                bulletVariant="cyan"
                glowColor="indigo"
                stats={
                    <>
                        <PageStatChip label="Skills Detected" value={totalSkillCount} icon="fa-microchip" color="cyan" />
                        <PageStatChip label="Target Role" value={role} icon="fa-briefcase" color="slate" />
                        <PageStatChip label="Experience" value={expLevel} icon="fa-chart-bar" color="emerald" />
                    </>
                }
            />
            <div className="px-6 space-y-8 pb-20 max-w-[1400px] mx-auto">
                <GamificationHeader
                    xp={analytics?.total_xp || 12500}
                    rank={analytics?.level === 1 ? 'Beginner' : analytics?.level > 5 ? 'Expert' : 'Intermediate'}
                    streak={7}
                />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div />

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
                        <div className="p-6 rounded-3xl bg-card border border-border shadow-light-card dark:shadow-none">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-bullseye text-blue-600 dark:text-sky-400"></i> Target Goal
                            </h3>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Job Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="sm-input px-4 py-3 text-sm"
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
                                                className={`py-2 rounded-lg text-xs font-bold border transition-all ${expLevel === lvl ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-600/10 dark:border-indigo-500/50 dark:text-indigo-400 shadow-sm' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-500 hover:border-slate-400'
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
                                        className="sm-input px-4 py-3 text-sm"
                                    >
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-card border border-border shadow-light-card dark:shadow-none space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-file-invoice text-indigo-600 dark:text-indigo-400"></i> Job Description Scanner
                            </h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Paste a specific job description to extract required skills and automatically identify skill gaps.
                            </p>
                            <div className="space-y-3">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste JD here (e.g., We are looking for a Senior React & Node.js Engineer with Kafka, Redis, and AWS...)"
                                    className="sm-input h-32 px-4 py-3 text-sm resize-none"
                                />
                                <button
                                    onClick={handleExtractJD}
                                    disabled={extracting || !jobDescription.trim()}
                                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-indigo-600 text-xs font-bold text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                    {extracting ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                                            <span>Scanning Job Description...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-wand-sparkles text-xs" />
                                            <span>Extract Required & Gapped Skills</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Extracted Skills Categorization Display */}
                            {jdExtraction && (
                                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                                        <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <i className="fa-solid fa-chart-pie text-blue-500" />
                                            <span>JD Match: {jdExtraction.match_percentage}%</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            {jdExtraction.skills.length} Required Skills Detected
                                        </span>
                                    </div>

                                    {/* 1. Required Skills from JD */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center justify-between">
                                            <span>Required Skills (From JD)</span>
                                            <span>({jdExtraction.required_skills.length})</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                            {jdExtraction.required_skills.map((sk, idx) => (
                                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-cyan-300 font-bold border border-blue-200 dark:border-blue-500/20 flex items-center gap-1">
                                                    <span>{sk}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Gapped / Missing Skills */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between">
                                            <span>🔴 Gapped Skills (Missing)</span>
                                            <span>({jdExtraction.gapped_skills.length})</span>
                                        </div>
                                        {jdExtraction.gapped_skills.length === 0 ? (
                                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                <i className="fa-solid fa-circle-check" />
                                                <span>No skill gaps! You match all JD requirements.</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                                {jdExtraction.gapped_skills.map((sk, idx) => (
                                                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                                                        <i className="fa-solid fa-triangle-exclamation text-[8px]" />
                                                        <span>{sk}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Matched Skills */}
                                    {jdExtraction.matched_skills.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                                                <span>🟢 Matched In Your Profile</span>
                                                <span>({jdExtraction.matched_skills.length})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                                                {jdExtraction.matched_skills.map((sk, idx) => (
                                                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                                                        <i className="fa-solid fa-check text-[8px]" />
                                                        <span>{sk}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-2 flex flex-col gap-2">
                                        {jdExtraction.gapped_skills.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    jdExtraction.gapped_skills.forEach(s => addManualSkill(s, 'Beginner'));
                                                }}
                                                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-500/30"
                                            >
                                                <i className="fa-solid fa-plus" />
                                                <span>Add All {jdExtraction.gapped_skills.length} Gapped Skills to Profile</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleAnalyze}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <i className="fa-solid fa-bolt" />
                                            <span>Run Readiness Analysis for This JD</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-3xl bg-card border border-border shadow-light-card dark:shadow-none">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-brain text-emerald-500 dark:text-emerald-400"></i> Active Profile Skills
                                </h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Count: <span className="text-slate-900 dark:text-slate-300 font-black">{totalSkillCount}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 min-h-[100px] p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                {(resumeStatus?.skills || []).map(s => (
                                    <div key={s} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700/50 shadow-sm group">
                                        <i className="fa-solid fa-star text-[10px] text-emerald-500"></i>
                                        {s}
                                        <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity italic">CV</span>
                                    </div>
                                ))}
                                {manualSkills.map(s => (
                                    <div key={s.name} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-indigo-200 dark:border-indigo-500/30 shadow-sm group">
                                        {s.name}
                                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-md font-bold uppercase tracking-tighter">{s.level[0]}</span>
                                        <button onClick={() => removeManualSkill(s.name)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                            <i className="fa-solid fa-xmark text-[10px]"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 relative">
                                <div className="flex-1 relative">
                                    <i className="fa-solid fa-plus absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
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
                                        className="sm-input pl-10 pr-4 py-3 text-sm"
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="absolute z-50 bottom-full left-0 w-full mb-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                            {filteredSuggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => addManualSkill(s)}
                                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 hover:text-indigo-600 dark:hover:text-indigo-400 border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-colors"
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
                                    className="sm-input px-4 py-3 text-sm"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                                <button
                                    onClick={() => addManualSkill()}
                                    className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-blue-600 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700/50 shadow-sm"
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
                                        className="flex items-center gap-3 px-8 py-4 bg-card border border-border rounded-2xl font-black text-slate-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:border-blue-300 dark:hover:border-indigo-500/50 transition-all group uppercase tracking-[0.2em] text-[11px] shadow-light-card dark:shadow-none"
                                    >
                                        <i className="fa-solid fa-map-location-dot text-blue-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"></i>
                                        Export Gaps to Roadmap
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="py-10 grid gap-6">
                                <SkeletonCard className="h-64" />
                                <div className="grid grid-cols-2 gap-6">
                                    <SkeletonCard className="h-48" />
                                    <SkeletonCard className="h-48" />
                                </div>
                            </div>
                        )}

                        {!report && !loading && (
                            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 rounded-3xl bg-card border border-dashed border-border shadow-light-card dark:shadow-none">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-700 text-3xl">
                                    <i className="fa-solid fa-magnifying-glass-chart"></i>
                                </div>
                                <div className="max-w-xs">
                                    <h4 className="text-slate-900 dark:text-slate-300 font-bold text-lg mb-2">Ready to Analyze?</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                        Run the <strong className="text-blue-600 dark:text-indigo-400">Readiness Analysis</strong> to unlock deep intelligence and learning strategies.
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
