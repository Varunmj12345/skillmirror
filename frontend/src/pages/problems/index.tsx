import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';

const ProblemsDiscoveryPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'real_world' | 'ai_practice'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const loadProblems = async () => {
    try {
      setLoading(true);
      const params: any = {
        category: selectedCategory,
        complexity: selectedComplexity,
        search
      };
      if (sourceFilter === 'real_world') params.is_real_world = 'true';
      if (sourceFilter === 'ai_practice') params.source_type = 'AI_GENERATED_PRACTICE';

      const res: any = await problemService.getProblems(params);
      setProblems(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [sourceFilter, selectedCategory, selectedComplexity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProblems();
  };

  const renderSourceBadge = (p: Problem) => {
    if (!p.is_real_world || p.source_type === 'AI_GENERATED_PRACTICE') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <i className="fa-solid fa-robot" />
          <span>AI-GENERATED PRACTICE PROJECT</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
        <i className="fa-solid fa-building flex-shrink-0" />
        <span>REAL-WORLD PROJECT</span>
      </span>
    );
  };

  return (
    <Layout>
      <Head>
        <title>Problem Discovery & Intelligence • SkillMirror</title>
      </Head>

      <ScrollReveal className="space-y-10">
        {/* Header Terminal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Problem Discovery & Intelligence Engine</span>
            </div>
            <h1 className="sm-h1 !text-4xl lg:!text-5xl">Validated Problem Directory</h1>
            <p className="sm-body-text mt-2 max-w-2xl">
              Discover verified real-world requirements from organizations, startups, hospitals, and NGOs, or explore AI-generated practice challenges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/evaluator/dashboard">
              <button className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs hover:bg-indigo-500/20 transition-all flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check" />
                <span>Evaluator Dashboard</span>
              </button>
            </Link>
            <Link href="/owner/dashboard">
              <button className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold text-xs hover:bg-cyan-500/20 transition-all flex items-center gap-2">
                <i className="fa-solid fa-user-shield" />
                <span>Problem Owner Portal</span>
              </button>
            </Link>
            <Link href="/projects/status-center">
              <button className="px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2">
                <i className="fa-solid fa-diagram-project" />
                <span>Status Center</span>
              </button>
            </Link>
            <Link href="/problems/submit">
              <button className="sm-btn-primary py-2.5 px-5 !text-xs uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-plus" />
                <span>Submit Problem</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Source Type Filter Tabs */}
        <div className="flex border-b border-white/10 text-sm font-bold">
          <button
            onClick={() => setSourceFilter('all')}
            className={`pb-3 px-5 border-b-2 transition-all flex items-center gap-2 ${sourceFilter === 'all' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-globe" />
            <span>All Problems ({problems.length})</span>
          </button>
          <button
            onClick={() => setSourceFilter('real_world')}
            className={`pb-3 px-5 border-b-2 transition-all flex items-center gap-2 ${sourceFilter === 'real_world' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-building" />
            <span>Real-World Projects</span>
          </button>
          <button
            onClick={() => setSourceFilter('ai_practice')}
            className={`pb-3 px-5 border-b-2 transition-all flex items-center gap-2 ${sourceFilter === 'ai_practice' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-robot" />
            <span>AI Practice Projects</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="sm-glass p-6 rounded-3xl space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                type="text"
                placeholder="Search by keywords, organization, tech stack, or requirement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl hover:bg-cyan-500/30 transition-all">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Healthcare Tech">Healthcare Tech</option>
                <option value="AgriTech">AgriTech</option>
                <option value="EdTech">EdTech</option>
                <option value="Retail & Small Business">Retail & Business</option>
                <option value="CivicTech & Gov">CivicTech & Gov</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Complexity:</span>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="!h-[240px]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="sm-glass p-12 rounded-3xl text-center space-y-4 border border-white/5">
            <i className="fa-solid fa-folder-open text-4xl text-slate-600" />
            <h3 className="text-lg font-bold text-white">No Problems Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No problems match your current search or source filters. Try adjusting your search query or submit a new problem.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((p) => (
              <div key={p.id} className="sm-glass p-6 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-5 group">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {renderSourceBadge(p)}
                    <span className="text-[10px] font-bold text-slate-400 capitalize">{p.complexity}</span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                    <i className="fa-solid fa-building text-slate-500" />
                    <span>{p.organization_name || p.problem_owner_name || 'Independent Submitter'}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-semibold">{p.category}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {(p.required_skills_list || []).slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-white/5 text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <Link href={`/problems/${p.id}`} className="block">
                    <button className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/10 font-bold text-xs transition-all flex items-center justify-center gap-2">
                      <span>Inspect Requirements</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
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

export default ProblemsDiscoveryPage;
