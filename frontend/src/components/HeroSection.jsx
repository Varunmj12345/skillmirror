import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSection = ({ user }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden bg-brand-obsidian pb-20">
      {/* 1. Immersive Neural Grid Backdrop */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="black" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <mask id="mask">
              <rect width="100%" height="100%" fill="url(#fade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" mask="url(#mask)" />
        </svg>
      </div>

      {/* 2. Floating Neural Nodes (Animated) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-brand-neural/20 blur-3xl"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 3. Main Content Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Sub-Nano Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="sm-nano flex items-center gap-3 px-5 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span>Neural Engine v2.0 Ready</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-400">Enterprise Grade</span>
          </motion.div>

          {/* Headline - The "WOW" Factor */}
          <h1 className="sm-h1 mb-8 perspective-header">
            Predict Your Next
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neural via-brand-aurora to-pink-500 animate-shimmer-fast inline-block">
              Career Leap.
            </span>
          </h1>

          {/* Subheading */}
          <p className="sm-subhead text-center text-xl mb-12 opacity-80">
            Stop guessing. Start improving. SkillMirror's AI calculates your market-readiness 
            in real-time and builds a structured path to your dream salary.
          </p>

          {/* Primary Action */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-20">
            <Link href={user ? '/dashboard' : '/signup'}>
              <button className="sm-btn-primary group text-lg flex items-center gap-3">
                {user ? 'Open Workspace' : 'Get Started for Free'}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <Link href="/roadmap">
              <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Compare Market Rates
              </button>
            </Link>
          </div>

          {/* 4. High-Fidelity 3D Portal Mockup */}
          <motion.div
            style={{ y: y1 }}
            className="w-full max-w-5xl mx-auto realtive perspective-2000 group"
          >
            <div className="relative transform-gpu transition-all duration-700 group-hover:rotate-x-2">
              {/* Outer Glow */}
              <div className="absolute inset-x-0 -top-10 -bottom-10 bg-brand-neural/20 blur-[120px] rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
              
              <div className="sm-glass p-1.5 rounded-[2.5rem] shadow-2xl">
                <div className="bg-brand-obsidian/90 rounded-[2rem] overflow-hidden border border-white/5">
                  {/* Fake UI Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-slate-500">
                      skillmirror.ai/dashboard
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                  </div>

                  {/* Mockup Dashboard Content */}
                  <div className="p-8 grid grid-cols-12 gap-6 min-h-[400px]">
                    <div className="col-span-8 space-y-6">
                      <div className="h-40 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-r from-brand-neural/10 to-transparent" />
                         {/* Animated Scan Line */}
                         <motion.div 
                           animate={{ x: ['0%', '200%'] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                           className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-brand-neural/20 to-transparent skew-x-12"
                         />
                         <div className="relative p-6">
                            <div className="flex gap-4 mb-4">
                               <div className="w-12 h-12 rounded-xl bg-brand-neural/20" />
                               <div className="space-y-2 flex-1 pt-2">
                                  <div className="h-2 w-1/4 bg-slate-700 rounded-full" />
                                  <div className="h-2 w-1/2 bg-slate-800 rounded-full" />
                               </div>
                            </div>
                            <div className="flex items-end gap-2">
                               <div className="h-12 w-6 bg-brand-neural/40 rounded-t-lg" />
                               <div className="h-20 w-6 bg-brand-neural/60 rounded-t-lg" />
                               <div className="h-16 w-6 bg-brand-neural/40 rounded-t-lg" />
                               <div className="h-24 w-6 bg-brand-neural/80 rounded-t-lg" />
                               <div className="h-10 w-6 bg-brand-neural/20 rounded-t-lg" />
                            </div>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="h-32 bg-white/5 rounded-3xl border border-white/5 p-6 space-y-3">
                           <div className="w-10 h-10 rounded-full bg-brand-emerald/20 flex items-center justify-center text-brand-emerald">⚡</div>
                           <div className="h-2 w-full bg-slate-800 rounded-full" />
                           <div className="h-2 w-2/3 bg-slate-800 rounded-full" />
                        </div>
                        <div className="h-32 bg-white/5 rounded-3xl border border-white/5 p-6 space-y-3">
                           <div className="w-10 h-10 rounded-full bg-brand-aurora/20 flex items-center justify-center text-brand-aurora">💎</div>
                           <div className="h-2 w-full bg-slate-800 rounded-full" />
                           <div className="h-2 w-2/3 bg-slate-800 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4 bg-white/5 rounded-3xl border border-white/5 p-6 space-y-6">
                       <div className="text-center space-y-3">
                          <div className="w-24 h-24 rounded-full border-4 border-brand-neural/30 border-t-brand-neural mx-auto flex items-center justify-center">
                             <span className="text-2xl font-black text-white">82%</span>
                          </div>
                          <p className="text-nano">Market Readiness</p>
                       </div>
                       <div className="space-y-4">
                          {[1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-brand-neural" />
                               <div className="h-2 flex-1 bg-slate-800 rounded-full" />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative badges floating around the portal */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-8 sm-glass p-4 rounded-2xl border border-brand-neural/30 shadow-glass-glow flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-neural/20 flex items-center justify-center text-xl">🚀</div>
                <div>
                   <p className="text-xs font-black text-white">Career Shadow Active</p>
                   <p className="text-[10px] text-brand-neural font-bold">Monitoring Gaps...</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -left-12 sm-glass p-4 rounded-2xl border border-brand-emerald/30 shadow-emerald-500/20 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 flex items-center justify-center text-xl">💸</div>
                <div>
                   <p className="text-xs font-black text-white">+₹4.2L Potential</p>
                   <p className="text-[10px] text-brand-emerald font-bold">Salary Optimized</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 5. Scroll Indicatotor */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explore Intelligence</span>
        <div className="w-px h-12 bg-gradient-to-b from-brand-neural to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
