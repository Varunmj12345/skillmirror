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
import SkillRadar from '../components/dashboard/SkillRadar';
import ModuleSummaries from '../components/dashboard/ModuleSummaries';
import AIInsightPanel from '../components/dashboard/AIInsightPanel';
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
          <div className="w-16 h-16 border-2 border-brand-neural/20 border-t-brand-neural rounded-full animate-spin" />
          <p className="sm-nano animate-pulse">Synchronizing Neural Pathways...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="sm-glass p-12 text-center max-w-md rounded-[2.5rem]">
             <div className="text-4xl mb-6">📡</div>
             <h2 className="sm-h2 text-2xl">Network Latency Detected</h2>
             <p className="sm-subhead text-sm mb-8">Re-establishing handshake with the Career Intelligence Engine...</p>
             <button onClick={loadData} className="sm-btn-primary w-full py-3 text-xs uppercase tracking-widest font-black">Retry Sync</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Intelligence Hub • SkillMirror</title>
      </Head>

      {/* 1. Header & Identity */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm-page-enter">
        <div>
          <div className="sm-nano text-brand-neural mb-3 opacity-60">Career Intelligence Terminal</div>
          <h1 className="sm-h1 !text-5xl lg:!text-6xl">Command Center</h1>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right border-r border-white/5 pr-8 hidden sm:block">
              <p className="sm-nano !text-[8px] opacity-40">Global IQ Percentile</p>
              <p className="text-xl font-black text-white">Top 8.4% <span className="text-brand-emerald text-xs">↑</span></p>
           </div>
           <Link href="/profile">
              <button className="sm-glass px-6 py-3.5 rounded-2xl flex items-center gap-3 group text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                 <span>Identity Verified</span>
                 <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform" />
              </button>
           </Link>
        </div>
      </div>

      {/* 2. Primary KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16 sm-page-enter [animation-delay:100ms]">
        <MetricCard label="Readiness" value={data.job_readiness_score} icon="fa-bullseye" color="indigo" />
        <MetricCard label="Market Match" value={92} icon="fa-chart-network" color="cyan" />
        <MetricCard label="Risk Index" value={data.career_risk_index} icon="fa-bolt" color="orange" suffix="%" />
        <MetricCard label="XP Level" value={data.xp_system.level} icon="fa-trophy" color="amber" />
        <MetricCard label="Trust Score" value={98} icon="fa-shield-check" color="emerald" suffix="%" />
      </section>

      {/* 3. The "Brain" Layer: Intelligence & Insights */}
      <div className="grid lg:grid-cols-12 gap-10 mb-20 sm-page-enter [animation-delay:200ms]">
        <div className="lg:col-span-8">
           <AIStrategy strategy={data.ai_strategy} />
           <div className="mt-10">
              <XPSystem
                level={data.xp_system.level}
                totalXp={data.xp_system.total_xp}
                progress={data.xp_system.progress}
                nextLevelAt={data.xp_system.next_level_at}
                username={data.username}
              />
           </div>
        </div>
        <div className="lg:col-span-4">
           <AIInsightPanel />
        </div>
      </div>

      {/* 4. Visualization & Growth */}
      <div className="grid lg:grid-cols-3 gap-10 mb-20 sm-page-enter [animation-delay:300ms]">
         <div className="lg:col-span-2 sm-glass p-8 rounded-[2rem]">
            <div className="sm-nano mb-6 opacity-60">Mastery Heatmap</div>
            <SkillRadar skills={data.skill_heatmap} />
         </div>
         <div className="space-y-10">
            <GrowthForecast data={data.growth_forecast} />
            <AchievementBadges badges={data.badges} />
         </div>
      </div>

      {/* 5. Integrated Modules Bento */}
      <section className="sm-page-enter [animation-delay:400ms]">
        <div className="flex items-center gap-4 mb-8">
           <h3 className="sm-nano">Neural Network Modules</h3>
           <div className="h-px flex-1 bg-white/5" />
        </div>
        <ModuleSummaries summaries={data.summaries} />
      </section>

    </Layout>
  );
};

export default withAuth(Dashboard);
