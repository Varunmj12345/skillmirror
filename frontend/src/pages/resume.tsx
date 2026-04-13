import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { skillService } from '../services/skillService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import ResumeHistoryPanel from '../components/Resume/ResumeHistoryPanel';
import ATSScorePanel from '../components/Resume/ATSScorePanel';
import JobTargetingPanel from '../components/Resume/JobTargetingPanel';
import AIImprovementPanel from '../components/Resume/AIImprovementPanel';
import ExportPanel from '../components/Resume/ExportPanel';
import ResumeBuilderForm, { EMPTY_FORM } from '../components/Resume/ResumeBuilderForm';
import TemplateGallery from '../components/Resume/TemplateGallery';
import ResumePreview from '../components/Resume/ResumePreview';
import ResumeIntelligenceModal from '../components/Resume/ResumeIntelligenceModal';
import type { BuilderFormData } from '../components/Resume/ResumeBuilderForm';
import type { TemplateConfig } from '../components/Resume/TemplateGallery';
import apiClient from '../services/apiClient';

type ResumeAnalysis = {
  id: string;
  createdAt: string;
  readinessScore: number;
  jobMatchScore: number;
  skills: { name: string; proficiency: number }[];
  missingSkills: string[];
  breakdown: { label: string; value: number }[];
  aiSuggestions?: string[];
};

type Tab = 'analyze' | 'build';
type BuildSubTab = 'form' | 'templates' | 'preview' | 'custom';
import CustomTemplateEngine from '../components/Resume/CustomTemplateEngine';


const DEFAULT_TEMPLATE: TemplateConfig = {
  id: 't1', name: 'Nova', category: 'Modern',
  color: '#6366f1', font: 'Inter', layout: '1-col', accent: '#6366f1'
};

const ResumePage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('analyze');
  const [buildSubTab, setBuildSubTab] = useState<BuildSubTab>('form');

  // Analyze tab state
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [atsData, setAtsData] = useState<any>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Build tab state
  const [formData, setFormData] = useState<BuilderFormData>(EMPTY_FORM);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(DEFAULT_TEMPLATE);
  const [extractingProfile, setExtractingProfile] = useState(false);
  const [isResumeReportOpen, setIsResumeReportOpen] = useState(false);

  useEffect(() => {
    if (tab === 'build') {
      const loadProfile = async () => {
        try {
          const res = await skillService.getBuilderProfile() as any;
          if (res.personal_details) {
            setFormData({
              personal: res.personal_details,
              summary: res.summary || '',
              skills: res.skills || [],
              experience: res.experience || [{ company: '', role: '', duration: '', bullets: [''] }],
              education: res.education || [{ institution: '', degree: '', year: '' }],
              projects: res.projects || [{ name: '', description: '', tech: '' }],
              certifications: res.certifications || [{ name: '', issuer: '', year: '' }],
              achievements: res.achievements || [''],
            });
          }
          if (res.template_config && res.template_config.id) {
            setSelectedTemplate(res.template_config);
          }
        } catch { }
      };
      loadProfile();
    }
  }, [tab]);

  const handleExtractProfile = async () => {
    setExtractingProfile(true);
    try {
      const data = await skillService.extractProfile() as any;
      setFormData(data);
      startToast('✓ Profile extracted from previous resume');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Extraction failed. Make sure you have uploaded a resume first.');
    } finally {
      setExtractingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await skillService.saveBuilderProfile({
        personal_details: formData.personal,
        summary: formData.summary,
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
        projects: formData.projects,
        certifications: formData.certifications,
        achievements: formData.achievements,
        template_config: selectedTemplate
      });
      startToast('✓ Builder profile saved');
    } catch {
      startToast('Failed to save profile');
    }
  };


  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data: any = await skillService.checkResumeStatus();
        if (data && data.exists) {
          setAnalysis({
            id: 'loaded',
            createdAt: data.created_at,
            readinessScore: data.readiness_score || 75,
            jobMatchScore: 80,
            skills: (data.skills || []).map((s: string) => ({ name: s, proficiency: 85 })),
            missingSkills: [],
            breakdown: data.strength_breakdown || [
              { label: 'Technical', value: 85 },
              { label: 'Keywords', value: 70 },
              { label: 'Structure', value: 95 }
            ],
            aiSuggestions: data.ai_suggestions
          });
        }
      } catch { }
    };
    fetchStatus();
  }, []);

  const startToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleFile = async (file: File) => {
    setError(null);
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setError('Only PDF and Word documents are allowed.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return; }

    setUploading(true);
    setAnalyzing(false);
    setProgress(0);

    const iv = setInterval(() => setProgress(p => p >= 90 ? p : p + 10), 120);

    try {
      const data: any = await skillService.uploadResume(file);
      setProgress(100);
      clearInterval(iv);
      setAnalyzing(true);

      const a: ResumeAnalysis = {
        id: data.id || `${Date.now()}`,
        createdAt: new Date().toISOString(),
        readinessScore: data.readiness_score || 75,
        jobMatchScore: 80,
        skills: (data.skills || []).map((s: string) => ({ name: s, proficiency: 85 })),
        missingSkills: [],
        breakdown: data.strength_breakdown?.map((b: any) => ({ label: b.label, value: b.value })) || [
          { label: 'Technical', value: 85 },
          { label: 'Keywords', value: 70 },
          { label: 'Structure', value: 95 }
        ],
        aiSuggestions: data.ai_suggestions
      };
      setAnalysis(a);
      setAnalyzing(false);
      setHistoryRefresh(n => n + 1);
      startToast('✓ Resume analyzed successfully');
    } catch (e: any) {
      clearInterval(iv);
      setProgress(0);
      setError(e?.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleATSScan = async () => {
    setAtsLoading(true);
    try {
      const res: any = await apiClient.post('/api/skills/resume/ats-insight/', {});
      setAtsData(res);
    } catch { }
    finally { setAtsLoading(false); }
  };

  const breakdownData = useMemo(() =>
    analysis?.breakdown.map(b => ({ subject: b.label, value: b.value, fullMark: 100 })) || [],
    [analysis]
  );

  const TAB_ITEMS: { key: Tab; label: string; icon: string }[] = [
    { key: 'analyze', label: 'Analyze Resume', icon: 'fa-magnifying-glass-chart' },
    { key: 'build', label: 'Build Resume', icon: 'fa-hammer' },
  ];

  const BUILD_TABS: { key: BuildSubTab; label: string; icon: string }[] = [
    { key: 'form', label: 'Details', icon: 'fa-pen-to-square' },
    { key: 'templates', label: 'Templates', icon: 'fa-layer-group' },
    { key: 'preview', label: 'Preview', icon: 'fa-eye' },
    { key: 'custom', label: 'Custom Template', icon: 'fa-file-export' },
  ];


  return (
    <Layout>
      <Head>
        <title>AI Resume Intelligence • SkillMirror</title>
        <meta name="description" content="Analyze, build, and optimize your resume with AI-powered tools." />
      </Head>

      <section className="space-y-6">
        {/* Page header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-1">Resume Module</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">AI Resume Intelligence</h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              Analyze, build, and optimize your resume with AI-powered tools and ATS scoring.
            </p>
          </div>
          <button 
            onClick={() => setIsResumeReportOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)]"
          >
            <i className="fa-solid fa-microchip animate-pulse"></i>
            Generate Resume Intelligence
          </button>
        </header>

        <ResumeIntelligenceModal 
          isOpen={isResumeReportOpen}
          onClose={() => setIsResumeReportOpen(false)}
        />


        {/* Main Tab Switcher */}
        <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl w-fit">
          {TAB_ITEMS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className={`fa-solid ${t.icon} text-[10px]`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* ============ ANALYZE TAB ============ */}
        {tab === 'analyze' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Upload + Scores row */}
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1.2fr]">
              <div className="glass-panel p-5 space-y-4">
                <h2 className="text-sm font-medium text-slate-50">Upload Resume</h2>
                <div
                  onDrop={e => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-950/60 hover:bg-slate-900'}`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
                  <i className="fa-solid fa-file-arrow-up text-indigo-400 text-2xl mb-3" />
                  <p className="text-sm text-slate-50 font-medium">Drop resume or click to browse</p>
                  <p className="text-[10px] text-slate-600 mt-1">PDF, DOC, DOCX · Max 5MB</p>
                </div>
                {(uploading || analyzing) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{uploading ? 'Uploading...' : 'Analyzing...'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {error && <div className="p-2 bg-red-500/10 border border-red-500/50 text-red-200 text-[10px] rounded-lg">{error}</div>}
              </div>

              <div className="glass-panel p-5 space-y-4">
                <h2 className="text-sm font-medium text-slate-50">Readiness & Match</h2>
                {!analysis ? (
                  <div className="h-40 bg-slate-900 rounded-xl animate-pulse" />
                ) : (
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg width="128" height="128" className="-rotate-90 absolute">
                        <circle cx="64" cy="64" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <circle cx="64" cy="64" r="54" fill="none" stroke="#6366f1" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={339} strokeDashoffset={339 - (analysis.readinessScore / 100) * 339}
                          style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))', transition: 'stroke-dashoffset 1s ease' }} />
                      </svg>
                      <div className="text-center z-10">
                        <div className="text-xl font-black text-slate-50">{analysis.readinessScore}%</div>
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest">Ready</div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Job Match</span>
                          <span className="text-slate-100 font-bold">{analysis.jobMatchScore}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${analysis.jobMatchScore}%` }} />
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 text-[10px] text-slate-400 leading-relaxed">
                        Strong base skills detected. Cloud certifications could push your score past 90%.
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black border ${analysis.readinessScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : analysis.readinessScore >= 60 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                          {analysis.readinessScore >= 80 ? '✓ Hire-Ready' : analysis.readinessScore >= 60 ? '⚡ Good — Improve' : '⚠ Needs Work'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills + Radar row */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1.2fr]">
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-50">Skills Extracted</h2>
                  {analysis && <span className="text-[10px] font-black text-indigo-400 px-2 py-1 bg-indigo-500/10 rounded-lg">{analysis.skills.length} skills</span>}
                </div>
                {!analysis ? (
                  <div className="flex flex-wrap gap-2 animate-pulse">{[1, 2, 3, 4].map(n => <div key={n} className="h-6 w-16 bg-slate-900 rounded-full" />)}</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map(s => (
                        <span key={s.name} className="px-3 py-1 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:border-indigo-500/50 transition-all">
                          {s.name} <span className="text-slate-500">· {s.proficiency}%</span>
                        </span>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                        <i className="fa-solid fa-triangle-exclamation" /> Review your skill gaps
                      </span>
                      <button onClick={() => router.push('/skill-gap')} className="btn-primary text-[10px] py-1.5 px-3">Go to Roadmap</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-panel p-5 space-y-4 overflow-hidden">
                <h2 className="text-sm font-medium text-slate-50">Strength Breakdown</h2>
                <div className="h-56 -mx-4">
                  {analysis ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={breakdownData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                        <RechartsTooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">Awaiting analysis...</div>
                  )}
                </div>
              </div>
            </div>

            {/* ATS + Job Targeting row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ATSScorePanel data={atsData} loading={atsLoading} onAnalyze={handleATSScan} />
              <JobTargetingPanel />
            </div>

            {/* AI Suggestions + AI Improvement row */}
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="glass-panel p-5 space-y-3">
                <h2 className="text-sm font-medium text-slate-50">AI Optimization Suggestions</h2>
                <ul className="space-y-2">
                  {(analysis?.aiSuggestions || [
                    "Include quantifiable achievements like 'Reduced loading time by 40%'.",
                    "Ensure your LinkedIn profile URL is clickable and professional.",
                    "Highlight target keywords like 'System Design' or 'API Integration'."
                  ]).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <i className="fa-solid fa-circle-check text-indigo-400 text-[10px] mt-0.5 shrink-0"></i>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <ExportPanel />
            </div>

            {/* AI Improvement Panel */}
            <AIImprovementPanel skills={analysis?.skills.map(s => s.name)} />

            {/* Resume History */}
            <ResumeHistoryPanel
              onView={(entry) => {
                // load viewed entry data into analysis
                setAnalysis(prev => prev ? { ...prev, jobMatchScore: entry.job_match_score } : null);
                startToast(`Viewing: ${entry.file_name}`);
              }}
              refreshTrigger={historyRefresh}
            />
          </div>
        )}

        {/* ============ BUILD TAB ============ */}
        {tab === 'build' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Build sub-tab switcher + Save Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl w-fit">
                {BUILD_TABS.map(bt => (
                  <button
                    key={bt.key}
                    onClick={() => setBuildSubTab(bt.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${buildSubTab === bt.key ? 'bg-slate-700 text-slate-100' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    <i className={`fa-solid ${bt.icon} text-[9px]`}></i>
                    {bt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} className="btn-primary text-[10px] py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                  <i className="fa-solid fa-floppy-disk mr-2"></i> Save Changes
                </button>
              </div>
            </div>

            {/* Import Banner */}
            {buildSubTab === 'form' && (
              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Auto-fill from Resume</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">We can extract info from your last scan to save you time.</p>
                  </div>
                </div>
                <button
                  onClick={handleExtractProfile}
                  disabled={extractingProfile}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {extractingProfile ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                  {extractingProfile ? 'Extracting...' : 'Import from Resume'}
                </button>
              </div>
            )}


            {buildSubTab === 'form' && (
              <ResumeBuilderForm value={formData} onChange={setFormData} />
            )}

            {buildSubTab === 'templates' && (
              <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
            )}

            {buildSubTab === 'custom' && (
              <CustomTemplateEngine formData={formData} />
            )}


            {buildSubTab === 'preview' && (
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                {/* Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-50">Live Preview</h3>
                    <span className="text-[10px] font-black text-slate-600 uppercase">{selectedTemplate.name} · {selectedTemplate.layout}</span>
                  </div>
                  <div className="overflow-auto max-h-[80vh] rounded-xl border border-slate-800 shadow-2xl">
                    <ResumePreview data={formData} template={selectedTemplate} />
                  </div>
                </div>
                {/* Controls panel */}
                <div className="space-y-4">
                  <ExportPanel />
                  <div className="glass-panel p-5 border-slate-800/50">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <button onClick={() => setBuildSubTab('form')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-[11px] font-black text-slate-300 uppercase tracking-widest rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2">
                        <i className="fa-solid fa-pen-to-square"></i> Edit Details
                      </button>
                      <button onClick={() => setBuildSubTab('templates')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-[11px] font-black text-slate-300 uppercase tracking-widest rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2">
                        <i className="fa-solid fa-layer-group"></i> Change Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 px-5 py-2.5 rounded-full text-[11px] text-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toast}
        </div>
      )}
    </Layout>
  );
};

export default ResumePage;
