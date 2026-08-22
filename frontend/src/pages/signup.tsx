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
    <label htmlFor={id} className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <i className={`fa-solid ${icon} text-xs text-slate-500`} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`sm-input pl-10 ${addon ? 'pr-16' : ''} ${error ? 'error' : ''}`}
      />
      {addon && <div className="absolute inset-y-0 right-0 flex items-center">{addon}</div>}
    </div>
  </div>
);

/* ── Spinner ─────────────────────────────────────────────── */
const Spinner: React.FC = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   SIGNUP PAGE
   ═══════════════════════════════════════════════════════════ */
const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'problem_owner' | 'evaluator'>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: pick role | Step 2: fill details
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

  const selectedRole = roleOptions.find((r) => r.id === role)!;

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
          className="relative z-10 w-full max-w-xl"
        >
          {/* Top brand bar */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <a className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-black text-white text-xs shadow-[0_0_14px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
                  SM
                </div>
                <span className="font-display font-black text-white text-sm tracking-widest uppercase">
                  SkillMirror <span className="text-cyan-400">OS</span>
                </span>
              </a>
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>REGISTRATION NODE: OPEN</span>
            </div>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl bg-pop border border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* Step Indicator */}
            <div className="px-8 pt-8 pb-0">
              <div className="flex items-center gap-3 mb-6">
                {[1, 2].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${step >= s ? 'text-cyan-400' : 'text-slate-600'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(0,217,255,0.5)]' : 'bg-pop border border-white/[0.08] text-slate-600'}`}>
                        {step > s ? <i className="fa-solid fa-check text-[8px]" /> : s}
                      </div>
                      <span className="hidden sm:block">{s === 1 ? 'Select Role' : 'Account Details'}</span>
                    </div>
                    {s < 2 && <div className={`flex-1 h-px transition-colors ${step > 1 ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />}
                  </React.Fragment>
                ))}
              </div>

              <h1 className="text-2xl font-display font-black text-white tracking-tight mb-1">
                {step === 1 ? 'Choose Your Role' : 'Create Your Account'}
              </h1>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-6">
                {step === 1 ? 'Select the access domain that fits your mission' : `Registering as ${selectedRole.title}`}
              </p>
            </div>

            <div className="px-8 pb-8">
              <AnimatePresence>
                {/* STEP 1 — Role Selection */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className="space-y-3"
                  >
                    {roleOptions.map((opt) => {
                      const isActive = role === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRole(opt.id as any)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                            isActive
                              ? `bg-card ${opt.accentClass}`
                              : 'bg-card/50 border-white/[0.05] hover:border-white/[0.15] hover:bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-pop border border-white/[0.06]'}`}>
                              <i className={`fa-solid ${opt.icon} text-sm ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-mono font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                  {opt.title}
                                </span>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,217,255,0.8)]" />
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 leading-normal mt-0.5">
                                {opt.desc}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'border-cyan-400 bg-cyan-400' : 'border-white/[0.15]'}`}>
                              {isActive && <i className="fa-solid fa-check text-[8px] text-black" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="sm-btn-primary w-full py-4 text-xs mt-4"
                    >
                      <span>CONTINUE AS {selectedRole.title.toUpperCase()}</span>
                      <i className="fa-solid fa-chevron-right text-[10px]" />
                    </button>

                    <p className="text-center text-xs font-mono text-slate-500 pt-1">
                      Already have an account?{' '}
                      <Link href="/login">
                        <a className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                          Sign in →
                        </a>
                      </Link>
                    </p>
                  </motion.div>
                )}

                {/* STEP 2 — Account Details */}
                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Role summary chip */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <i className={`fa-solid ${selectedRole.icon} text-xs text-cyan-400`} />
                      <span className="text-[11px] font-mono text-cyan-300 font-bold">{selectedRole.title}</span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="ml-auto text-[10px] font-mono text-slate-500 hover:text-cyan-300 transition-colors uppercase tracking-wide"
                      >
                        Change
                      </button>
                    </div>

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
                          className="px-4 h-full text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      }
                    />

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="sm-btn-neon !py-4 !px-5 text-xs flex-shrink-0"
                      >
                        <i className="fa-solid fa-chevron-left text-[10px]" />
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="sm-btn-primary flex-1 py-4 text-xs"
                      >
                        {loading ? (
                          <><Spinner /> Deploying Profile...</>
                        ) : (
                          <><i className="fa-solid fa-rocket text-xs" /> DEPLOY PROFILE</>
                        )}
                      </button>
                    </div>

                    <p className="text-center text-[10px] font-mono text-slate-600 pt-1">
                      By registering you agree to our Terms of Service & Privacy Policy.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-center text-[10px] font-mono text-slate-600 mt-4">
            SkillMirror OS • Encrypted Registration Node v2.4
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Signup;
