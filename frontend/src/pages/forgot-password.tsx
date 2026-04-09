import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { forgotPassword } from '../services/auth';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage('If an account exists, a reset link has been dispatched to your neural link (email).');
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Protocol failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Recover Identity • SkillMirror AI</title>
      </Head>
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full glass-panel p-10 border-slate-800 shadow-3xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-amber-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <i className="fa-solid fa-burst text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Identity Recovery</h1>
            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.2em]">Secure Protocol Initiation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                {message}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-700 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 rounded-2xl text-xs font-black shadow-xl shadow-amber-600/20 transition-all active:scale-95 bg-amber-600 hover:bg-amber-500"
            >
              {loading ? 'Processing...' : 'Request Reset Link'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest">
            <Link href="/login">
              <span className="text-slate-500 hover:text-white transition-colors cursor-pointer">Back to Gateway</span>
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
