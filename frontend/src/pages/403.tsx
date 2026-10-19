import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { ScrollReveal } from '../components/motion/ScrollReveal';

const ForbiddenPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>403 Access Forbidden • SkillMirror Core</title>
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4 text-zinc-200">
        <div className="bg-zinc-900/90 border border-zinc-800 p-10 lg:p-12 max-w-lg text-center space-y-6">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center text-rose-400 text-2xl">
            <i className="fa-solid fa-lock" />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-400" />
              403 AUTHORIZATION BOUNDARY
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">Access Forbidden</h1>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Your account does not have authorization to access this domain or platform resource. Access is strictly scoped to authorized user roles.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full py-3 px-6 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors">
                Return to Command Center
              </button>
            </Link>
            <Link href="/admin/login" className="w-full sm:w-auto">
              <button className="w-full py-3 px-6 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors">
                Admin Gateway
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForbiddenPage;
