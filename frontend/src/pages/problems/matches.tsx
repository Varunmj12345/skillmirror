import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const MyMatchedProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res: any = await problemService.getProblems();
      const list: Problem[] = Array.isArray(res) ? res : (res?.data || []);
      setProblems(list);
    } catch (err) {
      console.error('Failed to load matched problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <Layout>
      <Head>
        <title>My Matched Problems • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Skill Intelligence Engine</span>
            </div>
            <h1 className="sm-h1 !text-4xl">My Matched Problems</h1>
            <p className="sm-body-text mt-1">
              Real-world problems matched against your verified skills, proficiency levels, and target career path.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[220px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="sm-glass p-12 text-center rounded-3xl space-y-3">
            <div className="text-4xl">🎯</div>
            <h3 className="text-lg font-bold text-white">No problem matches yet</h3>
            <p className="text-sm text-slate-400">Add more skills to your profile to unlock matched real-world problems.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((prob) => (
              <div key={prob.id} className="sm-glass p-6 rounded-3xl space-y-4 border border-indigo-500/20 sm-card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                    {prob.category || 'General'}
                  </span>
                  <span className="text-xs font-black text-emerald-400">78% Skill Match</span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2">
                  {prob.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {prob.description}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{prob.estimated_effort_weeks || 4} Weeks</span>
                  <Link href={`/problems/${prob.id}`}>
                    <button className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold hover:bg-indigo-500/30 transition-all">
                      Build Solution →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>
    </Layout>
  );
};

export default MyMatchedProblemsPage;
