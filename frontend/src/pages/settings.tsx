import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getUserProfile } from '../services/auth';
import apiClient from '../services/apiClient';

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
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadProfile = async () => {
      try {
        const profile: any = await getUserProfile();
        setPrefs(p => ({
          ...p,
          twoFactor: profile.two_factor_enabled,
          profileVisibility: profile.profile_visibility,
          accountName: profile.username,
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
        applyThemePreference(parsed.appearanceTheme);
      } else {
        applyThemePreference('dark');
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
    } catch (err) {
      alert("Failed to update security settings.");
    }
  };

  const handleVisibilityToggle = async () => {
    const newVal = !prefs.profileVisibility;
    try {
      await apiClient.put('/users/profile/', { profile_visibility: newVal });
      setPrefs(p => ({ ...p, profileVisibility: newVal }));
    } catch (err) {
      alert("Failed to update privacy settings.");
    }
  };

  const persist = (next: SettingsPrefs) => {
    setPrefs(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    }
  };

  const applyThemePreference = (mode: 'system' | 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const chosen =
      mode === 'system'
        ? (window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches &&
          'dark') ||
        'light'
        : mode;
    if (chosen === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    const next = { ...prefs, appearanceTheme: mode };
    setPrefs(next);
    applyThemePreference(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.put('/users/profile/', {
        dream_job: prefs.dreamJob,
        // other fields if needed, but the current PUT handles first/last name separately
      });
      persist(prefs);
      applyThemePreference(prefs.appearanceTheme);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save profile updates.");
    }
  };

  const toggle = <K extends keyof SettingsPrefs>(key: K) => {
    const next = { ...prefs, [key]: !prefs[key] } as SettingsPrefs;
    persist(next);
  };

  return (
    <Layout>
      <Head>
        <title>Settings • AI Career Intelligence</title>
      </Head>
      <section className="space-y-8 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-20 py-4 bg-slate-900/80 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-indigo-400">
                System Configuration
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">
              Workspace & AI preferences
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Tailor the AI mentor's personality and adjust your ecosystem settings for a personalized career growth journey.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <i className="fa-solid fa-floppy-disk text-xs opacity-70" />
            Save preferences
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Account settings */}
            <div className="glass-panel p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <i className="fa-solid fa-circle-user text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">Account settings</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Display name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={prefs.accountName}
                      onChange={(e) =>
                        setPrefs((prev) => ({ ...prev, accountName: e.target.value }))
                      }
                      placeholder="Your name in the neural workspace..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                      <i className="fa-solid fa-pen-nib text-xs" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Dream Job Role</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={prefs.dreamJob}
                      onChange={(e) =>
                        setPrefs((prev) => ({ ...prev, dreamJob: e.target.value }))
                      }
                      placeholder="e.g. Senior Frontend Architect..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                      <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-500 font-medium">
                    The AI engine uses this to sync with real-time job market data.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Timezone</label>
                  <div className="relative group/select">
                    <select
                      value={prefs.accountTimezone}
                      onChange={(e) =>
                        setPrefs((prev) => ({ ...prev, accountTimezone: e.target.value }))
                      }
                      className="w-full grow px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="UTC">UTC (Universal Coordinated)</option>
                      <option value="America/New_York">Eastern Time (New York)</option>
                      <option value="Europe/London">Greenwich Mean Time (London)</option>
                      <option value="Asia/Kolkata">India Standard Time (Kolkata)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <i className="fa-solid fa-chevron-down text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI preferences */}
            <div className="glass-panel p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
                  <i className="fa-solid fa-brain text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">AI preferences</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Mentor tone</label>
                  <div className="flex gap-3 flex-wrap">
                    {(['neutral', 'friendly', 'direct'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() =>
                          setPrefs((prev) => ({ ...prev, aiTone: tone }))
                        }
                        className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${prefs.aiTone === tone
                          ? 'border-violet-500/50 bg-violet-500/20 text-violet-200 shadow-lg shadow-violet-500/10'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Response detail</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['concise', 'balanced', 'detailed'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setPrefs(p => ({ ...p, aiDetail: lvl }))}
                        className={`py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${prefs.aiDetail === lvl
                          ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-100 shadow-md'
                          : 'border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-panel p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <i className="fa-solid fa-bell text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">Communication</h2>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'notifyEmail', label: 'Weekly career digest', color: 'bg-emerald-500', icon: 'fa-paper-plane' },
                  { id: 'notifyProduct', label: 'Product updates', color: 'bg-indigo-500', icon: 'fa-rocket' },
                  { id: 'enableSmartAlerts', label: 'AI Smart Alerts', color: 'bg-violet-500', icon: 'fa-wand-magic-sparkles' },
                ].map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.color}/10 flex items-center justify-center opacity-70`}>
                          <i className={`fa-solid ${item.icon} text-xs text-slate-400`} />
                        </div>
                        <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(item.id as any)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${(prefs as any)[item.id] ? item.color : 'bg-slate-700'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ${(prefs as any)[item.id] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                    {item.id === 'enableSmartAlerts' && prefs.enableSmartAlerts && (
                      <div className="pl-11 mt-1">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Summary Frequency</label>
                        <div className="flex gap-2">
                          {(['instant', 'daily', 'weekly'] as const).map(f => (
                            <button
                              key={f}
                              onClick={() => setPrefs(p => ({ ...p, alertFrequency: f }))}
                              className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase transition-all ${prefs.alertFrequency === f ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Advanced AI Settings */}
                <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">Predictive Intelligence</label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">Enable Predictive Risks</span>
                        <button
                          type="button"
                          onClick={() => toggle('enablePredictive' as any)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${prefs.enablePredictive ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all ${prefs.enablePredictive ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">Behavioral Analysis</span>
                        <button
                          type="button"
                          onClick={() => toggle('enableBehavioral' as any)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${prefs.enableBehavioral ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all ${prefs.enableBehavioral ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">AI Engine Sensitivity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'balanced', 'aggressive'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setPrefs(p => ({ ...p, alertSensitivity: s }))}
                          className={`py-2 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${prefs.alertSensitivity === s ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-600 mt-2 italic">Aggressive mode identifies even minor deviations in your career trajectory.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {/* Appearance */}
            <div className="glass-panel p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                  <i className="fa-solid fa-palette text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">Visual Experience</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['system', 'light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleThemeChange(mode)}
                    className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all ${prefs.appearanceTheme === mode
                      ? 'border-sky-500/50 bg-sky-500/10 text-slate-100 ring-2 ring-sky-500/20'
                      : 'border-slate-800 bg-slate-950/50 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                      }`}
                  >
                    <i className={`fa-solid ${mode === 'dark' ? 'fa-moon' : mode === 'light' ? 'fa-sun' : 'fa-laptop-code'} text-lg`} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{mode}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-800/20 p-3 rounded-lg border border-slate-800/50">
                <i className="fa-solid fa-circle-info mr-2 opacity-70" />
                Dark mode is optimized for focus, using the same palette across dashboard, roadmap and resume analyzer.
              </p>
            </div>

            {/* Security */}
            <div className="glass-panel p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                  <i className="fa-solid fa-shield-halved text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">Security & Integrity</h2>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-200">Two-factor authentication</span>
                  <span className="text-[11px] text-slate-500 max-w-[200px]">Add an extra layer of protection to your account.</span>
                </div>
                <button
                  type="button"
                  onClick={handleTwoFactorToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${prefs.twoFactor ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${prefs.twoFactor ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Subscription / privacy */}
            <div className="glass-panel p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <i className="fa-solid fa-crown text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">Subscription & Privacy</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-400/20 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Active Plan</span>
                    <span className="text-lg font-bold text-slate-100">Starter</span>
                    <span className="text-[11px] text-slate-500 italic mt-0.5">Local demo active</span>
                  </div>
                  <button className="px-4 py-2 bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-600/20">
                    Upgrade soon
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Monthly Usage</span>
                    <span className="text-indigo-400">42%</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-slate-900 border border-slate-800 p-[1px] overflow-hidden">
                    <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400 w-[42%] animate-pulse" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/50 space-y-4">
                  <div className="flex items-center justify-between group cursor-help">
                    <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">Share anonymized data</span>
                    <button
                      type="button"
                      onClick={() => toggle('privacyTelemetry')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${prefs.privacyTelemetry ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${prefs.privacyTelemetry ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-800/50">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Identity Privacy</h3>

                    <div className="flex items-center justify-between p-3 mb-3 rounded-lg bg-slate-950 border border-slate-800/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-200">Public Profile Visibility</span>
                        <span className="text-[10px] text-slate-500">Allow others to see your skill progress</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleVisibilityToggle}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${prefs.profileVisibility ? 'bg-indigo-500' : 'bg-slate-700'
                          }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-300 ${prefs.profileVisibility ? 'translate-x-5.5' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const res: any = await apiClient.get('/users/export-data/');
                          const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `skillmirror_data_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (err) {
                          alert('Failed to download data.');
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
                    >
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Download My Data (JSON)</span>
                      <i className="fa-solid fa-download text-slate-500 group-hover:text-emerald-400 transition-colors"></i>
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to permanently delete your identity? This cannot be undone.')) {
                          try {
                            await apiClient.delete('/users/delete-account/');
                            window.location.href = '/login';
                          } catch (err) {
                            alert('Failed to delete account.');
                          }
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 mt-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/10 hover:border-rose-900/30 transition-all group"
                    >
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-rose-400">Permanently Delete Identity</span>
                      <i className="fa-solid fa-trash-can text-slate-500 group-hover:text-rose-500 transition-colors"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {saved && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
            <div className="px-6 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 text-slate-50 shadow-2xl shadow-indigo-900/50 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                <i className="fa-solid fa-check text-xs text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Preferences updated!</span>
                <span className="text-[11px] text-slate-400">Your configuration is saved locally.</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default SettingsPage;
