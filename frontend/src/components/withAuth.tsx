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
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
