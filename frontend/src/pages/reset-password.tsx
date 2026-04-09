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
                <title>Reset Password • SkillMirror AI</title>
            </Head>
            <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-950">
                <div className="max-w-md w-full glass-panel p-10 border-slate-800 shadow-3xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-violet-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                            <i className="fa-solid fa-key text-white text-3xl"></i>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Set New Password</h1>
                        <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.2em]">Security Protocol Update</p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center">
                                <i className="fa-solid fa-circle-check text-2xl mb-3 block"></i>
                                <p className="text-sm font-bold">Password Reset Successful!</p>
                                <p className="text-[10px] mt-2 text-slate-400 uppercase tracking-widest">Redirecting to login...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-700 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder:text-slate-700 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full btn-primary py-4 rounded-2xl text-xs font-black shadow-xl shadow-violet-600/20 transition-all active:scale-95 bg-violet-600 hover:bg-violet-500"
                            >
                                {loading ? 'Updating Secret...' : 'Reset Password'}
                            </button>

                            {!token && (
                                <p className="text-[10px] text-rose-400 font-bold text-center uppercase tracking-widest">Invalid search parameters detected.</p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ResetPasswordPage;
