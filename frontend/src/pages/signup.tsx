import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import useAuth from '../hooks/useAuth';
import { registerUser } from '../services/auth';
import { TVNoise } from '../components/ui/tv-noise';
import { Bullet } from '../components/ui/bullet';

/* ── Decorative cyber background ────────────────────────── */
const CyberBackground: React.FC = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage: `linear-gradient(rgba(0,217,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.4) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
    <div className="absolute top-0 right-1/2 translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/8 blur-[160px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[280px] bg-cyan-500/8 blur-[130px] rounded-full pointer-events-none" />
  </>
);

/* ── Alert banner ────────────────────────────────────────── */
type AlertVariant = 'error' | 'success' | 'warning';
const Alert: React.FC<{ variant: AlertVariant; message: string }> = ({ variant, message }) => {
  const styles = {
    error:   { wrap: 'bg-red-500/10 border-red-500/25 text-red-400',      icon: 'fa-circle-xmark' },
    success: { wrap: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', icon: 'fa-circle-check' },
    warning: { wrap: 'bg-amber-500/10 border-amber-500/25 text-amber-400',  icon: 'fa-triangle-exclamation' },
  }[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      className={`flex items-center gap-3 p-3.5 border rounded-xl text-xs font-mono font-semibold ${styles.wrap}`}
    >
      <i className={`fa-solid ${styles.icon} text-sm flex-shrink-0`} />
      <span>{message}</span>
    </motion.div>
  );
};

/* ── Role card ───────────────────────────────────────────── */
const roleOptions = [
  {
    id: 'student',
    title: 'Student Developer',
    desc: 'Discover real-world problems, build MVP projects & prove verified skills.',
    icon: 'fa-user-graduate',
    bulletVariant: 'cyan',
    accentClass: 'border-cyan-500/50 shadow-[0_0_20px_rgba(0,217,255,0.12)]',
  },
  {
    id: 'problem_owner',
    title: 'Problem Owner',
    desc: 'Submit genuine challenges from your company, hospital, NGO or startup.',
    icon: 'fa-building',
    bulletVariant: 'default',
    accentClass: 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.12)]',
  },
  {
    id: 'evaluator',
    title: 'Technical Evaluator',
    desc: 'Review code repos, verify coverage & guide project iterations.',
    icon: 'fa-clipboard-check',
    bulletVariant: 'success',
    accentClass: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.12)]',
  },
] as const;

/* ── Input field ─────────────────────────────────────────── */
interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: string;
  error?: boolean;
  addon?: React.ReactNode;
  required?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({
  label, id, type = 'text', value, onChange, placeholder, icon, error, addon, required,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <i className={`fa-solid ${icon} text-xs text-slate-400 dark:text-slate-500`} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-card border rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-400 transition-all ${
          error ? 'border-red-500/60' : 'border-slate-200 dark:border-white/[0.08]'
        } ${addon ? 'pr-20' : ''}`}
      />
      {addon && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {addon}
        </div>
      )}
    </div>
  </div>
);

/* ── Spinner ─────────────────────────────────────────────── */
const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
);

/* ═══════════════════════════════════════════════════════════
   SIGNUP PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dreamJob, setDreamJob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser({ username, email, password, role: 'student', dream_job: dreamJob });
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

  return (
    <Layout>
      <Head>
        <title>Deploy Profile • SkillMirror OS</title>
        <meta name="description" content="Create your SkillMirror AI career intelligence account." />
      </Head>

      <div className="min-h-screen bg-background relative overflow-hidden flex items-start justify-center py-12 px-4 sm:px-6">
        <CyberBackground />
        <TVNoise opacity={0.025} intensity={0.14} speed={50} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Top brand bar */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <a className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-primary flex items-center justify-center font-display font-black text-white text-xs shadow-md group-hover:scale-105 transition-transform">
                  SM
                </div>
                <span className="font-display font-black text-slate-900 dark:text-white text-sm tracking-widest uppercase">
                  SkillMirror <span className="text-blue-600 dark:text-cyan-400">OS</span>
                </span>
              </a>
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>REGISTRATION NODE: OPEN</span>
            </div>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl bg-card dark:bg-pop border border-border shadow-light-card dark:shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 dark:via-indigo-500/50 to-transparent" />

            <div className="p-7 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-1">
                  Create Your Account
                </h1>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Deploy your autonomous AI career telemetry & assessment engine
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && <Alert variant="error" message={error} />}
                </AnimatePresence>

                <InputField
                  label="Username"
                  id="signup-username"
                  value={username}
                  onChange={setUsername}
                  placeholder="yourhandle"
                  icon="fa-at"
                  error={!!error}
                  required
                />
                <InputField
                  label="Email Address"
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="name@company.com"
                  icon="fa-envelope"
                  error={!!error}
                  required
                />
                <InputField
                  label="Target Career Goal"
                  id="signup-dream-job"
                  value={dreamJob}
                  onChange={setDreamJob}
                  placeholder="e.g. Senior Backend Engineer"
                  icon="fa-bullseye"
                  error={!!error}
                />
                <InputField
                  label="Password"
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  icon="fa-lock"
                  error={!!error}
                  required
                  addon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="px-4 h-full text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  }
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="sm-btn-primary w-full py-4 text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2"><Spinner /> Deploying Profile...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-rocket text-xs" /> DEPLOY PROFILE</span>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs font-mono text-slate-500 pt-2">
                  Already have an account?{' '}
                  <Link href="/login">
                    <a className="text-blue-600 dark:text-cyan-400 hover:underline font-bold transition-colors">
                      Sign in →
                    </a>
                  </Link>
                </p>

                <p className="text-center text-[10px] font-mono text-slate-400 dark:text-slate-600 pt-1">
                  By registering you agree to our Terms of Service & Privacy Policy.
                </p>
              </form>
            </div>
          </div>

          <p className="text-center text-[10px] font-mono text-slate-500 dark:text-slate-600 mt-4">
            SkillMirror OS • Encrypted Registration Node v3.0
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Signup;
