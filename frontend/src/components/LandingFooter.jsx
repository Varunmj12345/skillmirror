import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Bullet } from './ui/bullet';
import { Badge } from './ui/badge';

const LandingFooter = () => {
  return (
    <footer className="bg-background border-t border-white/[0.08] text-slate-400 font-mono text-xs">
      {/* Pre-Footer Action Banner */}
      <section className="py-20 border-b border-white/[0.06] relative overflow-hidden bg-gradient-to-b from-card/50 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/5 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300 mb-6">
            <Bullet variant="cyan" size="sm" />
            <span>ACCELERATE YOUR CAREER TRAJECTORY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-6">
            READY TO ACTIVATE YOUR CAREER OPERATING SYSTEM?
          </h2>

          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of developers using SkillMirror to track skill gaps, simulate interviews, and reach senior engineering compensation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <button className="sm-btn-primary !py-4 !px-8 text-xs tracking-wider w-full sm:w-auto">
                <span>DEPLOY FREE ACCOUNT</span>
                <i className="fa-solid fa-arrow-right text-xs" />
              </button>
            </Link>
            <Link href="/login">
              <button className="sm-btn-neon !py-4 !px-8 text-xs tracking-wider w-full sm:w-auto">
                <span>SYSTEM SIGN IN</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer Links */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-display font-black text-white text-xs shadow-[0_0_12px_rgba(0,217,255,0.4)]">
                SM
              </div>
              <span className="font-display font-black text-white tracking-widest text-sm uppercase">
                SkillMirror
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Autonomous AI Career Intelligence Platform & Skill Gap Quantification Engine.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Module Links */}
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bullet variant="cyan" size="sm" />
              <span>ENGINES</span>
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><Link href="/dashboard"><a className="hover:text-cyan-300 transition-colors">Command Center</a></Link></li>
              <li><Link href="/roadmap"><a className="hover:text-cyan-300 transition-colors">Career Roadmap</a></Link></li>
              <li><Link href="/skill-gap"><a className="hover:text-cyan-300 transition-colors">Skill Gap Radar</a></Link></li>
              <li><Link href="/resume"><a className="hover:text-cyan-300 transition-colors">Resume Optimizer</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bullet variant="warning" size="sm" />
              <span>SIMULATION</span>
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><Link href="/mock-interview"><a className="hover:text-cyan-300 transition-colors">Mock Interview</a></Link></li>
              <li><Link href="/job-intelligence"><a className="hover:text-cyan-300 transition-colors">Job Market Radar</a></Link></li>
              <li><Link href="/smart-alerts"><a className="hover:text-cyan-300 transition-colors">Smart Alert Dispatch</a></Link></li>
              <li><Link href="/profile"><a className="hover:text-cyan-300 transition-colors">Career Digital Twin</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bullet variant="success" size="sm" />
              <span>ENVIRONMENT</span>
            </h4>
            <div className="space-y-2.5 text-[10px]">
              <div className="p-2 rounded bg-pop border border-white/[0.04] space-y-1">
                <div className="text-slate-500">API BUILD:</div>
                <div className="text-cyan-300 font-bold">v1.1.3-refined</div>
              </div>
              <div className="p-2 rounded bg-pop border border-white/[0.04] space-y-1">
                <div className="text-slate-500">DATABASE CLUSTER:</div>
                <div className="text-emerald-300 font-bold">POSTGRES / SQLITE READY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div>© 2026 SKILLMIRROR OS • ARCHITECTURE v2.4</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">SECURITY POLICY</a>
            <a href="#" className="hover:text-slate-300 transition-colors">TELEMETRY DOCS</a>
            <a href="#" className="hover:text-slate-300 transition-colors">SUPPORT NODE</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
