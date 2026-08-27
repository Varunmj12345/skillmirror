import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  hasExistingData: boolean;
  onStartNew: () => void;
  onContinueExisting: () => void;
  onUploadResume: (file: File) => void;
  onLoadSample: () => void;
  onBackToAnalyze?: () => void;
}

export const ResumeChoiceScreen: React.FC<Props> = ({
  hasExistingData,
  onStartNew,
  onContinueExisting,
  onUploadResume,
  onLoadSample,
  onBackToAnalyze,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadResume(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUploadResume(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in duration-400">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 text-blue-700 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <i className="fa-solid fa-sparkles text-[11px]" />
          <span>Next-Gen ATS Resume Architect</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
          How would you like to build your resume?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Choose a starting path below to craft an interview-winning, 100% ATS-optimized resume tailored to your target engineering roles.
        </p>
      </div>

      {/* Choice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Option 1: Start Fresh / Create New */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] shadow-light-card dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-blue-500 dark:hover:border-cyan-500/50 transition-all"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-file-circle-plus" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                Start with a new resume
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Get step-by-step support with expert AI content suggestions, verified ATS templates, and live real-time preview!
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <i className="fa-solid fa-check text-emerald-500 text-[10px]" /> Step-by-Step Wizard
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <i className="fa-solid fa-check text-emerald-500 text-[10px]" /> 6+ ATS Templates
              </span>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <button
              onClick={onStartNew}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-display font-bold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create New Resume</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>

            <button
              onClick={onLoadSample}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-bolt text-amber-500" />
              <span>Or Load Sample Tech Resume to Explore</span>
            </button>
          </div>
        </motion.div>

        {/* Option 2: Upload Existing OR Continue Saved Build */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] shadow-light-card dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-file-arrow-up" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                {hasExistingData ? 'Continue editing or upload' : 'Upload an existing resume'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {hasExistingData
                  ? 'We detected an active resume in your workspace. You can resume editing directly or upload a new PDF/DOCX.'
                  : 'Import your existing resume to extract and auto-fill contact info, skills, and experience in seconds!'}
              </p>
            </div>

            {/* Hidden Input & Drag Zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <i className="fa-solid fa-cloud-arrow-up text-indigo-500 text-lg mb-1" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drop resume file or click to browse
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Supports PDF, DOCX, DOC · Max 5MB
              </p>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            {hasExistingData ? (
              <button
                onClick={onContinueExisting}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-display font-bold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square text-xs" />
                <span>Continue Editing Saved Resume</span>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-upload text-xs" />
                <span>Choose Resume File</span>
              </button>
            )}

            {hasExistingData && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-rotate text-[11px]" />
                <span>Replace by Uploading New Resume</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer Navigation */}
      {onBackToAnalyze && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onBackToAnalyze}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-[11px]" />
            <span>Back to Resume Analyzer</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeChoiceScreen;
