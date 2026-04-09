import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [is2FARequired, setIs2FARequired] = useState(false);
  const { user, login, verify2FA } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const redirect = (router.query.redirect as string) || '/dashboard';
      router.replace(redirect);
    }
  }, [user, router]);

  const justSignedUp = router.query.fromSignup === '1';
  const isExpired = router.query.expired === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await login({ email, password });
      if (res && res['2fa_required']) {
        setIs2FARequired(true);
      }
    } catch (err: any) {
      const data = err?.response?.data;
      setError(data?.detail || data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verify2FA({ email, code: twoFactorCode });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Secure Access • SkillMirror AI</title>
      </Head>
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full glass-panel p-10 border-slate-800 shadow-3xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <i className="fa-solid fa-shield-halved text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.2em]">Career Intelligence Gateway</p>
          </div>

          {!is2FARequired ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {isExpired && !error && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text_center">
                  Session expired. Please sign in again.
                </div>
              )}
              {justSignedUp && !error && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text_center">
                  Welcome! Account ready. Please sign in.
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text_center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Institutional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Secret Code</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl text-xs font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                {loading ? 'Authenticating...' : 'Enter SkillMirror'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-indigo-400 font-bold mb-2">Security Verification Required</p>
                <p className="text-[11px] text-slate-500">We've sent a 6-digit code to your registered email {email.replace(/(.{3})(.*)(@.*)/, "$1...$3")}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                  placeholder="000000"
                  className="w-40 text-center text-2xl tracking-[0.5em] px-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl text-xs font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                {loading ? 'Verifying...' : 'Complete Login'}
              </button>

              <button
                type="button"
                onClick={() => setIs2FARequired(false)}
                className="w_full text-[10px] font_bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                Back to credentials
              </button>
            </form>
          )}

          <div className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest px-2">
            <Link href="/signup"><span className="text-indigo-400 hover:text-indigo-300">Create Account</span></Link>
            <Link href="/forgot-password"><span className="text-indigo-400 hover:text-indigo-300">Reset Key</span></Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
