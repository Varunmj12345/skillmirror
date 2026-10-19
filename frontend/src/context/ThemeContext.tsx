import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'dark' | 'light';
  setTheme: (mode: ThemeMode, event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => void;
  toggleTheme: (event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => void;
}

const THEME_STORAGE_KEY = 'sm_theme';
const LEGACY_STORAGE_KEY = 'sm_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  effectiveTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');
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

  /** Minimal water wave ripple effect */
  const spawnWaterWaveRipple = (x: number, y: number, isToDark: boolean) => {
    if (typeof document === 'undefined') return;
    const ripple = document.createElement('div');
    ripple.className = 'water-wave-ripple';
    const size = Math.max(window.innerWidth, window.innerHeight) * 2.4;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    if (isToDark) {
      ripple.style.borderColor = 'rgba(245, 158, 11, 0.6)';
      ripple.style.boxShadow = '0 0 50px rgba(245, 158, 11, 0.3), inset 0 0 35px rgba(245, 158, 11, 0.2)';
    } else {
      ripple.style.borderColor = 'rgba(217, 119, 6, 0.5)';
      ripple.style.boxShadow = '0 0 50px rgba(217, 119, 6, 0.25), inset 0 0 35px rgba(217, 119, 6, 0.15)';
    }

    document.body.appendChild(ripple);
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 850);
  };

  const setTheme = (
    mode: ThemeMode,
    event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }
  ) => {
    const resolved = computeEffectiveTheme(mode);
    const isToDark = resolved === 'dark';

    // Extract coordinates of click for circular wave origin
    let x = typeof window !== 'undefined' ? window.innerWidth - 60 : 0;
    let y = 40;
    if (event && 'clientX' in event && 'clientY' in event && event.clientX && event.clientY) {
      x = event.clientX;
      y = event.clientY;
    }

    // Spawn minimal water wave ripple
    spawnWaterWaveRipple(x, y, isToDark);

    // Modern View Transitions API for seamless circular wave reveal
    const doc = document as any;
    if (
      typeof window !== 'undefined' &&
      typeof doc.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        setThemeState(mode);
        setEffectiveTheme(resolved);
        applyThemeToDOM(resolved);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 750,
            easing: 'cubic-bezier(0.25, 1, 0.4, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      // Fallback
      setThemeState(mode);
      setEffectiveTheme(resolved);
      applyThemeToDOM(resolved);
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        window.localStorage.setItem(LEGACY_STORAGE_KEY, mode);
      } catch (err) {
        console.error('Failed to save theme in localStorage:', err);
      }
    }
  };

  const toggleTheme = (event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => {
    const next: ThemeMode = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(next, event);
  };

  useEffect(() => {
    setMounted(true);
    let initialMode: ThemeMode = 'dark';

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
