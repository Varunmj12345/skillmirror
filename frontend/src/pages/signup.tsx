import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { registerUser } from '../services/auth';
import { Button } from '../components/ui/button';

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
      let msg = err?.message || 'Registration failed. Please check your network and try again.';
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
    <>
      <Head>
        <title>Deploy Profile • SkillMirror Core</title>
        <meta name="description" content="Initialize your SkillMirror AI career defense identity." />
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

            <Link href="/login">
              <a className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                Already have access? Sign In →
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
            className="w-full max-w-lg"
          >
            <div className="border border-zinc-700/80 bg-zinc-900/90 backdrop-blur-xl p-8 md:p-10 shadow-2xl relative">
              {/* Status Header */}
              <div className="flex items-center gap-2.5 px-3 py-1 border border-zinc-700 w-fit mb-6 bg-zinc-950/60">
                <div className="w-2 h-2 bg-amber-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Node Initialization
                </span>
              </div>

              <h1 className="text-3xl font-normal tracking-tight text-white mb-2">
                Deploy Your Sentinel Profile
              </h1>
              <p className="text-sm text-zinc-400 mb-8 font-mono">
                Initialize your autonomous vector profile and begin continuous career defense.
              </p>

              {/* Error Alert */}
              <AnimatePresence>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Full Name / Handle
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Alex Rivera"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 text-sm font-mono focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 text-sm font-mono focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Target Engineering Role
                  </label>
                  <input
                    type="text"
                    value={dreamJob}
                    onChange={(e) => setDreamJob(e.target.value)}
                    placeholder="Staff Distributed Systems Architect"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 text-sm font-mono focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Master Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-mono text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={8}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 px-4 py-3 text-sm font-mono focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="white"
                  size="lg"
                  className="w-full text-xs uppercase tracking-widest font-semibold mt-4"
                >
                  {loading ? 'Initializing Node...' : 'Deploy Profile Now'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                <span className="text-xs font-mono text-zinc-500">
                  Already registered?{' '}
                  <Link href="/login">
                    <a className="text-white hover:underline font-medium">Access terminal</a>
                  </Link>
                </span>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Minimalist Bottom Bar */}
        <footer className="relative z-10 w-full px-6 py-6 border-t border-zinc-800/80 text-center text-xs font-mono text-zinc-500">
          Zero-Knowledge Credentials • Encrypted Career Vector Architecture
        </footer>
      </div>
    </>
  );
};

export default Signup;
