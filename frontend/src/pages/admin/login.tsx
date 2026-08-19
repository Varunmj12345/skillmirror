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
        <title>Platform Admin Access • SkillMirror Enterprise</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#090d16] to-[#1e1b4b] relative overflow-hidden px-4">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/60 p-10 space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-amber-500/20 border border-amber-400/30">
                <i className="fa-solid fa-shield-halved text-white text-2xl" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Restricted Access</span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-1">Platform Admin Portal</h1>
              <p className="text-slate-400 text-xs mt-1">
                Authorized Platform Owner & Super Admin Authentication Boundary
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl font-semibold flex items-center gap-3"
                >
                  <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@skillmirror.ai"
                  className="sm-input px-4 py-3.5 text-sm text-white font-mono border-slate-700 focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Master Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="sm-input px-4 pr-16 py-3.5 text-sm text-white border-slate-700 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin" />
                    <span>Verifying Admin Boundary...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock" />
                    <span>Authenticate Platform Admin →</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-white/5">
                <Link href="/login">
                  <span className="text-slate-500 hover:text-slate-300 text-[11px] font-semibold transition-colors">
                    ← Return to Student Login Gateway
                  </span>
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminLoginPage;
