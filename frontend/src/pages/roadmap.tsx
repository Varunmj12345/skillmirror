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
      <Head>
        <title>Universal Domain Career Roadmap • SkillMirror</title>
      </Head>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 min-h-screen space-y-8">

        {/* Analytics Top Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm-glass p-4 flex items-center gap-4 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <i className="fa-solid fa-fire text-lg animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day Streak</p>
              <p className="text-xl font-black text-white">{analytics?.streak || 0}</p>
            </div>
          </div>
          <div className="sm-glass p-4 flex items-center gap-4 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <i className="fa-solid fa-star text-lg" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Points</p>
              <p className="text-xl font-black text-white">{analytics?.points || 0} XP</p>
            </div>
          </div>
          <div className="sm-glass p-4 flex items-center gap-4 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <i className="fa-solid fa-graduation-cap text-lg" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Steps</p>
              <p className="text-xl font-black text-white">{analytics?.completed_steps || 0}</p>
            </div>
          </div>
          <div className="sm-glass p-4 flex items-center gap-4 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <i className="fa-solid fa-award text-lg" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Badges Earned</p>
              <p className="text-xl font-black text-white">{analytics?.badges?.length || 0}</p>
            </div>
          </div>
        </div>

        {!roadmap ? (
          /* Profile & Roadmap Generator Setup Form */
          <ScrollReveal className="sm-glass p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Universal Career Engine</span>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Domain-Aware Career Roadmap</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  Select your engineering or non-engineering domain to perform skill gap analysis and generate a personalized learning sequence.
                </p>
              </div>
              <button
                onClick={handleFetchRecommendations}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center gap-2"
              >
                <i className="fa-solid fa-compass" />
                <span>Recommend Careers for Me</span>
              </button>
            </div>

            {/* Profiling Inputs */}
            <div className="grid md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <label className="sm-label">Degree / Education</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="sm-input px-4 py-3"
                >
                  {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="sm-label">Academic Domain / Branch</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="sm-input px-4 py-3 font-semibold text-cyan-300"
                >
                  {DOMAIN_OPTIONS.map((dom) => <option key={dom} value={dom}>{dom}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="sm-label">Current Skill Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="sm-input px-4 py-3"
                >
                  {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="sm-label">Target Career Role</label>
              <input
                type="text"
                placeholder="e.g. Structural Engineer, Embedded Engineer, Mechanical Design Engineer, Software Developer..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="sm-input px-4 py-3 text-white font-bold"
              />
            </div>

            {/* Skills & Tools Entry */}
            <div className="grid md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-white/5">
                <label className="sm-label flex items-center justify-between">
                  <span>Known Domain & Technical Skills</span>
                  <span className="text-[10px] text-slate-400">({userSkills.length} added)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Structural Analysis, Verilog, C++)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="sm-input px-3 py-2 flex-1"
                  />
                  <button onClick={handleAddSkill} className="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl hover:bg-slate-700">
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {userSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 text-[11px]">
                      <span>{s}</span>
                      <button onClick={() => handleRemoveSkill(s)} className="hover:text-rose-400"><i className="fa-solid fa-xmark text-[10px]" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-white/5">
                <label className="sm-label flex items-center justify-between">
                  <span>Software & Industry Tools Known</span>
                  <span className="text-[10px] text-slate-400">({softwareTools.length} added)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tool (e.g. AutoCAD, SolidWorks, STAAD.Pro, KiCAD, Power BI)"
                    value={newToolInput}
                    onChange={(e) => setNewToolInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                    className="sm-input px-3 py-2 flex-1"
                  />
                  <button onClick={handleAddTool} className="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl hover:bg-slate-700">
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {softwareTools.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 text-[11px]">
                      <span>{t}</span>
                      <button onClick={() => handleRemoveTool(t)} className="hover:text-rose-400"><i className="fa-solid fa-xmark text-[10px]" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {genError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                {genError}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={genLoading}
              className="w-full sm-btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20"
            >
              {genLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">{genStatus}</span>
                </div>
              ) : `Generate ${domain} Career Roadmap →`}
            </button>
          </ScrollReveal>
        ) : (
          /* Roadmap View Display */
          <ScrollReveal className="space-y-8">
            {/* Header Card */}
            <div className="sm-glass p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {roadmap.domain || domain}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/5">
                    {roadmap.student_level || level} Level
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">
                    Job Readiness: <span className="text-emerald-400 font-black text-sm">{roadmap.job_readiness_score || 75}%</span>
                  </span>
                  <button
                    onClick={() => setRoadmap(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/5"
                  >
                    + New Domain Roadmap
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black text-white">{roadmap.title}</h1>
                <p className="text-xs text-slate-300">{roadmap.timeline_summary || 'Comprehensive domain sequence'}</p>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${roadmap.completion_percentage || 0}%` }} />
              </div>
            </div>

            {/* Categorized Skill Gap Breakdown */}
            {roadmap.categorized_gaps && (
              <div className="sm-glass p-7 rounded-3xl border border-white/10 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center justify-between">
                  <span>Domain Skill Gap Classification</span>
                  <span className="text-xs text-slate-400 font-normal">Prioritized for {targetRole}</span>
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Critical */}
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">🔴 Critical Must-Have</span>
                    <ul className="space-y-1 font-semibold text-slate-200">
                      {(roadmap.categorized_gaps.critical || []).length === 0 ? (
                        <li className="text-slate-500 italic">No critical gaps!</li>
                      ) : (
                        roadmap.categorized_gaps.critical.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-exclamation text-[10px] text-rose-400" />
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* High Priority */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">🟠 High Priority</span>
                    <ul className="space-y-1 font-semibold text-slate-200">
                      {(roadmap.categorized_gaps.high_priority || []).length === 0 ? (
                        <li className="text-slate-500 italic">No high priority gaps!</li>
                      ) : (
                        roadmap.categorized_gaps.high_priority.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <i className="fa-solid fa-triangle-exclamation text-[10px] text-amber-400" />
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Medium Priority */}
                  <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300">🟡 Medium Priority</span>
                    <ul className="space-y-1 font-semibold text-slate-200">
                      {(roadmap.categorized_gaps.medium_priority || []).length === 0 ? (
                        <li className="text-slate-500 italic">None</li>
                      ) : (
                        roadmap.categorized_gaps.medium_priority.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-dot text-[10px] text-yellow-300" />
                            <span>{sk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Optional */}
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">🟢 Optional Edge</span>
                    <ul className="space-y-1 font-semibold text-slate-200">
                      {(roadmap.categorized_gaps.optional || []).length === 0 ? (
                        <li className="text-slate-500 italic">None</li>
                      ) : (
                        roadmap.categorized_gaps.optional.map((sk: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <i className="fa-solid fa-star text-[10px] text-emerald-400" />
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
              <div className="sm-glass p-6 rounded-3xl border border-white/10 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-diagram-project text-cyan-400" />
                  <span>Domain Projects to Build</span>
                </h3>
                <div className="space-y-2">
                  {(roadmap.projects_to_build || []).map((proj: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-slate-200 font-semibold flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">{i+1}.</span>
                      <span>{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm-glass p-6 rounded-3xl border border-white/10 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-indigo-400" />
                  <span>Industry Certifications to Pursue</span>
                </h3>
                <div className="space-y-2">
                  {(roadmap.certifications || []).map((cert: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-indigo-300 font-semibold flex items-center gap-2">
                      <i className="fa-solid fa-ribbon text-indigo-400" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5-Phase Learning Sequence */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span>Domain Learning & Execution Sequence</span>
                <span className="text-xs text-slate-400 font-normal">Click checkmark to log completion</span>
              </h3>

              <StaggerChildren className="grid gap-6">
                {(roadmap.steps || []).map((step: any, idx: number) => (
                  <ScrollReveal stagger key={step.id || idx}>
                    <div className={`sm-glass p-6 rounded-3xl border transition-all space-y-4 ${step.completed ? 'bg-emerald-500/5 border-emerald-500/30' : 'border-white/5 hover:border-cyan-500/30'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${step.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-cyan-400 border border-white/10'}`}>
                            {idx + 1}
                          </span>
                          <h4 className={`text-base font-bold ${step.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {step.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => toggleStep(step.id, !!step.completed)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${step.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'}`}
                        >
                          <i className="fa-solid fa-check text-xs font-black" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        <AdaptiveDifficulty level={step.difficulty} />
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/20">
                          ⏱️ {step.duration_weeks || 3} Weeks ({step.estimated_hours || 25} Hours)
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

                      {(step.skills || step.skills_list) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(step.skills || step.skills_list).map((sk: string, i: number) => (
                            <span key={i} className="text-[10px] px-2.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-semibold border border-white/5">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Resources */}
                      {step.recommended_resources && step.recommended_resources.length > 0 && (
                        <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Learning Resources</span>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {step.recommended_resources.map((res: any, rIdx: number) => (
                              <div key={rIdx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-200 truncate">{res.name}</p>
                                  <p className="text-[10px] text-slate-400">{res.platform || res.author || res.type}</p>
                                </div>
                                {res.url && (
                                  <a href={res.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 font-bold">
                                    <i className="fa-solid fa-external-link text-xs" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </StaggerChildren>
            </div>

            {/* YouTube Learning Section */}
            <div className="pt-8 border-t border-white/10">
              <YouTubeLearning skills={roadmap.required_skills?.length ? roadmap.required_skills : [targetRole]} />
            </div>
          </ScrollReveal>
        )}

        {/* Recommended Careers Modal */}
        {showRecsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="sm-glass p-8 rounded-3xl max-w-2xl w-full space-y-6 border border-cyan-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-400">Career Intelligence Engine</span>
                  <h3 className="text-xl font-bold text-white">Recommended Career Paths for {domain}</h3>
                </div>
                <button onClick={() => setShowRecsModal(false)} className="text-slate-400 hover:text-white">
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>

              {recsLoading ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Analyzing education, branch, and current skills...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3 hover:border-cyan-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{rec.role}</h4>
                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {rec.match_score}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{rec.description}</p>

                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="font-bold text-slate-400">Top Skills:</span>
                        {(rec.top_skills || []).map((sk: string, sI: number) => (
                          <span key={sI} className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-semibold">{sk}</span>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setTargetRole(rec.role);
                          setShowRecsModal(false);
                        }}
                        className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl transition-all"
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

