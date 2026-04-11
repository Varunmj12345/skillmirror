import React from 'react';
import Header from './Header';
import AICareerWidget from './AICareerWidget';
import useAuth from '../hooks/useAuth';

function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  const { user, loading } = useAuth();

  return (
    <div className="app-shell" data-app-shell>
      <Header />
      <main className="app-main sm-scrollbar" data-app-main>
        <div className="app-main-inner pb-10 sm-page-enter">{children}</div>
      </main>
      {!loading && user && <AICareerWidget />}
    </div>
  );
}

export default Layout;
