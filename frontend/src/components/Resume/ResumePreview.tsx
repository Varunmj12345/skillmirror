import React from 'react';
import type { BuilderFormData, SkillCategory } from './ResumeBuilderForm';
import type { TemplateConfig } from './TemplateGallery';

interface Props {
  data: BuilderFormData;
  template: TemplateConfig;
  className?: string;
}

export const ResumePreview: React.FC<Props> = ({ data, template, className = '' }) => {
  const accent = template.accent || template.color || '#2563eb';
  const font = template.font || 'Inter';
  const templateId = template.id || 't1';

  // Extract contact fields safely
  const fullName = (data.personal?.name || 'Your Full Name').trim();
  const email = (data.personal?.email || '').trim();
  const phone = (data.personal?.phone || '').trim();

  // Clean location calculation without dangling commas
  const city = (data.personal?.city || '').trim();
  const country = (data.personal?.country || '').trim();
  const location =
    city || country
      ? [city, country].filter(Boolean).join(', ')
      : (data.personal?.location || '').replace(/^,\s*|,\s*$/g, '').trim();

  const linkedin = (data.personal?.linkedin || '').trim();
  const github = (data.personal?.github || '').trim();
  const photo = (data.personal as any)?.photo || '';

  // Categorized skills extraction
  const categorizedSkills: SkillCategory[] =
    data.categorizedSkills && data.categorizedSkills.some((c) => c.skills && c.skills.length > 0)
      ? data.categorizedSkills.filter((c) => c.skills && c.skills.length > 0)
      : data.skills && data.skills.length > 0
      ? [{ category: 'Core & Technical Skills', skills: data.skills }]
      : [];

  const experienceList = (data.experience || []).filter((e) => e.company || e.role);
  const educationList = (data.education || []).filter((e) => e.institution || e.degree);
  const projectList = (data.projects || []).filter((p) => p.name || p.description);
  const certList = (data.certifications || []).filter((c) => c.name);

  // Helper to strip leading bullet characters (*, -, •)
  const cleanBullet = (text: string) =>
    (text || '').replace(/^[\s\-*•\u2022\u2023\u25E6\u2043\u2219]+\s*/, '').trim();

  // Font family helper with explicit web-safe fallbacks
  const getFontFamily = () => {
    switch (font) {
      case 'Merriweather':
      case 'Playfair Display':
        return '"Times New Roman", Times, Georgia, serif';
      case 'Roboto':
        return 'Roboto, "Helvetica Neue", Arial, sans-serif';
      case 'Source Sans':
        return '"Source Sans Pro", "Segoe UI", Arial, sans-serif';
      default:
        return 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    }
  };

  // Structured bullet row component that guarantees pixel-perfect canvas and print rendering
  const BulletItem: React.FC<{ text: string }> = ({ text }) => {
    const cleaned = cleanBullet(text);
    if (!cleaned) return null;
    return (
      <div className="flex items-start gap-2 my-0.5 text-[10.5px] text-slate-700 leading-relaxed">
        <span className="text-slate-400 font-bold select-none text-xs leading-none mt-1 shrink-0">
          •
        </span>
        <div className="flex-1 whitespace-normal leading-relaxed">{cleaned}</div>
      </div>
    );
  };

  // Helper to format multi-line project descriptions cleanly
  const renderFormattedDescription = (text: string) => {
    if (!text) return null;
    const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return null;

    if (rawLines.length > 1 || /^[\s\-*•]/.test(text)) {
      return (
        <div className="space-y-0.5 pt-0.5">
          {rawLines.map((line, idx) => (
            <BulletItem key={idx} text={line} />
          ))}
        </div>
      );
    }

    return (
      <p className="text-[10.5px] text-slate-700 leading-relaxed whitespace-pre-line pt-0.5">
        {cleanBullet(text)}
      </p>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER TEMPLATE 1: FAANG Standard (100% ATS Single Column)
  ───────────────────────────────────────────────────────────── */
  const renderFAANG = () => (
    <div className="p-7 sm:p-8 space-y-3.5 text-slate-900 bg-white min-h-[1100px] box-border">
      {/* Header */}
      <div className="text-center pb-1">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 mb-1.5 leading-none">
          {fullName}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10.5px] text-slate-700 font-medium leading-normal mb-2.5">
          {location && <span>{location}</span>}
          {location && (phone || email) && <span className="text-slate-400">•</span>}
          {phone && <span>{phone}</span>}
          {phone && email && <span className="text-slate-400">•</span>}
          {email && <span>{email}</span>}
          {linkedin && (
            <>
              <span className="text-slate-400">•</span>
              <span className="font-semibold" style={{ color: accent }}>
                {linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            </>
          )}
          {github && (
            <>
              <span className="text-slate-400">•</span>
              <span className="font-semibold" style={{ color: accent }}>
                {github.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            </>
          )}
        </div>
        <div className="w-full h-[1.5px] block clear-both" style={{ backgroundColor: accent }} />
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="space-y-1">
          <div className="border-b pb-0.5 mb-1" style={{ borderColor: `${accent}40` }}>
            <h2 className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: accent }}>
              Professional Summary
            </h2>
          </div>
          <p className="text-[10.5px] text-slate-700 leading-relaxed whitespace-pre-line">
            {data.summary}
          </p>
        </div>
      )}

      {/* Categorized Technical Skills */}
      {categorizedSkills.length > 0 && (
        <div className="space-y-1">
          <div className="border-b pb-0.5 mb-1" style={{ borderColor: `${accent}40` }}>
            <h2 className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: accent }}>
              Technical & Core Skills
            </h2>
          </div>
          <div className="space-y-1 text-[10.5px] text-slate-800 leading-relaxed">
            {categorizedSkills.map((cat, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-bold text-slate-950 shrink-0">
                  {cat.category}:
                </span>
                <span className="text-slate-700">
                  {cat.skills.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {experienceList.length > 0 && (
        <div className="space-y-2.5">
          <div className="border-b pb-0.5 mb-1" style={{ borderColor: `${accent}40` }}>
            <h2 className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: accent }}>
              Professional Experience
            </h2>
          </div>
          <div className="space-y-2.5">
            {experienceList.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-2">
                    <span className="text-[11.5px] font-black text-slate-950">
                      {exp.role || 'Software Engineer'}
                    </span>
                    {exp.company && (
                      <span className="text-[11.5px] font-semibold text-slate-700">
                        {' '}— {exp.company}
                      </span>
                    )}
                    {exp.location && (
                      <span className="text-[9.5px] text-slate-500 ml-1.5 font-normal">
                        ({exp.location})
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] font-mono font-bold text-slate-600 uppercase tracking-wider shrink-0 text-right">
                    {exp.duration || '2023 - Present'}
                  </div>
                </div>
                <div className="space-y-0.5 pt-0.5">
                  {exp.bullets.filter((b) => b && b.trim()).map((b, bi) => (
                    <BulletItem key={bi} text={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projectList.length > 0 && (
        <div className="space-y-2.5">
          <div className="border-b pb-0.5 mb-1" style={{ borderColor: `${accent}40` }}>
            <h2 className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: accent }}>
              Key Projects & Architectures
            </h2>
          </div>
          <div className="space-y-2">
            {projectList.map((proj, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11.5px] font-bold text-slate-950">{proj.name}</span>
                  {proj.tech && (
                    <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 shrink-0">
                      {proj.tech}
                    </span>
                  )}
                </div>
                {proj.description && renderFormattedDescription(proj.description)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educationList.length > 0 && (
        <div className="space-y-1.5">
          <div className="border-b pb-0.5 mb-1" style={{ borderColor: `${accent}40` }}>
            <h2 className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: accent }}>
              Education
            </h2>
          </div>
          <div className="space-y-1.5">
            {educationList.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-bold text-slate-950">
                    {edu.degree || 'Degree Program'}
                  </span>
                  {edu.institution && (
                    <span className="text-[11px] text-slate-700">, {edu.institution}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9.5px] font-mono font-bold text-slate-600">
                    {edu.year}
                  </span>
                  {edu.gpa && (
                    <span className="text-[9.5px] text-slate-500 ml-2 font-mono">
                      (GPA: {edu.gpa})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certList.length > 0 && (
        <div className="space-y-1">
          <div className="border-b pb-0.5 mb-1" style={{ borderColor: `${accent}40` }}>
            <h2 className="text-[10.5px] font-black uppercase tracking-wider" style={{ color: accent }}>
              Certifications & Credentials
            </h2>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-slate-700">
            {certList.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="font-semibold text-slate-900">{c.name}</span>
                {c.issuer && <span className="text-slate-600">({c.issuer})</span>}
                {c.year && <span className="text-slate-500 font-mono">· {c.year}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER TEMPLATE 2: Modern Executive (2-Column Tech)
  ───────────────────────────────────────────────────────────── */
  const renderModernTwoCol = () => (
    <div className="flex w-full min-h-[1100px] items-stretch bg-white text-slate-900 box-border">
      {/* Left Sidebar (32% width, spans 100% full height) */}
      <div className="w-[32%] shrink-0 p-6 space-y-4 bg-slate-50 border-r border-slate-200 flex flex-col justify-start">
        {/* Photo / Avatar */}
        {photo ? (
          <div className="w-18 h-18 rounded-2xl overflow-hidden mx-auto border-2 border-white shadow-sm">
            <img src={photo} alt={fullName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-display font-black text-lg text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            {fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2) || 'SM'}
          </div>
        )}

        {/* Contact info with clean alignment */}
        <div className="space-y-1.5 pt-1 border-t border-slate-200">
          <h3 className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Contact
          </h3>
          <div className="space-y-1.5 text-[9.5px] text-slate-700 leading-normal break-all">
            {email && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-bold shrink-0">✉</span>
                <span>{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-bold shrink-0">☎</span>
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-bold shrink-0">⌖</span>
                <span>{location}</span>
              </div>
            )}
            {linkedin && (
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">in</span>
                <span className="truncate">{linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {github && (
              <div className="flex items-start gap-2">
                <span className="text-slate-800 font-bold shrink-0">git</span>
                <span className="truncate">{github.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Categorized Skills Sidebar */}
        {categorizedSkills.length > 0 && (
          <div className="space-y-2.5 pt-1 border-t border-slate-200">
            <h3 className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Core Competencies
            </h3>
            <div className="space-y-2">
              {categorizedSkills.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    {cat.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((sk, skIdx) => (
                      <span
                        key={skIdx}
                        className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-medium text-slate-800 bg-white border border-slate-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Sidebar */}
        {educationList.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-200">
            <h3 className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Education
            </h3>
            <div className="space-y-1.5 text-[9.5px]">
              {educationList.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution}</div>
                  <div className="text-slate-500 font-mono">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Sidebar */}
        {certList.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-200">
            <h3 className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Certifications
            </h3>
            <div className="space-y-1 text-[9.5px]">
              {certList.map((c, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  {c.issuer && <div className="text-slate-500">{c.issuer}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Column (68% width, spans 100% full height) */}
      <div className="w-[68%] p-7 space-y-4 bg-white flex flex-col justify-start">
        {/* Name Title */}
        <div className="space-y-1 pb-1">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 leading-none">
            {fullName}
          </h1>
          <div className="h-[2px] w-12 rounded-full" style={{ backgroundColor: accent }} />
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="space-y-1">
            <h2 className="text-[10.5px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              Executive Profile
            </h2>
            <p className="text-[10.5px] text-slate-700 leading-relaxed whitespace-pre-line">
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experienceList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[10.5px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experienceList.map((exp, idx) => (
                <div key={idx} className="space-y-1 pl-2.5 border-l-2 border-slate-200">
                  <div className="flex justify-between items-center">
                    <div className="text-[11px] font-black text-slate-900">{exp.role}</div>
                    <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase shrink-0">
                      {exp.duration}
                    </span>
                  </div>
                  <div className="text-[9.5px] font-bold text-slate-600">{exp.company}</div>
                  <div className="space-y-0.5 pt-0.5">
                    {exp.bullets.filter((b) => b && b.trim()).map((b, bi) => (
                      <BulletItem key={bi} text={b} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projectList.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-[10.5px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              Highlighted Projects
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {projectList.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-900">{p.name}</span>
                    {p.tech && (
                      <span className="text-[8.5px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {p.tech}
                      </span>
                    )}
                  </div>
                  {p.description && renderFormattedDescription(p.description)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER TEMPLATE 3: Ivy League Classic (Serif Elegance)
  ───────────────────────────────────────────────────────────── */
  const renderIvyLeague = () => (
    <div className="p-7 sm:p-8 space-y-3.5 text-slate-900 bg-white min-h-[1100px] box-border" style={{ fontFamily: 'Georgia, Cambria, serif' }}>
      {/* Centered Serif Header */}
      <div className="text-center pb-1.5 mb-1 border-b border-slate-900">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-wide text-slate-950 mb-1 leading-none">
          {fullName}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-xs text-slate-700 italic mb-1.5">
          {location && <span>{location}</span>}
          {phone && <span>· {phone}</span>}
          {email && <span>· {email}</span>}
          {linkedin && <span>· {linkedin.replace(/^https?:\/\//, '')}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="space-y-1">
          <div className="border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Summary
            </h2>
          </div>
          <p className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-line">
            {data.summary}
          </p>
        </div>
      )}

      {/* Categorized Skills */}
      {categorizedSkills.length > 0 && (
        <div className="space-y-1">
          <div className="border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Technical & Core Competencies
            </h2>
          </div>
          <div className="space-y-1 text-[11px] text-slate-800 leading-relaxed">
            {categorizedSkills.map((cat, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-bold text-slate-950">{cat.category}:</span>
                <span>{cat.skills.join(' • ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experienceList.length > 0 && (
        <div className="space-y-2.5">
          <div className="border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Experience
            </h2>
          </div>
          <div className="space-y-2.5">
            {experienceList.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-950">{exp.company}</span>
                  <span className="italic text-slate-700 shrink-0">{exp.duration}</span>
                </div>
                <div className="text-[11px] italic font-medium text-slate-800">{exp.role}</div>
                <div className="space-y-0.5 pt-0.5">
                  {exp.bullets.filter((b) => b && b.trim()).map((b, bi) => (
                    <BulletItem key={bi} text={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projectList.length > 0 && (
        <div className="space-y-2">
          <div className="border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Key Projects
            </h2>
          </div>
          <div className="space-y-1.5">
            {projectList.map((proj, idx) => (
              <div key={idx} className="space-y-0.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-950">{proj.name}</span>
                  {proj.tech && <span className="italic text-slate-600 shrink-0">({proj.tech})</span>}
                </div>
                {proj.description && renderFormattedDescription(proj.description)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educationList.length > 0 && (
        <div className="space-y-1.5">
          <div className="border-b border-slate-300 pb-0.5 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Education
            </h2>
          </div>
          <div className="space-y-1.5">
            {educationList.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-bold text-slate-950">{edu.institution}</span>
                  <div className="italic text-slate-800">{edu.degree}</div>
                </div>
                <div className="text-right font-medium text-slate-700 shrink-0">
                  {edu.year} {edu.gpa && `· GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      id="resume-export-container"
      className={`w-full max-w-[794px] mx-auto bg-white text-slate-900 overflow-visible transition-all ${className}`}
      style={{ fontFamily: getFontFamily(), width: '794px' }}
    >
      {templateId === 't2' || template.layout === '2-col'
        ? renderModernTwoCol()
        : templateId === 't3'
        ? renderIvyLeague()
        : renderFAANG()}
    </div>
  );
};

export default ResumePreview;
