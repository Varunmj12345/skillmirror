import React from 'react';
import Header from './Header';
import AICareerWidget from './AICareerWidget';
import useAuth from '../hooks/useAuth';

function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, loading } = useAuth();

  return (
    <div className="app-shell min-h-screen bg-brand-obsidian relative" data-app-shell>
      <Header />
      <main className="app-main sm-scrollbar lg:pl-72 min-h-screen transition-all duration-300" data-app-main>
        <div className="app-main-inner pb-10 sm-page-enter">{children}</div>
      </main>
      {!loading && user && <AICareerWidget />}
    </div>
  );
}

export default Layout;
