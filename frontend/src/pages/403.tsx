import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { ScrollReveal } from '../components/motion/ScrollReveal';

const ForbiddenPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>403 Access Forbidden • SkillMirror</title>
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <ScrollReveal className="sm-glass p-10 lg:p-12 rounded-3xl border border-rose-500/20 max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400 text-3xl shadow-lg shadow-rose-500/10">
            <i className="fa-solid fa-lock" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-rose-400">403 Authorization Boundary</span>
            <h1 className="text-3xl font-black text-white">Access Forbidden</h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your account does not have authorization to access this domain or platform resource. Access is strictly scoped to authorized user roles.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="sm-btn-primary w-full py-3 px-6 text-xs font-bold uppercase tracking-widest">
                Return to Student Dashboard
              </button>
            </Link>
            <Link href="/admin/login" className="w-full sm:w-auto">
              <button className="w-full py-3 px-6 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-all">
                Admin Login Gateway
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </Layout>
  );
};

export default ForbiddenPage;
