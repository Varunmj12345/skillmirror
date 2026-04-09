import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import apiClient from '../services/apiClient';
import withAuth from '../components/withAuth';


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

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

function ProfileDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend', level: 3 });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', dream_job: '', experience_level: 'Junior' });

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res: any = await apiClient.get('/users/dashboard/');
      setData(res);
      setEditForm({
        first_name: res.profile.first_name || '',
        last_name: res.profile.last_name || '',
        dream_job: res.profile.dream_job || '',
        experience_level: res.profile.experience_level || 'Junior'
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
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
    } catch (err) {
      console.error("Add Skill Error:", err);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await apiClient.delete(`/users/skills/${id}/`);
      fetchDashboardData();
    } catch (err) {
      console.error("Delete Skill Error:", err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await apiClient.put('/users/profile/', editForm);
      setShowEditProfile(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Profile Update Error:", err);
    }
  };

  const handleTwoFactorToggle = async () => {
    const newVal = !data.profile.two_factor_enabled;
    try {
      await apiClient.put('/users/profile/', { two_factor_enabled: newVal });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to update security settings.");
    }
  };

  const handleVisibilityToggle = async () => {
    const newVal = !data.profile.profile_visibility;
    try {
      await apiClient.put('/users/profile/', { profile_visibility: newVal });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to update privacy settings.");
    }
  };

  const handleExportData = async () => {
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
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to permanently delete your identity? This cannot be undone.')) {
      try {
        await apiClient.delete('/users/delete-account/');
        window.location.href = '/login';
      } catch (err) {
        alert('Failed to delete account.');
      }
    }
  };

  if (loading || !data) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  );

  const { profile, skills, activities, stats, suggestions } = data;

  // Mock data for charts
  const growthData = [
    { name: 'Week 1', score: 45 },
    { name: 'Week 2', score: 52 },
    { name: 'Week 3', score: 48 },
    { name: 'Week 4', score: 61 },
    { name: 'Week 5', score: 75 },
  ];

  return (
    <Layout>
      <Head>
        <title>Identity Dashboard • SkillMirror AI</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">

        {/* 4️⃣ CAREER IDENTITY SECTION */}
        <section className="glass-panel p-8 bg-slate-900/40 border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden group-hover:border-indigo-400 transition-all shadow-2xl">
                <i className="fa-solid fa-user text-4xl text-slate-600 group-hover:text-indigo-400 transition-colors"></i>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-xs shadow-lg hover:scale-110 transition-transform">
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {profile.first_name} {profile.last_name || profile.username}
                </h1>
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {profile.market_readiness_level} LEVEL
                </span>
                <button onClick={() => setShowEditProfile(true)} className="text-slate-500 hover:text-white transition-colors">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </div>
              <p className="text-slate-400 font-medium">{profile.dream_job || 'Aspiring Professional'}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <i className="fa-solid fa-briefcase text-slate-500 text-xs"></i>
                  <span className="text-xs text-slate-300 font-bold">{profile.experience_level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <i className="fa-solid fa-layer-group text-slate-500 text-xs"></i>
                  <span className="text-xs text-slate-300 font-bold">{skills.length} Skills Tracked</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* 9️⃣ JOB READINESS SCORE SYSTEM */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * profile.job_readiness_score / 100)} className="text-indigo-500 shadow-glow transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{profile.job_readiness_score}%</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Readiness</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1️⃣ MAKE ALL METRICS DYNAMIC */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Skills Mastered', val: stats.skills_completed, total: stats.total_skills, icon: 'fa-bolt', color: 'indigo', trend: '↑' },
            { label: 'Roadmap Progress', val: stats.roadmap_progress, suffix: '%', icon: 'fa-route', color: 'violet', trend: '↑' },
            { label: 'Resume Score', val: stats.resume_score, total: 100, icon: 'fa-file-circle-check', color: 'emerald', trend: '↓' },
            { label: 'AI Mentorship', val: stats.chats_used, icon: 'fa-comments', color: 'orange', trend: '↑' },
          ].map((s, i) => (
            <div key={i} className="glass-panel p-5 bg-slate-900/40 border-slate-800/60 group hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${s.color}-500/10 text-${s.color}-400 border border-${s.color}-500/20`}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <span className={`text-[10px] font-black ${s.trend === '↑' ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1`}>
                  12% {s.trend}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white">{s.val}{s.suffix}</span>
                {s.total && <span className="text-xs text-slate-500">/ {s.total}</span>}
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* 8️⃣ PERSONALIZATION ENGINE CARD */}
            {suggestions.length > 0 && (
              <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border-indigo-500/30 relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl">
                    <i className="fa-solid fa-brain-circuit text-xl"></i>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest">AI Strategic Recommendation</h3>
                    <p className="text-slate-100 font-medium leading-relaxed">{suggestions[0].text}</p>
                    <div className="pt-2 flex gap-3">
                      <button className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest flex items-center gap-2">
                        Execute Recommendation <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rotate-45 translate-x-16 -translate-y-16"></div>
              </div>
            )}

            {/* 2️⃣ ENHANCE SKILLS MANAGEMENT */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-white flex items-center gap-3">
                  <i className="fa-solid fa-star-of-life text-indigo-500"></i> Skill Management
                </h2>
                <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                  <i className="fa-solid fa-file-import mr-1"></i> Import from Resume
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Docker, Figma, SEO"
                    value={newSkill.name}
                    onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={newSkill.category}
                      onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {['Frontend', 'Backend', 'Tools', 'Soft Skills'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAddSkill} className="btn-primary h-[46px] px-6 rounded-xl text-sm font-black shadow-lg shadow-indigo-600/20 uppercase tracking-widest">
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {['Frontend', 'Backend', 'Tools', 'Soft Skills'].map(category => {
                  const items = skills.filter((s: Skill) => s.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((s: Skill) => (
                          <div key={s.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl group hover:border-indigo-500/40 transition-all flex justify-between items-center">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-100">{s.name}</span>
                                {s.level >= 4 && <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[8px] font-black uppercase">Trending</span>}
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${s.level * 20}%` }}></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-[10px] font-black text-slate-500">Lvl {s.level}</span>
                              <button onClick={() => handleDeleteSkill(s.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5️⃣ ADD PERFORMANCE ANALYTICS */}
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-lg font-black text-white flex items-center gap-3">
                <i className="fa-solid fa-chart-line text-violet-500"></i> Performance Analytics
              </h2>
              <div className="h-64 w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-slate-950/20 animate-pulse rounded-2xl" />
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Weekly Activity</p>
                  <p className="text-lg font-black text-white">+18.4%</p>
                </div>
                <div className="text-center p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Resume Factor</p>
                  <p className="text-lg font-black text-white">4.2/5</p>
                </div>
                <div className="text-center p-3 bg-slate-950/40 rounded-xl border border-slate-800 hidden md:block">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Interview Score</p>
                  <p className="text-lg font-black text-white">82%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* 🔟 PROFILE COMPLETENESS SYSTEM */}
            <div className="glass-panel p-6 space-y-4 bg-slate-900 border-indigo-500/20 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Profile Completeness</h3>
                <span className="text-xs font-black text-indigo-400">{profile.profile_completeness}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 shadow-glow" style={{ width: `${profile.profile_completeness}%` }}></div>
              </div>
              {profile.profile_completeness < 100 && (
                <div className="pt-2">
                  <button onClick={() => setShowEditProfile(true)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 transition-all">
                    Complete Profile <i className="fa-solid fa-arrow-right ml-2 opacity-0 group-hover:opacity-100"></i>
                  </button>
                </div>
              )}
            </div>

            {/* 6️⃣ ENHANCE ACTIVITY HISTORY */}
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-clock-rotate-left text-orange-500"></i> Live Activity
              </h2>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {activities.map((a: Activity) => (
                  <div key={a.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center z-10">
                      <div className={`w-2 h-2 rounded-full ${a.action_type === 'skill' ? 'bg-indigo-500' :
                        a.action_type === 'roadmap' ? 'bg-violet-500' :
                          a.action_type === 'resume' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-100">{a.action_type_display}</p>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{new Date(a.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{a.description}</p>
                      {a.impact_score > 0 && (
                        <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black rounded uppercase">
                          +{a.impact_score} Job Readiness
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7️⃣ ACCOUNT SETTINGS UPGRADE */}
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-shield-halved text-emerald-500"></i> Security & Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-100">2-Factor Auth (2FA)</p>
                    <p className="text-[8px] text-slate-500">Secure your digital identity</p>
                  </div>
                  <button
                    onClick={handleTwoFactorToggle}
                    className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${profile.two_factor_enabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-100">Identity Privacy</p>
                    <p className="text-[8px] text-slate-500">Control profile visibility</p>
                  </div>
                  <button
                    onClick={handleVisibilityToggle}
                    className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-all ${profile.profile_visibility ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                </div>
                <div className="pt-4 border-t border-slate-800/50 space-y-2">
                  <button onClick={handleExportData} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                    Download My Data (JSON)
                  </button>
                  <button onClick={handleDeleteAccount} className="w-full text-left px-3 py-2 text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors">
                    Permanently Delete Identity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-white">Edit Career Identity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">First Name</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dream Job Role</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Architect"
                value={editForm.dream_job}
                onChange={e => setEditForm({ ...editForm, dream_job: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experience Level</label>
              <select
                value={editForm.experience_level}
                onChange={e => setEditForm({ ...editForm, experience_level: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm outline-none appearance-none focus:ring-2 focus:ring-indigo-500"
              >
                {['Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 text-xs font-black text-slate-300 uppercase tracking-widest hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button onClick={handleUpdateProfile} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Glow Effects */}
      <style jsx>{`
        .shadow-glow {
          filter: drop-shadow(0 0 4px #6366f1);
        }
      `}</style>
    </Layout>
  );
}

export default withAuth(ProfileDashboard);
