import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import apiClient from '../../services/apiClient';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await apiClient.post('/users/admin-login/', { email, password });
      const data = res?.data || res;
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        router.push(data.redirect || '/admin/problems');
      } else {
        setError('Authentication failed. No access token received.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Access Denied: You do not have Platform Admin authorization.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Platform Admin Access • SkillMirror Core</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200 relative overflow-hidden px-4">
        {/* Skydda vertical guidelines */}
        <div className="pointer-events-none fixed inset-0 z-10">
          <div className="mx-auto h-full max-w-7xl">
            <div className="relative h-full">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800/50" />
              <div className="absolute right-0 top-0 h-full w-px bg-zinc-800/50" />
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-md my-12">
          <div className="bg-zinc-900/95 border border-zinc-800 p-8 sm:p-10 space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 mx-auto mb-4 flex items-center justify-center text-amber-400">
                <i className="fa-solid fa-shield-halved text-xl" />
              </div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400" />
                RESTRICTED ACCESS
              </div>
              <h1 className="text-2xl font-mono font-bold text-white tracking-tight mt-1">Platform Admin Portal</h1>
              <p className="text-zinc-400 text-xs mt-1">
                Authorized Platform Owner & Super Admin Authentication Boundary
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {error && (
                <div className="p-4 bg-rose-950/20 border border-rose-800/60 text-rose-300 font-mono text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Admin Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@skillmirror.ai"
                  className="w-full px-4 py-3 text-xs text-white font-mono bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-amber-400 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Admin Master Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 pr-16 py-3 text-xs text-white font-mono bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-amber-400 placeholder-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-zinc-500 hover:text-amber-400 transition-colors text-[10px] font-mono font-bold uppercase tracking-wider"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                    <span>Verifying Admin Boundary...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock text-xs" />
                    <span>Authenticate Platform Admin →</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-zinc-800">
                <Link href="/login">
                  <span className="text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors">
                    ← Return to Student Login Gateway
                  </span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLoginPage;
