import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import YouTubeLearning from '../components/YouTubeLearning';
import { fetchGoals, fetchSkills, fetchDomains, fetchCareerRecommendations, generateRoadmap, updateProgress, fetchUserAnalytics, fetchAISuggestion, fetchRoadmapDetail } from '../services/roadmap';
import MasteryScore from '../components/roadmap/MasteryScore';
import AdaptiveDifficulty from '../components/roadmap/AdaptiveDifficulty';
import SkillDemand from '../components/roadmap/SkillDemand';
import TimeOptimization from '../components/roadmap/TimeOptimization';
import CareerOutcome from '../components/roadmap/CareerOutcome';
import PhaseMiniMock from '../components/roadmap/PhaseMiniMock';
import Leaderboard from '../components/roadmap/Leaderboard';
import apiClient from '../services/apiClient';
import withAuth from '../components/withAuth';
import { SkeletonCard } from '../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';

const GEN_BOOT_SEQUENCE = [
  'Profiling Student Domain & Degree...',
  'Evaluating Domain Skill Gaps...',
  'Synthesizing Learning Sequence...',
  'Mapping Software Tools & Projects...',
  'Calculating Job Readiness Score...',
  'Finalizing Universal Domain Roadmap...',
];

const DOMAIN_OPTIONS = [
  'Civil Engineering',
  'Mechanical Engineering',
  'ECE / EEE',
  'Computer Science / IT',
  'Automobile Engineering',
  'Chemical Engineering',
  'Biotechnology / Bioengineering',
  'Agriculture & Agribusiness',
  'Architecture & Urban Planning',
  'Commerce, Finance & Management'
];

const DEGREE_OPTIONS = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.Arch', 'M.Tech', 'MBA', 'Diploma'];
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

const Roadmap: React.FC = () => {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Student Profile Form State
  const [degree, setDegree] = useState('B.Tech');
  const [domain, setDomain] = useState('Computer Science / IT');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [level, setLevel] = useState('Beginner');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [softwareTools, setSoftwareTools] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newToolInput, setNewToolInput] = useState('');

  // Domain Taxonomy & Recommendations State
  const [domainTaxonomy, setDomainTaxonomy] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecsModal, setShowRecsModal] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [suggLoading, setSuggLoading] = useState(false);

  const [genStatus, setGenStatus] = useState(GEN_BOOT_SEQUENCE[0]);

  // Load existing profile & roadmap data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileRes, analyticsRes, taxonomyRes] = await Promise.all([
          apiClient.get('/users/profile/').catch(() => null),
          fetchUserAnalytics().catch(() => null),
          fetchDomains().catch(() => null)
        ]) as any[];

        if (profileRes) {
          setDegree(profileRes.degree || 'B.Tech');
          setDomain(profileRes.branch_domain || 'Computer Science / IT');
          setCurrentYear(profileRes.current_year_semester || '3rd Year');
          setLevel(profileRes.experience_level || 'Beginner');
          if (profileRes.dream_job) setTargetRole(profileRes.dream_job);
          if (Array.isArray(profileRes.software_tools)) setSoftwareTools(profileRes.software_tools);
        }

        setAnalytics(analyticsRes);
        if (taxonomyRes?.domains) {
          setDomainTaxonomy(taxonomyRes.domains);
        }

        // Check URL or fetch latest roadmap
        if (router.query.generate === 'true') {
          handleGenerate();
        } else {
          const existing: any = await apiClient.get('/roadmaps/').catch(() => null);
          if (existing && existing.length > 0) {
            const firstRoadmap = existing[0];
            const latestDetail = await fetchRoadmapDetail(firstRoadmap.id).catch(() => firstRoadmap);
            setRoadmap(latestDetail);
            loadSuggestion(firstRoadmap.id);
          }
        }
      } catch (err) {
        console.error('Failed to load roadmap init data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) loadData();
  }, [router.isReady]);

  const loadSuggestion = async (id: number) => {
    setSuggLoading(true);
    try {
      const res = await fetchAISuggestion(id);
      setAiSuggestion(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSuggLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !userSkills.includes(newSkillInput.trim())) {
      setUserSkills([...userSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setUserSkills(userSkills.filter(s => s !== skill));
  };

  const handleAddTool = () => {
    if (newToolInput.trim() && !softwareTools.includes(newToolInput.trim())) {
      setSoftwareTools([...softwareTools, newToolInput.trim()]);
      setNewToolInput('');
    }
  };

  const handleRemoveTool = (tool: string) => {
    setSoftwareTools(softwareTools.filter(t => t !== tool));
  };

  const handleFetchRecommendations = async () => {
    try {
      setRecsLoading(true);
      setShowRecsModal(true);
      const res: any = await fetchCareerRecommendations({
        degree,
        branch_domain: domain,
        skills: userSkills,
        software_tools: softwareTools
      });
      setRecommendations(res?.recommendations || []);
    } catch (err) {
      console.error('Failed recommendations:', err);
    } finally {
      setRecsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenError(null);
    setGenLoading(true);
    setGenStatus(GEN_BOOT_SEQUENCE[0]);

    let stepIdx = 0;
    const bootTimer = setInterval(() => {
      stepIdx = (stepIdx + 1) % GEN_BOOT_SEQUENCE.length;
      setGenStatus(GEN_BOOT_SEQUENCE[stepIdx]);
    }, 1200);

    try {
      const payload = {
        degree,
        branch_domain: domain,
        current_year_semester: currentYear,
        target_role: targetRole,
        experience_level: level,
        skills: userSkills,
        software_tools: softwareTools
      };

      const res: any = await generateRoadmap(payload);
      setRoadmap(res);
      if (res?.id) {
        loadSuggestion(res.id);
      }
      router.replace('/roadmap', undefined, { shallow: true });
    } catch (e: any) {
      setGenError(e?.response?.data?.detail || e?.message || 'Failed to generate roadmap.');
    } finally {
      clearInterval(bootTimer);
      setGenLoading(false);
    }
  };

  const toggleStep = async (stepId: number, completed: boolean) => {
    try {
      await updateProgress(stepId, !completed);
      const updatedSteps = (roadmap.steps || []).map((s: any) =>
        s.id === stepId ? { ...s, completed: !completed } : s
      );
      const doneCount = updatedSteps.filter((s: any) => s.completed).length;
      setRoadmap((prev: any) => ({
        ...prev,
        steps: updatedSteps,
        completion_percentage: Math.round((doneCount / maxOne(updatedSteps.length)) * 100)
      }));
      const analyticsRes = await fetchUserAnalytics();
      setAnalytics(analyticsRes);
      if (roadmap.id) loadSuggestion(roadmap.id);
    } catch (e) {
      console.error(e);
    }
  };

  const maxOne = (val: number) => (val > 0 ? val : 1);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-6 py-10 max-w-5xl mx-auto px-4 w-full">
          <SkeletonCard className="!h-32" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard className="md:col-span-2 !h-96" />
            <SkeletonCard className="!h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>Career Roadmap Engine • SkillMirror OS</title></Head>
      <CyberPageShell
        moduleCode="MOD-01"
        title="CAREER ROADMAP ENGINE"
        subtitle="Domain-aware AI learning sequencer mapping your skills to job readiness across any engineering or business field."
        badge="AUTONOMOUS SEQUENCE"
        actions={
          <button
            onClick={handleFetchRecommendations}
            className="px-4 py-2 border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-xs transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-compass text-xs text-amber-500" />
            <span>Recommend Careers</span>
          </button>
        }
        stats={
          <>
            <PageStatChip label="Streak" value={`${analytics?.streak || 0} days`} icon="fa-fire" />
            <PageStatChip label="XP" value={`${analytics?.points || 0}`} icon="fa-star" />
            <PageStatChip label="Steps Done" value={analytics?.completed_steps || 0} icon="fa-graduation-cap" />
            <PageStatChip label="Badges" value={analytics?.badges?.length || 0} icon="fa-award" />
          </>
        }
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10 space-y-8">

        {!roadmap ? (
          /* Profile & Roadmap Generator Setup Form */
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 bg-amber-500" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    UNIVERSAL CAREER SEQUENCER
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-normal text-white tracking-tight">
                  Domain-Aware Career Roadmap
                </h2>
                <p className="mt-1 text-xs font-mono text-zinc-400">
                  Select your academic domain to perform skill gap analysis and generate a personalized curriculum.
                </p>
              </div>
              <button
                onClick={handleFetchRecommendations}
                className="px-4 py-2 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-compass text-xs text-amber-500" />
                <span>Recommend Careers for Me</span>
              </button>
            </div>

            {/* Profiling Inputs */}
            <div className="grid md:grid-cols-3 gap-6 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-zinc-400 uppercase text-[10px] tracking-wider block">Degree / Education</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 focus:border-zinc-600 focus:outline-none"
                >
                  {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-400 uppercase text-[10px] tracking-wider block">Academic Domain / Branch</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-xs px-3 py-2.5 focus:border-zinc-600 focus:outline-none"
                >
                  {DOMAIN_OPTIONS.map((dom) => <option key={dom} value={dom}>{dom}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-400 uppercase text-[10px] tracking-wider block">Current Skill Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 focus:border-zinc-600 focus:outline-none"
                >
                  {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <label className="text-zinc-400 uppercase text-[10px] tracking-wider block">Target Career Role</label>
              <input
                type="text"
                placeholder="e.g. Structural Engineer, Embedded Engineer, Mechanical Design Engineer, Software Developer..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            {/* Skills & Tools Entry */}
            <div className="grid md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-3 p-4 border border-zinc-800 bg-zinc-950">
                <label className="flex items-center justify-between text-zinc-400 uppercase text-[10px] tracking-wider">
                  <span>Known Domain & Technical Skills</span>
                  <span>({userSkills.length} added)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Structural Analysis, Verilog, C++)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-3 py-2 focus:border-zinc-600 focus:outline-none"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 font-mono text-xs font-medium transition-colors"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {userSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 border border-zinc-800 bg-zinc-900 text-zinc-300 flex items-center gap-1.5 text-[11px] font-mono">
                      <span>{s}</span>
                      <button onClick={() => handleRemoveSkill(s)} className="text-zinc-500 hover:text-white"><i className="fa-solid fa-xmark text-[9px]" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4 border border-zinc-800 bg-zinc-950">
                <label className="flex items-center justify-between text-zinc-400 uppercase text-[10px] tracking-wider">
                  <span>Software & Industry Tools Known</span>
                  <span>({softwareTools.length} added)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tool (e.g. AutoCAD, SolidWorks, STAAD.Pro, KiCAD)"
                    value={newToolInput}
                    onChange={(e) => setNewToolInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-3 py-2 focus:border-zinc-600 focus:outline-none"
                  />
                  <button
                    onClick={handleAddTool}
                    className="px-3.5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 font-mono text-xs font-medium transition-colors"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {softwareTools.map((t) => (
                    <span key={t} className="px-2.5 py-1 border border-zinc-800 bg-zinc-900 text-zinc-300 flex items-center gap-1.5 text-[11px] font-mono">
                      <span>{t}</span>
                      <button onClick={() => handleRemoveTool(t)} className="text-zinc-500 hover:text-white"><i className="fa-solid fa-xmark text-[9px]" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {genError && (
              <div className="p-3 border border-rose-500/40 bg-zinc-950 text-rose-400 text-xs font-mono">
                {genError}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={genLoading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-medium transition-colors uppercase tracking-wider"
            >
              {genLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  <span className="animate-pulse">{genStatus}</span>
                </div>
              ) : `Generate ${domain} Career Roadmap →`}
            </button>
          </div>
        ) : (
          /* Roadmap View Display */
          <div className="space-y-8">
            {/* Header Card */}
            <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider border border-amber-500/40 bg-amber-500/10 text-amber-300">
                    {roadmap.domain || domain}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider border border-zinc-800 bg-zinc-950 text-zinc-400">
                    {roadmap.student_level || level} Level
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-400">
                    Job Readiness: <span className="text-emerald-400 font-medium text-sm tabular-nums">{roadmap.job_readiness_score || 75}%</span>
                  </span>
                  <button
                    onClick={() => setRoadmap(null)}
                    className="px-3.5 py-1.5 border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono transition-colors"
                  >
                    + New Roadmap
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">{roadmap.title}</h1>
                <p className="text-xs font-mono text-zinc-400">{roadmap.timeline_summary || 'Comprehensive domain sequence'}</p>
              </div>

              <div className="w-full h-2 bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${roadmap.completion_percentage || 0}%` }} />
              </div>
            </div>

            {/* Categorized Skill Gap Breakdown */}
            {roadmap.categorized_gaps && (
              <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 bg-amber-500" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                      Domain Skill Gap Classification
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    TARGET: {targetRole}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  {/* Critical */}
                  <div className="p-4 border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-rose-400">
                      <div className="w-1.5 h-1.5 bg-rose-500" />
                      <span>Critical Must-Have</span>
                    </div>
                    <ul className="space-y-1.5 text-zinc-300 pt-1">
                      {(roadmap.categorized_gaps.critical || []).length === 0 ? (
                        <li className="text-zinc-600 italic">No critical gaps</li>
                      ) : (
                        roadmap.categorized_gaps.critical.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-[11px]">
                            <span className="text-rose-500">•</span>
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* High Priority */}
                  <div className="p-4 border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-400">
                      <div className="w-1.5 h-1.5 bg-amber-500" />
                      <span>High Priority</span>
                    </div>
                    <ul className="space-y-1.5 text-zinc-300 pt-1">
                      {(roadmap.categorized_gaps.high_priority || []).length === 0 ? (
                        <li className="text-zinc-600 italic">No high priority gaps</li>
                      ) : (
                        roadmap.categorized_gaps.high_priority.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-[11px]">
                            <span className="text-amber-500">•</span>
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Medium Priority */}
                  <div className="p-4 border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-yellow-400">
                      <div className="w-1.5 h-1.5 bg-yellow-500" />
                      <span>Medium Priority</span>
                    </div>
                    <ul className="space-y-1.5 text-zinc-300 pt-1">
                      {(roadmap.categorized_gaps.medium_priority || []).length === 0 ? (
                        <li className="text-zinc-600 italic">None</li>
                      ) : (
                        roadmap.categorized_gaps.medium_priority.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-[11px]">
                            <span className="text-yellow-500">•</span>
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Optional */}
                  <div className="p-4 border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-400">
                      <div className="w-1.5 h-1.5 bg-emerald-500" />
                      <span>Optional Edge</span>
                    </div>
                    <ul className="space-y-1.5 text-zinc-300 pt-1">
                      {(roadmap.categorized_gaps.optional || []).length === 0 ? (
                        <li className="text-zinc-600 italic">None</li>
                      ) : (
                        roadmap.categorized_gaps.optional.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-[11px]">
                            <span className="text-emerald-500">•</span>
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Projects & Certifications Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 text-xs font-mono">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <i className="fa-solid fa-diagram-project text-xs text-amber-500" />
                  <h3 className="text-xs uppercase tracking-wider text-white">Domain Projects to Build</h3>
                </div>
                <div className="space-y-2">
                  {(roadmap.projects_to_build || []).map((proj: string, i: number) => (
                    <div key={i} className="p-3 border border-zinc-800 bg-zinc-950 text-zinc-300 flex items-start gap-2.5">
                      <span className="text-amber-500 font-medium">{i+1}.</span>
                      <span>{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 text-xs font-mono">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                  <i className="fa-solid fa-certificate text-xs text-amber-500" />
                  <h3 className="text-xs uppercase tracking-wider text-white">Industry Certifications</h3>
                </div>
                <div className="space-y-2">
                  {(roadmap.certifications || []).map((cert: string, i: number) => (
                    <div key={i} className="p-3 border border-zinc-800 bg-zinc-950 text-zinc-300 flex items-center gap-2.5">
                      <i className="fa-solid fa-ribbon text-amber-500 text-xs" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5-Phase Learning Sequence */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-amber-500" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-medium">
                    Domain Learning & Execution Sequence
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  CLICK CHECKMARK TO LOG COMPLETION
                </span>
              </div>

              <div className="space-y-4">
                {(roadmap.steps || []).map((step: any, idx: number) => (
                  <div
                    key={step.id || idx}
                    className={`p-6 border transition-colors space-y-4 ${
                      step.completed
                        ? 'border-emerald-500/40 bg-zinc-900/95'
                        : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 border flex items-center justify-center font-mono text-xs ${
                          step.completed
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <h4 className={`text-base font-normal tracking-tight ${step.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => toggleStep(step.id, !!step.completed)}
                        className={`w-8 h-8 border flex items-center justify-center transition-colors ${
                          step.completed
                            ? 'border-emerald-500 bg-emerald-500 text-zinc-950 font-bold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <i className="fa-solid fa-check text-xs" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      <AdaptiveDifficulty level={step.difficulty} />
                      <span className="px-2.5 py-1 border border-zinc-800 bg-zinc-950 text-zinc-400">
                        {step.duration_weeks || 3} WEEKS • {step.estimated_hours || 25} HOURS
                      </span>
                    </div>

                    <p className="text-xs font-mono text-zinc-300 leading-relaxed">{step.description}</p>

                    {(step.skills || step.skills_list) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(step.skills || step.skills_list).map((sk: string, i: number) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-400">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Resources */}
                    {step.recommended_resources && step.recommended_resources.length > 0 && (
                      <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs font-mono">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">Recommended Resources</span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {step.recommended_resources.map((res: any, rIdx: number) => (
                            <div key={rIdx} className="p-3 border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-white truncate text-xs">{res.name}</p>
                                <p className="text-[10px] text-zinc-500">{res.platform || res.author || res.type}</p>
                              </div>
                              {res.url && (
                                <a href={res.url} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-400">
                                  <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube & Courses Learning Section */}
            <div className="pt-8 border-t border-zinc-800">
              <YouTubeLearning
                skills={Array.from(new Set([
                  ...(roadmap.required_skills || []),
                  ...((roadmap.steps || []).flatMap((s: any) => s.skills || s.skills_list || [])),
                  targetRole,
                  domain
                ].filter(Boolean))).slice(0, 10)}
              />
            </div>
          </div>
        )}

        {/* Recommended Careers Modal */}
        {showRecsModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="p-6 md:p-8 max-w-2xl w-full space-y-6 bg-zinc-950 border border-zinc-800 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-amber-500" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      CAREER RECOMMENDATION
                    </span>
                  </div>
                  <h3 className="text-lg font-normal text-white">Recommended Career Paths for {domain}</h3>
                </div>
                <button
                  onClick={() => setShowRecsModal(false)}
                  className="w-8 h-8 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>

              {recsLoading ? (
                <div className="p-8 text-center text-zinc-500 space-y-3 font-mono text-xs">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Analyzing education, domain, and current skills...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 border border-zinc-800 bg-zinc-900/60 space-y-2.5 hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-normal text-white">{rec.role}</h4>
                        <span className="px-2 py-0.5 text-[10px] font-mono border border-emerald-500/40 bg-zinc-950 text-emerald-400">
                          {rec.match_score}% Match
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-400">{rec.description}</p>

                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                        <span className="text-zinc-500">Skills:</span>
                        {(rec.top_skills || []).map((sk: string, sI: number) => (
                          <span key={sI} className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-1.5 py-0.2">{sk}</span>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setTargetRole(rec.role);
                          setShowRecsModal(false);
                        }}
                        className="w-full mt-2 py-2 bg-white text-zinc-950 hover:bg-zinc-200 font-mono text-xs font-medium transition-colors"
                      >
                        Select "{rec.role}" & Generate Roadmap →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Roadmap);


