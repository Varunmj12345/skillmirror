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
import { motion } from 'framer-motion';
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
        title: 'Profile Updated',
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
        <title>Profile & Portfolio • SkillMirror OS</title>
        <meta name="description" content="Digital Career Twin, Job Readiness Index, Verified Skills, and Performance Analytics." />
      </Head>

      <CyberPageShell
        moduleCode="SYS-00"
        section="ACCOUNT & PROFILE"
        title="PROFILE & PORTFOLIO"
        subtitle="Manage your career profile, verified technical competencies, readiness score, and live career trajectory."
        badge="PROFILE SYNCHRONIZED"
        badgeVariant="outline-amber"
        bulletVariant="amber"
        glowColor="amber"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-amber-400"
            >
              <i className="fa-solid fa-pen-to-square text-xs" />
              <span>Edit Identity</span>
            </button>
            <Link href="/settings">
              <button className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-gear text-xs text-amber-400" />
                <span>Settings</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Completeness" value={`${profile?.profile_completeness || 85}%`} icon="fa-shield-halved" color="amber" />
            <PageStatChip label="Readiness Score" value={`${profile?.job_readiness_score || 78}%`} icon="fa-bolt" color="amber" />
            <PageStatChip label="Verified Skills" value={skills.length} icon="fa-layer-group" color="zinc" />
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
              <div className="border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 relative">
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  {/* Left: Avatar & Identity Details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="relative group/avatar shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-950 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        <i className="fa-solid fa-user-astronaut text-4xl text-amber-400/80" />
                      </div>
                      <button
                        onClick={() => setShowEditProfile(true)}
                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-400 border border-zinc-950 flex items-center justify-center text-[10px] text-zinc-950 shadow-md hover:scale-105 transition-transform"
                        title="Edit Avatar"
                      >
                        <i className="fa-solid fa-camera" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-mono font-bold text-zinc-100 tracking-tight">
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.username || 'Digital Twin'}
                        </h1>
                        <span className="px-2 py-0.5 border border-amber-400/40 bg-amber-400/10 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                          [ {profile?.market_readiness_level || 'READY'} TIER ]
                        </span>
                        <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                          {profile?.role === 'admin' ? '🛡️ Platform Admin' : '🎓 Verified Developer'}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-zinc-400">
                        <span className="text-amber-400 mr-2">&gt; TARGET:</span>
                        <span className="text-zinc-100 font-bold">{profile?.dream_job || 'Full-Stack Software Engineer'}</span>
                      </p>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                          <i className="fa-solid fa-briefcase text-zinc-500 text-[10px]" />
                          <span>{profile?.experience_level || 'Junior'} Level</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                          <i className="fa-solid fa-layer-group text-zinc-500 text-[10px]" />
                          <span>{skills.length} Verified Skills</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                          <i className="fa-solid fa-shield-halved text-amber-400 text-[10px]" />
                          <span>{profile?.profile_visibility ? 'Public Index' : 'Private'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Circular Readiness Radar Score */}
                  <div className="flex flex-col items-center justify-center self-center lg:self-auto shrink-0 p-4 border border-zinc-800 bg-zinc-950">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#f59e0b"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={251}
                          strokeDashoffset={251 - (251 * (profile?.job_readiness_score || 78) / 100)}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-mono font-bold text-zinc-100">{profile?.job_readiness_score || 78}%</span>
                        <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Score</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 mt-2">
                      TOP 15% TIER
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ── 2. Four Key Performance Metric Cards ── */}
            <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Skills Mastered', val: stats?.skills_completed || skills.length, total: stats?.total_skills || 24, icon: 'fa-bolt', delta: '+4 this month' },
                { label: 'Roadmap Velocity', val: stats?.roadmap_progress || 68, suffix: '%', icon: 'fa-route', delta: 'Ahead of pace' },
                { label: 'Resume ATS Score', val: stats?.resume_score || 84, total: 100, icon: 'fa-file-shield', delta: 'Grade A' },
                { label: 'AI Sessions', val: stats?.chats_used || 18, icon: 'fa-comments', delta: 'Active' },
              ].map((s, i) => (
                <ScrollReveal stagger key={i}>
                  <div className="p-4 border border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 flex items-center justify-center bg-zinc-950 text-amber-400 border border-zinc-800 text-xs">
                        <i className={`fa-solid ${s.icon}`} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20">
                        {s.delta}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{s.label}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-mono font-bold text-zinc-100">{s.val}{s.suffix}</span>
                        {s.total && <span className="text-xs font-mono text-zinc-500">/ {s.total}</span>}
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
                    <div className="p-5 border border-amber-500/30 bg-amber-500/5 flex items-start gap-4 relative">
                      <div className="w-9 h-9 border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 text-sm shrink-0">
                        <i className="fa-solid fa-brain" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                            [ AI STRATEGIC RECOMMENDATION ]
                          </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                          {suggestions[0].text}
                        </p>
                        <div className="pt-1">
                          <Link href="/roadmap">
                            <button className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline uppercase tracking-wider flex items-center gap-2 transition-colors">
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
                  <div className="p-6 border border-zinc-800 bg-zinc-900/90 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs">
                          <i className="fa-solid fa-layer-group" />
                        </div>
                        <div>
                          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                            Verified Skills Matrix
                          </h2>
                          <p className="text-[11px] font-mono text-zinc-400">
                            Competency benchmarks evaluated across resume, projects, and assessments.
                          </p>
                        </div>
                      </div>

                      <Link href="/resume">
                        <button className="text-xs font-mono font-bold text-amber-400 hover:underline uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                          <i className="fa-solid fa-file-import text-xs" />
                          <span>Import from Resume</span>
                        </button>
                      </Link>
                    </div>

                    {/* Add Skill Quick Form */}
                    <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Add New Competency Vector
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="e.g. Next.js, Docker, PyTorch..."
                            value={newSkill.name}
                            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={newSkill.category}
                            onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 outline-none focus:border-amber-400/60"
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
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 outline-none focus:border-amber-400/60"
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
                            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-amber-400"
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
                          className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                            activeSkillCategory === cat
                              ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {cat === 'all' ? `[ ALL SKILLS (${skills.length}) ]` : `[ ${cat.toUpperCase()} ]`}
                        </button>
                      ))}
                    </div>

                    {/* Skills Grid */}
                    {filteredSkills.length === 0 ? (
                      <div className="p-8 text-center bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-500">
                        No skills tracked in this category yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredSkills.map((s: Skill) => (
                          <div
                            key={s.id}
                            className="p-3.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-zinc-200 truncate">{s.name}</span>
                                {s.level >= 4 && (
                                  <span className="px-1.5 py-0.2 border border-amber-400/40 bg-amber-400/10 text-amber-400 text-[8px] font-mono font-bold uppercase">
                                    ★ TOP
                                  </span>
                                )}
                              </div>
                              {/* Level Bar */}
                              <div className="w-full bg-zinc-850 h-1.5 overflow-hidden border border-zinc-800">
                                <div
                                  className="h-full bg-amber-400 transition-all duration-500"
                                  style={{ width: `${s.level * 20}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono font-bold text-zinc-400">LVL {s.level}</span>
                              <button
                                onClick={() => handleDeleteSkill(s.id, s.name)}
                                className="w-6 h-6 bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs"
                                title="Delete Skill"
                              >
                                <i className="fa-regular fa-trash-can text-[10px]" />
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
                  <div className="p-6 border border-zinc-800 bg-zinc-900/90 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-amber-400/20 bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs">
                          <i className="fa-solid fa-chart-line" />
                        </div>
                        <div>
                          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
                            Trajectory & Readiness Velocity
                          </h2>
                          <p className="text-[11px] font-mono text-zinc-400">
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
                              <linearGradient id="colorScoreAmber" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontStyle="italic" axisLine={false} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px', color: '#f4f4f5', fontFamily: 'monospace' }}
                              itemStyle={{ color: '#f59e0b', fontFamily: 'monospace' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorScoreAmber)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full bg-zinc-950 animate-pulse" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-zinc-950 border border-zinc-800 text-center">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">Weekly Velocity</p>
                        <p className="text-base font-mono font-bold text-amber-400 mt-0.5">+18.4% Lift</p>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-800 text-center">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">Resume Factor</p>
                        <p className="text-base font-mono font-bold text-zinc-100 mt-0.5">4.8 / 5.0</p>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-800 text-center col-span-2 md:col-span-1">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">Interview Match</p>
                        <p className="text-base font-mono font-bold text-zinc-100 mt-0.5">85% Match</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Column (1 Col): Profile Completeness, Live Audit Feed, Security */}
              <div className="space-y-8">
                {/* Profile Completeness Card */}
                <ScrollReveal>
                  <div className="p-6 border border-zinc-800 bg-zinc-900/90 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Profile Completeness
                      </h3>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {profile?.profile_completeness || 85}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 border border-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-1000"
                        style={{ width: `${profile?.profile_completeness || 85}%` }}
                      />
                    </div>
                    {(profile?.profile_completeness || 85) < 100 && (
                      <button
                        onClick={() => setShowEditProfile(true)}
                        className="w-full py-2 bg-amber-400/10 border border-amber-400/40 text-amber-400 hover:bg-amber-400/20 font-mono font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Complete Remaining Fields
                      </button>
                    )}
                  </div>
                </ScrollReveal>

                {/* Live Activity Stream */}
                <ScrollReveal>
                  <div className="p-6 border border-zinc-800 bg-zinc-900/90 space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                      <i className="fa-solid fa-clock-rotate-left text-amber-400 text-xs" />
                      <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Live Activity Audit Feed
                      </h3>
                    </div>

                    <div className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800">
                      {activities && activities.length > 0 ? (
                        activities.slice(0, 5).map((a: Activity) => (
                          <div key={a.id} className="relative pl-6">
                            <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-zinc-950 border border-zinc-700 flex items-center justify-center z-10">
                              <div className="w-1.5 h-1.5 bg-amber-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-mono font-bold text-zinc-200">{a.action_type_display}</p>
                                <span className="text-[9px] font-mono text-zinc-500">
                                  {new Date(a.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">{a.description}</p>
                              {a.impact_score > 0 && (
                                <span className="inline-block px-1.5 py-0.2 bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-mono font-bold">
                                  +{a.impact_score} Readiness Score
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-mono text-zinc-500 pl-6">No recent activity records.</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Quick Security & Privacy Controls */}
                <ScrollReveal>
                  <div className="p-6 border border-zinc-800 bg-zinc-900/90 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                      <i className="fa-solid fa-shield-halved text-amber-400 text-xs" />
                      <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                        Security & Controls
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800">
                        <div>
                          <p className="text-xs font-mono font-bold text-zinc-200">2-Factor Auth (2FA)</p>
                          <p className="text-[10px] font-mono text-zinc-500">Secure digital identity</p>
                        </div>
                        <button
                          onClick={handleTwoFactorToggle}
                          className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                            profile?.two_factor_enabled
                              ? 'border-amber-400 bg-amber-400 text-zinc-950'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                          }`}
                        >
                          {profile?.two_factor_enabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800">
                        <div>
                          <p className="text-xs font-mono font-bold text-zinc-200">Identity Visibility</p>
                          <p className="text-[10px] font-mono text-zinc-500">Public recruiter indexing</p>
                        </div>
                        <button
                          onClick={handleVisibilityToggle}
                          className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                            profile?.profile_visibility
                              ? 'border-amber-400 bg-amber-400 text-zinc-950'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                          }`}
                        >
                          {profile?.profile_visibility ? 'PUBLIC' : 'PRIVATE'}
                        </button>
                      </div>

                      <div className="pt-3 border-t border-zinc-800 space-y-2">
                        <button
                          onClick={handleExportData}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 transition-all flex items-center gap-2"
                        >
                          <i className="fa-solid fa-download text-[11px] text-amber-400" />
                          <span>Export Identity Telemetry (JSON)</span>
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full text-left px-3 py-2 text-xs font-mono font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-2"
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

      {/* ── Edit Profile Modal ── */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 sm:p-7 max-w-md w-full bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-user-pen text-amber-400 text-sm" />
                <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Edit Profile</h2>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-mono"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 outline-none focus:border-amber-400/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Target Dream Job</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={editForm.dream_job}
                  onChange={e => setEditForm({ ...editForm, dream_job: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 outline-none focus:border-amber-400/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Active System Role</label>
                <select
                  value={editForm.role || 'student'}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono font-bold outline-none cursor-pointer focus:border-amber-400/60"
                >
                  <option value="student">🎓 Verified Developer / Candidate</option>
                  <option value="admin">🛡️ Platform Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Experience Level</label>
                <select
                  value={editForm.experience_level}
                  onChange={e => setEditForm({ ...editForm, experience_level: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 outline-none cursor-pointer focus:border-amber-400/60"
                >
                  {['Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider transition-all border border-amber-400"
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
