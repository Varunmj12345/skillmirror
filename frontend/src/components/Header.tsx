import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

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
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: 'fa-table-columns' },
      ],
    },
    {
      title: 'Career Development',
      items: [
        { href: '/roadmap', label: 'Career Roadmap', icon: 'fa-route' },
        { href: '/skill-gap', label: 'Skill Gap Analyzer', icon: 'fa-chart-pie' },
        { href: '/resume', label: 'Resume Analyzer', icon: 'fa-file-invoice' },
        { href: '/mock-interview', label: 'Mock Interview Engine', icon: 'fa-microphone' },
      ],
    },
    {
      title: 'Opportunities',
      items: [
        { href: '/job-intelligence', label: 'Job Intelligence', icon: 'fa-briefcase' },
        { href: '/smart-alerts', label: 'Smart Alerts', icon: 'fa-wand-magic-sparkles' },
      ],
    },
  ];

  const accountItems: NavItem[] = [
    { href: '/profile', label: 'Profile', icon: 'fa-circle-user' },
    { href: '/settings', label: 'Settings', icon: 'fa-sliders' },
  ];

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentlyDark = root.classList.contains('dark');
    const newTheme = currentlyDark ? 'light' : 'dark';

    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      setIsDark(false);
    }

    localStorage.setItem('sm_settings_prefs', JSON.stringify({
      ...JSON.parse(localStorage.getItem('sm_settings_prefs') || '{}'),
      appearanceTheme: newTheme
    }));
  };

  return (
    <aside
      className="app-sidebar sm-scrollbar hidden sm:flex shadow-xl"
      data-app-sidebar
    >
      <div className="flex-1 flex flex-col px-4 py-6 gap-6 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center justify-between px-2">
          <Link href="/">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <i className="fa-solid fa-bolt-lightning text-white text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black dark:text-slate-50 text-slate-900 tracking-tight">
                  SkillMirror
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  AI Career Mentor
                </span>
              </div>
            </div>
          </Link>
          {!loading && user && <NotificationBell />}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 space-y-8">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 pointer-events-auto cursor-pointer
                          ${isActive
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}
                      >
                        {isActive && (
                          <div className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
                        )}
                        <i className={`fa-solid ${item.icon} w-5 text-center text-[14px] transition-transform duration-300 group-hover:scale-110`} />
                        <span className="truncate">{item.label}</span>
                        {item.label === 'Smart Alerts' && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Account Section */}
        <div className="mt-auto pt-6 space-y-4">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Account
            </h3>
            {accountItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer
                      ${isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}
                  >
                    <i className={`fa-solid ${item.icon} w-5 text-center text-[14px]`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 transition-all text-[11px] text-slate-500 hover:text-slate-200 border border-slate-200 dark:border-slate-900 group"
          >
            <span className="flex items-center gap-3 font-bold uppercase tracking-wider">
              <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'} text-[14px] ${isDark ? 'text-slate-600' : 'text-amber-500'} group-hover:text-indigo-400 transition-colors`} />
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-8 h-4 rounded-full border transition-all relative flex items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-amber-100 border-amber-200'}`}>
              <div className={`absolute w-2.5 h-2.5 rounded-full transition-all duration-300 ${isDark ? 'right-1 bg-slate-500' : 'left-1 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
            </div>
          </button>

          {mounted && !loading && (
            <div className="p-3 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-400 shadow-inner">
                  {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-black text-slate-100 truncate">
                    {user?.username || user?.email || 'Guest user'}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Elite Tier
                  </span>
                </div>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-700 hover:border-rose-900/50 transition-all duration-300"
                >
                  Sign Out
                </button>
              ) : (
                <Link href="/login" className="block w-full text-center py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all duration-300">
                  Join Project
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Header;
