import React from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Header from './Header';
import AICareerWidget from './AICareerWidget';
import PageTransition from './PageTransition';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import useAuth from '../hooks/useAuth';

function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="app-shell min-h-screen bg-background text-foreground relative transition-colors duration-300" data-app-shell>
      <Header />

      {/* ── Mobile Top Navigation Bar (Shown on small screens) ── */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#12151e]/90 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-display font-black text-white text-xs shadow-[0_0_12px_rgba(0,217,255,0.35)]">
              SM
            </div>
            <span className="text-sm font-display font-black tracking-wider uppercase text-foreground">
              SkillMirror
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="compact" />
          {!loading && user && <NotificationBell />}
        </div>
      </div>

      <main className="app-main sm-scrollbar lg:pl-72 min-h-screen transition-all duration-300" data-app-main>
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
