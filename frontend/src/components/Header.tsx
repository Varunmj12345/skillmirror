import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import apiClient from '../services/apiClient';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const FALLBACK_NAV: NavSection[] = [
  {
    title: 'Command Center',
    items: [{ href: '/dashboard', label: 'Intelligence Hub', icon: 'fa-gauge-high' }],
  },
  {
    title: 'AI Career Engines',
    items: [
      { href: '/roadmap',       label: 'Career Roadmap',   icon: 'fa-compass' },
      { href: '/skill-gap',     label: 'Skill Gap Radar',  icon: 'fa-brain' },
      { href: '/resume',        label: 'Resume Optimizer', icon: 'fa-file-shield' },
      { href: '/mock-interview',label: 'Mock Interview',   icon: 'fa-headset' },
      { href: '/job-intelligence', label: 'Job Intel',     icon: 'fa-magnifying-glass-chart' },
      { href: '/smart-alerts',  label: 'Smart Alerts',     icon: 'fa-bell' },
    ],
  },
  {
    title: 'AI Practice & Assessments',
    items: [
      { href: '/problems', label: 'Practice Arena', icon: 'fa-code' },
      { href: '/problems/matches', label: 'Gap Challenge Lab', icon: 'fa-bullseye' },
      { href: '/projects/status-center', label: 'Scorecards & History', icon: 'fa-chart-line' },
    ],
  },
  {
    title: 'Identity & Settings',
    items: [
      { href: '/profile',  label: 'Career Identity',   icon: 'fa-id-card' },
      { href: '/settings', label: 'Account Settings',  icon: 'fa-sliders' },
    ],
  },
];

/* ── Section label ───────────────────────────────── */
const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 px-3 mb-2">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-500/60" />
    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.04]" />
  </div>
);

/* ── Nav item button ───────────────────────────────────── */
const NavBtn: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => (
  <Link href={item.href}>
    <div
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
        ${isActive
          ? 'bg-blue-50/90 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-300 font-bold shadow-light-sm dark:shadow-none'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
        }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="activeNavBar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 dark:bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.4)] dark:shadow-[0_0_8px_rgba(0,217,255,0.8)]"
        />
      )}

      {/* Icon box */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all text-xs
          ${isActive
            ? 'bg-blue-100/90 border border-blue-200/80 text-blue-600 dark:bg-cyan-500/20 dark:border-cyan-500/30 dark:text-cyan-400 shadow-sm'
            : 'bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 group-hover:bg-slate-200/60'
          }`}
      >
        <i className={`fa-solid ${item.icon}`} />
      </div>

      <span className="text-xs font-mono font-semibold truncate">{item.label}</span>

      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse flex-shrink-0" />
      )}
    </div>
  </Link>
);

/* ═══════════════════════════════════════════════════════════
   SIDEBAR / HEADER COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Header: React.FC = () => {
  const { user, loading, logout } = useAuth() as any;
  const [mounted, setMounted] = useState(false);
  const [navSections, setNavSections] = useState<NavSection[]>(FALLBACK_NAV);
  const [activeRole, setActiveRole] = useState<string>('student');
  const [activeDomain, setActiveDomain] = useState<string>('General');
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const loadAuthorizedEngines = async () => {
    try {
      const res: any = await apiClient.get('/users/authorized-engines/');
      const data = res?.data || res;
      if (data?.nav_sections) {
        setNavSections(data.nav_sections);
        setActiveRole(data.role || 'student');
        setActiveDomain(data.domain || 'General');
      }
    } catch {
      setNavSections(FALLBACK_NAV);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user) loadAuthorizedEngines();
  }, [user]);

  if (!mounted) return null;

  const sidebarW = collapsed ? 'w-[68px]' : 'w-72';

  return (
    <aside
      className={`fixed inset-y-0 left-0 h-full z-50 bg-card border-r border-border hidden lg:flex flex-col transition-all duration-300 ${sidebarW} overflow-hidden shadow-light-sm dark:shadow-none`}
    >
      {/* Top scanline decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 dark:via-cyan-500/30 to-transparent pointer-events-none" />

      {/* ── Brand Section ── */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-0 py-5' : 'justify-between px-5 py-5'} border-b border-border`}>
        {!collapsed && (
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-cyan-500 flex items-center justify-center font-display font-black text-white text-xs shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                SM
              </div>
              <div>
                <div className="text-sm font-display font-black text-foreground tracking-widest uppercase">
                  SkillMirror
                </div>
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.15em]">
                  {activeDomain} Domain
                </div>
              </div>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-cyan-500 flex items-center justify-center font-display font-black text-white text-xs shadow-md cursor-pointer hover:scale-105 transition-transform">
              SM
            </div>
          </Link>
        )}

        {/* Action icons: Theme Switcher & Collapse toggle */}
        <div className={`${collapsed ? 'hidden' : 'flex'} items-center gap-1.5`}>
          <ThemeToggle variant="compact" />
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-300 dark:hover:border-cyan-500/30 transition-all text-[10px] flex-shrink-0"
            title="Collapse Sidebar"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        </div>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 w-7 h-7 flex items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-300 dark:hover:border-cyan-500/30 transition-all text-[10px]"
          title="Expand Sidebar"
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}

      {/* ── Status Pill ── */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-pop border border-emerald-200/70 dark:border-border text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider truncate">NEURAL MESH: ACTIVE</span>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-white/20">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && <SectionLabel title={section.title} />}
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = router.pathname === item.href;
                if (collapsed) {
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all text-xs cursor-pointer mb-1
                          ${isActive
                            ? 'bg-blue-50 border border-blue-200 text-blue-600 dark:bg-cyan-500/20 dark:border-cyan-500/30 dark:text-cyan-400 shadow-sm'
                            : 'text-slate-500 hover:bg-secondary hover:text-foreground'
                          }`}
                        title={item.label}
                      >
                        <i className={`fa-solid ${item.icon}`} />
                      </div>
                    </Link>
                  );
                }
                return <NavBtn key={item.href} item={item} isActive={isActive} />;
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* ── User Profile Footer ── */}
      <div className={`border-t border-border ${collapsed ? 'p-2' : 'p-4'}`}>
        {!loading && user ? (
          collapsed ? (
            /* Collapsed: avatar + compact theme toggle */
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/25 flex items-center justify-center font-display font-black text-blue-600 dark:text-cyan-400 text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ThemeToggle variant="compact" />
            </div>
          ) : (
            /* Expanded: full user card with Theme & Notifications */
            <div className="rounded-xl bg-slate-50 dark:bg-pop border border-border p-3.5 shadow-light-sm dark:shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100/80 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/25 flex items-center justify-center font-display font-black text-blue-600 dark:text-cyan-400 text-sm flex-shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-foreground truncate">{user?.username || 'Elite User'}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                      {activeRole}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle variant="compact" />
                  <NotificationBell />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/profile">
                  <button className="w-full py-2 rounded-lg bg-white dark:bg-secondary border border-border text-[10px] font-mono font-bold text-slate-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-cyan-300 hover:border-blue-200 dark:hover:border-cyan-500/25 transition-all uppercase tracking-wider shadow-light-sm">
                    <i className="fa-solid fa-id-card text-[9px] mr-1" />
                    Profile
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="w-full py-2 rounded-lg bg-white dark:bg-secondary border border-border text-[10px] font-mono font-bold text-slate-600 dark:text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/20 transition-all uppercase tracking-wider shadow-light-sm"
                >
                  <i className="fa-solid fa-power-off text-[9px] mr-1" />
                  Logout
                </button>
              </div>
            </div>
          )
        ) : !user && !loading ? (
          <div className="space-y-2">
            <Link href="/login">
              <button className="sm-btn-primary w-full py-3 text-xs">
                <i className="fa-solid fa-bolt text-xs" />
                {!collapsed && 'Access Intelligence'}
              </button>
            </Link>
            {!collapsed && (
              <div className="flex justify-center">
                <ThemeToggle variant="pill" />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default Header;
