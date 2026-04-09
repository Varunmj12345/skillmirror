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
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 animate-pulse">Syncing Career Intelligence Hub...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="px-8 py-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-center shadow-2xl">
            <i className="fa-solid fa-triangle-exclamation text-red-400 text-3xl mb-4" />
            <p className="text-sm font-bold text-red-200">{error || 'Intelligence Hub Offline'}</p>
            <button onClick={loadData} className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-black uppercase rounded-xl transition-all">Retry Synchronization</button>
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
      <div className="flex flex-col gap-4 mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black mb-1.5 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-indigo-500/30" />
            Intelligence Summary
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">Executive Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block mr-2 border-r border-slate-800 pr-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Global Ranking</p>
            <p className="text-sm font-bold text-white">Top 12% Worldwide</p>
          </div>
          <Link href="/profile">
            <button className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all shadow-xl">
              Manage Identity
            </button>
          </Link>
        </div>
      </div>

      {/* 1. Metric Cards Row (Career Risk, Readiness, etc.) */}
      <section className="grid gap-6 mb-10 md:grid-cols-2 lg:grid-cols-5">
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
          label="Learning Consistency"
          value={data.learning_consistency}
          icon="fa-bolt-lightning"
          color="amber"
          suffix="%"
        />
        <MetricCard
          label="Roadmap Progress"
          value={data.profile_completion}
          icon="fa-stairs"
          color="sky"
        />
      </section>

      {/* 2. Intelligence Layer & Primary Content */}
      <div className="grid gap-8 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2 space-y-8">
          {/* XP System & AI Strategy Top Row */}
          <div className="grid md:grid-cols-2 gap-8">
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

          {/* Module Summary Widgets Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Integrated Intelligence Modules</h2>
              <div className="h-[1px] flex-1 bg-slate-800/60 mx-4" />
            </div>
            <ModuleSummaries summaries={data.summaries} />
          </div>
        </div>

        {/* 3. Right Sidebar Highlights */}
        <div className="space-y-8">
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

      {/* Market Intelligence / Recommendations Footer */}
      <div className="glass-panel p-8 bg-slate-900/30 border-slate-800/40">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Market Volatility Warning</h3>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              The demand for <span className="text-indigo-400 font-bold">{data.dream_job}</span> roles is projected to shift by 18% due to emerging AI paradigms. Advancing your {data.career_recommendations?.[0] || 'core technical'} proficiency is now a strategic priority.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {data.career_recommendations.map((skill: string) => (
              <span key={skill} className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-widest">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);
