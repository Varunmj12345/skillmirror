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
    label: 'Command Center',
    href: '/dashboard',
  },
  folders: [
    {
      id: 'diagnostic',
      name: 'diagnostic',
      label: 'Diagnostic & Intel',
      files: [
        {
          id: 'skill-gap',
          name: 'skill-gap',
          label: 'Skill Gap Radar',
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
        {
          id: 'smart-alerts',
          name: 'smart-alerts',
          label: 'Signals & Nudges',
          href: '/smart-alerts',
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
          label: 'Coding Arena',
          href: '/problems',
        },
        {
          id: 'gap-lab',
          name: 'gap-challenges',
          label: 'Gap Challenge Lab',
          href: '/problems/matches',
        },
        {
          id: 'mock-interview',
          name: 'mock-interview',
          label: 'AI Mock Interview',
          href: '/mock-interview',
          subRoutes: ['/mock-interview/session', '/mock-interview/result', '/mock-interview/live'],
        },
        {
          id: 'scorecards',
          name: 'scorecards',
          label: 'Scorecards & History',
          href: '/projects/status-center',
        },
      ],
    },
    {
      id: 'system',
      name: 'system',
      label: 'Identity & Telemetry',
      files: [
        {
          id: 'profile',
          name: 'profile',
          label: 'Career Identity',
          href: '/profile',
        },
        {
          id: 'settings',
          name: 'settings',
          label: 'Account Settings',
          href: '/settings',
        },
        {
          id: 'bot-telemetry',
          name: 'bot-telemetry',
          label: 'Bot Telemetry',
          href: '/bot-analytics',
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
    if (user) loadAuthorizedEngines();
  }, [user]);

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
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <NotificationBell placement="sidebar" />
                </div>
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
    </aside>
  );
};

export default Header;
