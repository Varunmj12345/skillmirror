import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'dark' | 'light';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'sm_theme';
const LEGACY_STORAGE_KEY = 'sm_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  effectiveTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = (resolved: 'dark' | 'light') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    if (resolved === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      body.classList.add('light');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme', 'light');
    }
  };

  const computeEffectiveTheme = (mode: ThemeMode): 'dark' | 'light' => {
    if (mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return mode;
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    const resolved = computeEffectiveTheme(mode);
    setEffectiveTheme(resolved);
    applyThemeToDOM(resolved);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        window.localStorage.setItem(LEGACY_STORAGE_KEY, mode);
      } catch (err) {
        console.error('Failed to save theme in localStorage:', err);
      }
    }
  };

  const toggleTheme = () => {
    const next: ThemeMode = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    setMounted(true);
    let initialMode: ThemeMode = 'light';

    if (typeof window !== 'undefined') {
      try {
        const stored = (window.localStorage.getItem(THEME_STORAGE_KEY) ||
          window.localStorage.getItem(LEGACY_STORAGE_KEY)) as ThemeMode | null;

        if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
          initialMode = stored;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          initialMode = 'dark';
        }
      } catch (err) {
        console.error('Failed to read theme from localStorage:', err);
      }
    }

    setThemeState(initialMode);
    const resolved = computeEffectiveTheme(initialMode);
    setEffectiveTheme(resolved);
    applyThemeToDOM(resolved);

    // Listen for system theme changes if mode is 'system'
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const currentStored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (currentStored === 'system') {
          const newResolved = mediaQuery.matches ? 'dark' : 'light';
          setEffectiveTheme(newResolved);
          applyThemeToDOM(newResolved);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
