import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'

// ========== Icons ==========
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function DropletIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.5c-4 4.5-7 8-7 11.5a7 7 0 0014 0c0-3.5-3-7-7-11.5z" />
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
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
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
function PulseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  )
}
function FlaskIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 3h6M10 3v6L5 20a2 2 0 002 2h10a2 2 0 002-2l-5-11V3" />
      <path d="M7 15h10" />
    </svg>
  )
}
function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

// ========== Main ==========
export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    age: '',
    gender: '',
    blood_type: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register({
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        blood_type: form.blood_type || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err: any) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const f =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }))

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.backgroundColor = '#FFFFFF'
    e.currentTarget.style.borderColor = '#0D9488'
    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.14)'
  }
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.backgroundColor = '#FAFAF9'
    e.currentTarget.style.borderColor = '#E7E5E4'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF9', color: '#0F172A' }}
    >
      <style>{`
        @keyframes slowDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(40px, -60px) scale(1.15); }
          66%      { transform: translate(-30px, 40px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rp-item { animation: fadeIn 0.5s ease forwards; opacity: 0; }
      `}</style>

      {/* ========== Left panel (vibrant teal gradient) ========== */}
      <div
        className="hidden lg:flex lg:w-[42%] relative overflow-hidden text-white p-12 flex-col justify-between"
        style={{
          background:
            'linear-gradient(135deg, #14B8A6 0%, #0D9488 28%, #0F766E 58%, #134E4A 100%)',
        }}
      >
        {/* Bright decorative accents */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(165, 243, 252, 0.45) 0%, rgba(103, 232, 249, 0.2) 50%, transparent 80%)',
            animation: 'slowDrift 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.45) 0%, transparent 75%)',
            animation: 'slowDrift 16s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-56 h-56 rounded-full blur-2xl pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(204, 251, 241, 0.4) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center text-white"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              }}
            >
              <PlusIcon className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p
                className="font-semibold text-white text-[15px] transition-colors"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                SmartHealth
              </p>
              <p className="text-[11px] -mt-0.5" style={{ color: 'rgba(204, 251, 241, 0.85)' }}>
                AI Health Assistant
              </p>
            </div>
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h1
            className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Start your{' '}
            <span style={{ color: '#99F6E4' }}>health journey</span> today.
          </h1>
          <p
            className="mt-5 text-base leading-relaxed max-w-sm"
            style={{ color: 'rgba(204, 251, 241, 0.95)' }}
          >
            Preliminary AI-assisted health assessments grounded in the Gale
            Encyclopedia of Medicine.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-5">
            {[
              {
                icon: <PulseIcon className="w-5 h-5" />,
                title: 'AI Symptom Analysis',
                desc: 'Plain-language symptoms, referenced results.',
              },
              {
                icon: <FlaskIcon className="w-5 h-5" />,
                title: 'Lab Report Interpretation',
                desc: 'Upload a PDF, get clear explanations.',
              },
              {
                icon: <ChatIcon className="w-5 h-5" />,
                title: 'Natural Chat Intake',
                desc: 'Describe how you feel, in your own words.',
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className="flex items-start gap-3.5 rp-item"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.10)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    className="font-semibold text-white text-sm"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: 'rgba(204, 251, 241, 0.8)' }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust card */}
        <div className="relative z-10">
          <div
            className="rounded-2xl backdrop-blur-sm p-5 rp-item"
            style={{
              animationDelay: '0.6s',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
            }}
          >
            <div className="flex items-start gap-3">
              <ShieldCheckIcon
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: '#99F6E4' } as any}
              />
              <div>
                <p className="text-sm font-medium text-white leading-snug">
                  Grounded in trusted medical references.
                </p>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: 'rgba(204, 251, 241, 0.85)' }}
                >
                  Every prediction cites sources from the Gale Encyclopedia of
                  Medicine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Right panel (form) ========== */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FAFAF9' }}>
        {/* Mini top nav */}
        <div
          className="px-6 h-16 flex items-center justify-between"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E5E4' }}
        >
          <Link to="/" className="lg:hidden flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: '#0D9488', boxShadow: '0 6px 16px rgba(13, 148, 136, 0.35)' }}
            >
              <PlusIcon className="w-5 h-5" />
            </div>
            <p
              className="font-semibold text-[15px] transition-colors"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              SmartHealth
            </p>
          </Link>
          <div className="hidden lg:block" />
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

        {/* Subtle ambient on right side too */}
        <div className="flex-1 relative flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div
            className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-70"
            style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.20) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-10 left-10 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(204, 251, 241, 0.45) 0%, transparent 75%)' }}
          />

          <div className="relative w-full max-w-md">
            {success ? (
              // ========== Success state ==========
              <div
                className="rounded-3xl p-10 text-center animate-fade-up"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCFBF1',
                  boxShadow: '0 25px 70px rgba(13, 148, 136, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{
                    backgroundColor: '#D1FAE5',
                    border: '2px solid #A7F3D0',
                    color: '#047857',
                    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <CheckIcon className="w-7 h-7" />
                </div>
                <h2
                  className="text-2xl font-bold tracking-tight"
                  style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
                >
                  Account created
                </h2>
                <p className="mt-2 text-sm" style={{ color: '#475569' }}>
                  Redirecting you to sign in...
                </p>
              </div>
            ) : (
              // ========== Form ==========
              <div
                className="rounded-3xl p-8 md:p-10 animate-fade-up"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCFBF1',
                  boxShadow: '0 25px 70px rgba(13, 148, 136, 0.18), 0 4px 12px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div className="mb-7">
                  <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
                  >
                    Create account
                  </h1>
                  <p className="mt-2 text-sm" style={{ color: '#475569' }}>
                    Already have one?{' '}
                    <Link
                      to="/login"
                      className="font-semibold transition-colors"
                      style={{ color: '#0D9488' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0F766E')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#0D9488')}
                    >
                      Sign in
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
                  {/* Full name */}
                  <div>
                    <label
                      htmlFor="full_name"
                      className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                      style={{ fontFamily: "'Sora', sans-serif", color: '#334155' }}
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <UserIcon
                        className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: '#94A3B8' } as any}
                      />
                      <input
                        id="full_name"
                        type="text"
                        required
                        placeholder="Your full name"
                        value={form.full_name}
                        onChange={f('full_name')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all"
                        style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                    </div>
                  </div>

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
                        onChange={f('email')}
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
                        minLength={8}
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={f('password')}
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

                  {/* Optional health profile */}
                  <div className="pt-4 mt-2" style={{ borderTop: '1px solid #F5F4F0' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ fontFamily: "'Sora', sans-serif", color: '#334155' }}
                      >
                        Health profile
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ color: '#0F766E', backgroundColor: '#F0FDFA', border: '1px solid #99F6E4' }}
                      >
                        Optional
                      </span>
                    </div>
                    <p className="text-xs mb-4 leading-relaxed" style={{ color: '#64748B' }}>
                      Helps us give more accurate suggestions. You can add or edit
                      this later in your profile.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Age */}
                      <div>
                        <label
                          htmlFor="age"
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: '#475569' }}
                        >
                          Age
                        </label>
                        <div className="relative">
                          <CalendarIcon
                            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: '#94A3B8' } as any}
                          />
                          <input
                            id="age"
                            type="number"
                            min={1}
                            max={120}
                            placeholder="e.g. 28"
                            value={form.age}
                            onChange={f('age')}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all"
                            style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label
                          htmlFor="gender"
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: '#475569' }}
                        >
                          Gender
                        </label>
                        <select
                          id="gender"
                          value={form.gender}
                          onChange={f('gender')}
                          className="w-full px-3 py-2.5 rounded-xl text-sm transition-all appearance-none cursor-pointer"
                          style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                          onFocus={inputFocus}
                          onBlur={inputBlur}
                        >
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Blood type */}
                    <div className="mt-3">
                      <label
                        htmlFor="blood_type"
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: '#475569' }}
                      >
                        Blood type
                      </label>
                      <div className="relative">
                        <DropletIcon
                          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: '#94A3B8' } as any}
                        />
                        <select
                          id="blood_type"
                          value={form.blood_type}
                          onChange={f('blood_type')}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all appearance-none cursor-pointer"
                          style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                          onFocus={inputFocus}
                          onBlur={inputBlur}
                        >
                          <option value="">Unknown</option>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                            <option key={bt} value={bt}>
                              {bt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit — bright gradient */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                        Creating account
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center leading-relaxed pt-1" style={{ color: '#64748B' }}>
                    By creating an account, you agree this is a preliminary
                    assessment tool and not a substitute for medical advice.
                  </p>
                </form>

                {/* Trust row */}
                <div
                  className="mt-7 pt-6 flex items-center justify-center gap-5 flex-wrap text-xs"
                  style={{ borderTop: '1px solid #F5F4F0', color: '#64748B' }}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5" style={{ color: '#059669' } as any} />
                    <span>Encrypted connection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5" style={{ color: '#059669' } as any} />
                    <span>Free to use</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
