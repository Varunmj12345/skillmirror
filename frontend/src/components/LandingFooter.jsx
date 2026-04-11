import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const LandingFooter = () => (
  <footer className="bg-black border-t border-white/5">
    {/* CTA strip above footer */}
    <section className="relative py-24 overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-indigo-600/10 blur-[80px] rounded-full" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tight">
            Own Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Future.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Join thousands of professionals using SkillMirror to accelerate into senior roles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-600/25 hover:scale-105 transition-all duration-300">
                Deploy Your Profile — Free
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-all duration-300">
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Footer body */}
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-sm">SM</div>
            <span className="font-black text-white tracking-widest uppercase text-sm">SkillMirror</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            The AI-powered career intelligence platform for the next generation of professionals.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {[
              { label: 'GitHub', href: 'https://github.com/Varunmj12345/skillmirror',
                icon: <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /> },
            ].map(({ label, href, icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{icon}</svg>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          {
            title: 'Product',
            links: [
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Career Roadmap', href: '/roadmap' },
              { label: 'Skill Gap Analyzer', href: '/skill-gap' },
              { label: 'Resume Engine', href: '/resume' },
            ],
          },
          {
            title: 'Tools',
            links: [
              { label: 'Mock Interview', href: '/mock-interview' },
              { label: 'Job Intelligence', href: '/job-intelligence' },
              { label: 'Smart Alerts', href: '/smart-alerts' },
              { label: 'AI Assistant', href: '/dashboard' },
            ],
          },
          {
            title: 'Account',
            links: [
              { label: 'Sign Up — Free', href: '/signup' },
              { label: 'Login', href: '/login' },
              { label: 'Profile', href: '/profile' },
              { label: 'Settings', href: '/settings' },
            ],
          },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}>
                    <span className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest font-bold">
          © 2026 SkillMirror · All rights reserved
        </p>
        <div className="flex gap-6 text-[11px] uppercase font-bold tracking-widest text-slate-600">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
