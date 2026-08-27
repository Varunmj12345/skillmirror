import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const insights = [
  { id: 1, label: 'Market Velocity', value: '+14%', status: 'rising', color: 'brand-neural' },
  { id: 2, label: 'Skill Retention', value: '88%', status: 'stable', color: 'brand-emerald' },
  { id: 3, label: 'Gap Criticality', value: 'High', status: 'warning', color: 'orange-500' },
];

const AIInsightPanel = () => {
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Dynamic import for html2pdf.js (bypasses SSR restrictions)
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      // Create a temporary hidden off-screen report container with high quality styling
      const reportElement = document.createElement('div');
      reportElement.id = 'readiness-report-pdf-template';
      reportElement.style.position = 'fixed';
      reportElement.style.left = '-9999px';
      reportElement.style.top = '0';
      reportElement.style.width = '800px';
      reportElement.style.backgroundColor = '#ffffff';
      reportElement.style.color = '#0f172a';
      reportElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      reportElement.style.padding = '40px';
      reportElement.style.boxSizing = 'border-box';

      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      reportElement.innerHTML = `
        <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #3b82f6; margin-bottom: 4px;">SkillMirror OS • Neural Telemetry</div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">CAREER READINESS & BENCHMARK REPORT</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Comprehensive Skill Matrix, Market Alignment & Strategic Next Actions</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Generated On</div>
            <div style="font-size: 12px; font-weight: 700; color: #334155;">${currentDate}</div>
            <div style="font-size: 9px; font-weight: 700; color: #10b981; margin-top: 2px;">● VERIFIED SECURE TELEMETRY</div>
          </div>
        </div>

        <!-- KPI Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Job Readiness</div>
            <div style="font-size: 24px; font-weight: 900; color: #2563eb; margin-top: 4px;">88%</div>
            <div style="font-size: 9px; color: #16a34a; font-weight: 700; margin-top: 2px;">+4% this week</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Market Match</div>
            <div style="font-size: 24px; font-weight: 900; color: #0891b2; margin-top: 4px;">92%</div>
            <div style="font-size: 9px; color: #0891b2; font-weight: 700; margin-top: 2px;">Top 8.4% rank</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Market Velocity</div>
            <div style="font-size: 24px; font-weight: 900; color: #4f46e5; margin-top: 4px;">+14%</div>
            <div style="font-size: 9px; color: #4f46e5; font-weight: 700; margin-top: 2px;">Rapid demand</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Skill Retention</div>
            <div style="font-size: 24px; font-weight: 900; color: #059669; margin-top: 4px;">88%</div>
            <div style="font-size: 9px; color: #059669; font-weight: 700; margin-top: 2px;">High durability</div>
          </div>
        </div>

        <!-- Next Best Action -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px; margin-bottom: 25px;">
          <div style="font-size: 10px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">★ AI Recommended Next Best Action</div>
          <p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.5;">
            Your readiness for <strong>Senior Technical Roles</strong> has surged. Prioritize mastering <strong>Kafka Streams & Distributed Systems</strong> to unlock estimated salary upside of ₹3.5L.
          </p>
        </div>

        <!-- Deep Intelligence Sections -->
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 10px; letter-spacing: 0.5px;">Domain Competencies & Gaps Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; color: #475569; font-weight: 800;">
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Competency Area</th>
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Status</th>
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Proficiency</th>
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Strategic Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 700;">Core Architecture & System Design</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 700;">● Strong Match</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Advanced (92%)</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Maintain & Mentor</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 700;">Distributed Messaging (Kafka / RabbitMQ)</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #d97706; font-weight: 700;">▲ Priority Gap</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Intermediate (60%)</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Complete Phase 2 Project</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 700;">Cloud Native Infrastructure (Kubernetes/AWS)</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 700;">● Strong Match</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Proficient (85%)</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Production Certified</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 700;">Database Optimization & Indexing</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 700;">● Strong Match</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Advanced (90%)</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Verified via Mock Interview</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 30-Day Growth Roadmap -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 10px; letter-spacing: 0.5px;">30-Day Action Execution Plan</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #fafafa;">
              <div style="font-size: 10px; font-weight: 800; color: #2563eb;">WEEK 1 - 2</div>
              <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Event-Driven Streams</div>
              <div style="font-size: 10px; color: #64748b;">Build resilient event pipelines and partition strategies.</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #fafafa;">
              <div style="font-size: 10px; font-weight: 800; color: #2563eb;">WEEK 3</div>
              <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Mini-Mock Simulation</div>
              <div style="font-size: 10px; color: #64748b;">Complete AI Technical Mock for Low-Latency Architectures.</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #fafafa;">
              <div style="font-size: 10px; font-weight: 800; color: #2563eb;">WEEK 4</div>
              <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 4px 0;">Resume & Recruiter Push</div>
              <div style="font-size: 10px; color: #64748b;">Update ATS resume with verified stream projects and apply.</div>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
          <div>SkillMirror Intelligence OS • Neural Engine v2.4 • Confidential</div>
          <div>Report Hash: SM-RPT-${Math.floor(100000 + Math.random() * 900000)}</div>
        </div>
      `;

      document.body.appendChild(reportElement);

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: 'SkillMirror_Career_Readiness_Report.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(reportElement).save();
      document.body.removeChild(reportElement);

      setToast('✓ Readiness report downloaded successfully!');
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('PDF Download Error:', err);
      setToast('Failed to generate PDF. Please try again.');
      setTimeout(() => setToast(null), 3500);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="sm-glass p-6 sm:p-7 rounded-2xl h-full flex flex-col justify-between shadow-light-card dark:shadow-none relative">
      <div className="mb-6">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-indigo-400 mb-2">Neural Engine Insights</div>
        <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">Next Best Action</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-sans">
          Your readiness for "Senior Backend Engineer" has improved by 4% this week. 
          Mastering <span className="text-blue-600 dark:text-brand-neural font-bold">Kafka Streams</span> will unlock a ₹3.5L salary increase.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3.5 sm:p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 rounded-xl flex items-center justify-between group hover:bg-blue-50/70 dark:hover:bg-brand-neural/5 transition-colors shadow-light-sm dark:shadow-none">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{insight.label}</span>
              <span className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">{insight.value}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-transparent flex items-center justify-center text-lg shadow-sm">
               {insight.status === 'rising' ? '📈' : insight.status === 'stable' ? '✨' : '🔥'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-white/5">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-brand-neural transition-all duration-300 shadow-light-sm dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
        >
          {downloading ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin text-sm" />
              <span>Generating Neural Report PDF...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-file-arrow-down text-sm" />
              <span>Download Full Readiness Report (PDF)</span>
            </>
          )}
        </button>
      </div>

      {toast && (
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <i className="fa-solid fa-circle-check" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default AIInsightPanel;
