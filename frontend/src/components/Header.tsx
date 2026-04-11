import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Header: React.FC = () => {
  const { user, loading, logout } = useAuth() as any;
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navSections: NavSection[] = [
    {
      title: 'Command Center',
      items: [
        { href: '/dashboard', label: 'Intelligence Hub', icon: 'fa-gauge-high' },
      ],
    },
    {
      title: 'AI Intelligence',
      items: [
        { href: '/roadmap', label: 'Career Roadmap', icon: 'fa-compass' },
        { href: '/skill-gap', label: 'Gap Analyzer', icon: 'fa-brain' },
        { href: '/resume', label: 'ATS Optimizer', icon: 'fa-file-shield' },
        { href: '/mock-interview', label: 'Interview Shadow', icon: 'fa-headset' },
      ],
    },
    {
      title: 'Market Intelligence',
      items: [
        { href: '/job-intelligence', label: 'Demand Streams', icon: 'fa-network-wired' },
        { href: '/smart-alerts', label: 'Smart Alerts', icon: 'fa-bolt-lightning' },
      ],
    },
  ];

  if (!mounted) return null;

  return (
    <aside className="fixed inset-y-0 left-0 w-72 h-full z-50 bg-brand-obsidian border-r border-white/5 hidden lg:flex flex-col group transition-all duration-500 hover:w-[290px]">
      {/* Brand Section */}
      <div className="p-8 pb-10 flex items-center gap-4">
        <Link href="/">
          <div className="flex items-center gap-4 cursor-pointer group/logo">
             <div className="w-11 h-11 rounded-[14px] bg-brand-neural relative flex items-center justify-center shadow-glass-glow shadow-brand-neural/30 transition-all group-hover/logo:scale-105">
                <i className="fa-solid fa-mirror text-white text-xl" />
                <div className="absolute inset-0 bg-white/20 rounded-inherit opacity-0 group-hover/logo:opacity-100 transition-opacity" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-black text-white tracking-ultra-tight">SKILLMIRROR</span>
                <span className="sm-nano text-brand-neural">Enterprise AI</span>
             </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-9 overflow-y-auto sm-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="sm-nano px-4 opacity-50">{section.title}</h3>
            <nav className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`
                      group relative px-4 py-3 rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer
                      ${isActive 
                        ? 'bg-brand-neural/10 text-brand-neural' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}
                    `}>
                      {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-2/3 bg-brand-neural rounded-r-full shadow-glass-glow" />}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-brand-neural/20 shadow-inner' : 'bg-slate-900/50 group-hover:bg-slate-800'}`}>
                        <i className={`fa-solid ${item.icon} text-lg`} />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Account / Footer */}
      <div className="p-6 mt-auto">
         {!loading && user && (
            <div className="sm-glass p-5 rounded-[22px] border-white/10 group-hover:border-brand-neural/20 transition-all">
               <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-neural/10 border border-brand-neural/20 flex items-center justify-center border-dashed font-black text-brand-neural text-xl">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-sm font-bold text-white truncate">{user?.username || 'Elite User'}</span>
                     <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-emerald">Pro Active</span>
                     </div>
                  </div>
                  <div className="ml-auto">
                     <NotificationBell />
                  </div>
               </div>
               
               <button 
                 onClick={logout}
                 className="w-full py-3 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
               >
                 Terminate Session
               </button>
            </div>
         )}
         
         {!user && !loading && (
           <Link href="/login">
             <button className="sm-btn-primary w-full py-3.5 !rounded-xl !text-xs !px-0">
               Access Intelligence
             </button>
           </Link>
         )}
      </div>
    </aside>
  );
};

export default Header;
