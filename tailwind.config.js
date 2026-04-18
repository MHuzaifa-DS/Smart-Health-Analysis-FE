/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#060A0F',
          900: '#0D1117',
          800: '#161B22',
          700: '#21262D',
          600: '#30363D',
          500: '#484F58',
          400: '#6E7681',
          300: '#8B949E',
          200: '#B1BAC4',
          100: '#C9D1D9',
          50:  '#F0F6FC',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        }
      },
      animation: {
        'fade-up':      'fadeUp 0.4s ease forwards',
        'fade-in':      'fadeIn 0.3s ease forwards',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'typing':       'typing 1.2s steps(3) infinite',
        'slide-in':     'slideIn 0.35s ease forwards',
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'blob':         'blob 9s ease-in-out infinite',
        'spin-slow':    'spin 12s linear infinite',
        'aurora':       'aurora 12s ease-in-out infinite',
        'aurora-bg':    'auroraBg 22s ease infinite',
        'neon-pulse':   'neonPulse 2.5s ease-in-out infinite',
        'morph':        'morph 10s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        typing:  { '0%,100%': { opacity: '0.2' }, '50%': { opacity: '1' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-18px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(28px, -45px) scale(1.07)' },
          '66%':      { transform: 'translate(-20px, 20px) scale(0.93)' },
        },
      },
    },
  },
  plugins: [],
}
