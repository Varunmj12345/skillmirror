import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import Header from './Header';
import AICareerWidget from './AICareerWidget';
import PageTransition from './motion/PageTransition';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import useAuth from '../hooks/useAuth';

function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  return (
    <div className="app-shell min-h-screen bg-zinc-950 text-zinc-100 relative" data-app-shell>
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ── Mobile Top Navigation Bar (Skydda Styled) ── */}
      <div className="lg:hidden sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-7 h-7 border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium tracking-tight text-zinc-100 flex items-center gap-1">
              SkillMirror <span className="text-amber-500 text-caption font-mono px-1 border border-amber-500/40">CORE</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="compact" />
          {!loading && user && <NotificationBell placement="top-down" />}
        </div>
      </div>

      <main
        className={`app-main sm-scrollbar min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:pl-[68px]' : 'lg:pl-72'
        }`}
        data-app-main
      >
        <div className="app-main-inner pb-10">
          <AnimatePresence exitBeforeEnter>
            <PageTransition key={router.asPath || router.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
      {!loading && user && <AICareerWidget />}
    </div>
  );
}

export default Layout;
