import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getUserProfile } from '../services/auth';
import apiClient from '../services/apiClient';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';
import { ScrollReveal, StaggerChildren } from '../components/motion/ScrollReveal';
import { useToast } from '../components/motion/Toast';
import Link from 'next/link';

type SettingsPrefs = {
  accountName: string;
  accountTimezone: string;
  aiTone: 'neutral' | 'friendly' | 'direct';
  aiDetail: 'concise' | 'balanced' | 'detailed';
  notifyEmail: boolean;
  notifyProduct: boolean;
  notifyTips: boolean;
  appearanceTheme: 'system' | 'light' | 'dark';
  twoFactor: boolean;
  privacyTelemetry: boolean;
  enableSmartAlerts: boolean;
  alertFrequency: 'instant' | 'daily' | 'weekly';
  alertSensitivity: 'low' | 'balanced' | 'aggressive';
  enablePredictive: boolean;
  enableBehavioral: boolean;
  profileVisibility: boolean;
  dreamJob: string;
};

const SETTINGS_KEY = 'sm_settings_prefs';

const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'account' | 'ai' | 'alerts' | 'security'>('all');
  const [prefs, setPrefs] = useState<SettingsPrefs>({
    accountName: '',
    accountTimezone: 'UTC',
    aiTone: 'neutral',
    aiDetail: 'balanced',
    notifyEmail: true,
    notifyProduct: true,
    notifyTips: false,
    appearanceTheme: 'dark',
    twoFactor: false,
    privacyTelemetry: true,
    enableSmartAlerts: true,
    alertFrequency: 'instant',
    alertSensitivity: 'balanced',
    enablePredictive: true,
    enableBehavioral: true,
    profileVisibility: true,
    dreamJob: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadProfile = async () => {
      try {
        const profile: any = await getUserProfile();
        setPrefs(p => ({
          ...p,
          twoFactor: profile.two_factor_enabled || false,
          profileVisibility: profile.profile_visibility ?? true,
          accountName: profile.username || '',
          dreamJob: profile.dream_job || ''
        }));
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsPrefs;
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTwoFactorToggle = async () => {
    const newVal = !prefs.twoFactor;
    try {
      await apiClient.put('/users/profile/', { two_factor_enabled: newVal });
      setPrefs(p => ({ ...p, twoFactor: newVal }));
      addToast({
        type: 'info',
        title: newVal ? '2FA Active' : '2FA Deactivated',
        message: newVal ? 'Two-Factor Authentication is now enabled.' : 'Two-Factor Authentication disabled.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update 2FA setting' });
    }
  };

  const handleVisibilityToggle = async () => {
    const newVal = !prefs.profileVisibility;
    try {
      await apiClient.put('/users/profile/', { profile_visibility: newVal });
      setPrefs(p => ({ ...p, profileVisibility: newVal }));
      addToast({
        type: 'info',
        title: newVal ? 'Profile Public' : 'Profile Private',
        message: newVal ? 'Profile indexed for recruiter searches.' : 'Profile hidden from public directories.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update visibility' });
    }
  };

  const persist = (next: SettingsPrefs) => {
    setPrefs(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put('/users/profile/', {
        dream_job: prefs.dreamJob,
      });
      persist(prefs);
      addToast({
        type: 'success',
        title: 'Settings Synchronized',
        message: 'Workspace configurations and AI preferences have been saved.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = <K extends keyof SettingsPrefs>(key: K) => {
    const next = { ...prefs, [key]: !prefs[key] } as SettingsPrefs;
    persist(next);
  };

  const tabs = [
    { id: 'all', label: 'All Settings', icon: 'fa-layer-group' },
    { id: 'account', label: 'Identity & Target', icon: 'fa-id-card' },
    { id: 'ai', label: 'AI Copilot Tuning', icon: 'fa-brain' },
    { id: 'alerts', label: 'Signals & Telemetry', icon: 'fa-bell' },
    { id: 'security', label: 'Security & Privacy', icon: 'fa-shield-halved' }
  ];

  return (
    <Layout>
      <Head>
        <title>System Settings & AI Preferences • SkillMirror OS</title>
        <meta name="description" content="Workspace preferences, AI copilot tuning, alert sensitivity, and security configuration." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-10"
        section="IDENTITY & SYSTEM PREFERENCES"
        title="SYSTEM CONFIGURATION & PREFERENCES"
        subtitle="Tune the autonomous AI copilot's personality, configure real-time alert sensitivity, and manage workspace security protocols."
        badge="NEURAL ENGINE PREFS"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="indigo"
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.35)] transition-all flex items-center gap-2"
          >
            <i className={`fa-solid fa-floppy-disk text-xs ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        }
        stats={
          <>
            <PageStatChip label="AI Personality" value={prefs.aiTone.toUpperCase()} icon="fa-brain" color="cyan" />
            <PageStatChip label="Alert Sensitivity" value={prefs.alertSensitivity.toUpperCase()} icon="fa-bolt" color="amber" />
            <PageStatChip label="Security Level" value={prefs.twoFactor ? 'MAX (2FA)' : 'STANDARD'} icon="fa-shield-check" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* Navigation Category Switcher */}
        <ScrollReveal>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none p-2 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,217,255,0.25)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-xs`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* ── 1. Account & Career Identity Settings ── */}
            {(activeTab === 'all' || activeTab === 'account') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-base">
                      <i className="fa-solid fa-id-card" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-black text-white">
                        Career Identity & Target Role
                      </h2>
                      <p className="text-[11px] font-mono text-slate-400">
                        Configures target benchmark models and job match parameters.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Display Handle
                      </label>
                      <input
                        type="text"
                        value={prefs.accountName}
                        onChange={(e) => setPrefs(prev => ({ ...prev, accountName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
                        placeholder="Your username handle..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Target Dream Job Role
                      </label>
                      <input
                        type="text"
                        value={prefs.dreamJob}
                        onChange={(e) => setPrefs(prev => ({ ...prev, dreamJob: e.target.value }))}
                        placeholder="e.g. Senior Full-Stack AI Engineer..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
                      />
                      <p className="text-[10px] font-mono text-slate-500">
                        The AI engine continuously indexes real-time hiring trends matching this specific position.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Workspace Timezone
                      </label>
                      <select
                        value={prefs.accountTimezone}
                        onChange={(e) => setPrefs(prev => ({ ...prev, accountTimezone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">Eastern Time (US / New York)</option>
                        <option value="America/Los_Angeles">Pacific Time (US / Los Angeles)</option>
                        <option value="Europe/London">Greenwich Mean Time (London)</option>
                        <option value="Asia/Kolkata">India Standard Time (IST / Kolkata)</option>
                        <option value="Asia/Tokyo">Japan Standard Time (Tokyo)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* ── 2. AI Copilot Personality Tuning ── */}
            {(activeTab === 'all' || activeTab === 'ai') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-base">
                      <i className="fa-solid fa-brain" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-black text-white">
                        AI Copilot Personality Tuning
                      </h2>
                      <p className="text-[11px] font-mono text-slate-400">
                        Adjust mentorship tone, feedback depth, and prompt style.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Copilot Mentorship Tone
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {(['neutral', 'friendly', 'direct'] as const).map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => setPrefs(prev => ({ ...prev, aiTone: tone }))}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                              prefs.aiTone === tone
                                ? 'border-violet-500/60 bg-violet-500/20 text-violet-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Response & Analysis Depth
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {(['concise', 'balanced', 'detailed'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setPrefs(p => ({ ...p, aiDetail: lvl }))}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                              prefs.aiDetail === lvl
                                ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* ── 3. Signals & Smart Alerts Intelligence ── */}
            {(activeTab === 'all' || activeTab === 'alerts') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-base">
                      <i className="fa-solid fa-satellite-dish" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-black text-white">
                        Signals & Predictive Alerts Engine
                      </h2>
                      <p className="text-[11px] font-mono text-slate-400">
                        Configure predictive hiring spike detection and drift warnings.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.05]">
                      <div>
                        <p className="text-xs font-mono font-bold text-white">Autonomous Smart Signals</p>
                        <p className="text-[10px] font-mono text-slate-400">Evaluate hiring surges & skill drift</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle('enableSmartAlerts')}
                        className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                          prefs.enableSmartAlerts ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.05]">
                      <div>
                        <p className="text-xs font-mono font-bold text-white">Predictive Risk Analysis</p>
                        <p className="text-[10px] font-mono text-slate-400">Warn before competency gaps widen</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle('enablePredictive')}
                        className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                          prefs.enablePredictive ? 'bg-indigo-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.05]">
                      <div>
                        <p className="text-xs font-mono font-bold text-white">Behavioral Consistency Tracking</p>
                        <p className="text-[10px] font-mono text-slate-400">Momentum drop & stagnation alerts</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle('enableBehavioral')}
                        className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                          prefs.enableBehavioral ? 'bg-indigo-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    {/* Alert Sensitivity */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Signal Engine Sensitivity
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'balanced', 'aggressive'] as const).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setPrefs(p => ({ ...p, alertSensitivity: s }))}
                            className={`py-2 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                              prefs.alertSensitivity === s
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* ── 4. Security & Privacy Matrix ── */}
            {(activeTab === 'all' || activeTab === 'security') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-base">
                      <i className="fa-solid fa-shield-halved" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-black text-white">
                        Security & Data Privacy
                      </h2>
                      <p className="text-[11px] font-mono text-slate-400">
                        Identity protection, two-factor auth, and data privacy controls.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.05]">
                      <div>
                        <p className="text-xs font-mono font-bold text-white">Two-Factor Authentication (2FA)</p>
                        <p className="text-[10px] font-mono text-slate-400">Enforce second-factor security check</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTwoFactorToggle}
                        className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                          prefs.twoFactor ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/[0.05]">
                      <div>
                        <p className="text-xs font-mono font-bold text-white">Recruiter Discovery</p>
                        <p className="text-[10px] font-mono text-slate-400">Allow verified partner recruiters to find twin</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleVisibilityToggle}
                        className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                          prefs.profileVisibility ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <Link href="/profile" className="flex-1">
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider transition-all"
                        >
                          View Identity Profile
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                      >
                        Save All Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
