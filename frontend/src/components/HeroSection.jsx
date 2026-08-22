import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';
import { TVNoise } from './ui/tv-noise';

const HeroSection = ({ user }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background pt-24 pb-16 px-4 sm:px-6">
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial Gradient Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00d9ff]" />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-300">
              NEURAL CAREER OPERATING SYSTEM • v2.4
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.05] text-white max-w-4xl mb-6">
            ENGINEER YOUR CAREER{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              WITH AI PRECISION
            </span>
          </h1>

          {/* Subheading */}
          <p className="sm-body-text text-base sm:text-lg max-w-2xl text-slate-400 mb-10 leading-relaxed font-mono">
            Continuous skill gap quantification, automated roadmap synthesis, and real-time market readiness analytics designed for technical leaders.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Link href={user ? '/dashboard' : '/signup'}>
              <button className="sm-btn-primary w-full sm:w-auto !py-4 !px-8 text-sm group">
                <span>{user ? 'INITIALIZE WORKSPACE' : 'DEPLOY PROFILE FREE'}</span>
                <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/roadmap">
              <button className="sm-btn-neon w-full sm:w-auto !py-4 !px-8 text-sm">
                <i className="fa-solid fa-terminal text-xs" />
                <span>EXPLORE ROADMAP ENGINE</span>
              </button>
            </Link>
          </div>

          {/* Cyber Terminal Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-4xl mx-auto rounded-xl p-1.5 bg-pop border border-white/[0.1] shadow-2xl relative group overflow-hidden"
          >
            <TVNoise opacity={0.03} intensity={0.15} speed={45} />
            <div className="rounded-lg bg-card border border-white/[0.04] p-5 relative z-20">
              {/* Terminal Top Window Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06] text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  <span className="text-slate-500 ml-2 font-mono">telemetry://career-iq-stream</span>
                </div>
                <Badge variant="outline-cyan">NODE: LIVE</Badge>
              </div>

              {/* Terminal Inner Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-3.5 rounded bg-pop/60 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                    <span>Target Role</span>
                    <Bullet variant="cyan" size="sm" />
                  </div>
                  <div className="text-lg font-display font-bold text-white">Full-Stack AI Architect</div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-1">Tier: Senior L5+</div>
                </div>

                <div className="p-3.5 rounded bg-pop/60 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                    <span>Readiness Delta</span>
                    <Bullet variant="success" size="sm" />
                  </div>
                  <div className="text-lg font-display font-bold text-emerald-400">92.4% Match</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Gap: System Design, AWS</div>
                </div>

                <div className="p-3.5 rounded bg-pop/60 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                    <span>Market Trajectory</span>
                    <Bullet variant="warning" size="sm" />
                  </div>
                  <div className="text-lg font-display font-bold text-white">$165,000 / yr</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-1">▲ +24% Year-over-Year</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
