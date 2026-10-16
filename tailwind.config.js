/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090D16',
          secondary: '#0F172A',
          card: 'rgba(17, 24, 39, 0.75)',
          cardLight: '#FFFFFF',
          cardHover: 'rgba(30, 41, 59, 0.85)',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'glow-emerald': '0 0 25px -3px rgba(16, 185, 129, 0.35)',
        'glow-indigo': '0 0 25px -3px rgba(99, 102, 241, 0.35)',
        'glow-rose': '0 0 25px -3px rgba(244, 63, 94, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
