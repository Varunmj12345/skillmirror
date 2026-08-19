import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import useAuth from '../hooks/useAuth';
import { registerUser } from '../services/auth';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'problem_owner' | 'evaluator' | 'admin'>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser({ username, email, password, role });
      router.push('/login?fromSignup=1');
    } catch (err: any) {
      const data = err?.response?.data ?? err;
      let msg = err?.message || 'Signup failed. Check your connection and try again.';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (Array.isArray(data.email)) msg = data.email[0];
        else if (Array.isArray(data.username)) msg = data.username[0];
        else if (data.email) msg = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.username) msg = Array.isArray(data.username) ? data.username[0] : data.username;
        else if (data.detail) msg = Array.isArray(data.detail) ? data.detail[0] : data.detail;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'student',
      title: 'Student Developer',
      desc: 'Discover real-world problems, build MVP projects & prove verified skills.',
      icon: 'fa-user-graduate',
      color: 'from-indigo-600 to-violet-600'
    },
    {
      id: 'problem_owner',
      title: 'Problem Owner / Requester',
      desc: 'Submit genuine challenges from your company, hospital, NGO or startup.',
      icon: 'fa-building',
      color: 'from-cyan-600 to-blue-600'
    },
    {
      id: 'evaluator',
      title: 'Technical Evaluator',
      desc: 'Review code repos, verify requirement coverage & guide project iterations.',
      icon: 'fa-clipboard-check',
      color: 'from-emerald-600 to-teal-600'
    }
  ] as const;

  return (
    <Layout>
      <Head>
        <title>Create Account • SkillMirror AI</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden px-4 py-12">

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-700/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-indigo-700/15 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl"
        >
          {/* Card */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/40 p-8 sm:p-10">

            {/* Logo + heading */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-violet-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Create SkillMirror Account</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1 uppercase tracking-[0.2em]">Select your primary role & access domain</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </motion.div>
              )}

              {/* Role Selection Grid */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Account Role *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setRole(opt.id as any)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 flex flex-col justify-between ${
                        role === opt.id
                          ? 'bg-slate-850 border-cyan-400/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                          : 'bg-slate-950/60 border-white/5 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white text-xs font-bold`}>
                          <i className={`fa-solid ${opt.icon}`} />
                        </div>
                        {role === opt.id && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{opt.title}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Username field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="yourname"
                  className={`sm-input px-4 py-3.5 text-sm ${error ? 'error' : ''}`}
                />
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className={`sm-input px-4 py-3.5 text-sm ${error ? 'error' : ''}`}
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`sm-input px-4 pr-16 py-3.5 text-sm ${error ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sm-btn-primary w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Role Account...' : `Register as ${roleOptions.find(r => r.id === role)?.title} →`}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Already have an account?{' '}
                <Link href="/login"><span className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in here</span></Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Signup;
