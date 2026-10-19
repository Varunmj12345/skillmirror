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
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
          <span>ATS RESUME ENGINE · PROTOCOL v2</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-mono font-bold text-zinc-100 tracking-tight">
          CHOOSE BUILD MODE
        </h1>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-xl mx-auto">
          Craft an interview-winning, 100% ATS-compliant engineering resume tailored for tech recruiters and automated screeners.
        </p>
      </div>

      {/* Choice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Option 1: Start Fresh / Create New */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 text-xl">
              <i className="fa-solid fa-file-circle-plus" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-mono font-bold text-zinc-100 uppercase tracking-wide">
                Fresh Document Build
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Step-by-step assisted wizard with verified ATS engineering schemas, clean typography, and real-time split-view canvas preview.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400" /> 6+ ATS Formats
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400" /> Vector PDF Output
              </span>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <button
              onClick={onStartNew}
              className="w-full py-3 px-5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Initialize Blank Resume</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>

            <button
              onClick={onLoadSample}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950 border border-transparent hover:border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-bolt text-amber-400" />
              <span>Load Sample Engineer Profile</span>
            </button>
          </div>
        </motion.div>

        {/* Option 2: Upload Existing OR Continue Saved Build */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 text-xl">
              <i className="fa-solid fa-file-arrow-up" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-mono font-bold text-zinc-100 uppercase tracking-wide">
                {hasExistingData ? 'Resume Saved Session' : 'Parse Existing Resume'}
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                {hasExistingData
                  ? 'Active draft detected in local state. Continue editing or upload an updated binary to re-extract.'
                  : 'Import your PDF or DOCX file to extract contact details, technical stack, and bullet points into the editor.'}
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
              className={`p-4 rounded-xl border border-dashed transition-all cursor-pointer text-center ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-zinc-700 bg-zinc-950 hover:border-zinc-600'
              }`}
            >
              <i className="fa-solid fa-cloud-arrow-up text-amber-400 text-lg mb-1" />
              <p className="text-xs font-mono font-bold text-zinc-200">
                Drop PDF / DOCX or click to browse
              </p>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                Maximum size 5MB
              </p>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            {hasExistingData ? (
              <button
                onClick={onContinueExisting}
                className="w-full py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <i className="fa-solid fa-pen-to-square text-xs" />
                <span>Resume Saved Draft</span>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <i className="fa-solid fa-upload text-xs" />
                <span>Select Resume File</span>
              </button>
            )}

            {hasExistingData && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950 border border-transparent hover:border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-rotate text-[11px]" />
                <span>Re-upload New File Instead</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer Navigation */}
      {onBackToAnalyze && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onBackToAnalyze}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-[11px]" />
            <span>Return to Telemetry Scanner</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeChoiceScreen;
