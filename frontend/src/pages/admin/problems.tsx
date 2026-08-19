import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { problemService } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const AdminProblemPortalPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      const res: any = await problemService.getAdminDashboard();
      setData(res?.data || res);
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      if (err?.response?.status === 403) {
        router.push('/403');
      } else if (err?.response?.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const handleAction = async (problemId: number, action: string) => {
    try {
      await problemService.takeAdminAction(problemId, action);
      loadAdminDashboard();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  if (loading || !data) {
    return (
      <Layout>
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <SkeletonCard className="!h-[200px]" />
          <SkeletonCard className="!h-[400px]" />
        </div>
      </Layout>
    );
  }

  const stats = data.stats || {};
  const problems = data.problems || [];
  const duplicates = data.duplicates || [];

  return (
    <Layout>
      <Head>
        <title>Admin Problem Portal • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Admin Control Center</span>
            <h1 className="sm-h1 !text-4xl">Problem Intelligence Portal</h1>
            <p className="sm-body-text mt-1">Review submitted real-world problem statements, merge duplicate candidates, and validate organization sources. (Student projects require no admin approval).</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sm-glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Submitted</span>
            <p className="text-2xl font-black text-white">{stats.total_problems || 0}</p>
          </div>
          <div className="sm-glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Validated</span>
            <p className="text-2xl font-black text-emerald-400">{stats.validated_count || 0}</p>
          </div>
          <div className="sm-glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Duplicates Detected</span>
            <p className="text-2xl font-black text-amber-400">{stats.potential_duplicates || 0}</p>
          </div>
          <div className="sm-glass p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Student Projects</span>
            <p className="text-2xl font-black text-cyan-400">{stats.active_projects || 0}</p>
          </div>
        </div>

        {/* Duplicate candidates warning */}
        {duplicates.length > 0 && (
          <div className="sm-glass p-6 rounded-3xl border border-amber-500/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <i className="fa-solid fa-copy" />
              <span>Potential Duplicate Problems ({duplicates.length})</span>
            </h3>
            <div className="space-y-3 text-xs">
              {duplicates.map((dup: any) => (
                <div key={dup.id} className="p-4 rounded-2xl bg-slate-950/60 flex items-center justify-between border border-white/5">
                  <div>
                    <p className="font-bold text-white">Target Problem ID: {dup.target_problem}</p>
                    <p className="text-slate-400">Similarity Match: <span className="text-amber-400 font-bold">{dup.similarity_score}%</span></p>
                  </div>
                  <button
                    onClick={() => handleAction(dup.source_problem, 'merge')}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-all"
                  >
                    Merge Duplicate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Review Queue Table */}
        <div className="sm-glass p-7 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-white">Submitted Problems Queue</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase">
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {problems.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white max-w-[220px] truncate">{p.title}</td>
                    <td className="p-3 text-cyan-300 font-semibold">{p.category || 'General'}</td>
                    <td className="p-3 text-slate-300">{p.organization_name || 'Independent'}</td>
                    <td className="p-3 font-bold uppercase text-[10px] text-amber-400">{p.status}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(p.id, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'needs_info')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30"
                        >
                          Needs Info
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </Layout>
  );
};

export default AdminProblemPortalPage;
