import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { resetPassword } from '../services/auth';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { token, uid } = router.query;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await resetPassword({ token, uid, password });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Invalid or expired reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Reset Password • SkillMirror Core</title>
            </Head>
            <div className="min-h-[85vh] flex items-center justify-center p-6 bg-zinc-950 text-zinc-200">
                <div className="max-w-md w-full bg-zinc-900/95 border border-zinc-800 p-8 sm:p-10 space-y-6">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 mx-auto mb-4 flex items-center justify-center text-amber-400">
                            <i className="fa-solid fa-key text-xl"></i>
                        </div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400" />
                            SECURITY PROTOCOL UPDATE
                        </div>
                        <h1 className="text-2xl font-mono font-bold text-white tracking-tight mt-1">Set New Password</h1>
                        <p className="text-zinc-400 text-xs mt-1">Enter your new credentials to restore neural access.</p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-950/20 border border-emerald-800/60 text-emerald-400 text-center space-y-2">
                                <span className="w-2 h-2 bg-emerald-400 inline-block mb-1" />
                                <p className="text-sm font-mono font-bold">Password Reset Successful!</p>
                                <p className="text-xs text-zinc-400 font-mono">Redirecting to login portal...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3.5 bg-rose-950/20 border border-rose-800/60 text-rose-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-rose-400" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Updating Secret...' : 'Reset Password →'}
                            </button>

                            {!token && (
                                <p className="text-xs font-mono text-rose-400 text-center">Invalid search parameters detected.</p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ResetPasswordPage;
