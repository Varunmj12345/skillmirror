import React from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import AICareerWidget from './AICareerWidget';
import PageTransition from './PageTransition';
import useAuth from '../hooks/useAuth';

function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="app-shell min-h-screen bg-brand-obsidian relative" data-app-shell>
      <Header />
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
