import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import apiClient from '../services/apiClient';
import withAuth from '../components/withAuth';
import { CyberPageShell, PageStatChip } from '../components/CyberPageShell';
import { SkeletonCard } from '../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../components/motion/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/motion/Toast';
import Link from 'next/link';

type Skill = {
  id: number;
  name: string;
  category: string;
  level: number;
  verified: boolean;
};

type Activity = {
  id: number;
  action_type: string;
  action_type_display: string;
  description: string;
  impact_score: number;
  timestamp: string;
};

function ProfileDashboard() {
  const { addToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend', level: 3 });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('all');
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    dream_job: '',
    experience_level: 'Junior',
    role: 'student'
  });

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/users/dashboard/');
      setData(res);
      if (res?.profile) {
        setEditForm({
          first_name: res.profile.first_name || '',
          last_name: res.profile.last_name || '',
          dream_job: res.profile.dream_job || '',
          experience_level: res.profile.experience_level || 'Junior',
          role: res.profile.role || 'student'
        });
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not retrieve career identity profile data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      await apiClient.post('/users/skills/', newSkill);
      setNewSkill({ name: '', category: 'Frontend', level: 3 });
      fetchDashboardData();
      addToast({
        type: 'success',
        title: 'Skill Vector Added',
        message: `Added ${newSkill.name} to your verified competencies.`
      });
    } catch (err) {
      console.error("Add Skill Error:", err);
      addToast({ type: 'error', title: 'Failed to add skill' });
    }
  };

  const handleDeleteSkill = async (id: number, skillName: string) => {
    try {
      await apiClient.delete(`/users/skills/${id}/`);
      fetchDashboardData();
      addToast({
        type: 'info',
        title: 'Skill Removed',
        message: `Removed ${skillName} from your profile.`
      });
    } catch (err) {
      console.error("Delete Skill Error:", err);
      addToast({ type: 'error', title: 'Failed to delete skill' });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await apiClient.put('/users/profile/', editForm);
      setShowEditProfile(false);
      fetchDashboardData();
      addToast({
        type: 'success',
        title: 'Career Identity Updated',
        message: 'Your profile changes have been synchronized.'
      });
    } catch (err) {
      console.error("Profile Update Error:", err);
      addToast({ type: 'error', title: 'Failed to update profile' });
    }
  };

  const handleTwoFactorToggle = async () => {
    const newVal = !data?.profile?.two_factor_enabled;
    try {
      await apiClient.put('/users/profile/', { two_factor_enabled: newVal });
      fetchDashboardData();
      addToast({
        type: 'info',
        title: newVal ? '2FA Enabled' : '2FA Disabled',
        message: newVal ? 'Two-Factor Authentication is now active.' : 'Two-Factor Authentication disabled.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update security settings' });
    }
  };

  const handleVisibilityToggle = async () => {
    const newVal = !data?.profile?.profile_visibility;
    try {
      await apiClient.put('/users/profile/', { profile_visibility: newVal });
      fetchDashboardData();
      addToast({
        type: 'info',
        title: newVal ? 'Profile Public' : 'Profile Private',
        message: newVal ? 'Profile is visible to recruiters.' : 'Profile is hidden from public indexing.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update privacy settings' });
    }
  };

  const handleExportData = async () => {
    try {
      const res: any = await apiClient.get('/users/export-data/');
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillmirror_identity_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast({ type: 'success', title: 'Data Export Complete' });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to download data' });
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to permanently delete your career identity? This action is irreversible.')) {
      try {
        await apiClient.delete('/users/delete-account/');
        window.location.href = '/login';
      } catch (err) {
        addToast({ type: 'error', title: 'Failed to delete account' });
      }
    }
  };

  const { profile, skills = [], activities = [], stats = {}, suggestions = [] } = data || {};

  const growthData = useMemo(() => {
    return [
      { name: 'Week 1', score: 45 },
      { name: 'Week 2', score: 52 },
      { name: 'Week 3', score: 48 },
      { name: 'Week 4', score: 64 },
      { name: 'Week 5', score: profile?.job_readiness_score || 78 },
    ];
  }, [profile]);

  const skillCategories = ['all', 'Frontend', 'Backend', 'Tools', 'Soft Skills'];

  const filteredSkills = useMemo(() => {
    if (activeSkillCategory === 'all') return skills;
    return skills.filter((s: Skill) => s.category === activeSkillCategory);
  }, [skills, activeSkillCategory]);

  return (
    <Layout>
      <Head>
        <title>Career Identity & Profile • SkillMirror OS</title>
        <meta name="description" content="Digital Career Twin, Job Readiness Index, Verified Skills, and Performance Analytics." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-09"
        section="IDENTITY & CAREER TWIN ENGINE"
        title="CAREER IDENTITY DASHBOARD"
        subtitle="Manage your digital twin persona, verified technical competencies, readiness score, and live career trajectory."
        badge="DIGITAL TWIN SYNCHRONIZED"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-pen-to-square text-xs" />
              <span>Edit Identity</span>
            </button>
            <Link href="/settings">
              <button className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-gear text-xs text-indigo-400" />
                <span>Settings</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Completeness" value={`${profile?.profile_completeness || 85}%`} icon="fa-shield-halved" color="cyan" />
            <PageStatChip label="Readiness Score" value={`${profile?.job_readiness_score || 78}%`} icon="fa-bolt" color="amber" />
            <PageStatChip label="Verified Skills" value={skills.length} icon="fa-layer-group" color="emerald" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {loading || !data ? (
          <div className="space-y-6">
            <SkeletonCard className="!h-[180px]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SkeletonCard className="!h-[100px]" />
              <SkeletonCard className="!h-[100px]" />
              <SkeletonCard className="!h-[100px]" />
              <SkeletonCard className="!h-[100px]" />
            </div>
          </div>
        ) : (
          <>
            {/* ── 1. Hero Digital Identity Persona Banner ── */}
            <ScrollReveal>
              <div className="relative rounded-3xl bg-gradient-to-b from-[#121624] via-[#0d101a] to-[#0a0c14] border border-cyan-500/25 p-6 sm:p-8 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/15 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  {/* Left: Avatar & Identity Details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="relative group/avatar shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border-2 border-cyan-500/40 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(0,217,255,0.2)] group-hover/avatar:border-cyan-400 transition-all">
                        <i className="fa-solid fa-user-astronaut text-4xl text-cyan-400/80" />
                      </div>
                      <button
                        onClick={() => setShowEditProfile(true)}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-cyan-500 border-2 border-slate-950 flex items-center justify-center text-xs text-slate-950 shadow-lg hover:scale-110 transition-transform"
                        title="Edit Avatar"
                      >
                        <i className="fa-solid fa-camera" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.username || 'Digital Twin'}
                        </h1>
                        <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-full text-[10px] font-mono font-black uppercase tracking-wider">
                          {profile?.market_readiness_level || 'READY'} TIER
                        </span>
                        <span className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-mono font-black uppercase tracking-wider">
                          {profile?.role === 'problem_owner' ? '🏢 Problem Owner' : profile?.role === 'evaluator' ? '📋 Evaluator' : '🎓 Student Developer'}
                        </span>
                      </div>

                      <p className="text-sm font-mono text-cyan-300/90 font-medium">
                        <i className="fa-solid fa-crosshairs text-cyan-400 mr-2" />
                        Target Role: <span className="text-white font-bold">{profile?.dream_job || 'Full-Stack Software Engineer'}</span>
                      </p>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/[0.06] text-xs font-mono text-slate-300">
                          <i className="fa-solid fa-briefcase text-slate-500 text-[11px]" />
                          <span>{profile?.experience_level || 'Junior'} Level</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/[0.06] text-xs font-mono text-slate-300">
                          <i className="fa-solid fa-layer-group text-slate-500 text-[11px]" />
                          <span>{skills.length} Verified Skills</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/[0.06] text-xs font-mono text-slate-300">
                          <i className="fa-solid fa-shield-check text-emerald-400 text-[11px]" />
                          <span>{profile?.profile_visibility ? 'Publicly Indexed' : 'Private'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Readiness Radar Score */}
                  <div className="flex flex-col items-center justify-center self-center lg:self-auto shrink-0 p-4 rounded-3xl bg-black/40 border border-white/[0.06]">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800/80" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={301}
                          strokeDashoffset={301 - (301 * (profile?.job_readiness_score || 78) / 100)}
                          className="text-cyan-400 transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-display font-black text-white">{profile?.job_readiness_score || 78}%</span>
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Readiness</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 mt-2">
                      ★ Market Top 15%
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ── 2. Four Key Performance Metric Cards ── */}
            <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Skills Mastered', val: stats?.skills_completed || skills.length, total: stats?.total_skills || 24, icon: 'fa-bolt', color: 'cyan', trend: '↑', delta: '+4 this month' },
                { label: 'Roadmap Velocity', val: stats?.roadmap_progress || 68, suffix: '%', icon: 'fa-route', color: 'indigo', trend: '↑', delta: 'Ahead of pace' },
                { label: 'Resume ATS Score', val: stats?.resume_score || 84, total: 100, icon: 'fa-file-shield', color: 'emerald', trend: '↑', delta: 'Grade A' },
                { label: 'AI Mentorship Sessions', val: stats?.chats_used || 18, icon: 'fa-comments', color: 'amber', trend: '↑', delta: 'Active' },
              ].map((s, i) => (
                <ScrollReveal stagger key={i}>
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${s.color}-500/10 text-${s.color}-400 border border-${s.color}-500/20 text-sm shadow-md`}>
                        <i className={`fa-solid ${s.icon}`} />
                      </div>
                      <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {s.delta}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl sm:text-3xl font-display font-black text-white">{s.val}{s.suffix}</span>
                        {s.total && <span className="text-xs font-mono text-slate-500">/ {s.total}</span>}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </StaggerChildren>

            {/* ── 3. Main Split View: Skills & Analytics vs Side Intelligence ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 Cols): AI Insights, Skills Management, Growth Chart */}
              <div className="lg:col-span-2 space-y-8">
                {/* AI Strategic Recommendation Capsule */}
                {suggestions && suggestions.length > 0 && (
                  <ScrollReveal>
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/60 border border-indigo-500/30 flex items-start gap-4 shadow-xl relative overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        <i className="fa-solid fa-brain-circuit" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                            AI COPILOT RECOMMENDATION
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-sans font-semibold text-slate-100 leading-relaxed">
                          {suggestions[0].text}
                        </p>
                        <div className="pt-1">
                          <Link href="/roadmap">
                            <button className="text-xs font-mono font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-2 transition-colors">
                              <span>Execute Target Vector</span>
                              <i className="fa-solid fa-arrow-right text-[10px]" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* Skill Management Matrix */}
                <ScrollReveal>
                  <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                          <i className="fa-solid fa-layer-group" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-display font-black text-white">
                            Verified Skills Matrix
                          </h2>
                          <p className="text-[11px] font-mono text-slate-400">
                            Competency benchmarks evaluated across resume, projects, and interviews.
                          </p>
                        </div>
                      </div>

                      <Link href="/resume">
                        <button className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                          <i className="fa-solid fa-file-import text-xs" />
                          <span>Import from Resume</span>
                        </button>
                      </Link>
                    </div>

                    {/* Add Skill Quick Form */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        Add New Competency Vector
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="e.g. Next.js, Docker, PyTorch..."
                            value={newSkill.name}
                            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={newSkill.category}
                            onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 outline-none"
                          >
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Tools">Tools & DevOps</option>
                            <option value="Soft Skills">Soft Skills</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <select
                            value={newSkill.level}
                            onChange={e => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 outline-none"
                          >
                            <option value={1}>Lvl 1 (Basic)</option>
                            <option value={2}>Lvl 2 (Working)</option>
                            <option value={3}>Lvl 3 (Proficient)</option>
                            <option value={4}>Lvl 4 (Advanced)</option>
                            <option value={5}>Lvl 5 (Mastery)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            onClick={handleAddSkill}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(0,217,255,0.3)] transition-all flex items-center justify-center gap-1.5"
                          >
                            <i className="fa-solid fa-plus text-[10px]" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {skillCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveSkillCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                            activeSkillCategory === cat
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,217,255,0.25)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat === 'all' ? `All Skills (${skills.length})` : cat}
                        </button>
                      ))}
                    </div>

                    {/* Skills Grid */}
                    {filteredSkills.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-xs font-mono text-slate-500">
                        No skills tracked in this category yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {filteredSkills.map((s: Skill) => (
                          <div
                            key={s.id}
                            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-white truncate">{s.name}</span>
                                {s.level >= 4 && (
                                  <span className="px-1.5 py-0.2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded text-[8px] font-mono font-black uppercase">
                                    ★ Top
                                  </span>
                                )}
                              </div>
                              {/* Level Bar */}
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${s.level * 20}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono font-black text-slate-400">Lvl {s.level}</span>
                              <button
                                onClick={() => handleDeleteSkill(s.id, s.name)}
                                className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all flex items-center justify-center text-xs"
                                title="Delete Skill"
                              >
                                <i className="fa-regular fa-trash-can" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>

                {/* Performance Analytics Chart */}
                <ScrollReveal>
                  <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-sm">
                          <i className="fa-solid fa-chart-line" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-display font-black text-white">
                            Trajectory & Readiness Velocity
                          </h2>
                          <p className="text-[11px] font-mono text-slate-400">
                            Multi-week career readiness progression telemetry.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthData}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="italic" axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0b0d13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px' }}
                              itemStyle={{ color: '#00D9FF', fontFamily: 'monospace' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#00D9FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full bg-slate-950/40 rounded-2xl animate-pulse" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] text-center">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Weekly Velocity</p>
                        <p className="text-lg font-display font-black text-emerald-400 mt-0.5">+18.4% Lift</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] text-center">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Resume Factor</p>
                        <p className="text-lg font-display font-black text-cyan-300 mt-0.5">4.8 / 5.0</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] text-center col-span-2 md:col-span-1">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Interview Accuracy</p>
                        <p className="text-lg font-display font-black text-indigo-300 mt-0.5">85% Match</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Column (1 Col): Profile Completeness, Live Audit Feed, Security */}
              <div className="space-y-8">
                {/* Profile Completeness Card */}
                <ScrollReveal>
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Profile Completeness
                      </h3>
                      <span className="text-xs font-mono font-black text-cyan-400">
                        {profile?.profile_completeness || 85}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,217,255,0.5)]"
                        style={{ width: `${profile?.profile_completeness || 85}%` }}
                      />
                    </div>
                    {(profile?.profile_completeness || 85) < 100 && (
                      <button
                        onClick={() => setShowEditProfile(true)}
                        className="w-full py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-mono font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Complete Remaining Fields
                      </button>
                    )}
                  </div>
                </ScrollReveal>

                {/* Live Activity Stream */}
                <ScrollReveal>
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
                      <i className="fa-solid fa-clock-rotate-left text-amber-400 text-xs" />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Live Activity Audit Feed
                      </h3>
                    </div>

                    <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                      {activities && activities.length > 0 ? (
                        activities.slice(0, 5).map((a: Activity) => (
                          <div key={a.id} className="relative pl-8">
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center z-10">
                              <div className={`w-2 h-2 rounded-full ${
                                a.action_type === 'skill' ? 'bg-cyan-400' :
                                a.action_type === 'roadmap' ? 'bg-indigo-400' :
                                a.action_type === 'resume' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-mono font-bold text-slate-200">{a.action_type_display}</p>
                                <span className="text-[9px] font-mono text-slate-500">
                                  {new Date(a.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] font-sans text-slate-400 leading-relaxed">{a.description}</p>
                              {a.impact_score > 0 && (
                                <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold rounded-md">
                                  +{a.impact_score} Readiness Score
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-mono text-slate-500 pl-8">No recent activity records.</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Quick Security & Privacy Controls */}
                <ScrollReveal>
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
                      <i className="fa-solid fa-shield-halved text-emerald-400 text-xs" />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Security & Controls
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/[0.05]">
                        <div>
                          <p className="text-xs font-mono font-bold text-white">2-Factor Auth (2FA)</p>
                          <p className="text-[10px] font-mono text-slate-400">Secure digital identity</p>
                        </div>
                        <button
                          onClick={handleTwoFactorToggle}
                          className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                            profile?.two_factor_enabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/[0.05]">
                        <div>
                          <p className="text-xs font-mono font-bold text-white">Identity Visibility</p>
                          <p className="text-[10px] font-mono text-slate-400">Public recruiter indexing</p>
                        </div>
                        <button
                          onClick={handleVisibilityToggle}
                          className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${
                            profile?.profile_visibility ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] space-y-2">
                        <button
                          onClick={handleExportData}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-white/[0.03] rounded-xl transition-all flex items-center gap-2"
                        >
                          <i className="fa-solid fa-download text-[11px] text-cyan-400" />
                          <span>Export Identity Telemetry (JSON)</span>
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all flex items-center gap-2"
                        >
                          <i className="fa-regular fa-trash-can text-[11px]" />
                          <span>Permanently Delete Identity</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Edit Career Identity Modal ── */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-7 max-w-md w-full rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-5 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-user-pen text-cyan-400 text-sm" />
                <h2 className="text-base font-display font-black text-white">Edit Career Identity</h2>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-slate-500 hover:text-white text-xs"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Target Dream Job</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={editForm.dream_job}
                  onChange={e => setEditForm({ ...editForm, dream_job: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active System Role</label>
                <select
                  value={editForm.role || 'student'}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold outline-none cursor-pointer"
                >
                  <option value="student">🎓 Student Developer</option>
                  <option value="problem_owner">🏢 Problem Owner / Requester</option>
                  <option value="evaluator">📋 Technical Evaluator</option>
                  <option value="admin">🛡️ Platform Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Experience Level</label>
                <select
                  value={editForm.experience_level}
                  onChange={e => setEditForm({ ...editForm, experience_level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 outline-none cursor-pointer"
                >
                  {['Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-xs font-mono font-bold text-white uppercase tracking-wider shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all"
              >
                Save Identity
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}

export default withAuth(ProfileDashboard);
