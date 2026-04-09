// Utility helpers for the AI-Based Career Intelligence and Skill Gap Analysis System
// Keep this file framework-agnostic (vanilla JS only).

window.SMCareerUtils = (function () {
  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function safeParseJSON(value, fallback) {
    if (!value || typeof value !== 'string') return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function saveLocal(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / privacy errors
    }
  }

  function loadLocal(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return safeParseJSON(raw, fallback);
    } catch {
      return fallback;
    }
  }

  function animateCounter(el, target, durationMs) {
    if (!el) return;
    if (prefersReducedMotion) {
      el.textContent = String(Math.round(target));
      return;
    }
    const start = performance.now();
    const from = 0;

    function step(now) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (target - from) * eased;
      el.textContent = String(Math.round(value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  return {
    safeParseJSON,
    saveLocal,
    loadLocal,
    animateCounter,
    onReady,
  };
})();

