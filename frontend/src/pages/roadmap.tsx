import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import YouTubeLearning from '../components/YouTubeLearning';
import { fetchGoals, fetchSkills, generateRoadmap, updateProgress, fetchUserAnalytics, fetchAISuggestion, fetchRoadmapDetail } from '../services/roadmap';
import MasteryScore from '../components/roadmap/MasteryScore';
import AdaptiveDifficulty from '../components/roadmap/AdaptiveDifficulty';
import SkillDemand from '../components/roadmap/SkillDemand';
import TimeOptimization from '../components/roadmap/TimeOptimization';
import CareerOutcome from '../components/roadmap/CareerOutcome';
import PhaseMiniMock from '../components/roadmap/PhaseMiniMock';
import Leaderboard from '../components/roadmap/Leaderboard';
import apiClient from '../services/apiClient';
import withAuth from '../components/withAuth';
import { motion, AnimatePresence } from 'framer-motion';

const GEN_BOOT_SEQUENCE = [
  'Accessing Skill Graph...',
  'Analyzing Digital Twin Gaps...',
  'Synthesizing Learning Phases...',
  'Optimizing Skill Timelines...',
  'Accelerating Foundation Paths...',
  'Finalizing Execution Roadmap...',
];

const Roadmap: React.FC = () => {
  const [goals, setGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [suggLoading, setSuggLoading] = useState(false);

  const [genStatus, setGenStatus] = useState(GEN_BOOT_SEQUENCE[0]);
  const [genStatusIdx, setGenStatusIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [goalsRes, skillsRes, analyticsRes] = await Promise.all([
          fetchGoals(),
          fetchSkills(),
          fetchUserAnalytics()
        ]) as any[];

        setAnalytics(analyticsRes);
        const goalsData = goalsRes?.goals || [];
        setGoals(goalsData.length ? goalsData : ['Data Scientist', 'Web Developer', 'Software Engineer', 'Frontend Developer', 'Backend Developer']);
        setSkills(Array.isArray(skillsRes) ? skillsRes : (skillsRes?.results || []));

        if (goalsData.length) setSelectedGoal(goalsData[0]);

        // Handle auto-generation from Digital Twin
        if (router.query.generate === 'true') {
          handleGenerate();
        } else {
          // Fetch existing roadmap
          const existing: any = await apiClient.get('/roadmaps/');
          if (existing && existing.length > 0) {
            const firstRoadmap = existing[0];
            const latestDetail = await fetchRoadmapDetail(firstRoadmap.id);
            setRoadmap(latestDetail);
            loadSuggestion(firstRoadmap.id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (router.isReady) load();
  }, [router.isReady, router.query.generate]);

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

  const toggleSkill = (name: string) => {
    setSelectedSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleGenerate = async () => {
    setGenError(null);
    setGenLoading(true);
    setGenStatusIdx(0);
    setGenStatus(GEN_BOOT_SEQUENCE[0]);

    // Boot animation sequence
    const bootTimer = setInterval(() => {
      setGenStatusIdx(prev => {
        const next = Math.min(prev + 1, GEN_BOOT_SEQUENCE.length - 1);
        setGenStatus(GEN_BOOT_SEQUENCE[next]);
        return next;
      });
    }, 1500);

    try {
      const res: any = await generateRoadmap(selectedGoal, selectedSkills);
      setRoadmap(res);
      if (res?.id) {
        loadSuggestion(res.id);
      }
      // Clean up URL
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
      const updatedSteps = roadmap.steps.map((s: any) =>
        s.id === stepId ? { ...s, completed: !completed } : s
      );
      const doneCount = updatedSteps.filter((s: any) => s.completed).length;
      setRoadmap((prev: any) => ({
        ...prev,
        steps: updatedSteps,
        completion_percentage: Math.round((doneCount / updatedSteps.length) * 100)
      }));
      const analyticsRes = await fetchUserAnalytics();
      setAnalytics(analyticsRes);
      loadSuggestion(roadmap.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide">Initializing SkillMirror Intelligence...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Smart Career Roadmap • SkillMirror AI</title>
      </Head>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 min-h-screen">

        {/* Top Analytics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
              <i className="fa-solid fa-fire text-lg text-orange-400 animate-pulse"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Day Streak</p>
              <p className="text-xl font-black text-white">{analytics?.streak || 0}</p>
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <i className="fa-solid fa-star text-lg"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points earned</p>
              <p className="text-xl font-black text-white">{analytics?.points || 0}</p>
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
              <i className="fa-solid fa-check-double text-lg"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Steps Ready</p>
              <p className="text-xl font-black text-white">{analytics?.completed_steps || 0}</p>
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center gap-4 bg-slate-900/40 border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
              <i className="fa-solid fa-award text-lg"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Badges</p>
              <p className="text-xl font-black text-white">{analytics?.badges?.length || 0}</p>
            </div>
          </div>
        </div>

        {!roadmap ? (
          <div className="glass-panel p-10 border-slate-800 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-white tracking-tight">Generate Your Smart Career Roadmap</h1>
              <p className="mt-2 text-slate-400 max-w-xl">Our Groq AI engine will build a phased learning timeline with daily streaks, video resources, and automatic progress tracking.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Target Job Role</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full px-4 py-4 border border-slate-700/50 bg-slate-950/80 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 outline-none appearance-none transition-all"
                >
                  {goals.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Optional Focus Areas</label>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((s: any) => {
                    const name = s.name || s.skill?.name;
                    if (!name) return null;
                    const isSelected = selectedSkills.includes(name);
                    return (
                      <button key={name} onClick={() => toggleSkill(name)} type="button" className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}>
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={genLoading} className="w-full sm-btn-primary py-5 rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/25 relative overflow-hidden group">
              {genLoading ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">{genStatus}</span>
                </div>
              ) : 'Bootstrap Intelligent Path'}
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden bg-slate-900/30 border-slate-800/60 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white">{roadmap.title}</h2>
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {roadmap.completion_percentage || 0}% Complete
                    </span>
                    <button
                      onClick={() => setRoadmap(null)}
                      className="ml-auto text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i> New Path
                    </button>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${roadmap.completion_percentage || 0}%` }}></div>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    {roadmap.description}
                  </p>
                </div>

                <div className="mt-8 space-y-6">
                  <CareerOutcome projection={roadmap.outcome_projection} />
                  <div className="bg-slate-950/40 rounded-3xl p-6 border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-brain text-indigo-400 text-sm"></i>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Next Best Skill</span>
                    </div>
                    {suggLoading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-3 bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {aiSuggestion?.suggestion || "Maintain your focus on the core curriculum."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <Leaderboard />
                <div className="glass-panel p-6 bg-slate-950/40 border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Level System</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative">
                      <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full rotate-45"></div>
                      <span className="text-2xl font-black text-white">4</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">Career Explorer</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1">2,450 / 5,000 XP to Level 5</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6">
                {(roadmap.steps || []).map((step: any, idx: number) => (
                  <div key={step.id || idx} className={`group glass-panel bg-slate-950/40 rounded-3xl border p-6 space-y-4 transition-all ${step.completed ? 'border-green-500/20 opacity-70' : 'border-slate-800 hover:border-indigo-500/40'}`}>
                    <div className="flex items-start gap-6">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step.completed ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-slate-950 border border-slate-800 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-lg font-bold ${step.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{step.title}</h4>
                            {step.order === 1 && (
                              <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                <i className="fa-solid fa-circle-exclamation" /> High Priority
                              </span>
                            )}
                          </div>
                          <button onClick={() => toggleStep(step.id, !!step.completed)} className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${step.completed ? 'bg-green-600 border-green-500 text-white' : 'border-slate-800 hover:border-indigo-500 text-slate-700'}`}>
                            <i className="fa-solid fa-check text-xs"></i>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          <AdaptiveDifficulty level={step.difficulty} />
                          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <i className="fa-solid fa-calendar-days"></i>
                            {step.duration_weeks || 2} Week{(step.duration_weeks || 2) > 1 ? 's' : ''}
                          </span>
                          <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <i className="fa-solid fa-clock"></i>
                            {step.estimated_hours || 20} Hours
                          </span>
                        </div>

                        <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-4">
                            <MasteryScore score={step.mastery_score || 0} confidence={step.confidence_index || 40} />
                            <TimeOptimization data={step.time_optimization} />
                            <SkillDemand demand={step.skill_demand} />
                          </div>
                          <div className="flex flex-col justify-end">
                            <PhaseMiniMock stepId={step.id} stepTitle={step.title} />
                          </div>
                        </div>

                        {(step.skills || step.skills_list)?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {(step.skills || step.skills_list).map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-lg">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommended Resources */}
                    {step.recommended_resources?.length > 0 && (
                      <div className="pt-4 border-t border-slate-800/50">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-graduation-cap"></i>
                          Recommended Learning Resources
                        </h5>
                        <div className="grid gap-2">
                          {step.recommended_resources.map((resource: any, rIdx: number) => (
                            <div key={rIdx} className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800/50 rounded-xl hover:border-indigo-500/30 transition-all">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                {resource.type === 'course' && <i className="fa-solid fa-book text-indigo-400 text-sm"></i>}
                                {resource.type === 'book' && <i className="fa-solid fa-book-open text-violet-400 text-sm"></i>}
                                {resource.type === 'tutorial' && <i className="fa-solid fa-code text-sky-400 text-sm"></i>}
                                {resource.type === 'project' && <i className="fa-solid fa-rocket text-emerald-400 text-sm"></i>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-200 truncate">{resource.name}</p>
                                {resource.platform && <p className="text-[10px] text-slate-500 font-medium">{resource.platform}</p>}
                                {resource.author && <p className="text-[10px] text-slate-500 font-medium">by {resource.author}</p>}
                              </div>
                              {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                  <i className="fa-solid fa-external-link text-xs"></i>
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

            {analytics?.badges?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-medal"></i> Unlocked Achievements
                </h3>
                <div className="flex gap-4">
                  {analytics.badges.map((b: any, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-help" title={b.description}>
                        <i className="fa-solid fa-trophy text-white text-xl"></i>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{b.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-16 border-t border-slate-800/60">
              <YouTubeLearning skills={roadmap.required_skills?.length ? roadmap.required_skills : selectedSkills} />
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Roadmap);
