import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/motion/Toast';
import PageTransition from '../components/motion/PageTransition';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <Head>
        <title>AI-Based Career Intelligence and Skill Gap Analysis System</title>
        <meta
          name="description"
          content="AI-Based Career Intelligence and Skill Gap Analysis System – an investor-ready AI Career Intelligence SaaS for skill gaps, roadmaps, and readiness analytics."
        />
      </Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="afterInteractive"
      />
      <Script src="/js/utils.js" strategy="afterInteractive" />
      <Script src="/js/theme.js" strategy="afterInteractive" />
      <Script src="/js/charts.js" strategy="afterInteractive" />
      <Script src="/js/main.js" strategy="afterInteractive" />

      <ToastProvider>
        <AnimatePresence exitBeforeEnter>
          <PageTransition routeKey={router.pathname}>
            <Component {...pageProps} />
          </PageTransition>
        </AnimatePresence>
      </ToastProvider>
    </AuthProvider>
  );
}

export default MyApp;