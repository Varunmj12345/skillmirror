import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
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
    title: 'Identity & Settings',
    items: [
      { href: '/profile',  label: 'Career Identity',   icon: 'fa-id-card' },
      { href: '/settings', label: 'Account Settings',  icon: 'fa-sliders' },
    ],
  },
];

/* ── Cyber section label ───────────────────────────────── */
const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 px-3 mb-2">
    <div className="w-1 h-1 rounded-full bg-cyan-500/60" />
    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
      {title}
    </span>
    <div className="flex-1 h-px bg-white/[0.04]" />
  </div>
);

/* ── Nav item button ───────────────────────────────────── */
const NavBtn: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => (
  <Link href={item.href}>
    <div
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
        ${isActive
          ? 'bg-cyan-500/10 text-cyan-300'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="activeNavBar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(0,217,255,0.8)]"
        />
      )}

      {/* Icon box */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all text-xs
          ${isActive
            ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
            : 'bg-white/[0.03] border border-white/[0.05] text-slate-500 group-hover:text-slate-300 group-hover:border-white/[0.1]'
          }`}
      >
        <i className={`fa-solid ${item.icon}`} />
      </div>

      <span className="text-xs font-mono font-semibold truncate">{item.label}</span>

      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
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
      className={`fixed inset-y-0 left-0 h-full z-50 bg-[#0b0d13] border-r border-white/[0.06] hidden lg:flex flex-col transition-all duration-300 ${sidebarW} overflow-hidden`}
    >
      {/* Top scanline decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent pointer-events-none" />

      {/* ── Brand Section ── */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-0 py-5' : 'justify-between px-5 py-5'} border-b border-white/[0.05]`}>
        {!collapsed && (
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-display font-black text-white text-xs shadow-[0_0_14px_rgba(0,217,255,0.35)] group-hover:scale-105 transition-transform flex-shrink-0">
                SM
              </div>
              <div>
                <div className="text-sm font-display font-black text-white tracking-widest uppercase">
                  SkillMirror
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em]">
                  {activeDomain} Domain
                </div>
              </div>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-display font-black text-white text-xs shadow-[0_0_14px_rgba(0,217,255,0.35)] cursor-pointer hover:scale-105 transition-transform">
              SM
            </div>
          </Link>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`${collapsed ? 'hidden' : 'flex'} w-7 h-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-[10px] flex-shrink-0`}
        >
          <i className={`fa-solid fa-chevron-left`} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-[10px]"
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}

      {/* ── Status Pill ── */}
      {!collapsed && (
        <div className="mx-5 mt-4 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-pop border border-white/[0.05] text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider truncate">NEURAL MESH: ACTIVE</span>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
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
                            ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.2)]'
                            : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-300'
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
      <div className={`border-t border-white/[0.05] ${collapsed ? 'p-2' : 'p-4'}`}>
        {!loading && user ? (
          collapsed ? (
            /* Collapsed: just avatar */
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center font-display font-black text-cyan-400 text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            /* Expanded: full user card */
            <div className="rounded-xl bg-pop border border-white/[0.06] p-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center font-display font-black text-cyan-400 text-sm flex-shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-white truncate">{user?.username || 'Elite User'}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 truncate">
                      {activeRole}
                    </span>
                  </div>
                </div>
                <NotificationBell />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/profile">
                  <button className="w-full py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono font-bold text-slate-400 hover:text-cyan-300 hover:border-cyan-500/25 transition-all uppercase tracking-wider">
                    <i className="fa-solid fa-id-card text-[9px] mr-1" />
                    Profile
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="w-full py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono font-bold text-slate-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all uppercase tracking-wider"
                >
                  <i className="fa-solid fa-power-off text-[9px] mr-1" />
                  Logout
                </button>
              </div>
            </div>
          )
        ) : !user && !loading ? (
          <Link href="/login">
            <button className="sm-btn-primary w-full py-3 text-xs">
              <i className="fa-solid fa-bolt text-xs" />
              {!collapsed && 'Access Intelligence'}
            </button>
          </Link>
        ) : null}
      </div>
    </aside>
  );
};

export default Header;
