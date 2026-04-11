/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          obsidian: '#020617',
          neural: '#6366f1',
          aurora: '#8b5cf6',
          emerald: '#10b981',
          slate: {
            900: '#0f172a',
            800: '#1e293b',
            700: '#334155',
          }
        }
      },
      fontSize: {
        'nano': ['10px', { lineHeight: '1', letterSpacing: '0.05em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
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
        'obsidian-gradient': 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      }
    },
  },
  plugins: [],
}


