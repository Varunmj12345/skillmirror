import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '📊',
    title: 'Intelligence Hub',
    desc: 'Advanced AI analysis of your profile compared against 50k+ career paths.',
    accent: 'from-indigo-500/10 to-indigo-500/5',
    border: 'border-indigo-500/20',
    glow: 'group-hover:shadow-indigo-500/10',
    badge: 'Core',
    badgeColor: 'bg-indigo-500/20 text-indigo-300',
  },
  {
    icon: '🗺️',
    title: 'Path Discovery',
    desc: 'AI-generated roadmaps that adapt in real-time as you hit milestones.',
    accent: 'from-violet-500/10 to-violet-500/5',
    border: 'border-violet-500/20',
    glow: 'group-hover:shadow-violet-500/10',
    badge: 'Smart',
    badgeColor: 'bg-violet-500/20 text-violet-300',
  },
  {
    icon: '📄',
    title: 'Resume Engine',
    desc: 'Upload DOCX/PDF and get an ATS-optimized resume that scores 95%+.',
    accent: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/10',
    badge: 'ATS Ready',
    badgeColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    icon: '🎤',
    title: 'Mock Interview',
    desc: 'Practice with AI interviewers across technical, behavioral, and HR modes.',
    accent: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20',
    glow: 'group-hover:shadow-purple-500/10',
    badge: 'Live AI',
    badgeColor: 'bg-purple-500/20 text-purple-300',
  },
  {
    icon: '📈',
    title: 'Market Readiness',
    desc: 'Real-time job demand tracking and salary benchmarks for your skill stack.',
    accent: 'from-sky-500/10 to-sky-500/5',
    border: 'border-sky-500/20',
    glow: 'group-hover:shadow-sky-500/10',
    badge: 'Live Data',
    badgeColor: 'bg-sky-500/20 text-sky-300',
  },
  {
    icon: '🔔',
    title: 'Smart Alerts',
    desc: 'Instant notifications when job opportunities match your exact profile.',
    accent: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/10',
    badge: 'Instant',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FeatureCards = () => (
  <section className="py-28 relative bg-[#020617]">
    {/* Subtle grid overlay */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
      }}
    />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-black uppercase tracking-[0.25em] mb-5">
          Platform Features
        </span>
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          Everything You Need to{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Level Up
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Six AI-powered modules working together to automate your career growth from Day 1.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className={`group relative p-6 rounded-2xl bg-gradient-to-br ${f.accent} border ${f.border} shadow-lg hover:shadow-xl ${f.glow} transition-all duration-300 cursor-default overflow-hidden`}
          >
            {/* Corner glow on hover */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-4 -translate-y-4" />

            <div className="flex items-start justify-between mb-5">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${f.badgeColor}`}>
                {f.badge}
              </span>
            </div>

            <h3 className="text-base font-black text-white mb-2 tracking-tight">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 group-hover:text-indigo-400 transition-colors duration-300">
              <span>Explore</span>
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureCards;
