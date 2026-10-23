import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Atom,
  User,
  LogOut,
  FolderTree,
  MinusSquare,
  PlusSquare,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import apiClient from '../services/apiClient';

interface HeaderProps {
  collapsed?: boolean;
  setCollapsed?: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export interface TreeFileItem {
  id: string;
  name: string;
  label: string;
  href: string;
  icon?: string;
  subRoutes?: string[];
}

export interface TreeFolderItem {
  id: string;
  name: string;
  label: string;
  icon?: string;
  files: TreeFileItem[];
}

const TREE_DATA: {
  rootFile: TreeFileItem;
  folders: TreeFolderItem[];
} = {
  rootFile: {
    id: 'dashboard',
    name: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
  },
  folders: [
    {
      id: 'diagnostic',
      name: 'diagnostic',
      label: 'Skill Diagnostics',
      files: [
        {
          id: 'skill-gap',
          name: 'skill-gap',
          label: 'Skill Gap Analyzer',
          href: '/skill-gap',
        },
        {
          id: 'resume',
          name: 'resume',
          label: 'Resume Optimizer',
          href: '/resume',
        },
        {
          id: 'job-intel',
          name: 'job-intel',
          label: 'Job Market Intel',
          href: '/job-intelligence',
        },
      ],
    },
    {
      id: 'roadmap',
      name: 'roadmap',
      label: 'Career Roadmap',
      files: [
        {
          id: 'roadmap-seq',
          name: 'roadmap',
          label: 'Milestones & Path',
          href: '/roadmap',
        },
      ],
    },
    {
      id: 'practice',
      name: 'practice',
      label: 'Practice Studio',
      files: [
        {
          id: 'problems',
          name: 'problems',
          label: 'Practice Problems',
          href: '/problems',
        },
        {
          id: 'mock-interview',
          name: 'mock-interview',
          label: 'AI Mock Interview',
          href: '/mock-interview',
          subRoutes: ['/mock-interview/session', '/mock-interview/result', '/mock-interview/live'],
        },
        {
          id: 'projects',
          name: 'projects',
          label: 'Projects & Gigs',
          href: '/projects',
        },
      ],
    },
    {
      id: 'system',
      name: 'system',
      label: 'Account & Profile',
      files: [
        {
          id: 'profile',
          name: 'profile',
          label: 'Profile & Portfolio',
          href: '/profile',
        },
        {
          id: 'settings',
          name: 'settings',
          label: 'Account Settings',
          href: '/settings',
        },
      ],
    },
  ],
};

/* ── Route matcher for file items ────────────────────── */
const isFileActive = (file: TreeFileItem, currentPath: string): boolean => {
  if (currentPath === file.href) return true;
  if (file.subRoutes && file.subRoutes.some((r) => currentPath === r || currentPath.startsWith(r + '/'))) {
    return true;
  }
  if (file.href !== '/' && file.href !== '/dashboard' && currentPath.startsWith(file.href + '/')) {
    return true;
  }
  return false;
};

/* ═══════════════════════════════════════════════════════════
   VS CODE TREE EXPLORER SIDEBAR
   ═══════════════════════════════════════════════════════════ */
const Header: React.FC<HeaderProps> = ({ collapsed: propCollapsed, setCollapsed: propSetCollapsed }) => {
  const { user, loading, logout } = useAuth() as any;
  const [mounted, setMounted] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('student');
  const [activeDomain, setActiveDomain] = useState<string>('General');
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const setCollapsed = propSetCollapsed || setLocalCollapsed;
  const router = useRouter();
  const currentPath = router.pathname;

  // Folder open/closed states
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    diagnostic: true,
    roadmap: true,
    practice: true,
    system: false,
  });

  // Admin dynamic folder injection
  const [isAdmin, setIsAdmin] = useState(false);

  // Subscription & Credits state (Demo Mode)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'plus' | 'pro'>('free');
  const [creditsRemaining, setCreditsRemaining] = useState<number>(10);
  const [creditsLimit, setCreditsLimit] = useState<number>(10);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const loadSubscriptionStatus = async () => {
    try {
      const res: any = await apiClient.get('/users/subscription/');
      const data = res?.data || res;
      if (data?.subscription_plan) {
        setSubscriptionPlan(data.subscription_plan);
        setCreditsRemaining(data.credits_remaining ?? 10);
        setCreditsLimit(data.credits_limit ?? 10);
      }
    } catch {
      // fallback to default free tier display
    }
  };

  const handleDemoPlanSwitch = async (planId: 'free' | 'plus' | 'pro', action: 'upgrade' | 'refill' = 'upgrade') => {
    setUpgradingPlan(action === 'refill' ? 'refill' : planId);
    setUpgradeMessage(null);
    try {
      const res: any = await apiClient.post('/users/subscription/', { plan: planId, action });
      const data = res?.data || res;
      setSubscriptionPlan(data.subscription_plan || planId);
      setCreditsRemaining(data.credits_remaining ?? 10);
      setCreditsLimit(data.credits_limit ?? 10);
      setUpgradeMessage(data.message || `Activated ${planId.toUpperCase()} (Demo Mode)`);
    } catch {
      setUpgradeMessage('Failed to update demo subscription.');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const loadAuthorizedEngines = async () => {
    try {
      const res: any = await apiClient.get('/users/authorized-engines/');
      const data = res?.data || res;
      if (data?.role) {
        setActiveRole(data.role);
        setIsAdmin(data.role === 'admin' || user?.is_staff);
      }
      if (data?.domain) {
        setActiveDomain(data.domain);
      }
    } catch {
      setIsAdmin(user?.is_staff || false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user) {
      loadAuthorizedEngines();
      loadSubscriptionStatus();
    }
  }, [user, currentPath]);

  // Auto-expand folder when navigating into one of its files
  useEffect(() => {
    TREE_DATA.folders.forEach((folder) => {
      const hasActiveChild = folder.files.some((f) => isFileActive(f, currentPath));
      if (hasActiveChild) {
        setOpenFolders((prev) => ({ ...prev, [folder.id]: true }));
      }
    });
  }, [currentPath]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const expandAll = () => {
    setOpenFolders({
      diagnostic: true,
      roadmap: true,
      practice: true,
      system: true,
    });
  };

  const collapseAll = () => {
    setOpenFolders({
      diagnostic: false,
      roadmap: false,
      practice: false,
      system: false,
    });
  };

  if (!mounted) return null;

  const sidebarW = collapsed ? 'w-[68px]' : 'w-72';

  // Compute folders list (with optional admin items)
  const foldersToRender = [...TREE_DATA.folders];
  if (isAdmin) {
    const sysFolder = foldersToRender.find((f) => f.id === 'system');
    if (sysFolder && !sysFolder.files.some((f) => f.id === 'admin-control')) {
      sysFolder.files = [
        ...sysFolder.files,
        {
          id: 'admin-control',
          name: 'admin-center',
          label: 'Admin Control',
          href: '/admin/problems',
        },
        {
          id: 'ai-diagnostics',
          name: 'ai-diagnostics',
          label: 'AI Diagnostics',
          href: '/bot-analytics',
        },
      ];
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 h-full z-50 bg-zinc-950 border-r border-zinc-800 hidden lg:flex flex-col transition-all duration-300 ${sidebarW}`}
    >
      {/* ── Brand Section ── */}
      <div
        className={`flex items-center ${
          collapsed ? 'justify-center px-0 py-4' : 'justify-between px-4 py-4'
        } border-b border-zinc-800`}
      >
        {!collapsed ? (
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-7 h-7 border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                  SkillMirror <span className="text-amber-500 text-[10px] font-mono px-1 border border-amber-500/40 bg-amber-500/10">IDE</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {activeDomain}
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/">
            <div className="w-7 h-7 border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-500 cursor-pointer hover:bg-amber-500 hover:text-black transition-colors">
              <Shield className="h-4 w-4" />
            </div>
          </Link>
        )}

        {/* Action icons: Theme Switcher & Collapse toggle */}
        <div className={`${collapsed ? 'hidden' : 'flex'} items-center gap-1`}>
          <ThemeToggle variant="compact" />
          <button
            onClick={() => setCollapsed(true)}
            className="w-6 h-6 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors text-xs"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors text-xs"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ── VS Code Explorer Header ── */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1.5 flex items-center justify-between border-b border-zinc-900 select-none">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
            <FolderTree className="w-3.5 h-3.5 text-zinc-400" />
            <span>Explorer</span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={expandAll}
              title="Expand All Folders"
              className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
            >
              <PlusSquare className="w-3 h-3" />
            </button>
            <button
              onClick={collapseAll}
              title="Collapse All Folders"
              className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
            >
              <MinusSquare className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ── Workspace Root Title (Clean, no yellow badge) ── */}
      {!collapsed && (
        <div className="px-3 py-1.5 flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider select-none bg-zinc-900/40 border-b border-zinc-800/60">
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">SKILLMIRROR-WORKSPACE</span>
        </div>
      )}

      {/* ── File Tree Navigation ── */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
        {collapsed ? (
          /* Collapsed Mini Sidebar Icons */
          <div className="space-y-2">
            <Link href={TREE_DATA.rootFile.href}>
              <div
                className={`w-9 h-9 mx-auto flex items-center justify-center transition-all text-xs cursor-pointer border rounded
                  ${
                    isFileActive(TREE_DATA.rootFile, currentPath)
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                  }`}
                title={TREE_DATA.rootFile.label}
              >
                <Atom className="w-4 h-4 text-cyan-400" />
              </div>
            </Link>

            {foldersToRender.map((folder) => {
              const hasActiveChild = folder.files.some((f) => isFileActive(f, currentPath));
              const firstChild = folder.files[0];
              return (
                <Link key={folder.id} href={firstChild?.href || '#'}>
                  <div
                    className={`w-9 h-9 mx-auto flex items-center justify-center transition-all text-xs cursor-pointer border rounded
                      ${
                        hasActiveChild
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                      }`}
                    title={`${folder.label} (${folder.files.length} items)`}
                  >
                    <Folder className="w-4 h-4 text-amber-400/90" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Full VS Code File Tree */
          <>
            {/* Root File: dashboard (No .tsx, No yellow badge) */}
            <Link href={TREE_DATA.rootFile.href}>
              <div
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-none cursor-pointer text-xs font-mono transition-colors group select-none
                  ${
                    isFileActive(TREE_DATA.rootFile, currentPath)
                      ? 'bg-zinc-800 text-zinc-100 font-semibold border-l-2 border-amber-500 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                  }`}
              >
                <Atom className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{TREE_DATA.rootFile.name}</span>
                <span className="text-[11px] text-zinc-500 font-sans ml-auto truncate opacity-70 group-hover:text-zinc-400">
                  {TREE_DATA.rootFile.label}
                </span>
              </div>
            </Link>

            {/* Folders */}
            {foldersToRender.map((folder) => {
              const isOpen = openFolders[folder.id] ?? false;
              const hasActiveChild = folder.files.some((f) => isFileActive(f, currentPath));

              return (
                <div key={folder.id} className="pt-0.5">
                  {/* Folder Item Header (No yellow badge) */}
                  <div
                    onClick={() => toggleFolder(folder.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-none cursor-pointer text-xs font-mono select-none group transition-colors
                      ${
                        hasActiveChild
                          ? 'text-zinc-200 bg-zinc-900/40'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-150 shrink-0 ${
                        isOpen ? 'rotate-90 text-zinc-300' : ''
                      }`}
                    />
                    {isOpen ? (
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    )}
                    <span className="font-semibold truncate">{folder.name}</span>
                    <span className="text-[11px] text-zinc-500 font-sans ml-1 truncate opacity-70 group-hover:text-zinc-400">
                      • {folder.label}
                    </span>
                  </div>

                  {/* Folder Children (Files) with VS Code Indentation Line (No .tsx, No yellow badge) */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="ml-[17px] pl-2 border-l border-zinc-800/80 space-y-0.5 my-0.5">
                          {folder.files.map((file) => {
                            const isChildActive = isFileActive(file, currentPath);
                            return (
                              <Link key={file.id} href={file.href}>
                                <div
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-none cursor-pointer text-xs font-mono transition-colors group select-none
                                    ${
                                      isChildActive
                                        ? 'bg-zinc-800 text-zinc-100 font-semibold border-l-2 border-amber-500 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                                    }`}
                                >
                                  <Atom className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:text-cyan-300" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-[11px] text-zinc-500 font-sans ml-auto truncate opacity-70 group-hover:text-zinc-400">
                                    {file.label}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── User Profile Footer ── */}
      <div className={`border-t border-zinc-800 bg-zinc-950 ${collapsed ? 'p-2' : 'p-3'}`}>
        {!loading && user ? (
          collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono font-medium text-zinc-100 text-xs">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ThemeToggle variant="compact" />
            </div>
          ) : (
            <div className="border border-zinc-800 bg-zinc-900/60 p-2.5 rounded-none">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 border border-amber-500/40 bg-amber-500/10 flex items-center justify-center font-mono font-bold text-amber-500 text-xs shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-medium text-zinc-100 truncate">
                    {user?.username || 'User'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 truncate">
                      {activeRole}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${
                        subscriptionPlan === 'pro'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : subscriptionPlan === 'plus'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {subscriptionPlan.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <NotificationBell placement="sidebar" />
                </div>
              </div>

              {/* Credits Meter & Demo Upgrade Trigger */}
              <div className="mb-2 p-2 bg-zinc-950/90 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                    AI CREDITS ({subscriptionPlan.toUpperCase()})
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-400 truncate">
                    {subscriptionPlan === 'pro'
                      ? '⚡ UNLIMITED (PRO)'
                      : `⚡ ${creditsRemaining} / ${creditsLimit} LEFT`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-[9px] uppercase tracking-wider transition-colors shrink-0"
                >
                  {subscriptionPlan === 'free' ? 'UPGRADE' : 'PLANS'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Link href="/profile">
                  <button className="w-full py-1 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-colors uppercase tracking-wider flex items-center justify-center gap-1 rounded-none">
                    <User className="w-3 h-3 text-amber-500" />
                    <span>Profile</span>
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="w-full py-1 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300 hover:text-red-400 hover:border-red-500/40 transition-colors uppercase tracking-wider flex items-center justify-center gap-1 rounded-none"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )
        ) : !user && !loading ? (
          <div className="space-y-2">
            <Link href="/login">
              <button className="w-full py-2 bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-colors text-xs uppercase tracking-wider rounded-none font-mono font-bold">
                Access IDE
              </button>
            </Link>
          </div>
        ) : null}
      </div>

      {/* ── Demo Subscription & Credit Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-700 p-6 shadow-2xl text-white font-mono">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">
                    DEMO / TESTING SUBSCRIPTION MODE
                  </span>
                  <span className="text-xs text-zinc-400">
                    Active Plan: <strong className="text-white uppercase">{subscriptionPlan}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  Upgrade Your AI Credits & Subscription Tier
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  New accounts start with 10 free credits. Switch between Free, Plus, or Pro instantly for testing (no payment card required).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-2.5 py-1 border border-zinc-700 text-zinc-400 hover:text-white text-xs"
              >
                ✕ ESC
              </button>
            </div>

            {upgradeMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                <span>✓ {upgradeMessage}</span>
                <span className="font-bold">
                  {subscriptionPlan === 'pro' ? 'UNLIMITED CREDITS' : `${creditsRemaining} / ${creditsLimit} Credits`}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Starter Free */}
              <div className={`border p-4 flex flex-col justify-between ${subscriptionPlan === 'free' ? 'border-amber-500 bg-zinc-900/80' : 'border-zinc-800 bg-zinc-900/40'}`}>
                <div>
                  <div className="text-[10px] uppercase text-zinc-400">Starter Tier</div>
                  <div className="text-base font-bold text-white mt-0.5">Free</div>
                  <div className="text-sm text-amber-400 font-bold mt-1">₹0 / mo</div>
                  <div className="mt-3 text-xs text-zinc-300 space-y-1.5">
                    <div>• 10 AI Credits limit</div>
                    <div>• Resume Upload & ATS Score</div>
                    <div>• Standard Practice Problems</div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={upgradingPlan !== null || subscriptionPlan === 'free'}
                  onClick={() => handleDemoPlanSwitch('free')}
                  className="mt-4 w-full py-2 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-xs font-bold uppercase"
                >
                  {subscriptionPlan === 'free' ? 'CURRENT PLAN' : 'SWITCH TO FREE'}
                </button>
              </div>

              {/* Plus Plan */}
              <div className={`border p-4 flex flex-col justify-between ${subscriptionPlan === 'plus' ? 'border-cyan-400 bg-cyan-950/20' : 'border-zinc-800 bg-zinc-900/40'}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-cyan-400 font-bold">Most Popular</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">DEMO</span>
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">SkillMirror Plus</div>
                  <div className="text-sm text-cyan-300 font-bold mt-1">₹499 / mo (Demo)</div>
                  <div className="mt-3 text-xs text-zinc-300 space-y-1.5">
                    <div>• <strong>100 AI Credits</strong> / month</div>
                    <div>• Coursera-Style Guided Labs</div>
                    <div>• AI Mock Interviews & Roadmaps</div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={upgradingPlan !== null || subscriptionPlan === 'plus'}
                  onClick={() => handleDemoPlanSwitch('plus')}
                  className="mt-4 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 disabled:opacity-50 text-xs font-bold uppercase"
                >
                  {subscriptionPlan === 'plus' ? 'ACTIVE (PLUS)' : 'ACTIVATE PLUS (DEMO)'}
                </button>
              </div>

              {/* Pro Plan */}
              <div className={`border p-4 flex flex-col justify-between ${subscriptionPlan === 'pro' ? 'border-amber-400 bg-amber-950/20' : 'border-zinc-800 bg-zinc-900/40'}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-amber-400 font-bold">Power Engineer</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40">DEMO</span>
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">SkillMirror Pro</div>
                  <div className="text-sm text-amber-400 font-bold mt-1">₹999 / mo (Demo)</div>
                  <div className="mt-3 text-xs text-zinc-300 space-y-1.5">
                    <div>• <strong>Unlimited AI Credits</strong></div>
                    <div>• Autonomous AI Auto-Grader</div>
                    <div>• Career Digital Twin & Scout</div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={upgradingPlan !== null || subscriptionPlan === 'pro'}
                  onClick={() => handleDemoPlanSwitch('pro')}
                  className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-50 text-xs font-bold uppercase"
                >
                  {subscriptionPlan === 'pro' ? 'ACTIVE (PRO)' : 'ACTIVATE PRO (DEMO)'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
              <span>Testing helper: Need to reset your current tier&apos;s credit counter?</span>
              <button
                type="button"
                onClick={() => handleDemoPlanSwitch(subscriptionPlan, 'refill')}
                className="px-3 py-1.5 border border-zinc-700 hover:border-amber-500 text-zinc-200 hover:text-amber-400 text-xs uppercase font-bold"
              >
                ↻ Refill Demo Credits ({creditsRemaining}/{creditsLimit})
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Header;
