import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>AI-Based Career Intelligence and Skill Gap Analysis System</title>
        <meta
          name="description"
          content="AI-Based Career Intelligence and Skill Gap Analysis System – an investor-ready AI Career Intelligence SaaS for skill gaps, roadmaps, and readiness analytics."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
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

      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;