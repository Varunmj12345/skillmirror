import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/motion/Toast';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Head>
          <title>SkillMirror OS • AI Career Intelligence Engine</title>
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
        <Script src="/js/charts.js" strategy="afterInteractive" />
        <Script src="/js/main.js" strategy="afterInteractive" />

        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;