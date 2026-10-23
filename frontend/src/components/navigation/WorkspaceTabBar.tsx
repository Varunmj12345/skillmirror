import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export type WorkspaceType = 'diagnostic' | 'roadmap' | 'practice';

export interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  code?: string;
  badge?: string;
}

export const WORKSPACE_CONFIG: Record<
  WorkspaceType,
  {
    title: string;
    code: string;
    tabs: TabItem[];
  }
> = {
  diagnostic: {
    title: 'Skill Diagnostics',
    code: 'HUB-01',
    tabs: [
      { id: 'skill-gap', label: 'Skill Gap Analyzer', href: '/skill-gap', icon: 'fa-brain', code: 'AUDIT', badge: 'RADAR' },
      { id: 'resume', label: 'Resume Optimizer', href: '/resume', icon: 'fa-file-shield', code: 'ATS', badge: 'SCAN' },
      { id: 'job-intelligence', label: 'Job Market Intel', href: '/job-intelligence', icon: 'fa-magnifying-glass-chart', code: 'MARKET', badge: 'LIVE' },
    ],
  },
  roadmap: {
    title: 'Career Roadmap & Execution',
    code: 'HUB-02',
    tabs: [
      { id: 'roadmap', label: 'Milestones & Path', href: '/roadmap', icon: 'fa-compass', code: 'PATH', badge: 'SEQUENCE' },
      { id: 'smart-alerts', label: 'Career Alerts', href: '/smart-alerts', icon: 'fa-bolt-lightning', code: 'ALERTS' },
    ],
  },
  practice: {
    title: 'Practice & Assessment Studio',
    code: 'HUB-03',
    tabs: [
      { id: 'problems', label: 'Practice Problems', href: '/problems', icon: 'fa-code', code: 'PRACTICE' },
      { id: 'mock-interview', label: 'AI Mock Interview', href: '/mock-interview', icon: 'fa-headset', code: 'INTERVIEW', badge: 'VOICE' },
      { id: 'history', label: 'Assessment History', href: '/problems/history', icon: 'fa-chart-line', code: 'SCORE' },
    ],
  },
};

interface WorkspaceTabBarProps {
  workspace: WorkspaceType;
  className?: string;
}

export const WorkspaceTabBar: React.FC<WorkspaceTabBarProps> = ({ workspace, className = '' }) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const config = WORKSPACE_CONFIG[workspace];

  if (!config) return null;

  // Determine active tab by finding the most specific match
  const activeTab = config.tabs.reduce<TabItem | null>((best, tab) => {
    const isExact = currentPath === tab.href;
    const isPrefix = tab.href !== '/' && currentPath.startsWith(tab.href + '/');
    if (isExact) return tab;
    if (isPrefix) {
      if (!best || tab.href.length > best.href.length) return tab;
    }
    return best;
  }, null) || (config.tabs.find(t => t.href === currentPath) || config.tabs[0]);

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-1.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        {/* Hub indicator badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800/80 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            {config.code} : {config.title}
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          {config.tabs.map((tab) => {
            const isActive = activeTab.id === tab.id;
            return (
              <Link key={tab.id} href={tab.href}>
                <div
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-mono transition-all duration-200 cursor-pointer select-none group
                    ${
                      isActive
                        ? 'bg-zinc-900 border border-amber-500/50 text-amber-400 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/40 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                >
                  <i
                    className={`fa-solid ${tab.icon} text-[11px] transition-colors
                      ${isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                  />
                  <span>{tab.label}</span>

                  {tab.badge && (
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-sm border font-medium
                        ${
                          isActive
                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:text-zinc-400'
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId={`activePill-${workspace}`}
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-amber-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceTabBar;
