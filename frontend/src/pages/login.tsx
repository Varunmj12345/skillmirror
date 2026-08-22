import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { TVNoise } from '../components/ui/tv-noise';
import { Bullet } from '../components/ui/bullet';

/* ── Decorative cyber grid background ─────────────────────── */
const CyberBackground: React.FC = () => (
  <>
    {/* Grid */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.07]"
      style={{
        backgroundImage: `linear-gradient(rgba(0,217,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.4) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
    {/* Ambient glows */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 blur-[160px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[450px] h-[300px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />
    <div className="absolute top-1/3 left-0 w-[300px] h-[200px] bg-blue-500/8 blur-[120px] rounded-full pointer-events-none" />
  </>
);

/* ── Alert banner ─────────────────────────────────────────── */
type AlertVariant = 'error' | 'success' | 'warning';
const Alert: React.FC<{ variant: AlertVariant; message: string }> = ({ variant, message }) => {
  const styles = {
    error:   { wrap: 'bg-red-500/10 border-red-500/25 text-red-400',     icon: 'fa-circle-xmark' },
    success: { wrap: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400', icon: 'fa-circle-check' },
    warning: { wrap: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: 'fa-triangle-exclamation' },
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

/* ── Input field ──────────────────────────────────────────── */
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
      {addon && (
        <div className="absolute inset-y-0 right-0 flex items-center">{addon}</div>
      )}
    </div>
  </div>
);

/* ── Spinning loader ──────────────────────────────────────── */
const Spinner: React.FC = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
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
      if (res && res['2fa_required']) setIs2FARequired(true);
    } catch (err: any) {
      const data = err?.response?.data;
      setError(data?.detail || data?.message || 'Invalid credentials. Please try again.');
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
      setError(err?.response?.data?.detail || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Secure Access • SkillMirror OS</title>
        <meta name="description" content="Sign in to your SkillMirror AI career intelligence platform." />
      </Head>

      <div className="min-h-screen flex bg-background relative overflow-hidden">
        <CyberBackground />
        <TVNoise opacity={0.025} intensity={0.14} speed={50} />

        {/* ── Left panel: decorative telemetry ── */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative z-10 border-r border-white/[0.05]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-display font-black text-white text-sm shadow-[0_0_16px_rgba(59,130,246,0.5)]">
              SM
            </div>
            <div>
              <span className="font-display font-black text-white tracking-widest text-sm uppercase">
                SkillMirror <span className="text-cyan-400">OS</span>
              </span>
              <div className="text-[10px] font-mono text-slate-500">v2.4-NEURAL CORE</div>
            </div>
          </div>

          {/* Middle content */}
          <div className="flex-1 flex flex-col justify-center gap-8 py-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono text-cyan-300 uppercase tracking-widest mb-5">
                <Bullet variant="cyan" size="sm" />
                <span>LIVE CAREER INTELLIGENCE</span>
              </div>
              <h2 className="text-3xl font-display font-black text-white tracking-tight leading-tight mb-3">
                Your Career<br />Operating System<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Awaits Access
                </span>
              </h2>
              <p className="text-sm font-mono text-slate-400 leading-relaxed">
                Real-time skill gap analysis, adaptive roadmaps, and AI mock interviews — all in one neural terminal.
              </p>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: '94.2%', label: 'Avg Readiness Score' },
                { val: '+$42k', label: 'Salary Uplift Avg' },
                { val: '10k+', label: 'Active Engineers' },
                { val: '3×', label: 'Faster Promotions' },
              ].map((s) => (
                <div key={s.label} className="p-3.5 rounded-xl bg-pop border border-white/[0.05]">
                  <div className="text-xl font-display font-black text-cyan-400">{s.val}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom telemetry row */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL SYSTEMS OPERATIONAL • SkillMirror Security v2.0</span>
          </div>
        </div>

        {/* ── Right panel: login form ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            {/* Card */}
            <div className="relative rounded-2xl bg-pop border border-white/[0.08] shadow-2xl overflow-hidden p-8">
              {/* Subtle top highlight line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              {/* Header */}
              <div className="mb-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_24px_rgba(0,217,255,0.3)]">
                  <i className="fa-solid fa-terminal text-xl text-white" />
                </div>
                <h1 className="text-2xl font-display font-black text-white tracking-tight">
                  {is2FARequired ? 'Verify Identity' : 'System Access'}
                </h1>
                <p className="text-[11px] font-mono text-slate-500 mt-1.5 uppercase tracking-widest">
                  {is2FARequired ? 'Enter your 6-digit verification code' : 'Career Intelligence Gateway • Auth Node'}
                </p>
              </div>

              <AnimatePresence>
                {!is2FARequired ? (
                  <motion.form
                    key="credentials"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {isExpired && !error && (
                        <Alert variant="warning" message="Session expired — please sign in again." />
                      )}
                      {justSignedUp && !error && (
                        <Alert variant="success" message="Account created! Sign in to continue." />
                      )}
                      {error && <Alert variant="error" message={error} />}
                    </AnimatePresence>

                    <InputField
                      label="Email Address"
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="name@company.com"
                      icon="fa-at"
                      error={!!error}
                      required
                    />

                    <InputField
                      label="Password"
                      id="login-password"
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

                    <div className="flex justify-end">
                      <Link href="/forgot-password">
                        <a className="text-[11px] font-mono text-cyan-400/80 hover:text-cyan-300 transition-colors">
                          Forgot password?
                        </a>
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="sm-btn-primary w-full py-4 text-xs mt-2"
                    >
                      {loading ? <><Spinner /> Authenticating...</> : (
                        <>
                          <i className="fa-solid fa-bolt text-xs" />
                          INITIALIZE SESSION
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs font-mono text-slate-500 pt-1">
                      No account?{' '}
                      <Link href="/signup">
                        <a className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                          Deploy free profile →
                        </a>
                      </Link>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="2fa"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onSubmit={handleVerify2FA}
                    className="space-y-5"
                  >
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                      <i className="fa-solid fa-shield-halved text-cyan-400 text-2xl mb-2" />
                      <p className="text-xs font-mono text-cyan-300 font-bold">Security Verification</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        Code sent to {email.replace(/(.{3})(.*)(@.*)/, '$1...$3')}
                      </p>
                    </div>

                    <AnimatePresence>
                      {error && <Alert variant="error" message={error} />}
                    </AnimatePresence>

                    <div className="flex justify-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        required
                        placeholder="000000"
                        className={`sm-input w-48 text-center text-2xl tracking-[0.6em] py-4 font-mono ${error ? 'error' : ''}`}
                      />
                    </div>

                    <button type="submit" disabled={loading} className="sm-btn-primary w-full py-4 text-xs">
                      {loading ? <><Spinner /> Verifying...</> : (
                        <><i className="fa-solid fa-check-circle text-xs" /> CONFIRM IDENTITY</>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIs2FARequired(false)}
                      className="w-full text-[11px] font-mono font-semibold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest pt-1"
                    >
                      ← Back to credentials
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-[10px] font-mono text-slate-600 mt-4">
              Protected by SkillMirror Security • Encrypted Node v2.4
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
