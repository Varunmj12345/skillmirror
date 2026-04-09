// Theme and sidebar behavior (vanilla JS).

window.SMCareerTheme = (function () {
  const STORAGE_KEY = 'sm_theme';
  const SIDEBAR_KEY = 'sm_sidebar_collapsed';

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  function initThemeToggle() {
    const { loadLocal, saveLocal, onReady } = window.SMCareerUtils || {};
    if (!loadLocal || !saveLocal || !onReady) return;

    onReady(function () {
      const stored = loadLocal(STORAGE_KEY, null);
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored || (prefersDark ? 'dark' : 'light');
      applyTheme(theme);

      const toggles = document.querySelectorAll('[data-theme-toggle]');
      toggles.forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          const next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          saveLocal(STORAGE_KEY, next);
        });
      });
    });
  }

  function initSidebar() {
    const { loadLocal, saveLocal, onReady } = window.SMCareerUtils || {};
    if (!loadLocal || !saveLocal || !onReady) return;

    onReady(function () {
      const collapsed = !!loadLocal(SIDEBAR_KEY, false);
      const root = document.querySelector('[data-app-shell]');
      const sidebar = document.querySelector('[data-app-sidebar]');
      const main = document.querySelector('[data-app-main]');
      const toggles = document.querySelectorAll('[data-sidebar-toggle]');

      function setState(isCollapsed) {
        if (!sidebar || !main) return;
        sidebar.classList.toggle('collapsed', isCollapsed);
        main.classList.toggle('collapsed', isCollapsed);
        saveLocal(SIDEBAR_KEY, isCollapsed);
        if (root) {
          root.setAttribute('data-sidebar-collapsed', isCollapsed ? 'true' : 'false');
        }
      }

      if (collapsed) setState(true);

      toggles.forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = !sidebar.classList.contains('collapsed');
          setState(next);
        });
      });
    });
  }

  function init() {
    initThemeToggle();
    initSidebar();
  }

  return {
    init,
  };
})();

