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
        <title>Recover Identity • SkillMirror Core</title>
      </Head>
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-zinc-950 text-zinc-200">
        <div className="max-w-md w-full bg-zinc-900/95 border border-zinc-800 p-8 sm:p-10 space-y-6">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 mx-auto mb-4 flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-key text-xl"></i>
            </div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400" />
              IDENTITY RECOVERY
            </div>
            <h1 className="text-2xl font-mono font-bold text-white tracking-tight mt-1">Reset Password</h1>
            <p className="text-zinc-400 text-xs mt-1">Initiate verified recovery protocol to access your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/60 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400" />
                <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="p-3.5 bg-rose-950/20 border border-rose-800/60 text-rose-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Request Reset Link →'}
            </button>
          </form>

          <p className="pt-4 text-center text-xs font-mono border-t border-zinc-800">
            <Link href="/login">
              <span className="text-zinc-500 hover:text-white transition-colors cursor-pointer">← Back to Gateway</span>
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
