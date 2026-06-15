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
        // ============================================================
        // LIGHT THEME: Deep Teal + Cream + Navy
        // ============================================================
        // The `ink` palette is INVERTED (low = darkest, high = lightest)
        // and uses warm stone/cream neutrals. Existing classes like
        //   bg-ink-950 (page bg), bg-ink-900 (card), text-ink-50 (headings),
        //   border-ink-700, text-ink-400 (muted)
        // auto-convert from dark theme to this palette.
        ink: {
          50:  '#0F172A', // navy — headings, darkest text
          100: '#1E293B',
          200: '#334155',
          300: '#475569',
          400: '#64748B', // muted body text
          500: '#94A3B8',
          600: '#CBD5E1',
          700: '#E7E5E4', // warm subtle borders
          800: '#F5F4F0', // warm hover bg / subtle surface
          900: '#FFFFFF', // card surface
          950: '#FAFAF9', // warm cream page background
        },

        // `teal` remapped to proper deep medical teal so existing
        //   bg-teal-500, text-teal-400, hover:bg-teal-400
        // automatically become deep teal accents.
        teal: {
          400: '#14B8A6', // teal-500 equivalent — lighter accent
          500: '#0D9488', // teal-600 equivalent — primary
          600: '#0F766E', // teal-700 equivalent — hover
        },

        // Status colors kept vivid enough to read on cream backgrounds.
        // IMPORTANT: These remain semantic (not all teal) — critical
        // medical information must be visually distinguishable.
        rose: {
          400: '#E11D48', // rose-600
          500: '#BE123C', // rose-700
        },
        amber: {
          400: '#D97706', // amber-600
          500: '#B45309', // amber-700
        },
        emerald: {
          400: '#059669', // emerald-600
          500: '#047857', // emerald-700
        },
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
