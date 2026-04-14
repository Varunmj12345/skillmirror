import React from 'react';
import { motion } from 'framer-motion';
import { 
  Dna, 
  BrainCircuit, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Target, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Timer,
  BookOpen
} from 'lucide-react';

interface TwinMetrics {
  user_skills: string;
  projects: string;
  experience: string;
  target_role: string;
  risk_score: number;
  confidence_score: number;
  market_score: number;
  activity_score: number;
  competition_score: number;
  no_action: {
    job_prob: string;
    salary: string;
    risk_trend: string;
  };
  moderate: {
    improvements: string;
    growth: string;
  };
  smart: {
    maximum_potential: string;
    improvement_vs_none: string;
  };
  trending_skills: string;
  declining_skills: string;
  percentile: number;
  peer_gap: string;
  gaps: Array<{
    name: string;
    importance: number;
    category: string;
  }>;
}

interface CareerDigitalTwinProps {
  metrics: TwinMetrics;
  onResimulate: () => void;
  onAccept: () => void;
}

const CareerDigitalTwin: React.FC<CareerDigitalTwinProps> = ({ metrics, onResimulate, onAccept }) => {
  const getStatusColor = (val: number, type: 'risk' | 'confidence' | 'activity') => {
    if (type === 'risk') {
      if (val < 30) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      if (val < 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
    if (val > 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (val > 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 p-1"
    >
      {/* 1. Metric Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={item} className="sm-glass p-5 rounded-3xl border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current State</p>
            <p className="text-lg font-black text-white">
              {metrics.risk_score < 25 ? 'High Growth' : metrics.risk_score < 45 ? 'Competitive' : metrics.risk_score < 65 ? 'Developing' : 'Stagnating'}
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="sm-glass p-5 rounded-3xl border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stability Level</p>
            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase w-fit ${getStatusColor(metrics.confidence_score, 'confidence')}`}>
              {metrics.confidence_score > 75 ? 'High' : metrics.confidence_score > 50 ? 'Medium' : 'Low'}
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="sm-glass p-5 rounded-3xl border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Adaptability</p>
            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase w-fit ${getStatusColor(metrics.activity_score, 'activity')}`}>
              {metrics.activity_score > 60 ? 'Extreme' : metrics.activity_score > 30 ? 'Normal' : 'Stiff'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Behavior Insights */}
      <motion.div variants={item} className="sm-glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <BrainCircuit size={120} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6 flex items-center gap-2">
            <BrainCircuit size={16} /> Behavior Pattern Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
               <BookOpen size={14} className="text-cyan-500" /> Learning Pattern
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {metrics.activity_score > 50 ? 'Aggressive skill acquisition detected. Trending towards high-impact expertise.' : 'Passive learning cycle. Trajectory requires higher activity frequency for market alignment.'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
               <TrendingUp size={14} className="text-emerald-500" /> Skill Evolution
            </div>
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mapping {(metrics.user_skills || '').split(',').filter(Boolean).length} core skills against {metrics.target_role}. Evolution is {metrics.risk_score < 40 ? 'synchronized' : 'deviating'} from standard market growth.
              </p>
              {/* Progress Bar */}
              {metrics.gaps && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400">
                    <span>Target Core Readiness</span>
                    <span>{Math.max(0, 100 - (metrics.gaps.length * 15))}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, 100 - (metrics.gaps.length * 15))}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
               <Sparkles size={14} className="text-amber-500" /> Career Direction
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Steady alignment with {metrics.target_role}. System predicts {metrics.competition_score > 50 ? 'high' : 'moderate'} market pressure in the current segment.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. Future Simulation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item} className="sm-glass p-8 rounded-[2rem] border-rose-500/10 bg-rose-500/[0.02] group hover:bg-rose-500/[0.04] transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 font-mono">SCENARIO A</span>
            </div>
          </div>
          <h4 className="text-lg font-black text-rose-200 mb-2">No Action (Risk Path)</h4>
          <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">Remaining passive led to a decline in competitive positioning. Skills in {(metrics.declining_skills || '').split(',')[0] || 'core areas'} have reached obsolescence.</p>
          
          <div className="space-y-4 pt-4 border-t border-rose-500/10">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase font-bold text-slate-400">Survival Probability</span>
              <span className="text-sm font-mono text-rose-400 flex items-center gap-1">
                 {metrics.no_action?.job_prob || 'N/A'} <ArrowDownRight size={12} />
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase font-bold text-slate-400">Risk Trend</span>
              <span className="text-sm font-mono text-rose-400">{metrics.no_action?.risk_trend || 'N/A'}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="sm-glass p-8 rounded-[2rem] border-emerald-500/10 bg-emerald-500/[0.02] group hover:bg-emerald-500/[0.04] transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 font-mono">SCENARIO B</span>
            </div>
          </div>
          <h4 className="text-lg font-black text-emerald-200 mb-2">Smart Path (Growth)</h4>
          <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">Optimal acceleration path detected. Transitioning to {metrics.smart?.maximum_potential || 'Advanced Role'} yields maximum ROI.</p>
          
          <div className="space-y-4 pt-4 border-t border-emerald-500/10">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase font-bold text-slate-400">Potential Improvement</span>
              <span className="text-sm font-mono text-emerald-400 flex items-center gap-1">
                +{metrics.smart?.improvement_vs_none || '0%'} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase font-bold text-slate-400">Growth Index</span>
              <span className="text-sm font-mono text-emerald-400">{metrics.moderate?.growth || '0%'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Gap Analysis & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="sm-glass p-8 rounded-[2rem] border-white/5">
          <div className="flex items-center gap-3 mb-6">
             <Target size={18} className="text-cyan-400" />
             <h3 className="text-xs font-black uppercase tracking-widest text-white">Critical Evolution Gaps</h3>
          </div>
          <div className="space-y-3">
             {metrics.gaps?.length > 0 ? (
               metrics.gaps.slice(0, 4).map((gap, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3">
                       <div className={`w-1.5 h-1.5 rounded-full ${gap.importance >= 4 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-500'}`} />
                       <span className="text-[11px] font-bold text-slate-200">{gap.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                       Priority: {gap.importance >= 5 ? 'Mandatory' : gap.importance >= 4 ? 'Critical' : 'High'}
                    </span>
                 </div>
               ))
             ) : (
               <div className="py-4 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Critical Gaps Detected</p>
               </div>
             )}
          </div>
        </motion.div>

        <motion.div variants={item} className="sm-glass p-8 rounded-[2rem] border-white/5">
          <div className="flex items-center gap-3 mb-6">
             <Timer size={18} className="text-amber-400" />
             <h3 className="text-xs font-black uppercase tracking-widest text-white">Skill Relevance Decay</h3>
          </div>
          <div className="space-y-4">
             {(metrics.declining_skills || '').split(',').filter(Boolean).slice(0, 3).map((s, i) => (
               <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-slate-300">{s.trim()}</span>
                    <span className="text-[9px] font-bold text-rose-500 px-1.5 py-0.5 rounded uppercase tracking-tighter bg-rose-500/10">Declining</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: `${100 - (i * 20)}%` }}
                      className="h-full bg-rose-500/30" 
                    />
                  </div>
               </div>
             ))}
          </div>
        </motion.div>
      </div>

      {/* 5. Action Plan Footer */}
      <motion.div variants={item} className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent border border-white/5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
           <div className="space-y-2">
              <h5 className="text-xs font-black uppercase tracking-widest text-cyan-400">Actionable Twin Intelligence</h5>
              <div className="flex flex-wrap gap-2 pt-2">
                {(metrics.trending_skills || '').split(',').filter(Boolean).map((s, i) => (
                   <span key={i} className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-all cursor-default uppercase">
                      {s.trim()}
                   </span>
                ))}
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={onResimulate}
                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono"
              >
                Re-simulate
              </button>
              <button 
                onClick={onAccept}
                className="sm-btn-primary px-8 py-4 text-[10px] uppercase tracking-widest"
              >
                Accept Recommendations
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CareerDigitalTwin;
