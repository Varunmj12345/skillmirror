import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import Layout from '../components/Layout';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import AIFeatureSection from '../components/AIFeatureSection';
import LandingFooter from '../components/LandingFooter';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      <Head>
        <title>SkillMirror | Build Your Career with AI</title>
        <meta name="description" content="SkillMirror helps you analyze skills, build personalized roadmaps, and get job-ready with real-time AI." />
      </Head>

      <div className="bg-[#020617] text-slate-200 selection:bg-indigo-500/30">

        {/* Sticky landing navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-[#020617]/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/30'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xs">SM</div>
              <span className="font-black text-white tracking-widest uppercase text-sm">SkillMirror</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#ai-modes" className="hover:text-white transition-colors">AI Assistant</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            </div>
            <div className="flex items-center gap-3">
              {!user && (
                <a href="/login" className="hidden sm:block text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                  Sign In
                </a>
              )}
              <a
                href={user ? '/dashboard' : '/signup'}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all duration-300"
              >
                {user ? 'Dashboard' : 'Get Started'}
              </a>
            </div>
          </div>
        </motion.nav>

        {/* Hero */}
        <HeroSection user={user} />

        {/* Social proof bar */}
        <div className="max-w-7xl mx-auto px-6 py-10 border-y border-white/5">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">
            Trusted by developers from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-30 hover:opacity-60 transition-opacity duration-700">
            {['Google', 'Microsoft', 'Meta', 'Amazon', 'Stripe', 'Vercel'].map((co) => (
              <span key={co} className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">{co}</span>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div id="features">
          <FeatureCards />
        </div>

        {/* AI mode section */}
        <div id="ai-modes">
          <AIFeatureSection />
        </div>

        {/* Stats */}
        <section className="py-20 bg-[#020617] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: '50k+', label: 'Career Paths', icon: '📊' },
                { val: '95%', label: 'ATS Score Avg', icon: '📄' },
                { val: '3×', label: 'Faster Growth', icon: '🚀' },
                { val: '10k+', label: 'Active Users', icon: '🎯' },
              ].map(({ val, label, icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{icon}</div>
                  <p className="text-3xl font-black text-white mb-1">{val}</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <LandingFooter />
      </div>
    </Layout>
  );
};

export default Home;
