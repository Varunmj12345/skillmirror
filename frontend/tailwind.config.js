function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

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
        zinc: {
          50: withOpacity('--zinc-50'),
          100: withOpacity('--zinc-100'),
          200: withOpacity('--zinc-200'),
          300: withOpacity('--zinc-300'),
          400: withOpacity('--zinc-400'),
          500: withOpacity('--zinc-500'),
          600: withOpacity('--zinc-600'),
          700: withOpacity('--zinc-700'),
          800: withOpacity('--zinc-800'),
          850: withOpacity('--zinc-850'),
          900: withOpacity('--zinc-900'),
          950: withOpacity('--zinc-950'),
        },
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
        },
        pastel: {
          blue: {
            bg: '#EEF4FF',
            border: '#DBEAFE',
            text: '#1E40AF',
            badge: '#2563EB',
            hover: '#E0EDFF',
          },
          coral: {
            bg: '#FFE8EC',
            border: '#FFE4E6',
            text: '#9F1239',
            badge: '#E11D48',
            hover: '#FDE8E8',
          },
          amber: {
            bg: '#FFF7ED',
            border: '#FEF08A',
            text: '#92400E',
            badge: '#D97706',
            hover: '#FEF3C7',
          },
          emerald: {
            bg: '#ECFDF5',
            border: '#D1FAE5',
            text: '#065F46',
            badge: '#059669',
            hover: '#DCFCE7',
          },
          purple: {
            bg: '#F5F3FF',
            border: '#EDE9FE',
            text: '#5B21B6',
            badge: '#7C3AED',
            hover: '#E9D5FF',
          },
        },
      },
      fontSize: {
        'micro': ['8px', { lineHeight: '10px', letterSpacing: '0.08em' }],
        'nano': ['9px', { lineHeight: '12px', letterSpacing: '0.08em' }],
        'caption': ['10px', { lineHeight: '14px', letterSpacing: '0.06em' }],
        'sub': ['11px', { lineHeight: '16px', letterSpacing: '0.04em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        'tactical-none': '0px',
        'tactical-xs': '0px',
        'tactical-sm': '0px',
        'tactical-md': '0px',
        'tactical-lg': '0px',
        'tactical-full': '9999px',
        full: '9999px',
      },
      boxShadow: {
        'tactical-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'tactical-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'tactical-popover': '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        'glow-amber': '0 0 16px -2px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 16px -2px rgba(16, 185, 129, 0.4)',
        'glow-red': '0 0 16px -2px rgba(239, 68, 68, 0.4)',
        'cyber-sm': '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
        'cyber-lg': '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'premium-sm': '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(99, 102, 241, 0.05)',
        'premium-lg': '0 20px 50px -12px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.03)',
        'glass-glow': '0 8px 32px 0 rgba(99, 102, 241, 0.2)',
        'light-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'light-card': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 6px 18px -2px rgba(15, 23, 42, 0.04)',
        'light-float': '0 12px 32px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
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
