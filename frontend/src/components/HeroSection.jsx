import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

const HeroSection = ({ user }) => (
  <section className="relative min-h-screen flex items-center overflow-hidden">
    {/* Background glows */}
    <div className="absolute inset-0 bg-[#020617]" />
    <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-700/20 blur-[140px] rounded-full pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-700/15 blur-[140px] rounded-full pointer-events-none" />
    {/* Vertical beam */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-indigo-500/40 via-purple-500/10 to-transparent pointer-events-none" />

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 w-full">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col lg:flex-row items-center gap-16"
      >
        {/* Left — copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-300">v2.0 · AI Engine Live</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.05] tracking-tight mb-7"
          >
            Build Your Career
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              with AI.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-10"
          >
            SkillMirror helps you analyze skills, build personalized roadmaps, and get job-ready — powered by real-time AI.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href={user ? '/dashboard' : '/signup'}>
              <button className="group flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-black text-sm tracking-wide shadow-xl shadow-indigo-600/25 hover:scale-105 transition-all duration-300">
                {user ? 'Open Dashboard' : 'Get Started Free'}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <Link href={user ? '/roadmap' : '/login'}>
              <button className="flex items-center gap-2.5 px-8 py-4 bg-white/5 border border-white/10 text-slate-200 rounded-xl font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Try AI Assistant
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
            {[
              { val: '50k+', label: 'Career Paths' },
              { val: '95%', label: 'ATS Score' },
              { val: '3×', label: 'Faster Growth' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center lg:text-left">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — floating dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: -8 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex-1 relative hidden lg:block"
        >
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent rounded-[2.5rem] blur-3xl scale-110" />
          <div className="relative bg-gradient-to-br from-white/8 to-white/2 border border-white/10 rounded-[2.5rem] p-5 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
            {/* Fake browser bar */}
            <div className="flex items-center gap-1.5 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="ml-4 flex-1 h-5 rounded-md bg-white/5 border border-white/5" />
            </div>
            {/* Fake UI */}
            <div className="bg-[#0f172a] rounded-[1.5rem] overflow-hidden border border-white/5 p-6 space-y-5">
              <div className="h-3 w-1/3 bg-indigo-500/30 rounded-full" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">📊</div>
                <div className="h-20 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-2xl">🚀</div>
                <div className="h-20 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>
                <div className="h-2.5 w-5/6 bg-slate-800 rounded-full" />
                <div className="h-2.5 w-2/3 bg-slate-800 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-lg" />
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg" />
              </div>
            </div>
          </div>
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-4 -left-6 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <p className="text-xs font-black text-white">Career Boost</p>
              <p className="text-[10px] text-emerald-400 font-semibold">+18% Readiness ↑</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
