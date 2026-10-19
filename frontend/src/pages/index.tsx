import React from 'react';
import Head from 'next/head';
import useAuth from '../hooks/useAuth';
import { Hero } from '../components/skydda/Hero';
import { LogoSection } from '../components/skydda/LogoSection';
import { ProblemSection } from '../components/skydda/ProblemSection';
import { SolutionSection } from '../components/skydda/SolutionSection';
import { FeaturesSection } from '../components/skydda/FeaturesSection';
import { TelemetrySection } from '../components/skydda/TelemetrySection';
import { TestimonialsSection } from '../components/skydda/TestimonialsSection';
import { PricingSection } from '../components/skydda/PricingSection';
import { FaqSection } from '../components/skydda/FaqSection';
import { CtaSection } from '../components/skydda/CtaSection';
import { Footer } from '../components/skydda/Footer';
import AICareerWidget from '../components/AICareerWidget';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>SkillMirror Core | Autonomous AI Career Defense & Intelligence</title>
        <meta
          name="description"
          content="SkillMirror Core – Autonomous AI Career Defense, Real-Time Skill Gap Quantification, FAANG Mock Simulations, and ATS Optimization."
        />
      </Head>

      <div className="relative min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
        {/* Skydda Vertical Bounding Lines */}
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="mx-auto h-full max-w-7xl">
            <div className="relative h-full">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-700/30" />
              <div className="absolute right-0 top-0 h-full w-px bg-zinc-700/30" />
            </div>
          </div>
        </div>

        <main className="relative">
          <Hero user={user} />
          <LogoSection />
          <ProblemSection />
          <SolutionSection />
          <FeaturesSection />
          <TelemetrySection />
          <TestimonialsSection />
          <PricingSection />
          <FaqSection />
          <CtaSection user={user} />
        </main>

        <Footer />

        {!user ? null : <AICareerWidget />}
      </div>
    </>
  );
};

export default Home;
