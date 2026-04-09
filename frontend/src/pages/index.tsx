import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation Variants - Fixed Typing
  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer: Variants = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>SkillMirror | AI-Powered Career Intelligence & Intelligence Engine</title>
        <meta name="description" content="Propel your career with AI-driven skill gaps, personalized roadmaps, and next-gen resume optimization." />
      </Head>

      <div className="bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
        {/* Fixed Beam Light */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1px] h-screen bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent z-0 opacity-20" />

        {/* Hero Section - Ultra Premium */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full spotlight-bg pointer-events-none" />

          {/* Floating Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="flex flex-col lg:flex-row items-center gap-16"
            >
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">v2.0 AI Engine Alpha</span>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight mb-8"
                >
                  Master Your <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-mesh text-glow-premium">
                    Professional
                  </span> <br />
                  Destiny.
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10"
                >
                  SkillMirror is the intelligence layer for your career. We scan, analyze, and automate your path to senior roles using field-proven AI models.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                  <Link href={user ? "/dashboard" : "/signup"}>
                    <button className="btn-premium px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 group shadow-2xl shadow-indigo-600/20">
                      {user ? 'Launch Dashboard' : 'Get Started Free'}
                      <i className="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  {!user && (
                    <Link href="/login">
                      <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                        Sign In
                      </button>
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Floating Mockup Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: -10 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 relative perspective-2000 hidden lg:block"
              >
                <div className="glass-card p-4 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform -rotate-12 translate-x-10 animate-float">
                  <div className="bg-[#0f172a] rounded-[1.8rem] overflow-hidden border border-white/5 aspect-[16/10] flex flex-col">
                    <div className="h-8 bg-slate-900/80 border-b border-white/5 flex items-center px-4 gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                      <div className="h-4 w-1/3 bg-slate-800 rounded-lg animate-pulse" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-xl" />
                        <div className="h-24 bg-purple-500/10 border border-purple-500/20 rounded-xl" />
                        <div className="h-24 bg-slate-800 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-800 rounded" />
                        <div className="h-2 w-5/6 bg-slate-800 rounded" />
                        <div className="h-2 w-4/6 bg-slate-800 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl animate-pulse" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-y border-white/5 bg-white/[0.01]">
          <div className="flex flex-wrap items-center justify-between gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
            <span className="text-sm font-black uppercase tracking-[0.4em]">Stripe</span>
            <span className="text-sm font-black uppercase tracking-[0.4em]">Vercel</span>
            <span className="text-sm font-black uppercase tracking-[0.4em]">Linear</span>
            <span className="text-sm font-black uppercase tracking-[0.4em]">Arc</span>
            <span className="text-sm font-black uppercase tracking-[0.4em]">GitHub</span>
          </div>
        </div>

        {/* Modern Features Bento Grid */}
        <section className="py-24 lg:py-48 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 text-center lg:text-left"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Hyper-Growth Infrastructure</h2>
              <p className="text-slate-500 uppercase font-black tracking-widest text-[10px]">Everything you need to automate your career climb</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 auto-rows-[220px]">
              {/* Skill Analysis - Large */}
              <BentoItem
                className="md:col-span-2 md:row-span-2"
                icon="📊"
                title="Intelligence Hub"
                desc="Advanced vector analysis of your professional profile compared against 50k+ successful career paths."
                accent="rgba(99, 102, 241, 0.4)"
              />
              {/* Roadmaps */}
              <BentoItem
                className="md:col-span-2 md:row-span-1"
                icon="🗺️"
                title="Path Discovery"
                desc="AI-generated roadmaps that adapt instantly as you complete milestones."
                accent="rgba(168, 85, 247, 0.4)"
              />
              {/* Resume */}
              <BentoItem
                className="md:col-span-1 md:row-span-1"
                icon="📄"
                title="Custom Templates"
                desc="Upload your own DOCX/PDF and auto-fill with precision."
              />
              {/* ATS */}
              <BentoItem
                className="md:col-span-1 md:row-span-1"
                icon="🤖"
                title="ATS Bypass"
                desc="Score 95%+ every single time."
              />
              {/* Analytics */}
              <BentoItem
                className="md:col-span-2 md:row-span-1"
                icon="📈"
                title="Market Readiness"
                desc="Real-time demand tracking for your specific skill combination."
              />
            </div>
          </div>
        </section>

        {/* Final CTA - Ultra Clean */}
        <section className="py-24 lg:py-48 overflow-hidden bg-black relative">
          <div className="absolute inset-0 spotlight-bg opacity-50" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight">
                Own your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">Future.</span>
              </h2>
              <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
                Experience the gold standard in career intelligence. Deploy your profile on SkillMirror today.
              </p>
              <Link href="/signup">
                <button className="btn-premium px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all">
                  Deploy Profile
                </button>
              </Link>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-500/5 to-transparent" />
        </section>

        <footer className="py-12 border-t border-white/5 bg-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black italic text-white">SM</div>
              <span className="text-sm font-black tracking-widest uppercase">SkillMirror</span>
            </div>
            <div className="flex gap-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              © 2026 Engineered by Antigravity
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

const BentoItem: React.FC<{
  className?: string;
  icon: string;
  title: string;
  desc: string;
  accent?: string
}> = ({ className, icon, title, desc, accent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`glass-card p-8 rounded-[2rem] group flex flex-col justify-end ${className}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${accent || 'rgba(255,255,255,0.05)'} 0%, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">{icon}</div>
        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>

      <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
        <i className="fa-solid fa-plus text-xs" />
      </div>
    </motion.div>
  );
};

export default Home;
