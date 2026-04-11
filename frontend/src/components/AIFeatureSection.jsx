import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const modes = [
  {
    id: 'career',
    icon: '💼',
    label: 'Career',
    title: 'Career Advisor',
    desc: 'Get personalized career roadmaps, salary benchmarks, and strategic guidance aligned to your dream role.',
    color: 'from-indigo-600 to-blue-600',
    glow: 'shadow-indigo-500/25',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    textColor: 'text-indigo-300',
    items: ['Personalized roadmap', 'Salary benchmarks', 'Role gap analysis'],
  },
  {
    id: 'learning',
    icon: '📚',
    label: 'Learning',
    title: 'Learning Coach',
    desc: 'Curated skill-building paths with YouTube resources, project ideas, and adaptive difficulty levels.',
    color: 'from-violet-600 to-purple-600',
    glow: 'shadow-violet-500/25',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    textColor: 'text-violet-300',
    items: ['Adaptive curriculum', 'YouTube resources', 'Progress tracking'],
  },
  {
    id: 'quick',
    icon: '⚡',
    label: 'Quick',
    title: 'Quick Insights',
    desc: 'Instant answers to career questions, quick skill assessments, and rapid job-market snapshots.',
    color: 'from-blue-600 to-cyan-600',
    glow: 'shadow-blue-500/25',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    textColor: 'text-blue-300',
    items: ['Instant answers', 'Market snapshot', 'Quick skill check'],
  },
];

const AIFeatureSection = () => {
  const [active, setActive] = useState('career');
  const current = modes.find((m) => m.id === active);

  return (
    <section className="py-28 bg-gradient-to-b from-[#020617] via-[#080e24] to-[#020617] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-700/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[11px] font-black uppercase tracking-[0.25em] mb-5">
            AI Assistant
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            SkillMirror{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              AI Assistant
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Three intelligent modes — one powerful assistant. Switch context instantly.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mode selector */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {modes.map((mode) => {
              const isActive = mode.id === active;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActive(mode.id)}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 text-left group ${
                    isActive
                      ? `bg-gradient-to-r ${mode.color} border-transparent shadow-lg ${mode.glow}`
                      : `bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/14`
                  }`}
                >
                  <span className={`text-3xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {mode.icon}
                  </span>
                  <div className="flex-1">
                    <p className={`font-black text-base mb-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {mode.label} Mode
                    </p>
                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                      {mode.desc.slice(0, 60)}…
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                  )}
                </button>
              );
            })}

            <Link href="/dashboard">
              <button className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Open AI Assistant
              </button>
            </Link>
          </motion.div>

          {/* Detail card */}
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className={`p-8 rounded-3xl border ${current.border} ${current.bg} relative overflow-hidden`}>
              {/* Glow */}
              <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${current.color} blur-3xl opacity-20 pointer-events-none`} />

              <div className="text-5xl mb-6">{current.icon}</div>
              <h3 className="text-2xl font-black text-white mb-3">{current.title}</h3>
              <p className="text-slate-300 leading-relaxed mb-6">{current.desc}</p>

              <ul className="space-y-3">
                {current.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatureSection;
