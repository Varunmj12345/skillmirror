// Chart.js bindings for dashboard analytics.
// Expects Chart.js (v3+) to be loaded globally as Chart.

window.SMCareerCharts = (function () {
  const { safeParseJSON, onReady } = window.SMCareerUtils || {};

  function getAndClearCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;

    // Destroy existing instance if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    return canvas;
  }

  function buildWeeklyChart() {
    if (typeof Chart === 'undefined' || !onReady || !safeParseJSON) return;

    const canvas = getAndClearCanvas('weeklyProgressChart');
    if (!canvas) return;

    const labels = safeParseJSON(canvas.dataset.labels || '[]', []);
    const values = safeParseJSON(canvas.dataset.values || '[]', []);

    if (!labels.length || !values.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Weekly Completed',
            data: values,
            borderColor: 'rgba(129, 140, 248, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#cbd5f5',
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cbd5f5',
              precision: 0,
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.25)',
            },
          },
        },
      },
    });
  }

  function buildSkillRadar() {
    if (typeof Chart === 'undefined' || !onReady || !safeParseJSON) return;

    const canvas = getAndClearCanvas('skillRadarChart');
    if (!canvas) return;

    const labels = safeParseJSON(canvas.dataset.labels || '[]', []);
    const userValues = safeParseJSON(canvas.dataset.userValues || '[]', []);
    const marketValues = safeParseJSON(canvas.dataset.marketValues || '[]', []);

    if (!labels.length || !userValues.length || !marketValues.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'You',
            data: userValues,
            borderColor: 'rgba(129, 140, 248, 1)',
            backgroundColor: 'rgba(129, 140, 248, 0.2)',
          },
          {
            label: 'Market Demand',
            data: marketValues,
            borderColor: 'rgba(52, 211, 153, 1)',
            backgroundColor: 'rgba(52, 211, 153, 0.18)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#e5e7eb',
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              display: false,
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.35)',
            },
            angleLines: {
              color: 'rgba(148, 163, 184, 0.35)',
            },
            pointLabels: {
              color: '#e5e7eb',
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  }

  function buildResumeReadiness() {
    if (typeof Chart === 'undefined' || !onReady) return;

    const canvas = getAndClearCanvas('resumeReadinessChart');
    if (!canvas) return;

    const score = Number(canvas.dataset.score || '0') || 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let color = 'rgba(248, 113, 113, 1)'; // red
    if (score >= 70) color = 'rgba(52, 211, 153, 1)'; // green
    else if (score >= 50) color = 'rgba(251, 191, 36, 1)'; // amber

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Readiness', 'Gap'],
        datasets: [
          {
            data: [score, Math.max(0, 100 - score)],
            backgroundColor: [color, 'rgba(30, 41, 59, 0.85)'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });
  }

  function buildResumeBreakdown() {
    if (typeof Chart === 'undefined' || !onReady || !safeParseJSON) return;

    const canvas = getAndClearCanvas('resumeBreakdownChart');
    if (!canvas) return;

    const labels = safeParseJSON(canvas.dataset.labels || '[]', []);
    const values = safeParseJSON(canvas.dataset.values || '[]', []);
    if (!labels.length || !values.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Resume strength',
            data: values,
            borderColor: 'rgba(129, 140, 248, 1)',
            backgroundColor: 'rgba(129, 140, 248, 0.2)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(148, 163, 184, 0.35)' },
            angleLines: { color: 'rgba(148, 163, 184, 0.35)' },
            pointLabels: {
              color: '#e5e7eb',
              font: { size: 11 },
            },
          },
        },
      },
    });
  }

  function init() {
    if (!onReady) return;
    onReady(function () {
      buildCharts();
    });
  }

  function buildCharts() {
    buildWeeklyChart();
    buildSkillRadar();
    buildResumeReadiness();
    buildResumeBreakdown();
  }

  return {
    init,
    buildCharts
  };
})();


