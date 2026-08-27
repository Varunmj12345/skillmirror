import React from 'react';
import { Card, CardHeader, CardContent } from './card';
import { Badge } from './badge';
import { Bullet } from './bullet';

interface Candidate {
  id: number;
  name: string;
  role: string;
  streak: string;
  points: number;
  featured?: boolean;
  avatarChar: string;
  skills: string[];
}

const candidates: Candidate[] = [
  {
    id: 1,
    name: 'ALEX_VORTEX',
    role: 'AI / FULL-STACK ARCHITECT',
    streak: '4 WEEKS STREAK 🔥',
    points: 980,
    featured: true,
    avatarChar: 'A',
    skills: ['PyTorch', 'Next.js', 'Postgres', 'FastAPI'],
  },
  {
    id: 2,
    name: 'SARAH_DEV',
    role: 'SYSTEMS & CLOUD ENGINEER',
    streak: '2 WEEKS STREAK ⚡',
    points: 845,
    avatarChar: 'S',
    skills: ['Go', 'Kubernetes', 'AWS', 'Rust'],
  },
  {
    id: 3,
    name: 'NEO_CYBER',
    role: 'FRONTEND ARCHITECT',
    streak: '6 DAYS STREAK',
    points: 760,
    avatarChar: 'N',
    skills: ['React', 'TypeScript', 'Tailwind', 'WebGL'],
  },
  {
    id: 4,
    name: 'ZENITH_ML',
    role: 'DATA SCIENTIST',
    streak: '1 WEEK STREAK',
    points: 690,
    avatarChar: 'Z',
    skills: ['Python', 'SQL', 'Scikit', 'Docker'],
  },
];

export const MasteryRanking: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader
        title="TOP TALENT & MASTERY BENCHMARKS"
        bulletVariant="default"
        addon={<Badge variant="outline-warning">SEASON 4 LIVE</Badge>}
      />
      <CardContent className="p-3 bg-card dark:bg-transparent space-y-3">
        {candidates.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              c.featured
                ? 'bg-blue-50/90 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-light-sm dark:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Rank Number */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                  c.featured ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                #{c.id}
              </div>

              {/* Avatar Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-cyan-600 dark:to-indigo-600 flex items-center justify-center font-display font-black text-white text-sm shrink-0 shadow-sm">
                {c.avatarChar}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    {c.streak}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate">
                  {c.role}
                </div>
              </div>
            </div>

            {/* Score & Points */}
            <div className="text-right shrink-0 pl-3">
              <Badge variant={c.featured ? 'outline-cyan' : 'secondary'}>
                {c.points} XP
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MasteryRanking;
