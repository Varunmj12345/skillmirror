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
        <title>Admin Problem Portal • SkillMirror Core</title>
      </Head>

      <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 bg-amber-400" />
              ADMIN CONTROL CENTER
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">Problem Intelligence Portal</h1>
            <p className="text-xs font-sans text-zinc-400 mt-1">Review submitted real-world problem statements, merge duplicate candidates, and validate organization sources.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Total Submitted</span>
            <p className="text-2xl font-mono font-bold text-white">{stats.total_problems || 0}</p>
          </div>
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Validated</span>
            <p className="text-2xl font-mono font-bold text-emerald-400">{stats.validated_count || 0}</p>
          </div>
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Duplicates Detected</span>
            <p className="text-2xl font-mono font-bold text-amber-400">{stats.potential_duplicates || 0}</p>
          </div>
          <div className="p-5 bg-zinc-900/90 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Active Student Projects</span>
            <p className="text-2xl font-mono font-bold text-white">{stats.active_projects || 0}</p>
          </div>
        </div>

        {/* Duplicate candidates warning */}
        {duplicates.length > 0 && (
          <div className="p-6 bg-amber-950/20 border border-amber-800/60 space-y-4">
            <h3 className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400" />
              <span>Potential Duplicate Problems ({duplicates.length})</span>
            </h3>
            <div className="space-y-3 text-xs">
              {duplicates.map((dup: any) => (
                <div key={dup.id} className="p-4 bg-zinc-950 flex items-center justify-between border border-zinc-800">
                  <div>
                    <p className="font-mono font-bold text-white">Target Problem ID: {dup.target_problem}</p>
                    <p className="text-zinc-400 text-xs font-mono">Similarity Match: <span className="text-amber-400 font-bold">{dup.similarity_score}%</span></p>
                  </div>
                  <button
                    onClick={() => handleAction(dup.source_problem, 'merge')}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Merge Duplicate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Review Queue Table */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 space-y-6">
          <h3 className="text-base font-mono font-bold text-white">Submitted Problems Queue</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono uppercase text-[10px]">
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {problems.map((p: any) => (
                  <tr key={p.id} className="hover:bg-zinc-950/60 transition-colors">
                    <td className="p-3 font-bold text-white max-w-[220px] truncate">{p.title}</td>
                    <td className="p-3 text-amber-400 font-semibold">{p.category || 'General'}</td>
                    <td className="p-3 text-zinc-400">{p.organization_name || 'Independent'}</td>
                    <td className="p-3 font-bold uppercase text-[10px] text-zinc-300">[ {p.status} ]</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(p.id, 'approve')}
                          className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 font-mono font-bold text-[11px] uppercase hover:bg-emerald-900/50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'needs_info')}
                          className="px-2.5 py-1 bg-amber-950/40 text-amber-400 border border-amber-800/60 font-mono font-bold text-[11px] uppercase hover:bg-amber-900/50"
                        >
                          Needs Info
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'reject')}
                          className="px-2.5 py-1 bg-rose-950/40 text-rose-400 border border-rose-800/60 font-mono font-bold text-[11px] uppercase hover:bg-rose-900/50"
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
      </div>
    </Layout>
  );
};

export default AdminProblemPortalPage;
