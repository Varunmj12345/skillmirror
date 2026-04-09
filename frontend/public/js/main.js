// Global bootstrap for the AI-Based Career Intelligence and Skill Gap Analysis System.

(function () {
  const bootstrap = function () {
    if (window.SMCareerTheme) {
      window.SMCareerTheme.init();
    }
    if (window.SMCareerCharts) {
      window.SMCareerCharts.init();
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrap();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  }
})();

