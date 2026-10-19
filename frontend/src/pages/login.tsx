import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

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
      } else {
        const redirect = (router.query.redirect as string) || '/dashboard';
        router.push(redirect);
      }
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
      const redirect = (router.query.redirect as string) || '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Secure Access • SkillMirror Core</title>
        <meta name="description" content="Sign in to your SkillMirror AI career intelligence portal." />
      </Head>

      <div className="relative min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black overflow-hidden">
        {/* Background Hero Image with Dark Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950 pointer-events-none" />

        {/* Skydda Vertical Bounding Lines */}
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="mx-auto h-full max-w-7xl">
            <div className="relative h-full">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-700/30" />
              <div className="absolute right-0 top-0 h-full w-px bg-zinc-700/30" />
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <header className="relative z-10 w-full px-6 py-6 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-3 text-white group cursor-pointer">
                <div className="w-8 h-8 border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-medium text-base text-white">
                  SkillMirror <span className="text-amber-500 text-xs font-mono">CORE</span>
                </span>
              </a>
            </Link>

            <Link href="/signup">
              <a className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                Deploy Account Free →
              </a>
            </Link>
          </div>
        </header>

        {/* Form Container */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="border border-zinc-700/80 bg-zinc-900/90 backdrop-blur-xl p-8 md:p-10 shadow-2xl relative">
              {/* Status Header */}
              <div className="flex items-center gap-2.5 px-3 py-1 border border-zinc-700 w-fit mb-6 bg-zinc-950/60">
                <div className="w-2 h-2 bg-amber-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {is2FARequired ? '2FA Identity Check' : 'Sentinel Authentication'}
                </span>
              </div>

              <h1 className="text-3xl font-normal tracking-tight text-white mb-2">
                {is2FARequired ? 'Verify Identity' : 'Access Sentinel'}
              </h1>
              <p className="text-sm text-zinc-400 mb-8 font-mono">
                {is2FARequired
                  ? 'Enter the 6-digit confirmation code generated for your profile.'
                  : 'Enter your credentials to access your career telemetry node.'}
              </p>

              {/* Alerts */}
              <AnimatePresence>
                {isExpired && !error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-3 border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Session expired. Please re-authenticate.</span>
                  </motion.div>
                )}
                {justSignedUp && !error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Account initialized! Sign in to enter your dashboard.</span>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-3 border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {!is2FARequired ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="engineer@domain.com"
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 text-sm font-mono focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] font-mono text-zinc-500 hover:text-white transition-colors"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 text-sm font-mono focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link href="/forgot-password">
                      <a className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
                        Forgot password?
                      </a>
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="white"
                    size="lg"
                    className="w-full text-xs uppercase tracking-widest font-semibold mt-4"
                  >
                    {loading ? 'Authenticating...' : 'Enter System'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify2FA} className="space-y-5">
                  <div className="space-y-2 text-center">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      required
                      placeholder="000000"
                      className="w-48 mx-auto text-center text-2xl tracking-[0.5em] py-3 bg-zinc-950 border border-zinc-800 text-white font-mono focus:border-white focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="white"
                    size="lg"
                    className="w-full text-xs uppercase tracking-widest font-semibold"
                  >
                    {loading ? 'Verifying...' : 'Confirm 2FA'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIs2FARequired(false)}
                    className="w-full text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-wider pt-2"
                  >
                    ← Back to credentials
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                <span className="text-xs font-mono text-zinc-500">
                  New to SkillMirror?{' '}
                  <Link href="/signup">
                    <a className="text-white hover:underline font-medium">Create profile</a>
                  </Link>
                </span>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Minimalist Bottom Bar */}
        <footer className="relative z-10 w-full px-6 py-6 border-t border-zinc-800/80 text-center text-xs font-mono text-zinc-500">
          Protected by SkillMirror Security Core • 256-bit AES
        </footer>
      </div>
    </>
  );
};

export default Login;
