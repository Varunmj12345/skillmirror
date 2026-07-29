import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function withAuth<P extends object>(Component: React.ComponentType<P>) {
  const ProtectedRoute: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        const currentToken = localStorage.getItem('access_token');
        if (!currentToken) {
          router.replace('/login?redirect=' + encodeURIComponent(router.asPath));
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F]">
          <div className="w-16 h-16 rounded-2xl bg-brand-neural/10 border border-brand-neural/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(45,212,191,0.15)]">
            <i className="fa-solid fa-infinity text-brand-neural text-3xl"></i>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };

  return ProtectedRoute;
}
