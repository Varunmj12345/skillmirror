import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';
import { fetchDashboard } from '../services/dashboard';

// Modular Components
import MetricCard from '../components/dashboard/MetricCard';
import XPSystem from '../components/dashboard/XPSystem';
import AIStrategy from '../components/dashboard/AIStrategy';
import Benchmarking from '../components/dashboard/Benchmarking';
import GrowthForecast from '../components/dashboard/GrowthForecast';
import SkillHeatmap from '../components/dashboard/SkillHeatmap';
import ModuleSummaries from '../components/dashboard/ModuleSummaries';
import ConsistencyScore from '../components/dashboard/ConsistencyScore';
import AchievementBadges from '../components/dashboard/AchievementBadges';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboard();
      setData(res);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[75vh] gap-8">
          <div className="relative">
            <div className="w-20 h-20 border-[3px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-[3px] border-violet-500/10 border-b-violet-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Intelligence Hub</p>
            <p className="text-xs font-bold text-slate-500 animate-pulse tracking-widest">Synchronizing career neural pathways...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="max-w-md w-full px-10 py-12 rounded-[2.5rem] bg-[#0F172A] border border-red-500/20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl" />
            </div>
            <h2 className="text-xl font-black text-white mb-3">Intelligence Hub Offline</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-10">{error || 'Unable to establish secure connection with career logic engine.'}</p>
            <button 
              onClick={loadData} 
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-red-500/20 transition-all active:scale-95"
            >
              Retry Synchronization
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard • SkillMirror Intelligence</title>
      </Head>

      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-12 sm:flex-row sm:items-end sm:justify-between sm-page-enter">
        <div className="relative">
          {/* Spotlight background behind text */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 blur-[80px] pointer-events-none" />
          
          <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-black mb-3 flex items-center gap-3">
            <span className="w-10 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
            Career Intelligence Summary
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Executive <span className="text-indigo-500">Dashboard</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden lg:block mr-4 border-r border-white/5 pr-6">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Global IQ Ranking</p>
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm font-black text-white">Top 12%</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <Link href="/profile">
            <button className="group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all shadow-2xl active:scale-95">
              <span>Manage Identity</span>
              <i className="fa-solid fa-arrow-right text-[8px] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* 1. Metric Cards Grid */}
      <section className="grid gap-6 mb-12 lg:grid-cols-5 sm-page-enter [animation-delay:100ms]">
        <MetricCard
          label="Career Readiness"
          value={data.job_readiness_score}
          icon="fa-bullseye"
          color="indigo"
          trend={{ value: 4.2, isUp: true }}
        />
        <MetricCard
          label="Job Match Score"
          value={data.summaries.job_intelligence.top_match}
          icon="fa-briefcase"
          color="violet"
        />
        <MetricCard
          label="Career Risk Index"
          value={data.career_risk_index}
          icon="fa-triangle-exclamation"
          color={data.career_risk_index > 40 ? 'rose' : 'emerald'}
          suffix="%"
        />
        <MetricCard
          label="Learning Volume"
          value={data.learning_consistency}
          icon="fa-bolt-lightning"
          color="amber"
          suffix="%"
        />
        <MetricCard
          label="Platform Progress"
          value={data.profile_completion}
          icon="fa-stairs"
          color="sky"
        />
      </section>

      {/* 2. Main Content Layout */}
      <div className="grid gap-10 lg:grid-cols-3 mb-16 sm-page-enter [animation-delay:200ms]">
        <div className="lg:col-span-2 space-y-10">
          {/* XP & Consistency Row */}
          <div className="grid md:grid-cols-2 gap-10">
            <XPSystem
              level={data.xp_system.level}
              totalXp={data.xp_system.total_xp}
              progress={data.xp_system.progress}
              nextLevelAt={data.xp_system.next_level_at}
              username={data.username}
            />
            <ConsistencyScore score={data.learning_consistency} />
          </div>

          <AIStrategy strategy={data.ai_strategy} />

          {/* Module Grid Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Integrated Neural Modules</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-6" />
            </div>
            <ModuleSummaries summaries={data.summaries} />
          </div>
        </div>

        {/* 3. Sidebar Highlights */}
        <div className="space-y-10">
          <GrowthForecast data={data.growth_forecast} />

          <Benchmarking
            userScore={data.benchmarking.user_score}
            marketAvg={data.benchmarking.market_avg}
            percentile={data.benchmarking.percentile}
          />

          <SkillHeatmap skills={data.skill_heatmap} />

          <AchievementBadges badges={data.badges} />
        </div>
      </div>

      {/* Market Warning Banner */}
      <div className="glass-panel p-10 bg-[#0F172A]/40 border-white/5 sm-page-enter [animation-delay:300ms] sm-card">
        <div className="flex flex-col lg:flex-row gap-10 items-center justify-between relative overflow-hidden">
          {/* Subtle amber pulse in background */}
          <div className="absolute top-1/2 left-0 w-32 h-32 bg-amber-500/5 blur-[80px] -translate-y-1/2 -ml-16 pointer-events-none" />
          
          <div className="max-w-xl">
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">Market Volatility Warning</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              The demand for <span className="text-indigo-400 font-black">{data.dream_job}</span> roles is projected to shift by <span className="text-amber-400 font-black">18%</span> due to emerging AI paradigms. Advancing your <span className="text-indigo-300 underline decoration-indigo-500/30 underline-offset-4">{data.career_recommendations?.[0] || 'core technical'}</span> proficiency is now a high-priority strategic requirement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {data.career_recommendations.map((skill: string) => (
              <span key={skill} className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);

