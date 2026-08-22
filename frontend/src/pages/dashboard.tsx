import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';
import { fetchDashboard } from '../services/dashboard';
import apiClient from '../services/apiClient';
import RevealWrapper from '../components/RevealWrapper';
import StaggerGrid from '../components/StaggerGrid';
import { SkeletonCard } from '../components/motion/Skeleton';
import { TVNoise } from '../components/ui/tv-noise';
import { Bullet } from '../components/ui/bullet';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardContent } from '../components/ui/card';
// Dashboard sub-components
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

/* ── Cyber ambient background ─────────────────────────── */
const DashBg: React.FC = () => (
  <>
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
      style={{
        backgroundImage: `linear-gradient(rgba(0,217,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
    <div className="fixed top-0 right-1/4 w-[600px] h-[300px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none z-0" />
    <div className="fixed bottom-1/4 left-1/3 w-[400px] h-[250px] bg-indigo-600/5 blur-[130px] rounded-full pointer-events-none z-0" />
  </>
);

/* ── Cyber section divider ────────────────────────────── */
const SectionDivider: React.FC<{ label: string; bulletVariant?: any; badge?: string }> = ({
  label, bulletVariant = 'cyan', badge,
}) => (
  <div className="flex items-center gap-3 mb-6">
    <Bullet variant={bulletVariant} />
    <h2 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white">{label}</h2>
    <div className="flex-1 h-px bg-white/[0.05]" />
    {badge && <Badge variant="outline-cyan">{badge}</Badge>}
  </div>
);

/* ── Skeleton loading view ────────────────────────────── */
const DashboardSkeleton: React.FC = () => (
  <Layout>
    <div className="relative z-10 px-6 py-8 max-w-[1400px] mx-auto">
      <div className="mb-10 space-y-3">
        <div className="w-48 h-3 rounded-full bg-white/[0.06] animate-pulse" />
        <div className="w-72 h-8 rounded-xl bg-white/[0.06] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8"><SkeletonCard className="!h-[400px]" /></div>
        <div className="lg:col-span-4"><SkeletonCard className="!h-[400px]" /></div>
      </div>
    </div>
  </Layout>
);

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTwinOpen, setIsTwinOpen] = useState(false);

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
      const authEngines: any = await apiClient.get('/users/authorized-engines/');
      const authData = authEngines?.data || authEngines;
      if (authData?.role && authData.role !== 'student' && authData?.default_dashboard) {
        if (authData.default_dashboard !== '/dashboard') {
          router.replace(authData.default_dashboard);
          return;
        }
      }

      const res: any = await fetchDashboard();
      setData(res);

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

  useEffect(() => { loadData(); }, []);

  const handleCompleteWizard = async () => {
    setSavingWizard(true);
    try {
      await apiClient.put('/users/profile/', { dream_job: targetRole, experience_level: expLevel });
      const onboardingKey = `sm_onboarding_done_${data?.username || 'user'}`;
      localStorage.setItem(onboardingKey, 'true');
      setIsWizardOpen(false);
      await loadData();
    } catch (e) {
      setIsWizardOpen(false);
    } finally {
      setSavingWizard(false);
    }
  };

  const toggleSkillSelection = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full p-10 rounded-2xl bg-pop border border-white/[0.08] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
            <i className="fa-solid fa-satellite-dish text-4xl text-red-400/60 mb-4" />
            <h2 className="text-lg font-display font-black text-white mb-2">Network Latency Detected</h2>
            <p className="text-xs font-mono text-slate-400 mb-6">Re-establishing handshake with the Career Intelligence Engine...</p>
            <button onClick={loadData} className="sm-btn-primary w-full py-3 text-xs">
              <i className="fa-solid fa-rotate text-xs" /> RETRY SYNC
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Intelligence Hub • SkillMirror OS</title>
        <meta name="description" content="Your AI career intelligence command center." />
      </Head>

      {/* Ambient background */}
      <DashBg />

      {/* ── WELCOME OVERLAY ──────────────────────────────────── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0b0d13]/96 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <TVNoise opacity={0.04} />
            <div className="text-center max-w-sm space-y-6 relative z-10">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,217,255,0.2)]">
                <i className="fa-solid fa-brain text-cyan-400" />
              </div>
              <div className="space-y-2">
                {welcomeStep === 1 && <p className="text-base font-mono font-bold text-slate-300 animate-pulse">Initializing Neural Career Engine...</p>}
                {welcomeStep === 2 && <p className="text-base font-mono font-bold text-cyan-300 animate-pulse">Scanning market data & skill vectors...</p>}
                {welcomeStep === 3 && (
                  <div className="space-y-1">
                    <h2 className="text-2xl font-display font-black text-white">Welcome, {data.username}!</h2>
                    <p className="text-xs font-mono text-cyan-300">Career OS initialized. All systems nominal.</p>
                  </div>
                )}
              </div>
              <div className="w-48 h-1 mx-auto bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-400 to-emerald-400"
                  animate={{ width: welcomeStep === 1 ? '33%' : welcomeStep === 2 ? '66%' : '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ONBOARDING WIZARD MODAL ───────────────────────────── */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0b0d13]/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-pop border border-white/[0.08] rounded-2xl max-w-lg w-full p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <TVNoise opacity={0.025} />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">
                    INIT SEQUENCE • STEP {wizardStep} OF 3
                  </div>
                  <h3 className="text-lg font-display font-black text-white">Goal Configuration</h3>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        s === wizardStep ? 'w-6 bg-cyan-400' : s < wizardStep ? 'w-3 bg-emerald-400' : 'w-3 bg-white/[0.1]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10 space-y-4 mb-6">
                {wizardStep === 1 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Target career role:</p>
                    {['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Full Stack Developer'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setTargetRole(role)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-mono font-bold transition-all ${
                          targetRole === role
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.15]'
                        }`}
                      >
                        <i className="fa-solid fa-briefcase mr-2 text-cyan-400/70" />
                        {role}
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Core skills you have:</p>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'Python', 'Java', 'SQL', 'TypeScript', 'System Design', 'DSA', 'Docker', 'AWS'].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkillSelection(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                            selectedSkills.includes(skill)
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                          }`}
                        >
                          {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Experience level:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setExpLevel(lvl)}
                            className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                              expLevel === lvl
                                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                                : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Readiness timeline:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['3 months', '6 months', '1 year'].map((tl) => (
                          <button
                            key={tl}
                            onClick={() => setTimeline(tl)}
                            className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                              timeline === tl
                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                                : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                            }`}
                          >
                            {tl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/[0.06] relative z-10">
                {wizardStep > 1 ? (
                  <button onClick={() => setWizardStep((s) => s - 1)} className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
                    ← Back
                  </button>
                ) : <div />}
                {wizardStep < 3 ? (
                  <button onClick={() => setWizardStep((s) => s + 1)} className="sm-btn-primary px-5 py-2.5 text-xs">
                    Next Step <i className="fa-solid fa-chevron-right text-[10px]" />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteWizard}
                    disabled={savingWizard}
                    className="sm-btn-primary px-5 py-2.5 text-xs"
                  >
                    {savingWizard ? 'Saving...' : (
                      <><i className="fa-solid fa-bolt text-xs" /> Activate Intelligence Hub</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          DASHBOARD CONTENT
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 px-6 py-8 max-w-[1400px] mx-auto">

        {/* ── Page Header ─────────────────────────────────── */}
        <RevealWrapper type="heading">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bullet variant="cyan" size="sm" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-500">
                  CAREER INTELLIGENCE TERMINAL
                </span>
                <Badge variant="outline-cyan">LIVE</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
                COMMAND CENTER
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Welcome back, <span className="text-cyan-400 font-bold">{data.username}</span> — Neural OS synchronized
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* IQ Percentile chip */}
              <div className="px-4 py-2.5 rounded-xl bg-pop border border-white/[0.06] hidden sm:block">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Global IQ Percentile</div>
                <div className="text-base font-display font-black text-white mt-0.5">
                  Top 8.4% <span className="text-emerald-400 text-xs">↑</span>
                </div>
              </div>

              {/* Digital Twin */}
              <button
                onClick={() => setIsTwinOpen(true)}
                className="sm-btn-neon !py-2.5 !px-4 text-xs group"
              >
                <i className="fa-solid fa-dna text-xs animate-pulse" />
                <span>Digital Twin</span>
              </button>

              {/* Identity Verified */}
              <Link href="/profile">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pop border border-white/[0.06] text-[11px] font-mono font-bold text-slate-400 hover:text-white hover:border-white/[0.15] transition-all group">
                  <span>Identity Verified</span>
                  <i className="fa-solid fa-chevron-right text-[9px] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </RevealWrapper>

        <CareerDigitalTwinModal isOpen={isTwinOpen} onClose={() => setIsTwinOpen(false)} />

        {/* ── Career Risk Banner ───────────────────────────── */}
        {data.career_risk_index > 20 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-amber-500/8 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-sm" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-amber-300">Career Risk Index Elevated</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Complete profile → Add skills → Upload resume → Set target career
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs transition-all flex-shrink-0"
            >
              REDUCE RISK →
            </button>
          </motion.div>
        )}

        {/* ── 1. KPI Metric Cards ──────────────────────────── */}
        <div className="mb-10">
          <SectionDivider label="PRIMARY TELEMETRY METRICS" badge="AUTO-SYNC" />
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-5 gap-4" staggerDelay={80}>
            <MetricCard label="Readiness"    value={data.job_readiness_score}   icon="fa-bullseye"      color="indigo" />
            <MetricCard label="Market Match" value={92}                          icon="fa-network-wired" color="cyan" />
            <MetricCard label="Risk Index"   value={data.career_risk_index}      icon="fa-bolt"          color="amber" suffix="%" />
            <MetricCard label="XP Level"     value={data.xp_system.level}        icon="fa-trophy"        color="amber" />
            <MetricCard label="Trust Score"  value={98}                          icon="fa-shield-check"  color="emerald" suffix="%" />
          </StaggerGrid>
        </div>

        {/* ── 2. Intelligence & Insights ───────────────────── */}
        <div className="mb-10">
          <SectionDivider label="NEURAL INTELLIGENCE ENGINE" bulletVariant="default" />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <RevealWrapper type="card">
                <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                  <AIStrategy strategy={data.ai_strategy} />
                </div>
              </RevealWrapper>
              <RevealWrapper type="card">
                <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                  <XPSystem
                    level={data.xp_system.level}
                    totalXp={data.xp_system.total_xp}
                    progress={data.xp_system.progress}
                    nextLevelAt={data.xp_system.next_level_at}
                    username={data.username}
                    rankTitle={data.xp_system.rank_title}
                  />
                </div>
              </RevealWrapper>
            </div>
            <div className="lg:col-span-4">
              <RevealWrapper type="card">
                <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden h-full relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                  <AIInsightPanel />
                </div>
              </RevealWrapper>
            </div>
          </div>
        </div>

        {/* ── 3. Skill Mastery Visualization ───────────────── */}
        <div className="mb-10">
          <SectionDivider label="SKILL MASTERY HEATMAP" bulletVariant="success" badge="LIVE ANALYSIS" />
          <div className="grid lg:grid-cols-3 gap-6">
            <RevealWrapper type="card" className="lg:col-span-2">
              <div className="rounded-2xl bg-pop border border-white/[0.06] p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
                <SkillRadar skills={data.skill_heatmap} />
              </div>
            </RevealWrapper>
            <div className="space-y-6">
              <RevealWrapper type="card">
                <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
                  <GrowthForecast data={data.growth_forecast} />
                </div>
              </RevealWrapper>
              <RevealWrapper type="card">
                <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
                  <AchievementBadges badges={data.badges} />
                </div>
              </RevealWrapper>
            </div>
          </div>
        </div>

        {/* ── 4. Module Summaries & Benchmarking ───────────── */}
        <div className="space-y-8">
          <div>
            <SectionDivider label="ENGINE MODULE STATUS" bulletVariant="warning" />
            <RevealWrapper type="card">
              <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
                <ModuleSummaries summaries={{
                  resume:           { score: data.has_resume ? 85 : 0 },
                  roadmap:          { progress: data.profile_completion },
                  interview:        { last_score: null },
                  job_intelligence: { top_match: 92 },
                  alerts:           { count: 3 },
                }} />
              </div>
            </RevealWrapper>
          </div>

          <div>
            <SectionDivider label="GLOBAL BENCHMARKING" bulletVariant="cyan" badge="REAL-TIME" />
            <RevealWrapper type="card">
              <div className="rounded-2xl bg-pop border border-white/[0.06] overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
                <Benchmarking data={data.benchmarking} />
              </div>
            </RevealWrapper>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-10" />
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);
