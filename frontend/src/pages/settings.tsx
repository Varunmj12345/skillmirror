import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getUserProfile } from '../services/auth';
import apiClient from '../services/apiClient';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';
import { ScrollReveal } from '../components/motion/ScrollReveal';
import { useToast } from '../components/motion/Toast';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

type SettingsPrefs = {
  accountName: string;
  accountTimezone: string;
  aiTone: 'neutral' | 'friendly' | 'direct';
  aiDetail: 'concise' | 'balanced' | 'detailed';
  notifyEmail: boolean;
  notifyProduct: boolean;
  notifyTips: boolean;
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
  const { effectiveTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'account' | 'theme' | 'ai' | 'alerts' | 'security'>('all');
  const [prefs, setPrefs] = useState<SettingsPrefs>({
    accountName: '',
    accountTimezone: 'UTC',
    aiTone: 'neutral',
    aiDetail: 'balanced',
    notifyEmail: true,
    notifyProduct: true,
    notifyTips: false,
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
  const [, setLoading] = useState(true);

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
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const toggle = (key: keyof SettingsPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persist(next);
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put('/users/profile/', {
        username: prefs.accountName,
        dream_job: prefs.dreamJob,
        two_factor_enabled: prefs.twoFactor,
        profile_visibility: prefs.profileVisibility
      });
      persist(prefs);
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your system preferences and AI copilot configurations are fully synchronized.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error Saving Settings',
        message: 'Could not sync settings with the server. Local state was preserved.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Settings', icon: 'fa-layer-group' },
    { id: 'account', label: 'Identity & Target', icon: 'fa-id-card' },
    { id: 'theme', label: 'Theme & Display', icon: 'fa-palette' },
    { id: 'ai', label: 'AI Copilot Tuning', icon: 'fa-brain' },
    { id: 'alerts', label: 'Signals & Telemetry', icon: 'fa-bell' },
    { id: 'security', label: 'Security & Privacy', icon: 'fa-shield-halved' }
  ];

  return (
    <Layout>
      <Head>
        <title>System Settings & AI Preferences • SkillMirror OS</title>
        <meta name="description" content="Workspace preferences, AI copilot tuning, theme switcher, and security configuration." />
      </Head>

      <CyberPageShell
        moduleCode="SYS-01"
        section="SYSTEM PREFERENCES & CONTROL MATRIX"
        title="SYSTEM CONFIGURATION & PREFERENCES"
        subtitle="Calibrate autonomous AI heuristics, manage signal telemetry, configure 2FA security, and tune system ergonomics."
        badge="SYSTEM NOMINAL"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-amber-400"
          >
            <i className={`fa-solid fa-floppy-disk text-xs ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'SYNCING...' : 'SAVE SETTINGS'}</span>
          </button>
        }
        stats={
          <>
            <PageStatChip label="Visual Theme" value={effectiveTheme.toUpperCase()} icon="fa-palette" color="amber" />
            <PageStatChip label="AI Personality" value={prefs.aiTone.toUpperCase()} icon="fa-brain" color="zinc" />
            <PageStatChip label="Alert Sensitivity" value={prefs.alertSensitivity.toUpperCase()} icon="fa-bolt" color="amber" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* Skydda Category Switcher */}
        <ScrollReveal>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none p-1.5 border border-zinc-800 bg-zinc-900/90">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
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
                <div className="p-6 sm:p-7 border border-zinc-800 bg-zinc-900/90 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-id-card" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Profile & Target Role
                      </h2>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Configures target benchmark models and job match parameters.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Display Handle
                      </label>
                      <input
                        type="text"
                        value={prefs.accountName}
                        onChange={(e) => setPrefs(prev => ({ ...prev, accountName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 transition-all"
                        placeholder="Your username handle..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Target Dream Job Role
                      </label>
                      <input
                        type="text"
                        value={prefs.dreamJob}
                        onChange={(e) => setPrefs(prev => ({ ...prev, dreamJob: e.target.value }))}
                        placeholder="e.g. Senior Full-Stack AI Engineer..."
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60 transition-all"
                      />
                      <p className="text-[10px] font-mono text-zinc-500">
                        The AI engine continuously indexes real-time hiring trends matching this specific position.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Workspace Timezone
                      </label>
                      <select
                        value={prefs.accountTimezone}
                        onChange={(e) => setPrefs(prev => ({ ...prev, accountTimezone: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 outline-none cursor-pointer focus:border-amber-400/60"
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

            {/* ── 2. Visual Theme & Display Mode ── */}
            {(activeTab === 'all' || activeTab === 'theme') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 border border-zinc-800 bg-zinc-900/90 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-palette" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Visual Theme & Display Mode
                      </h2>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Calibrate terminal presentation contrast and interface scheme.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950 border border-zinc-800 gap-4">
                      <div>
                        <p className="text-xs font-mono font-bold text-zinc-100 uppercase">Active Interface Theme</p>
                        <p className="text-[10px] font-mono text-zinc-500">Current workspace display mode</p>
                      </div>
                      <ThemeToggle variant="pill" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={(e) => setTheme('dark', e)}
                        className={`p-4 border text-left transition-all ${
                          effectiveTheme === 'dark'
                            ? 'border-amber-400 bg-amber-400/5 text-zinc-100'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <i className="fa-solid fa-moon text-sm text-amber-400" />
                          {effectiveTheme === 'dark' && (
                            <span className="w-1.5 h-1.5 bg-amber-400" />
                          )}
                        </div>
                        <div className="text-xs font-mono font-bold uppercase tracking-wider">Dark Sentinel</div>
                        <div className="text-[10px] font-mono text-zinc-500">High-contrast tactical zinc</div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => setTheme('light', e)}
                        className={`p-4 border text-left transition-all ${
                          effectiveTheme === 'light'
                            ? 'border-amber-400 bg-amber-400/5 text-zinc-100'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <i className="fa-solid fa-sun text-sm text-zinc-400" />
                          {effectiveTheme === 'light' && (
                            <span className="w-1.5 h-1.5 bg-amber-400" />
                          )}
                        </div>
                        <div className="text-xs font-mono font-bold uppercase tracking-wider">Clean Day</div>
                        <div className="text-[10px] font-mono text-zinc-500">High ambient contrast</div>
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* ── 3. AI Copilot Personality Tuning ── */}
            {(activeTab === 'all' || activeTab === 'ai') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 border border-zinc-800 bg-zinc-900/90 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-brain" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        AI Copilot Heuristics Tuning
                      </h2>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Adjust mentorship tone, feedback depth, and evaluation strictness.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Copilot Mentorship Tone
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['neutral', 'friendly', 'direct'] as const).map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => setPrefs(prev => ({ ...prev, aiTone: tone }))}
                            className={`py-2 px-3 border text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                              prefs.aiTone === tone
                                ? 'border-amber-400/60 bg-amber-400/10 text-amber-400'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Analysis & Synthesis Depth
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['concise', 'balanced', 'detailed'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setPrefs(p => ({ ...p, aiDetail: lvl }))}
                            className={`py-2 px-3 border text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                              prefs.aiDetail === lvl
                                ? 'border-amber-400/60 bg-amber-400/10 text-amber-400'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
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
            {/* ── 4. Signals & Smart Alerts Intelligence ── */}
            {(activeTab === 'all' || activeTab === 'alerts') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 border border-zinc-800 bg-zinc-900/90 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-satellite-dish" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Signals & Predictive Alerts Engine
                      </h2>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Configure predictive hiring spike detection and drift warnings.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800">
                      <div>
                        <p className="text-xs font-mono font-bold text-zinc-200 uppercase">Autonomous Smart Signals</p>
                        <p className="text-[10px] font-mono text-zinc-500">Evaluate hiring surges & skill drift</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle('enableSmartAlerts')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                          prefs.enableSmartAlerts
                            ? 'border-amber-400 bg-amber-400 text-zinc-950'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {prefs.enableSmartAlerts ? 'ACTIVE' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800">
                      <div>
                        <p className="text-xs font-mono font-bold text-zinc-200 uppercase">Predictive Risk Analysis</p>
                        <p className="text-[10px] font-mono text-zinc-500">Warn before competency gaps widen</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle('enablePredictive')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                          prefs.enablePredictive
                            ? 'border-amber-400 bg-amber-400 text-zinc-950'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {prefs.enablePredictive ? 'ACTIVE' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800">
                      <div>
                        <p className="text-xs font-mono font-bold text-zinc-200 uppercase">Behavioral Consistency</p>
                        <p className="text-[10px] font-mono text-zinc-500">Momentum drop & stagnation alerts</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle('enableBehavioral')}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                          prefs.enableBehavioral
                            ? 'border-amber-400 bg-amber-400 text-zinc-950'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {prefs.enableBehavioral ? 'ACTIVE' : 'OFF'}
                      </button>
                    </div>

                    {/* Alert Sensitivity */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Signal Engine Sensitivity
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'balanced', 'aggressive'] as const).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setPrefs(p => ({ ...p, alertSensitivity: s }))}
                            className={`py-2 border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                              prefs.alertSensitivity === s
                                ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
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

            {/* ── 5. Security & Privacy Matrix ── */}
            {(activeTab === 'all' || activeTab === 'security') && (
              <ScrollReveal>
                <div className="p-6 sm:p-7 border border-zinc-800 bg-zinc-900/90 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-shield-halved" />
                    </div>
                    <div>
                      <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Security & Data Privacy
                      </h2>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Identity protection, two-factor auth, and data privacy controls.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800">
                      <div>
                        <p className="text-xs font-mono font-bold text-zinc-200 uppercase">Two-Factor Authentication (2FA)</p>
                        <p className="text-[10px] font-mono text-zinc-500">Enforce second-factor credential checks</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTwoFactorToggle}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                          prefs.twoFactor
                            ? 'border-amber-400 bg-amber-400 text-zinc-950'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {prefs.twoFactor ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800">
                      <div>
                        <p className="text-xs font-mono font-bold text-zinc-200 uppercase">Recruiter Discovery</p>
                        <p className="text-[10px] font-mono text-zinc-500">Allow verified partner recruiters to find twin</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleVisibilityToggle}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                          prefs.profileVisibility
                            ? 'border-amber-400 bg-amber-400 text-zinc-950'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {prefs.profileVisibility ? 'PUBLIC' : 'PRIVATE'}
                      </button>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row gap-3">
                      <Link href="/profile" className="flex-1">
                        <button
                          type="button"
                          className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider transition-all"
                        >
                          View Identity Profile
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-2.5 bg-amber-400/10 border border-amber-400/40 text-amber-400 hover:bg-amber-400/20 text-xs font-mono font-bold uppercase tracking-wider transition-all"
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
