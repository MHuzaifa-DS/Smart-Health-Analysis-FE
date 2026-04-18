import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { MouseTracker } from '@/components/ui/MouseTracker'

// ── Animated wave SVG background ─────────────────────────────────────────────
function WaveBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        <style>{`
          @keyframes wave1Anim {
            0%   { d: path("M0,600 C200,550 400,650 600,600 C800,550 1000,650 1200,600 C1300,570 1380,590 1440,580 L1440,900 L0,900 Z"); }
            50%  { d: path("M0,620 C200,580 400,620 600,580 C800,540 1000,620 1200,580 C1300,560 1380,575 1440,565 L1440,900 L0,900 Z"); }
            100% { d: path("M0,600 C200,550 400,650 600,600 C800,550 1000,650 1200,600 C1300,570 1380,590 1440,580 L1440,900 L0,900 Z"); }
          }
          @keyframes wave2Anim {
            0%   { d: path("M0,700 C300,660 500,730 720,700 C940,670 1100,730 1440,700 L1440,900 L0,900 Z"); }
            50%  { d: path("M0,720 C300,690 500,720 720,690 C940,660 1100,710 1440,690 L1440,900 L0,900 Z"); }
            100% { d: path("M0,700 C300,660 500,730 720,700 C940,670 1100,730 1440,700 L1440,900 L0,900 Z"); }
          }
          .w1 { animation: wave1Anim 8s ease-in-out infinite; }
          .w2 { animation: wave2Anim 11s ease-in-out infinite; }
        `}</style>
        <path className="w1" fill="url(#wave1)" opacity="0.5"
          d="M0,600 C200,550 400,650 600,600 C800,550 1000,650 1200,600 C1300,570 1380,590 1440,580 L1440,900 L0,900 Z" />
        <path className="w2" fill="url(#wave2)" opacity="0.7"
          d="M0,700 C300,660 500,730 720,700 C940,670 1100,730 1440,700 L1440,900 L0,900 Z" />
      </svg>

      {/* Soft top-right circle accent */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(191,219,254,0.55) 0%, transparent 70%)',
      }} />
      {/* Top-left small accent */}
      <div style={{
        position: 'absolute', top: -60, left: -80,
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(224,242,254,0.6) 0%, transparent 70%)',
      }} />
    </div>
  )
}

// ── Floating medical cross icons ──────────────────────────────────────────────
function FloatingCrosses() {
  const crosses = [
    { top: '8%',  left: '5%',  size: 22, delay: '0s',   dur: '6s'  },
    { top: '18%', left: '88%', size: 16, delay: '1.2s', dur: '8s'  },
    { top: '55%', left: '3%',  size: 14, delay: '0.6s', dur: '7s'  },
    { top: '70%', left: '92%', size: 18, delay: '2s',   dur: '9s'  },
    { top: '85%', left: '12%', size: 12, delay: '1.8s', dur: '6.5s'},
  ]
  return (
    <>
      <style>{`
        @keyframes floatCross {
          0%,100% { transform: translateY(0px) rotate(0deg); opacity: 0.18; }
          50%      { transform: translateY(-14px) rotate(8deg); opacity: 0.3; }
        }
      `}</style>
      {crosses.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: c.top, left: c.left, zIndex: 0, pointerEvents: 'none',
          animation: `floatCross ${c.dur} ease-in-out infinite`, animationDelay: c.delay,
          color: '#3b82f6', fontSize: c.size, fontWeight: 900, lineHeight: 1,
        }}>✚</div>
      ))}
    </>
  )
}

// ── Animated ECG line (draws itself) ─────────────────────────────────────────
function ECGLine() {
  return (
    <div style={{ marginBottom: 8 }}>
      <svg viewBox="0 0 260 44" style={{ width: 220, height: 34, display: 'block' }}>
        <style>{`
          @keyframes ecgDraw { to { stroke-dashoffset: 0; } }
          @keyframes ecgPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        `}</style>
        <polyline
          points="0,22 22,22 32,6 40,40 48,6 56,22 74,22 92,22 102,3 110,42 118,3 126,22 150,22 172,22 182,10 190,36 198,10 206,22 234,22 260,22"
          fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 520, strokeDashoffset: 520, animation: 'ecgDraw 2s ease forwards 0.4s' }}
        />
        <circle r="4" fill="#2563eb" style={{ animation: 'ecgPulse 1.2s ease-in-out infinite 2.4s', opacity: 0 }}>
          <animateMotion dur="2s" begin="0.4s" fill="freeze"
            path="M0,22 L22,22 L32,6 L40,40 L48,6 L56,22 L74,22 L92,22 L102,3 L110,42 L118,3 L126,22 L150,22 L172,22 L182,10 L190,36 L198,10 L206,22 L234,22 L260,22" />
        </circle>
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.user, data.access_token, data.refresh_token)
      navigate('/dashboard')
    } catch (err: any) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes slideUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes badgePop  { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.25)} 50%{box-shadow:0 0 0 10px rgba(37,99,235,0)} }

        .lp-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 24px; background: #f0f7ff;
          font-family: 'Plus Jakarta Sans', sans-serif; position: relative; overflow: hidden;
        }

        .lp-card {
          position: relative; z-index: 10; width: 100%; max-width: 420px;
          background: #fff; border-radius: 28px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(37,99,235,0.10), 0 0 0 1px rgba(219,234,254,0.8);
          padding: 44px 40px;
          animation: slideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .lp-logo {
          display: flex; align-items: center; gap: 11px; margin-bottom: 30px;
        }
        .lp-logo-icon {
          width: 44px; height: 44px; border-radius: 14px;
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: #fff; font-weight: 900;
          animation: logoPulse 2.8s ease-in-out infinite;
          box-shadow: 0 6px 18px rgba(29,78,216,0.28);
        }
        .lp-logo-text { font-size: 15px; font-weight: 700; color: #1e3a5f; letter-spacing: -0.01em; }
        .lp-logo-badge {
          margin-left: auto; font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe;
          padding: 3px 9px; border-radius: 999px; text-transform: uppercase;
          animation: badgePop 0.5s ease both 0.6s; opacity: 0;
        }

        .lp-heading {
          font-family: 'Lora', serif; font-size: 28px; font-weight: 700;
          color: #0f2040; line-height: 1.2; margin-bottom: 6px;
        }
        .lp-sub { font-size: 13.5px; color: #64748b; margin-bottom: 26px; }
        .lp-sub a { color: #2563eb; font-weight: 600; text-decoration: none; }
        .lp-sub a:hover { text-decoration: underline; }

        .lp-label {
          display: block; font-size: 12px; font-weight: 700; color: #374151;
          margin-bottom: 6px; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .lp-field { margin-bottom: 18px; position: relative; }
        .lp-input {
          width: 100%; padding: 13px 16px 13px 44px;
          border-radius: 13px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; color: #1e293b;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; outline: none;
        }
        .lp-input::placeholder { color: #94a3b8; }
        .lp-input:focus {
          border-color: #2563eb; background: #fff;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.09);
        }
        .lp-icon {
          position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
          font-size: 15px; pointer-events: none; line-height: 1;
        }
        .lp-pw-toggle {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          transition: color 0.2s; display: flex; padding: 4px;
        }
        .lp-pw-toggle:hover { color: #475569; }

        .lp-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px; font-size: 13px;
        }
        .lp-remember { display: flex; align-items: center; gap: 7px; color: #64748b; cursor: pointer; }
        .lp-remember input { accent-color: #2563eb; width: 14px; height: 14px; border-radius: 4px; }
        .lp-forgot { background: none; border: none; cursor: pointer; color: #2563eb; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; }
        .lp-forgot:hover { text-decoration: underline; }

        .lp-btn {
          width: 100%; padding: 14px; border-radius: 13px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 700; color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%);
          box-shadow: 0 6px 22px rgba(29,78,216,0.32);
          transition: box-shadow 0.25s, transform 0.15s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .lp-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          background-size: 200% 100%; animation: shimmer 2.6s linear infinite;
        }
        .lp-btn:hover:not(:disabled) { box-shadow: 0 10px 32px rgba(29,78,216,0.42); transform: translateY(-1px); }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-divider {
          display: flex; align-items: center; gap: 12px; margin: 22px 0;
        }
        .lp-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .lp-divider-text { font-size: 12px; color: #94a3b8; }

        .lp-trust {
          margin-top: 26px; display: flex; align-items: center; justify-content: center;
          gap: 16px; flex-wrap: wrap;
        }
        .lp-trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #94a3b8; }
        .lp-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; display: inline-block; }

        .lp-err {
          margin-bottom: 16px; padding: 11px 14px; border-radius: 11px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-size: 13px; display: flex; gap: 8px;
          animation: slideUp 0.3s ease;
        }

        /* staggered field animations */
        .lp-f1 { animation: slideUp 0.5s ease both 0.1s; opacity: 0; }
        .lp-f2 { animation: slideUp 0.5s ease both 0.2s; opacity: 0; }
        .lp-f3 { animation: slideUp 0.5s ease both 0.3s; opacity: 0; }
        .lp-f4 { animation: slideUp 0.5s ease both 0.38s; opacity: 0; }
        .lp-f5 { animation: slideUp 0.5s ease both 0.46s; opacity: 0; }
        .lp-f6 { animation: slideUp 0.5s ease both 0.54s; opacity: 0; }
      `}</style>

      <div className="lp-page">
        <MouseTracker />
        <WaveBackground />
        <FloatingCrosses />

        <div className="lp-card">

          {/* Logo row */}
          <div className="lp-logo lp-f1">
            <div className="lp-logo-icon">✚</div>
            <span className="lp-logo-text">Smart Health Assistant</span>
            <span className="lp-logo-badge">AI</span>
          </div>

          {/* ECG */}
          <div className="lp-f2"><ECGLine /></div>

          {/* Heading */}
          <div className="lp-f2">
            <h1 className="lp-heading">Welcome back 👋</h1>
            <p className="lp-sub">
              No account?{' '}
              <Link to="/register">Create one free →</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="lp-err">
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit}>
            <div className="lp-f3">
              <label className="lp-label">Email address</label>
              <div className="lp-field">
                <span className="lp-icon">📧</span>
                <input type="email" required placeholder="you@example.com" className="lp-input"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <div className="lp-f4">
              <label className="lp-label">Password</label>
              <div className="lp-field">
                <span className="lp-icon">🔒</span>
                <input type={showPw ? 'text' : 'password'} required placeholder="Your password"
                  className="lp-input" style={{ paddingRight: 44 }}
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" className="lp-pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div className="lp-row lp-f5">
              <label className="lp-remember">
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="lp-forgot">Forgot password?</button>
            </div>

            <div className="lp-f6">
              <button type="submit" disabled={loading} className="lp-btn">
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />Signing in…</>
                  : 'Sign In →'
                }
              </button>
            </div>
          </form>

          {/* Trust */}
          <div className="lp-trust lp-f6">
            {['SSL Encrypted', 'Zero Data Retention', 'HIPAA Compliant'].map(t => (
              <div key={t} className="lp-trust-item"><span className="lp-trust-dot" />{t}</div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}