import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import AIFeatureSection from '../components/AIFeatureSection';
import LandingFooter from '../components/LandingFooter';
import AICareerWidget from '../components/AICareerWidget';
import { StatCard } from '../components/ui/stat-card';
import { MarketChart } from '../components/ui/market-chart';
import { MasteryRanking } from '../components/ui/mastery-ranking';
import { SystemStatus } from '../components/ui/system-status';
import { TelemetryWidget } from '../components/ui/telemetry-widget';
import { LiveAlertsWidget } from '../components/ui/live-alerts-widget';
import { Bullet } from '../components/ui/bullet';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardContent } from '../components/ui/card';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>SkillMirror OS | Neural Career Intelligence Platform</title>
        <meta
          name="description"
          content="SkillMirror OS – Autonomous AI Career Intelligence, Real-Time Skill Gap Quantification, and ATS Optimization."
        />
      </Head>

      <div className="bg-background text-foreground selection:bg-cyan-500/30 selection:text-white min-h-screen font-mono">
        {/* Cyber-Industrial Navigation Bar */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-[#0b0d13]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl'
              : 'bg-transparent border-b border-white/[0.03]'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Brand Logo & Telemetry Status */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-display font-black text-xs shadow-[0_0_12px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
                    SM
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-white tracking-widest uppercase text-sm">
                      SkillMirror <span className="text-cyan-400">OS</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 hidden sm:block">
                      v2.4-NEURAL CORE
                    </span>
                  </div>
                </div>
              </Link>

              {/* Status Pill */}
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-card border border-white/[0.06] text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>MESH: ONLINE</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              <a href="#telemetry" className="hover:text-cyan-300 transition-colors">
                [Telemetry]
              </a>
              <a href="#features" className="hover:text-cyan-300 transition-colors">
                [Modules]
              </a>
              <a href="#ai-modes" className="hover:text-cyan-300 transition-colors">
                [AI Modes]
              </a>
              <Link href="/dashboard">
                <a className="hover:text-white transition-colors">[Command Hub]</a>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!user && (
                <Link href="/login">
                  <a className="hidden sm:block text-xs font-mono font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors px-3 py-2">
                    Sign In
                  </a>
                </Link>
              )}
              <Link href={user ? '/dashboard' : '/signup'}>
                <a className="sm-btn-primary !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider">
                  <span>{user ? 'Open OS' : 'Get Started'}</span>
                  <i className="fa-solid fa-chevron-right text-[10px]" />
                </a>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <HeroSection user={user} />

        {/* Live Cyber Telemetry Overview Section (inspired by dashboard-m-o-n-k-y) */}
        <section id="telemetry" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Bullet variant="cyan" />
              <div>
                <h2 className="sm-section-heading">LIVE INTELLIGENCE TELEMETRY</h2>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Synchronized node telemetry across market benchmarks & skill vectors
                </p>
              </div>
            </div>
            <Badge variant="outline-cyan">REFRESH: 1s</Badge>
          </div>

          {/* 1. Stat Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="READINESS INDEX"
              value="94.2%"
              description="WEEKLY TARGET MATCH"
              intent="positive"
              direction="up"
              tag="TOP 5%"
            />
            <StatCard
              label="SKILL DELTA GAPS"
              value="3 GAPS"
              description="CRITICAL PATH DEFICITS"
              intent="negative"
              direction="down"
              tag="AI AUDIT"
            />
            <StatCard
              label="MARKET SALARY DELTA"
              value="+$42k"
              description="PREDICTED COMPENSATION LIFT"
              intent="cyan"
              direction="up"
              tag="REAL-TIME"
            />
          </div>

          {/* 2. Interactive Market Trajectory Chart */}
          <div className="mb-8">
            <MarketChart />
          </div>

          {/* 3. 2-Column Grid: Rankings & System Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MasteryRanking />
            <SystemStatus />
          </div>

          {/* 4. Atmospheric Telemetry Row (Clock/Noise Widget + Live Alerts + Quick Copilot) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TelemetryWidget />
            <div className="md:col-span-2">
              <LiveAlertsWidget />
            </div>
          </div>
        </section>

        {/* Architecture Modules Matrix */}
        <div id="features">
          <FeatureCards />
        </div>

        {/* AI Modes Interactive Console */}
        <div id="ai-modes">
          <AIFeatureSection />
        </div>

        {/* Terminal Footer */}
        <LandingFooter />
      </div>

      {!user ? null : <AICareerWidget />}
    </>
  );
};

export default Home;
