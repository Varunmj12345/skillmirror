import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';
import { fetchDashboard, uploadResume } from '../services/dashboard';
import apiClient from '../services/apiClient';
import { jobService } from '../services/jobService';
import RevealWrapper from '../components/RevealWrapper';
import StaggerGrid from '../components/StaggerGrid';
import { SkeletonCard } from '../components/motion/Skeleton';
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
import ErrorBoundary from '../components/ui/ErrorBoundary';


/* ── Ambient background with subtle Skydda guidelines ── */
const DashBg: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

/* ── Skydda Section divider ────────────────────────────── */
const SectionDivider: React.FC<{ label: string; badge?: string }> = ({
  label, badge,
}) => (
  <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800">
    <div className="flex items-center gap-2.5">
      <div className="w-2 h-2 bg-amber-500" />
      <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-medium">
        {label}
      </h2>
    </div>
    {badge && (
      <span className="text-[10px] font-mono px-2 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-400">
        {badge}
      </span>
    )}
  </div>
);

/* ── Skeleton loading view ────────────────────────────── */
const DashboardSkeleton: React.FC = () => (
  <Layout>
    <div className="relative z-10 px-4 sm:px-6 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8 border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 space-y-3">
        <div className="w-40 h-4 bg-zinc-800 animate-pulse" />
        <div className="w-64 h-8 bg-zinc-800 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 border border-zinc-800 bg-zinc-900/60 animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-96 border border-zinc-800 bg-zinc-900/60 animate-pulse" />
        <div className="lg:col-span-4 h-96 border border-zinc-800 bg-zinc-900/60 animate-pulse" />
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
  const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Node.js']);
  const [expLevel, setExpLevel] = useState('Beginner');
  const [timeline, setTimeline] = useState('6 months');
  const [savingWizard, setSavingWizard] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<'manual' | 'resume'>('manual');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeExtracted, setResumeExtracted] = useState<any>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

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
      jobService.getSuggestedOpenings().then((r: any) => { const l = r?.recommended_jobs || (Array.isArray(r) ? r : []); setSuggestedJobs(l); }).catch(() => {});

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

  const handleOnboardingResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    setResumeError(null);
    try {
      const res: any = await uploadResume(file);
      const parsed = res?.data || res;
      if (parsed?.inferred_role) setTargetRole(parsed.inferred_role);
      if (parsed?.inferred_experience_level) setExpLevel(parsed.inferred_experience_level);
      if (Array.isArray(parsed?.skills) && parsed.skills.length > 0) {
        setSelectedSkills(parsed.skills.slice(0, 15));
      }
      setResumeExtracted({
        fileName: file.name,
        skillsCount: parsed?.skills?.length || 0,
        readinessScore: parsed?.readiness_score || 75,
        summary: parsed?.parsed_profile?.summary || '',
      });
    } catch (err: any) {
      setResumeError(err?.response?.data?.error || 'Could not parse resume file. Please upload a PDF, DOCX, or TXT file.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCompleteWizard = async () => {
    setSavingWizard(true);
    try {
      await apiClient.put('/users/profile/', {
        dream_job: targetRole,
        experience_level: expLevel,
        skills: selectedSkills,
      });
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
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="max-w-md w-full p-8 border border-zinc-800 bg-zinc-900 text-center">
            <div className="w-10 h-10 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-amber-500 mx-auto mb-4">
              <i className="fa-solid fa-satellite-dish text-sm" />
            </div>
            <h2 className="text-base font-normal tracking-tight text-white mb-2">Network Handshake Failed</h2>
            <p className="text-xs font-mono text-zinc-400 mb-6">
              Re-establishing telemetry link with the Career Intelligence Engine...
            </p>
            <button
              onClick={loadData}
              className="w-full py-2.5 bg-white text-zinc-950 font-mono text-xs hover:bg-zinc-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate text-xs" /> RETRY HANDSHAKE
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard • SkillMirror OS</title>
        <meta name="description" content="Your AI career intelligence command center." />
      </Head>

      {/* Ambient subtle grid */}
      <DashBg />

      {/* ── WELCOME OVERLAY ──────────────────────────────────── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="text-center max-w-sm space-y-6 border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
              <div className="w-14 h-14 mx-auto border border-zinc-800 bg-zinc-950 flex items-center justify-center text-amber-500">
                <i className="fa-solid fa-brain text-xl" />
              </div>
              <div className="space-y-2">
                {welcomeStep === 1 && (
                  <p className="text-xs font-mono text-zinc-300">
                    Initializing Neural Career Engine...
                  </p>
                )}
                {welcomeStep === 2 && (
                  <p className="text-xs font-mono text-amber-400">
                    Scanning market vectors & skill profiles...
                  </p>
                )}
                {welcomeStep === 3 && (
                  <div className="space-y-1">
                    <h2 className="text-lg font-normal text-white">Welcome, {data.username}</h2>
                    <p className="text-xs font-mono text-zinc-400">Career OS synchronized. All engines active.</p>
                  </div>
                )}
              </div>
              <div className="w-48 h-1 mx-auto bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
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
            className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative bg-zinc-950 border border-zinc-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-amber-500" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      {onboardingMode === 'resume' ? 'INIT SEQUENCE • RESUME AUTO-FETCH' : `INIT SEQUENCE • STEP ${wizardStep} OF 3`}
                    </span>
                  </div>
                  <h3 className="text-base font-normal tracking-tight text-white">Goal Configuration</h3>
                </div>
                {onboardingMode === 'manual' && (
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1 transition-all ${
                          s === wizardStep ? 'w-6 bg-amber-500' : s < wizardStep ? 'w-3 bg-emerald-500' : 'w-3 bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Setup Mode Selector: Upload Resume vs Manual Configuration */}
              <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOnboardingMode('resume')}
                  className={`py-2 px-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${
                    onboardingMode === 'resume'
                      ? 'bg-amber-500/15 border border-amber-500/60 text-amber-300 font-medium'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <i className="fa-solid fa-file-arrow-up text-xs" />
                  <span>Upload Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingMode('manual')}
                  className={`py-2 px-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${
                    onboardingMode === 'manual'
                      ? 'bg-amber-500/15 border border-amber-500/60 text-amber-300 font-medium'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <i className="fa-solid fa-sliders text-xs" />
                  <span>Configure Manually</span>
                </button>
              </div>

              {onboardingMode === 'resume' ? (
                <div className="space-y-4 mb-6">
                  <label className="block border border-dashed border-zinc-700 hover:border-amber-500/60 bg-zinc-900/60 p-5 text-center cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleOnboardingResumeUpload}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                    <div className="w-10 h-10 mx-auto mb-2.5 border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <i className={`fa-solid ${uploadingResume ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} text-sm`} />
                    </div>
                    <p className="text-xs font-mono text-white font-medium">
                      {uploadingResume
                        ? 'Extracting skills, target role & experience...'
                        : resumeExtracted
                        ? `Uploaded: ${resumeExtracted.fileName} (Click to replace)`
                        : 'Click to upload your Resume (PDF, DOCX, TXT)'}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-500 mt-1">
                      Automatically populates your target role, verified skills, and experience level
                    </p>
                  </label>

                  {resumeError && (
                    <div className="p-3 border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs font-mono">
                      {resumeError}
                    </div>
                  )}

                  {resumeExtracted && (
                    <div className="p-4 border border-emerald-500/30 bg-zinc-900/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <i className="fa-solid fa-circle-check" /> Resume Data Extracted
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          ATS Readiness: <strong className="text-white">{resumeExtracted.readinessScore}%</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase block">Detected Role</span>
                          <select
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="mt-1 w-full bg-transparent text-white font-medium focus:outline-none text-xs"
                          >
                            {['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Full Stack Developer'].map((r) => (
                              <option key={r} value={r} className="bg-zinc-950 text-white">{r}</option>
                            ))}
                          </select>
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase block">Experience Level</span>
                          <select
                            value={expLevel}
                            onChange={(e) => setExpLevel(e.target.value)}
                            className="mt-1 w-full bg-transparent text-white font-medium focus:outline-none text-xs"
                          >
                            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                              <option key={lvl} value={lvl} className="bg-zinc-950 text-white">{lvl}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5">
                          Extracted Skills ({selectedSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                          {selectedSkills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkillSelection(skill)}
                              className="px-2 py-0.5 text-[11px] font-mono border border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            >
                              ✓ {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {wizardStep === 1 && (
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Target career role:</p>
                      {['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Full Stack Developer'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setTargetRole(role)}
                          className={`w-full p-3 border text-left text-xs font-mono transition-colors flex items-center gap-2.5 ${
                            targetRole === role
                              ? 'border-amber-500/60 bg-amber-500/10 text-white font-medium'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <i className={`fa-solid fa-briefcase text-xs ${targetRole === role ? 'text-amber-500' : 'text-zinc-600'}`} />
                          <span>{role}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Core skills in your stack:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(['React', 'Node.js', 'Python', 'Java', 'SQL', 'TypeScript', 'System Design', 'DSA', 'Docker', 'AWS', ...selectedSkills])).map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkillSelection(skill)}
                            className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                              selectedSkills.includes(skill)
                                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
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
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Experience level:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setExpLevel(lvl)}
                              className={`p-2.5 border text-xs font-mono transition-colors ${
                                expLevel === lvl
                                  ? 'border-amber-500/60 bg-amber-500/10 text-white font-medium'
                                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Readiness timeline:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['3 months', '6 months', '1 year'].map((tl) => (
                            <button
                              key={tl}
                              onClick={() => setTimeline(tl)}
                              className={`p-2.5 border text-xs font-mono transition-colors ${
                                timeline === tl
                                  ? 'border-amber-500/60 bg-amber-500/10 text-white font-medium'
                                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
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
              )}

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                {onboardingMode === 'resume' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setOnboardingMode('manual');
                        setWizardStep(1);
                      }}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    >
                      {resumeExtracted ? 'Review in Manual Steps →' : 'Configure Manually →'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteWizard}
                      disabled={savingWizard || uploadingResume || !resumeExtracted}
                      className="px-5 py-2 bg-amber-500 text-zinc-950 font-mono text-xs hover:bg-amber-400 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {savingWizard ? 'Saving...' : (
                        <><i className="fa-solid fa-bolt text-xs" /> Activate Intelligence Hub</>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {wizardStep > 1 ? (
                      <button
                        onClick={() => setWizardStep((s) => s - 1)}
                        className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                      >
                        ← Back
                      </button>
                    ) : <div />}
                    {wizardStep < 3 ? (
                      <button
                        onClick={() => setWizardStep((s) => s + 1)}
                        className="px-5 py-2 bg-white text-zinc-950 font-mono text-xs hover:bg-zinc-200 transition-colors font-medium flex items-center gap-1.5"
                      >
                        Next Step <i className="fa-solid fa-chevron-right text-[10px]" />
                      </button>
                    ) : (
                      <button
                        onClick={handleCompleteWizard}
                        disabled={savingWizard}
                        className="px-5 py-2 bg-amber-500 text-zinc-950 font-mono text-xs hover:bg-amber-400 transition-colors font-medium flex items-center gap-1.5"
                      >
                        {savingWizard ? 'Saving...' : (
                          <><i className="fa-solid fa-bolt text-xs" /> Activate Intelligence Hub</>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          DASHBOARD CONTENT
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 px-4 sm:px-6 py-8 max-w-[1400px] mx-auto">

        {/* ── Page Header ─────────────────────────────────── */}
        <RevealWrapper type="heading">
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5 px-3 py-1 border border-zinc-800 bg-zinc-950/70 w-fit mb-3">
                  <div className="w-2 h-2 bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    DASHBOARD • REAL-TIME TELEMETRY
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 border border-zinc-700 bg-zinc-800 text-emerald-400 ml-1">
                    LIVE
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-white mb-2">
                  DASHBOARD
                </h1>
                <p className="text-xs sm:text-sm font-mono text-zinc-400">
                  Welcome back, <span className="text-white font-medium">{data.username}</span> — All autonomous career engines nominal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3.5 py-2 border border-zinc-800 bg-zinc-950 font-mono text-xs hidden sm:block">
                  <span className="text-zinc-500 uppercase text-[10px] block">Global IQ Standing</span>
                  <span className="text-white font-medium">Top 8.4%</span>{' '}
                  <span className="text-emerald-400 text-xs">↑</span>
                </div>

                <button
                  onClick={() => setIsTwinOpen(true)}
                  className="px-4 py-2 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-dna text-xs text-amber-500" />
                  <span>Career Simulation</span>
                </button>

                <Link href="/profile">
                  <a className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 bg-zinc-950 text-zinc-300 hover:text-white font-mono text-xs transition-colors flex items-center gap-2">
                    <span>Profile & Portfolio</span>
                    <i className="fa-solid fa-chevron-right text-[10px] text-zinc-500" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </RevealWrapper>

        <CareerDigitalTwinModal isOpen={isTwinOpen} onClose={() => setIsTwinOpen(false)} />

        {/* ── Career Risk Banner ───────────────────────────── */}
        {data.career_risk_index > 20 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 sm:p-5 border border-amber-500/40 bg-zinc-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-amber-500/40 bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-sm" />
              </div>
              <div>
                <p className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider">Career Risk Index Elevated</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Complete profile → Add skills → Upload resume → Align target career
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2 bg-amber-500 text-zinc-950 font-mono text-xs hover:bg-amber-400 font-medium transition-colors shrink-0"
            >
              REDUCE RISK →
            </button>
          </motion.div>
        )}

        {/* ── 1. KPI Metric Cards ──────────────────────────── */}
        <div className="mb-10">
          <SectionDivider label="PRIMARY TELEMETRY METRICS" badge="AUTO-SYNC" />
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-5 gap-4" staggerDelay={80}>
            <MetricCard label="Readiness"    value={data.job_readiness_score}   icon="fa-bullseye" />
            <MetricCard label="Market Match" value={92}                          icon="fa-network-wired" />
            <MetricCard label="Risk Index"   value={data.career_risk_index}      icon="fa-bolt" suffix="%" />
            <MetricCard label="XP Level"     value={data.xp_system.level}        icon="fa-trophy" />
            <MetricCard label="Trust Score"  value={98}                          icon="fa-shield-check" suffix="%" />
          </StaggerGrid>
        </div>

        {/* ── 2. Intelligence & Insights ───────────────────── */}
        <div className="mb-10">
          <SectionDivider label="NEURAL INTELLIGENCE ENGINE" />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
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
              <RevealWrapper type="card" className="h-full">
                <AIInsightPanel />
              </RevealWrapper>
            </div>
          </div>
        </div>

        {/* ── 3. Skill Mastery Visualization ───────────────── */}
        <div className="mb-10">
          <SectionDivider label="SKILL MASTERY HEATMAP" badge="LIVE ANALYSIS" />
          <div className="grid lg:grid-cols-3 gap-6">
            <RevealWrapper type="card" className="lg:col-span-2">
              <ErrorBoundary fallbackTitle="Skill Radar Telemetry Fault">
                <SkillRadar skills={data.skill_heatmap} onOpenSimulation={() => setIsTwinOpen(true)} />
              </ErrorBoundary>
            </RevealWrapper>
            <div className="space-y-6">
              <RevealWrapper type="card">
                <ErrorBoundary fallbackTitle="Growth Forecast Unavailable">
                  <GrowthForecast data={data.growth_forecast} />
                </ErrorBoundary>
              </RevealWrapper>
              <RevealWrapper type="card">
                <AchievementBadges badges={data.badges} />
              </RevealWrapper>
            </div>
          </div>
        </div>

        {/* ── 4. Module Summaries & Benchmarking ───────────── */}
        <div className="space-y-8">
          <div>
            <SectionDivider label="ENGINE MODULE STATUS" />
            <RevealWrapper type="card">
              <ModuleSummaries summaries={{
                resume:           { score: data.has_resume ? 85 : 0 },
                roadmap:          { progress: data.profile_completion },
                interview:        { last_score: null },
                job_intelligence: { top_match: 92 },
                alerts:           { count: 3 },
              }} />
            </RevealWrapper>
          </div>

          {/* ── Suggested Live Openings (Web-Scraped) ────────── */}
          {suggestedJobs && suggestedJobs.length > 0 && (
            <div>
              <SectionDivider label="SUGGESTED CURRENT OPENINGS" badge="FREELANCER LIVE SCRAPE" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedJobs.slice(0, 3).map((job: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 border border-zinc-800 bg-zinc-900/90 hover:border-amber-400/50 transition-colors flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                          <i className="fa-solid fa-bolt text-[8px]" />
                          <span>FREELANCER.COM</span>
                        </span>
                        {job.match_score && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
                            {job.match_score}% MATCH
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-mono font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                        {job.title}
                      </h4>
                      <p className="text-[11px] font-sans text-zinc-400 mb-3">
                        {job.company} • {job.salary || 'Competitive'}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(job.matched_skills || job.skills || []).slice(0, 3).map((s: string, sIdx: number) => (
                          <span key={sIdx} className="px-1.5 py-0.2 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-zinc-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Check Out Opening</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionDivider label="GLOBAL BENCHMARKING" badge="REAL-TIME" />
            <RevealWrapper type="card">
              <Benchmarking data={data.benchmarking} />
            </RevealWrapper>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);

