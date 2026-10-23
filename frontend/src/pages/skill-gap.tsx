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
            <Head><title>Skill Gap Analyzer • SkillMirror OS</title></Head>
            <SmartNotifications />
            <CyberPageShell
                moduleCode="GAP-01"
                title="SKILL GAP ANALYZER"
                subtitle="Deep neural graph evaluation benchmarking competencies against live market role requirements."
                badge="NEURAL AUDIT"
                badgeVariant="amber"
                bulletVariant="amber"
                glowColor="amber"
                stats={
                    <>
                        <PageStatChip label="Detected Skills" value={totalSkillCount} icon="fa-microchip" color="amber" />
                        <PageStatChip label="Target Role" value={role} icon="fa-briefcase" color="slate" />
                        <PageStatChip label="Experience" value={expLevel} icon="fa-chart-bar" color="emerald" />
                    </>
                }
            />
            <div className="px-6 space-y-6 pb-20 max-w-[1400px] mx-auto">
                <GamificationHeader
                    xp={analytics?.total_xp || 12500}
                    rank={analytics?.level === 1 ? 'Beginner' : analytics?.level > 5 ? 'Expert' : 'Intermediate'}
                    streak={7}
                />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div />

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || totalSkillCount === 0}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end shadow-sm"
                    >
                        {loading ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                        )}
                        <span>Analyze Readiness</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                                    Target Goal
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono uppercase text-zinc-400">Job Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono uppercase text-zinc-400">Experience Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Entry', 'Mid', 'Senior'].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setExpLevel(lvl)}
                                                className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                                                    expLevel === lvl
                                                        ? 'bg-zinc-800 border-amber-400/40 text-amber-400 font-bold'
                                                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                                }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-mono uppercase text-zinc-400">Industry (Optional)</label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
                                    >
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                                    Job Description Scanner
                                </h3>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                Paste a specific job post to extract required skills and calculate the delta.
                            </p>
                            <div className="space-y-3">
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste JD text here (e.g., We are looking for a Senior React Engineer with Node.js, AWS, Redis...)"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 font-mono text-xs p-3.5 rounded-lg focus:outline-none focus:border-amber-400 resize-none h-32"
                                />
                                <button
                                    onClick={handleExtractJD}
                                    disabled={extracting || !jobDescription.trim()}
                                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg border border-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {extracting ? (
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin text-xs text-amber-400" />
                                            <span>Scanning Job Description...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-wand-sparkles text-xs text-amber-400" />
                                            <span>Extract Required & Delta Skills</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Extracted Skills Categorization Display */}
                            {jdExtraction && (
                                <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                        <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                            <span>JD Match: {jdExtraction.match_percentage}%</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-500">
                                            {jdExtraction.skills.length} Detected
                                        </span>
                                    </div>

                                    {/* 1. Required Skills from JD */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                                            <span>Required Skills (From JD)</span>
                                            <span>({jdExtraction.required_skills.length})</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                            {jdExtraction.required_skills.map((sk, idx) => (
                                                <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-bold border border-zinc-800">
                                                    {sk}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Gapped / Missing Skills */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                                            <span>Delta Skills (Missing)</span>
                                            <span>({jdExtraction.gapped_skills.length})</span>
                                        </div>
                                        {jdExtraction.gapped_skills.length === 0 ? (
                                            <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                                                <i className="fa-solid fa-circle-check text-[10px]" />
                                                <span>Zero skill gaps! You match all JD criteria.</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                                {jdExtraction.gapped_skills.map((sk, idx) => (
                                                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-sm bg-rose-400"></span>
                                                        <span>{sk}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Matched Skills */}
                                    {jdExtraction.matched_skills.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                                                <span>Matched In Profile</span>
                                                <span>({jdExtraction.matched_skills.length})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                                                {jdExtraction.matched_skills.map((sk, idx) => (
                                                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                        <i className="fa-solid fa-check text-[8px]" />
                                                        <span>{sk}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-2 flex flex-col gap-2 font-mono">
                                        {jdExtraction.gapped_skills.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    jdExtraction.gapped_skills.forEach(s => addManualSkill(s, 'Beginner'));
                                                }}
                                                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-rose-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-zinc-800"
                                            >
                                                <i className="fa-solid fa-plus text-[10px]" />
                                                <span>Add {jdExtraction.gapped_skills.length} Gapped Skills to Profile</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleAnalyze}
                                            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <i className="fa-solid fa-bolt text-[10px]" />
                                            <span>Run Readiness Analysis for This JD</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                                        Active Profile Skills
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                        Total: <span className="text-white font-bold">{totalSkillCount}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 min-h-[90px] p-3.5 bg-zinc-950 rounded-xl border border-dashed border-zinc-800">
                                {(resumeStatus?.skills || []).map(s => (
                                    <div key={s} className="px-2.5 py-1 bg-zinc-900 text-zinc-200 rounded-lg text-xs font-mono flex items-center gap-2 border border-zinc-800 group">
                                        <i className="fa-solid fa-star text-[9px] text-amber-400"></i>
                                        <span>{s}</span>
                                        <span className="text-[9px] text-zinc-500 font-mono italic">CV</span>
                                    </div>
                                ))}
                                {manualSkills.map(s => (
                                    <div key={s.name} className="px-2.5 py-1 bg-zinc-900 text-amber-300 rounded-lg text-xs font-mono flex items-center gap-2 border border-amber-400/20 group">
                                        <span>{s.name}</span>
                                        <span className="text-[9px] px-1 py-0.2 bg-amber-400/10 text-amber-400 rounded font-bold uppercase">{s.level[0]}</span>
                                        <button onClick={() => removeManualSkill(s.name)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                                            <i className="fa-solid fa-xmark text-[9px]"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 relative">
                                <div className="flex-1 relative">
                                    <i className="fa-solid fa-plus absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
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
                                        placeholder="Add custom skill (e.g. AWS, Figma, Python)..."
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 font-mono text-xs pl-9 pr-3.5 py-2.5 rounded-lg focus:outline-none focus:border-amber-400"
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="absolute z-50 bottom-full left-0 w-full mb-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                                            {filteredSuggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => addManualSkill(s)}
                                                    className="w-full px-4 py-2 text-left text-xs font-mono font-bold text-zinc-300 hover:bg-zinc-900 hover:text-amber-400 border-b border-zinc-900 last:border-0 transition-colors"
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
                                    className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                                <button
                                    onClick={() => addManualSkill()}
                                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-mono text-xs font-bold transition-all border border-zinc-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Analysis Results View */}
                        {report && !loading && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <AdvancedCareerIntelligence data={report.ai_career_intelligence} />

                                <SkillGapScoreCards
                                    scores={{
                                        readiness: report.readiness_score,
                                        technical: report.technical_score,
                                        soft: report.soft_skill_score
                                    }}
                                    intelligence={report.readiness_metrics}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <RadarGapChart data={[...report.strong_matches, ...report.partial_matches, ...report.missing_skills]} />
                                    <GapHeatmap data={report.missing_skills} />
                                </div>

                                <ActionEngine plan={actionPlan || undefined} onStartLearning={handleExportToRoadmap} />

                                <SkillComparisonPanels
                                    matched={[...report.strong_matches, ...report.partial_matches]}
                                    missing={report.missing_skills}
                                />

                                <AIRecommendations data={recommendations} />

                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={handleExportToRoadmap}
                                        className="flex items-center gap-2.5 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-200 hover:text-white transition-all uppercase tracking-wider"
                                    >
                                        <i className="fa-solid fa-map-location-dot text-amber-400"></i>
                                        <span>Export Gaps to Roadmap</span>
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
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl bg-zinc-900/90 border border-dashed border-zinc-800">
                                <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xl">
                                    <i className="fa-solid fa-magnifying-glass-chart"></i>
                                </div>
                                <div className="max-w-xs space-y-1">
                                    <h4 className="text-white font-mono font-bold text-sm">Ready to Analyze?</h4>
                                    <p className="text-zinc-500 font-mono text-xs leading-relaxed">
                                        Trigger <span className="text-amber-400 font-bold">Analyze Readiness</span> to evaluate profile skills against target role specs.
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
