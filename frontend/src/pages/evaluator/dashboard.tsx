import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const EvaluatorDashboardRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/problems');
  }, [router]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-4 text-blue-600 dark:text-cyan-400">
          <i className="fa-solid fa-code text-lg animate-pulse" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Redirecting to AI Practice Arena...</h2>
        <p className="text-xs text-slate-500">SkillMirror has upgraded to autonomous AI assessments.</p>
      </div>
    </Layout>
  );
};

export default EvaluatorDashboardRedirect;
