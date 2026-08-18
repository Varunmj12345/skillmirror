import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';
import { fetchDashboard } from '../services/dashboard';
import apiClient from '../services/apiClient';
import RevealWrapper from '../components/RevealWrapper';
import StaggerGrid from '../components/StaggerGrid';
import { SkeletonCard } from '../components/motion/Skeleton';
// Modular Components
import MetricCard from '../components/dashboard/MetricCard';
import XPSystem from '../components/dashboard/XPSystem';
import AIStrategy from '../components/dashboard/AIStrategy';
import Benchmarking from '../components/dashboard/Benchmarking';
import GrowthForecast from '../components/dashboard/GrowthForecast';
import SkillRadar from '../components/dashboard/SkillRadar';
import ModuleSummaries from '../components/dashboard/ModuleSummaries';
import AIInsightPanel from '../components/dashboard/AIInsightPanel';
import AchievementBadges from '../components/dashboard/AchievementBadges';
import CareerDigitalTwinModal from '../components/CareerDigitalTwinModal';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTwinOpen, setIsTwinOpen] = useState(false);

  // BUG GROUP 4 — State
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Node.js']);
  const [expLevel, setExpLevel] = useState('Beginner');
  const [timeline, setTimeline] = useState('6 months');
  const [savingWizard, setSavingWizard] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res: any = await fetchDashboard();
      setData(res);

      // FIX 4E: One-time 5-second welcome animation
      const welcomeKey = `sm_welcome_shown_${res.username || 'user'}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowWelcome(true);
        setWelcomeStep(1);
        setTimeout(() => setWelcomeStep(2), 1800);
        setTimeout(() => setWelcomeStep(3), 3500);
        setTimeout(() => {
          setShowWelcome(false);
          localStorage.setItem(welcomeKey, 'true');
        }, 5000);
      }

      // FIX 4A: Onboarding Wizard modal for new users
      const onboardingKey = `sm_onboarding_done_${res.username || 'user'}`;
      if (!localStorage.getItem(onboardingKey) && (res.profile_completion < 40 || !res.dream_job)) {
        setIsWizardOpen(true);
      }
    } catch (e: any) {
      if (e?.response?.status !== 401) {
        setError('Synchronizing intelligence failed. Reconnecting...');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteWizard = async () => {
    setSavingWizard(true);
    try {
      await apiClient.put('/users/profile/', {
        dream_job: targetRole,
        experience_level: expLevel,
      });
      const onboardingKey = `sm_onboarding_done_${data?.username || 'user'}`;
      localStorage.setItem(onboardingKey, 'true');
      setIsWizardOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      setIsWizardOpen(false);
    } finally {
      setSavingWizard(false);
    }
  };

  const toggleSkillSelection = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="w-48 h-4 skeleton-shimmer rounded" />
            <div className="w-96 h-16 skeleton-shimmer rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid lg:grid-cols-12 gap-10 mb-20">
          <div className="lg:col-span-8">
            <SkeletonCard className="!h-[400px]" />
          </div>
          <div className="lg:col-span-4">
            <SkeletonCard className="!h-[400px]" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="sm-glass p-12 text-center max-w-md rounded-[2.5rem]">
             <div className="text-4xl mb-6">📡</div>
             <h2 className="sm-h2 text-2xl">Network Latency Detected</h2>
             <p className="sm-subhead text-sm mb-8">Re-establishing handshake with the Career Intelligence Engine...</p>
             <button onClick={loadData} className="sm-btn-primary w-full py-3 text-xs uppercase tracking-widest font-black">Retry Sync</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Intelligence Hub • SkillMirror</title>
      </Head>

      {/* FIX 4E: First-Time Welcome Animation Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="text-center max-w-md space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-3xl shadow-2xl shadow-indigo-500/30 animate-bounce">
              <i className="fa-solid fa-brain" />
            </div>
            <div className="space-y-2">
              {welcomeStep === 1 && (
                <p className="text-lg font-bold text-slate-200 animate-pulse">Initializing your Career Intelligence...</p>
              )}
              {welcomeStep === 2 && (
                <p className="text-lg font-bold text-cyan-300 animate-pulse">Scanning job market data & skill graph...</p>
              )}
              {welcomeStep === 3 && (
                <div className="space-y-1 animate-in zoom-in-95 duration-300">
                  <h2 className="text-2xl font-black text-white">Welcome, {data.username}!</h2>
                  <p className="text-xs text-indigo-300 font-medium">Your personalized career command center is ready.</p>
                </div>
              )}
            </div>
            <div className="w-48 h-1.5 mx-auto bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* FIX 4A: Onboarding Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Step {wizardStep} of 3</p>
                <h3 className="text-lg font-bold text-white">Onboarding & Goal Setting</h3>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-3 h-3 rounded-full ${s === wizardStep ? 'bg-indigo-500' : s < wizardStep ? 'bg-indigo-900' : 'bg-slate-800'}`} />
                ))}
              </div>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">What is your target career role?</p>
                <div className="grid grid-cols-1 gap-2">
                  {['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Full Stack Developer'].map(role => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${targetRole === role ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      <i className="fa-solid fa-briefcase mr-2 text-indigo-400" />
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">Select your current core skills:</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Node.js', 'Python', 'Java', 'SQL', 'TypeScript', 'System Design', 'DSA', 'Docker', 'AWS'].map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkillSelection(skill)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${selectedSkills.includes(skill) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Experience level:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setExpLevel(lvl)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${expLevel === lvl ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">Target readiness timeline:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['3 months', '6 months', '1 year'].map(tl => (
                      <button
                        key={tl}
                        onClick={() => setTimeline(tl)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${timeline === tl ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}
                      >
                        {tl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              {wizardStep > 1 ? (
                <button onClick={() => setWizardStep(s => s - 1)} className="text-xs text-slate-400 hover:text-white font-bold">
                  ← Back
                </button>
              ) : <div />}

              {wizardStep < 3 ? (
                <button onClick={() => setWizardStep(s => s + 1)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all">
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={handleCompleteWizard}
                  disabled={savingWizard}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-lg transition-all"
                >
                  {savingWizard ? 'Saving...' : 'Activate Intelligence Hub ✓'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Header & Identity */}
      <RevealWrapper type="heading" className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <div className="sm-nano text-brand-neural mb-3 opacity-60">Career Intelligence Terminal</div>
          <h1 className="sm-h1 !text-5xl lg:!text-6xl">Command Center</h1>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Career Digital Twin Trigger */}
           <button
              onClick={() => setIsTwinOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60 hover:text-cyan-200 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
           >
              <i className="fa-solid fa-dna text-sm animate-pulse" />
              <span>Digital Twin</span>
           </button>

           <div className="text-right border-r border-white/5 pr-8 hidden sm:block">
              <p className="sm-nano !text-[8px] opacity-40">Global IQ Percentile</p>
              <p className="text-xl font-black text-white">Top 8.4% <span className="text-brand-emerald text-xs">↑</span></p>
           </div>
           <Link href="/profile">
              <button className="sm-glass px-6 py-3.5 rounded-2xl flex items-center gap-3 group text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                 <span>Identity Verified</span>
                 <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform" />
              </button>
           </Link>
        </div>
      </RevealWrapper>

      <CareerDigitalTwinModal isOpen={isTwinOpen} onClose={() => setIsTwinOpen(false)} />

      {/* FIX 4B: Risk Index Amber Banner & Actionable Steps */}
      {data.career_risk_index > 20 && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-base" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">Complete your profile to reduce career risk</p>
              <p className="text-[11px] text-slate-400">Actionable steps: Complete your profile, Add your skills, Upload your resume, Set your target career, & Complete learning activities.</p>
            </div>
          </div>
          <button onClick={() => setIsWizardOpen(true)} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shrink-0">
            Reduce Risk Now →
          </button>
        </div>
      )}

      {/* 2. Primary KPI Grid */}
      <StaggerGrid className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16" staggerDelay={80}>
        <MetricCard label="Readiness" value={data.job_readiness_score} icon="fa-bullseye" color="indigo" />
        <MetricCard label="Market Match" value={92} icon="fa-network-wired" color="cyan" />
        <MetricCard label="Risk Index" value={data.career_risk_index} icon="fa-bolt" color="amber" suffix="%" />
        <MetricCard label="XP Level" value={data.xp_system.level} icon="fa-trophy" color="amber" />
        <MetricCard label="Trust Score" value={98} icon="fa-shield-check" color="emerald" suffix="%" />
      </StaggerGrid>

      {/* 3. The "Brain" Layer: Intelligence & Insights */}
      <div className="grid lg:grid-cols-12 gap-10 mb-20">
        <div className="lg:col-span-8 space-y-10">
           <RevealWrapper type="card">
              <AIStrategy strategy={data.ai_strategy} />
           </RevealWrapper>
           <RevealWrapper type="card">
              <XPSystem
                level={data.xp_system.level}
                totalXp={data.xp_system.total_xp}
                progress={data.xp_system.progress}
                nextLevelAt={data.xp_system.next_level_at}
                username={data.username}
                rankTitle={data.xp_system.rank_title}
              />
           </RevealWrapper>
        </div>
        <div className="lg:col-span-4">
           <RevealWrapper type="card">
              <AIInsightPanel />
           </RevealWrapper>
        </div>
      </div>

      {/* 4. Visualization & Growth */}
      <div className="grid lg:grid-cols-3 gap-10 mb-20">
         <RevealWrapper type="card" className="lg:col-span-2 sm-glass p-8 rounded-[2rem]">
            <div className="sm-nano mb-6 opacity-60">Mastery Heatmap</div>
            <SkillRadar skills={data.skill_heatmap} />
         </RevealWrapper>
         <div className="space-y-10">
            <RevealWrapper type="card">
               <GrowthForecast data={data.growth_forecast} />
            </RevealWrapper>
            <RevealWrapper type="card">
               <AchievementBadges badges={data.badges} />
            </RevealWrapper>
         </div>
      </div>

      {/* 5. Modules & Benchmarking */}
      <div className="space-y-20 mb-20">
         <RevealWrapper type="card">
            <ModuleSummaries summaries={{
               resume: { score: data.has_resume ? 85 : 0 },
               roadmap: { progress: data.profile_completion },
               interview: { last_score: null },
               job_intelligence: { top_match: 92 },
               alerts: { count: 3 }
            }} />
         </RevealWrapper>

         <RevealWrapper type="card">
            <Benchmarking data={data.benchmarking} />
         </RevealWrapper>
      </div>

    </Layout>
  );
};

export default withAuth(Dashboard);
