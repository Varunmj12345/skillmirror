import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { problemService, Problem } from '../../services/problemService';
import { SkeletonCard } from '../../components/motion/Skeleton';
import { ScrollReveal } from '../../components/motion/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssessmentWorkspacePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Submission Form State
  const [codeSnippet, setCodeSnippet] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<any | null>(null);
  
  // Progressive Hints State
  const [activeHintLevel, setActiveHintLevel] = useState<number | null>(null);
  const [hintContent, setHintContent] = useState<any | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res: any = await problemService.getProblemById(id as string);
      const probData = res?.data || res;
      setProblem(probData);
      
      // Starter code default template
      if (!codeSnippet) {
        setCodeSnippet(
          `// Challenge: ${probData.title}\n// Domain: ${probData.category || 'Backend Architecture'}\n\nfunction solveChallenge(inputData) {\n  // 1. Validate input\n  if (!inputData) return null;\n\n  // 2. Implement your core logic\n  const result = {\n    processed: true,\n    timestamp: Date.now()\n  };\n\n  // 3. Return verified outcome\n  return result;\n}\n\nmodule.exports = { solveChallenge };`
        );
      }
    } catch (err) {
      console.error('Failed to load challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleRequestHint = async (level: number) => {
    if (!problem) return;
    try {
      setLoadingHint(true);
      setActiveHintLevel(level);
      const res: any = await problemService.getProgressiveHint(problem.id, level);
      setHintContent(res?.data || res);
    } catch (err) {
      console.error('Failed to get hint:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleEvaluateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    try {
      setIsEvaluating(true);
      setEvaluationReport(null);

      const res: any = await problemService.evaluateSubmission(problem.id, {
        code_snippet: codeSnippet,
        github_url: githubUrl,
        published_url: publishedUrl,
        documentation: documentation
      });

      const data = res?.data || res;
      setEvaluationReport(data.evaluation || data);
    } catch (err) {
      console.error('Evaluation failed:', err);
      alert('Failed to evaluate assessment. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading || !problem) {
    return (
      <Layout>
        <div className="p-8 max-w-6xl mx-auto space-y-6">
          <SkeletonCard className="!h-[320px]" />
          <SkeletonCard className="!h-[400px]" />
        </div>
      </Layout>
    );
  }

  const requirements = problem.requirements || [];

  return (
    <Layout>
      <Head>
        <title>{problem.title} • AI Assessment Portal • SkillMirror Core</title>
        <meta name="description" content="Take the interactive AI assessment and receive instant automated grading." />
      </Head>

      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 py-6 text-zinc-200">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link href="/problems" className="hover:text-amber-400 transition-colors">
              PRACTICE ARENA
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-white font-bold truncate max-w-xs">{problem.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400" />
              +150 XP Reward
            </span>
            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono font-bold uppercase">
              [ {problem.complexity || 'Intermediate'} ]
            </span>
          </div>
        </div>

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT PANEL: Challenge Specifications & Hints ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Challenge Specs Card */}
            <div className="p-6 bg-zinc-900/90 border border-zinc-800 space-y-5">
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400" />
                  CHALLENGE SPECIFICATION
                </div>
                <h1 className="text-xl font-mono font-bold text-white tracking-tight">
                  {problem.title}
                </h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Domain: <span className="text-zinc-200 font-bold">{problem.category || 'Full-Stack Architecture'}</span>
                </p>
              </div>

              {/* Problem Description */}
              <div className="text-xs font-sans text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line bg-zinc-950 p-4 border border-zinc-800/80">
                {problem.description}
              </div>

              {/* Acceptance Criteria */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-amber-400" />
                  Acceptance Criteria
                </h3>
                <div className="space-y-2">
                  {requirements.length > 0 ? (
                    requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-zinc-950 border border-zinc-800/80 text-xs">
                        <span className="w-1.5 h-1.5 bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span className="font-sans text-zinc-300">{req.description || req.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 font-sans">
                      Complete all architectural logic and ensure error boundaries are cleanly handled.
                    </div>
                  )}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-amber-400" />
                  Performance & Constraints
                </h3>
                <ul className="list-disc list-inside text-xs font-mono text-zinc-400 space-y-1">
                  {problem.constraints && problem.constraints.length > 0 ? (
                    problem.constraints.map((c, i) => <li key={i}>{c}</li>)
                  ) : (
                    <>
                      <li>Time Complexity: O(N) or better.</li>
                      <li>Handle edge cases: null/empty inputs, network timeouts.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Progressive AI Hints */}
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <i className="fa-solid fa-lightbulb text-amber-400" />
                    AI Progressive Hints
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Step-by-step coaching</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleRequestHint(lvl)}
                      className={`py-2 px-2 text-[10px] font-mono font-bold uppercase transition-colors border ${
                        activeHintLevel === lvl
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {lvl === 1 ? '💡 Concept' : lvl === 2 ? '🏗️ Architecture' : '⚡ Algorithm'}
                    </button>
                  ))}
                </div>

                {loadingHint && (
                  <div className="p-3 text-center text-xs font-mono text-zinc-400 animate-pulse">
                    Generating hint guidance...
                  </div>
                )}

                {hintContent && !loadingHint && (
                  <div className="p-3.5 bg-zinc-950 border border-amber-400/30 text-xs space-y-1.5">
                    <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400" />
                      {hintContent.title}
                    </div>
                    <p className="font-sans text-zinc-300 leading-relaxed">{hintContent.content}</p>
                    {hintContent.key_takeaway && (
                      <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-zinc-800">
                        Takeaway: {hintContent.key_takeaway}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: Code Editor & Submission Workspace ── */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleEvaluateSubmission} className="space-y-5">
              <div className="bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Interactive Code & Solution Workspace
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Auto AI Grader Active</span>
                </div>

                {/* Code Editor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>CODE IMPLEMENTATION (JAVASCRIPT / PYTHON / TYPESCRIPT)</span>
                    <span>UTF-8 • Sandbox</span>
                  </div>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    rows={14}
                    placeholder="// Write or paste your implementation here..."
                    className="w-full p-4 font-mono text-xs leading-relaxed bg-zinc-950 text-amber-300 border border-zinc-800 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Optional Repo & Live URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase mb-1">
                      GitHub Repository (Optional)
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/user/project"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase mb-1">
                      Live Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={publishedUrl}
                      onChange={(e) => setPublishedUrl(e.target.value)}
                      placeholder="https://my-app.vercel.app"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[10px] font-mono text-zinc-500">
                    Instant automated multi-dimensional AI assessment with line-by-line feedback.
                  </p>
                  <button
                    type="submit"
                    disabled={isEvaluating || !codeSnippet.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin text-xs" />
                        <span>Evaluating Solution...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-bolt text-xs" />
                        <span>Run AI Assessment →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* ── AI Assessment Scorecard Report ── */}
            <AnimatePresence>
              {evaluationReport && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/95 border border-zinc-700 p-6 space-y-6"
                >
                  {/* Scorecard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-400" />
                        AI ASSESSMENT SCORECARD
                      </div>
                      <h3 className="text-xl font-mono font-bold text-white">
                        Evaluation Result: {evaluationReport.decision === 'PASS' ? 'Passed ✓' : 'Revision Suggested'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-white">
                          {evaluationReport.overall_score || 85}<span className="text-sm text-zinc-500">/100</span>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                          +{evaluationReport.xp_awarded || 150} XP Awarded
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Dimension Score Bars */}
                  {evaluationReport.dimension_scores && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {Object.entries(evaluationReport.dimension_scores).map(([dim, val]: any, idx) => (
                        <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 text-center">
                          <div className="text-[10px] font-mono uppercase text-zinc-500 truncate mb-1">
                            {dim.replace('_', ' ')}
                          </div>
                          <div className="text-base font-mono font-bold text-amber-400">
                            {val}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-950/20 border border-emerald-800/50 space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400" />
                        Key Strengths
                      </h4>
                      <ul className="text-xs font-sans text-emerald-200/90 space-y-1 list-disc list-inside">
                        {evaluationReport.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-950/20 border border-amber-800/50 space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-400" />
                        Areas for Growth
                      </h4>
                      <ul className="text-xs font-sans text-amber-200/90 space-y-1 list-disc list-inside">
                        {evaluationReport.areas_for_improvement?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Line-by-Line AI Critique */}
                  {evaluationReport.code_critique && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        AI Technical Critique & Feedback
                      </h4>
                      <p className="text-xs font-sans text-zinc-300 leading-relaxed bg-zinc-950 p-4 border border-zinc-800 whitespace-pre-line">
                        {evaluationReport.code_critique}
                      </p>
                    </div>
                  )}

                  {/* Refactored Example */}
                  {evaluationReport.refactored_example && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Recommended Industry Refactored Pattern
                      </h4>
                      <pre className="p-4 bg-zinc-950 text-amber-300 font-mono text-xs overflow-x-auto border border-zinc-800">
                        {evaluationReport.refactored_example}
                      </pre>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <Link href="/projects/status-center">
                      <button className="text-xs font-mono font-bold text-amber-400 hover:underline">
                        View in Scorecards & History →
                      </button>
                    </Link>
                    <Link href="/problems">
                      <button className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold uppercase transition-colors">
                        Next Challenge
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssessmentWorkspacePage;
