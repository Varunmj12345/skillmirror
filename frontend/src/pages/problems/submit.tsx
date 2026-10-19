import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const SubmitProblemRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/problems');
  }, [router]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-amber-400">
          <i className="fa-solid fa-code text-lg" />
        </div>
        <h2 className="text-base font-bold text-white mb-1">Redirecting to AI Practice Arena...</h2>
        <p className="text-xs text-zinc-500">SkillMirror Core has upgraded to autonomous AI practice challenges.</p>
      </div>
    </Layout>
  );
};

export default SubmitProblemRedirect;
