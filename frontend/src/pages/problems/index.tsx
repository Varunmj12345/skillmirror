import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal, StaggerChildren } from '../../components/motion/ScrollReveal';
import { CyberPageShell, PageStatChip } from '../../components/CyberPageShell';
import { motion, AnimatePresence } from 'framer-motion';

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
        search: search.trim()
      };
      if (sourceFilter === 'real_world') params.is_real_world = 'true';
      if (sourceFilter === 'ai_practice') params.source_type = 'AI_GENERATED_PRACTICE';

      const res: any = await problemService.getProblems(params);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProblems(list);
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

  const stats = useMemo(() => {
    const list = problems || [];
    const realWorldCount = list.filter(p => p.is_real_world && p.source_type !== 'AI_GENERATED_PRACTICE').length;
    const aiPracticeCount = list.filter(p => !p.is_real_world || p.source_type === 'AI_GENERATED_PRACTICE').length;
    return {
      total: list.length,
      realWorld: realWorldCount,
      aiPractice: aiPracticeCount,
    };
  }, [problems]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Healthcare Tech', label: 'Healthcare Tech' },
    { id: 'AgriTech', label: 'AgriTech' },
    { id: 'EdTech', label: 'EdTech' },
    { id: 'Retail & Small Business', label: 'Retail & Business' },
    { id: 'CivicTech & Gov', label: 'CivicTech & Gov' },
    { id: 'AI & Machine Learning', label: 'AI & Data Science' }
  ];

  return (
    <Layout>
      <Head>
        <title>Discover Real-World Problems • SkillMirror OS</title>
        <meta name="description" content="Verified real-world organizational challenges and AI-generated practice projects." />
      </Head>

      <CyberPageShell
        moduleCode="MOD-07"
        section="PROJECTS & REAL-WORLD PORTFOLIO"
        title="PROBLEM DISCOVERY & INTELLIGENCE"
        subtitle="Verified real-world challenges sourced from organizations, hospitals, NGOs, and startups to build verifiable Evidence of Skill."
        badge="REAL-WORLD DEMAND INDEX"
        badgeVariant="outline-cyan"
        bulletVariant="cyan"
        glowColor="cyan"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/problems/matches">
              <button className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-bullseye text-xs text-indigo-400" />
                <span>My Skill Matches</span>
              </button>
            </Link>
            <Link href="/projects">
              <button className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <i className="fa-solid fa-diagram-project text-xs text-cyan-400" />
                <span>My Projects</span>
              </button>
            </Link>
            <Link href="/problems/submit">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs" />
                <span>Submit Problem</span>
              </button>
            </Link>
          </div>
        }
        stats={
          <>
            <PageStatChip label="Total Problems" value={stats.total} icon="fa-folder-open" color="cyan" />
            <PageStatChip label="Real-World Org" value={stats.realWorld} icon="fa-building" color="emerald" />
            <PageStatChip label="AI Practice" value={stats.aiPractice} icon="fa-robot" color="amber" />
          </>
        }
      />

      <div className="px-4 sm:px-6 pb-24 max-w-[1400px] mx-auto space-y-8">
        {/* ── 1. Cyber Navigation Dock (Source Tabs & Search Matrix) ── */}
        <ScrollReveal>
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            {/* Top Source Type Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSourceFilter('all')}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                    sourceFilter === 'all'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <i className="fa-solid fa-globe text-xs" />
                  <span>All Problem Sources ({problems.length})</span>
                </button>

                <button
                  onClick={() => setSourceFilter('real_world')}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                    sourceFilter === 'real_world'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <i className="fa-solid fa-building-circle-check text-xs text-emerald-400" />
                  <span>Real-World Demands ({stats.realWorld})</span>
                </button>

                <button
                  onClick={() => setSourceFilter('ai_practice')}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${
                    sourceFilter === 'ai_practice'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <i className="fa-solid fa-robot text-xs text-purple-400" />
                  <span>AI Practice Challenges ({stats.aiPractice})</span>
                </button>
              </div>

              <Link href="/projects/status-center">
                <button className="text-[11px] font-mono font-bold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 self-end sm:self-auto transition-colors">
                  <i className="fa-solid fa-chart-line text-cyan-400" />
                  <span>Project Status Center</span>
                  <i className="fa-solid fa-arrow-right text-[9px]" />
                </button>
              </Link>
            </div>

            {/* Search Input & Selectors Row */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass text-slate-500 text-xs absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search problem titles, organization needs, tech requirements, or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); loadProblems(); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Domain:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs font-mono text-slate-300 font-bold outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Tier:</span>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="bg-transparent text-xs font-mono text-slate-300 font-bold outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-white">All Tiers</option>
                    <option value="beginner" className="bg-slate-900 text-white">Beginner</option>
                    <option value="intermediate" className="bg-slate-900 text-white">Intermediate</option>
                    <option value="advanced" className="bg-slate-900 text-white">Advanced</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-mono font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>

        {/* ── 2. Problem Intelligence Grid Stream ── */}
        <div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} className="!h-[280px]" />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden backdrop-blur-xl">
              <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-5 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                <i className="fa-solid fa-folder-open text-2xl text-slate-600" />
              </div>
              <h3 className="text-lg font-display font-black text-white">
                No Matching Problems Found
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Try adjusting your search keywords, clearing domain filters, or submit a verified real-world organizational requirement.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => { setSourceFilter('all'); setSelectedCategory('all'); setSelectedComplexity('all'); setSearch(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase transition-all"
                >
                  Reset All Filters
                </button>
                <Link href="/problems/submit">
                  <button className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2">
                    <i className="fa-solid fa-plus text-xs" />
                    <span>Submit New Problem</span>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((p) => {
                const isRealWorld = p.is_real_world && p.source_type !== 'AI_GENERATED_PRACTICE';
                const complexityPips = p.complexity === 'advanced' ? 3 : p.complexity === 'intermediate' ? 2 : 1;

                return (
                  <ScrollReveal stagger key={p.id}>
                    <div className="group relative rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 overflow-hidden hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)]">
                      {/* Top Accent Gradient Line */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isRealWorld ? 'from-emerald-500/50 via-teal-400/20 to-transparent' : 'from-purple-500/50 via-indigo-400/20 to-transparent'}`} />

                      <div className="space-y-3.5">
                        {/* Header Tags Row */}
                        <div className="flex items-center justify-between gap-2">
                          {isRealWorld ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <i className="fa-solid fa-building-shield text-[10px]" />
                              <span>REAL-WORLD DEMAND</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <i className="fa-solid fa-robot text-[10px]" />
                              <span>AI PRACTICE LAB</span>
                            </span>
                          )}

                          {/* Complexity Indicator */}
                          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-white/[0.05]">
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map((pip) => (
                                <span
                                  key={pip}
                                  className={`w-1.5 h-1.5 rounded-full ${pip <= complexityPips ? 'bg-amber-400' : 'bg-slate-700'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-400 ml-1">
                              {p.complexity || 'Med'}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-display font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                          {p.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs font-sans text-slate-300 line-clamp-3 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Organization & Industry Meta */}
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1.5 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                              <i className="fa-solid fa-building text-slate-500 text-[10px]" />
                              <span className="truncate">{p.organization_name || p.problem_owner_name || 'Independent Submitter'}</span>
                            </span>
                            <span className="text-cyan-400 font-bold truncate max-w-[120px] text-right">
                              {p.category}
                            </span>
                          </div>
                          {p.estimated_impact && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate pt-0.5 border-t border-white/[0.04]">
                              <i className="fa-solid fa-bolt-lightning text-amber-400 text-[9px]" />
                              <span className="truncate">Impact: {p.estimated_impact}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Skills & Action Deck */}
                      <div className="space-y-3.5 pt-3 border-t border-white/[0.06]">
                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                          {(p.required_skills_list || []).slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-lg bg-slate-950 border border-white/[0.08] text-[10px] font-mono font-medium text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {(p.required_skills_list || []).length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono text-slate-500">
                              +{(p.required_skills_list || []).length - 4}
                            </span>
                          )}
                        </div>

                        {/* Action Link */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-mono text-slate-500">
                            <i className="fa-regular fa-clock mr-1" />
                            {p.estimated_effort_weeks ? `${p.estimated_effort_weeks} Weeks` : '4 Weeks'}
                          </span>

                          <Link href={`/problems/${p.id}`} className="flex-1">
                            <button className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-slate-200 hover:text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn">
                              <span>Inspect & Build</span>
                              <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </StaggerChildren>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProblemsDiscoveryPage;
