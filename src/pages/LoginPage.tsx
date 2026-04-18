import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

// ========== Icons ==========
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function MailIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  )
}
function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  )
}
function EyeIcon({ open, className = '' }: { open: boolean; className?: string }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
    </svg>
  )
}
function AlertIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}
function ShieldCheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className + ' animate-spin'}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ========== Main ==========
export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.user, data.access_token, data.refresh_token)
      navigate('/dashboard')
    } catch (err: any) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.backgroundColor = '#FFFFFF'
    e.currentTarget.style.borderColor = '#0D9488'
    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.14)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.backgroundColor = '#FAFAF9'
    e.currentTarget.style.borderColor = '#E7E5E4'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF9', color: '#0F172A' }}
    >
      {/* ========== Navbar ========== */}
      <nav style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E5E4' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: '#0D9488', boxShadow: '0 6px 16px rgba(13, 148, 136, 0.35)' }}
            >
              <PlusIcon className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p
                className="font-semibold text-[15px] transition-colors"
                style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
              >
                SmartHealth
              </p>
              <p className="text-[11px] -mt-0.5" style={{ color: '#64748B' }}>
                AI Health Assistant
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="text-sm transition-colors"
            style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0D9488')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            Back to home
          </Link>
        </div>
      </nav>

      {/* ========== Form area ========== */}
      <div className="flex-1 relative flex items-center justify-center px-6 py-12 overflow-hidden">
        {/* Bright ambient background — more saturated blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(204, 251, 241, 0.55) 0%, rgba(250, 250, 249, 0) 45%, rgba(165, 243, 252, 0.45) 100%)',
          }}
        />
        <div
          className="absolute top-10 -right-40 w-[560px] h-[560px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.40) 0%, rgba(13, 148, 136, 0.18) 50%, transparent 75%)',
            animation: 'blob 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 -left-40 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(103, 232, 249, 0.35) 0%, rgba(204, 251, 241, 0.25) 55%, transparent 80%)',
            animation: 'blob 14s ease-in-out infinite 2s',
          }}
        />
        {/* Smaller accent dots for extra vibrancy */}
        <div
          className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(45, 212, 191, 0.35) 0%, transparent 70%)' }}
        />

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%      { transform: translate(40px, -50px) scale(1.1); }
            66%      { transform: translate(-30px, 30px) scale(0.9); }
          }
        `}</style>

        {/* Card */}
        <div
          className="relative w-full max-w-md rounded-3xl p-8 md:p-10 animate-fade-up"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CCFBF1',
            boxShadow: '0 25px 70px rgba(13, 148, 136, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div className="mb-8">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              Welcome back
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#475569' }}>
              New here?{' '}
              <Link
                to="/register"
                className="font-semibold transition-colors"
                style={{ color: '#0D9488' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0F766E')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#0D9488')}
              >
                Create a free account
              </Link>
            </p>
          </div>

          {error && (
            <div
              className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#FFE4E6', border: '1px solid #FECDD3', color: '#BE123C' }}
            >
              <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ fontFamily: "'Sora', sans-serif", color: '#334155' }}
              >
                Email address
              </label>
              <div className="relative">
                <MailIcon
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#94A3B8' } as any}
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all"
                  style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ fontFamily: "'Sora', sans-serif", color: '#334155' }}
              >
                Password
              </label>
              <div className="relative">
                <LockIcon
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#94A3B8' } as any}
                />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm transition-all"
                  style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: '#94A3B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0D9488')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                >
                  <EyeIcon open={showPw} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label
                className="flex items-center gap-2 cursor-pointer select-none"
                style={{ color: '#475569' }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#0D9488', borderColor: '#CBD5E1' }}
                />
                Remember me
              </label>
              <button
                type="button"
                className="font-semibold transition-colors"
                style={{ color: '#0D9488' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0F766E')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#0D9488')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit — extra bright */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'Sora', sans-serif",
                background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)',
                boxShadow: '0 10px 30px rgba(13, 148, 136, 0.45), 0 4px 10px rgba(20, 184, 166, 0.25)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.boxShadow =
                    '0 16px 40px rgba(13, 148, 136, 0.55), 0 6px 14px rgba(20, 184, 166, 0.35)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 10px 30px rgba(13, 148, 136, 0.45), 0 4px 10px rgba(20, 184, 166, 0.25)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Trust row */}
          <div
            className="mt-8 pt-6 flex items-center justify-center gap-5 flex-wrap text-xs"
            style={{ borderTop: '1px solid #F5F4F0', color: '#64748B' }}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3.5 h-3.5" style={{ color: '#059669' } as any} />
              <span>Encrypted connection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3.5 h-3.5" style={{ color: '#059669' } as any} />
              <span>Private by design</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Footer ========== */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E7E5E4' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 text-center">
          <p
            className="text-xs max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#64748B' }}
          >
            SmartHealth provides preliminary AI-assisted analysis for informational purposes only.
            Always consult a licensed healthcare professional for medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
