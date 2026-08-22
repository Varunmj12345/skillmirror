/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background, #0b0d13)',
        foreground: 'var(--color-foreground, #f8fafc)',
        card: {
          DEFAULT: 'var(--color-card, #12151e)',
          foreground: 'var(--color-card-foreground, #f8fafc)',
        },
        pop: 'var(--color-pop, #191e2b)',
        border: 'var(--color-border, rgba(255, 255, 255, 0.08))',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
          neon: '#00d9ff',
        },
        success: {
          DEFAULT: '#10b981',
          neon: '#00e599',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        destructive: {
          DEFAULT: '#ef4444',
        },
        brand: {
          obsidian: '#0b0d13',
          neural: '#6366f1',
          aurora: '#8b5cf6',
          emerald: '#10b981',
          slate: {
            950: '#06070a',
            900: '#0b0d13',
            800: '#12151e',
            700: '#191e2b',
            600: '#334155',
          }
        },
        accent: {
          primary: 'var(--accent-primary, #00D9FF)',
          success: 'var(--accent-success, #00C896)',
          warning: 'var(--accent-warning, #F59E0B)',
          danger: 'var(--accent-danger, #EF4444)',
          gold: 'var(--accent-gold, #F59E0B)',
          purple: 'var(--accent-purple, #7C3AED)',
        }
      },
      fontSize: {
        'nano': ['10px', { lineHeight: '1', letterSpacing: '0.08em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'cyber-sm': '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
        'cyber-lg': '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'premium-sm': '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(99, 102, 241, 0.05)',
        'premium-lg': '0 20px 50px -12px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.03)',
        'glass-glow': '0 8px 32px 0 rgba(99, 102, 241, 0.2)',
      },
      letterSpacing: {
        'ultra-tight': '-0.05em',
        'super-wide': '0.25em',
      },
      backgroundImage: {
        'neural-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
        'obsidian-gradient': 'linear-gradient(180deg, #0b0d13 0%, #12151e 100%)',
        'cyber-grid': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        'shimmer': 'shimmerSweep 1.5s infinite linear',
        'fab-breathe': 'fabBreathing 3s infinite ease-in-out',
        'shake': 'shake 300ms ease-in-out',
        'marquee-up': 'marqueeUp 6s ease-in-out infinite',
        'marquee-down': 'marqueeDown 6s ease-in-out infinite',
        'marquee-pulse': 'marqueePulse 2s ease-in-out infinite',
      },
      keyframes: {
        shimmerSweep: {
          '100%': { transform: 'translateX(200%) skewx(-20deg)' }
        },
        fabBreathing: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' }
        },
        marqueeUp: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(0, -50%, 0)' }
        },
        marqueeDown: {
          '0%': { transform: 'translate3d(0, -50%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' }
        },
        marqueePulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1) translateY(0)' },
          '50%': { opacity: '1', transform: 'scale(1.1) translateY(-2px)' }
        }
      }
    },
  },
  plugins: [],
}
