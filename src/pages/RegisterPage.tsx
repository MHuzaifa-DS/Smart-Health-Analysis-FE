import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'

// ── Animated blob background ──────────────────────────────────────────────────
function BlobBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes blobMove1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.97)} }
        @keyframes blobMove2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.04)} 66%{transform:translate(20px,-15px) scale(0.98)} }
        @keyframes blobMove3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,25px) scale(1.06)} }
      `}</style>
      <div style={{ position:'absolute', top:'-15%', right:'-10%', width:520, height:520, borderRadius:'60% 40% 30% 70% / 60% 30% 70% 40%', background:'radial-gradient(circle at 40% 40%, #dbeafe 0%, #bfdbfe 60%, transparent 80%)', opacity:0.7, animation:'blobMove1 14s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:'-12%', left:'-8%', width:440, height:440, borderRadius:'30% 60% 70% 40% / 50% 60% 30% 60%', background:'radial-gradient(circle at 60% 60%, #e0f2fe 0%, #bae6fd 60%, transparent 80%)', opacity:0.6, animation:'blobMove2 18s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'35%', left:'40%', width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, #eff6ff 0%, transparent 70%)', opacity:0.5, animation:'blobMove3 12s ease-in-out infinite' }} />
    </div>
  )
}

// ── Animated health stats card ────────────────────────────────────────────────
function StatsCard() {
  const stats = [
    { icon: '🩺', label: 'Disease Prediction', val: '82–91%', sub: 'accuracy rate', color: '#2563eb' },
    { icon: '🧪', label: 'Lab Analysis', val: '95.5%', sub: 'OCR extraction', color: '#0891b2' },
    { icon: '💬', label: 'Symptom Intake', val: '91%', sub: 'mapping accuracy', color: '#0369a1' },
  ]
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '22px 20px', boxShadow: '0 4px 24px rgba(37,99,235,0.10), 0 0 0 1px rgba(219,234,254,0.8)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>System Performance</p>
      {stats.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < stats.length - 1 ? 14 : 0, animation: `rSlideUp 0.5s ease both ${0.4 + i * 0.12}s`, opacity: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{s.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{s.label}</div>
            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${s.color}, #0ea5e9)`, borderRadius: 999, width: s.val.replace('%','').split('–')[0] + '%', animation: `rBarGrow 1s ease both ${0.7 + i * 0.15}s`, transform: 'scaleX(0)', transformOrigin: 'left' }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', age: '', gender: '', blood_type: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await authApi.register({ ...form, age: form.age ? parseInt(form.age) : undefined, gender: form.gender || undefined, blood_type: form.blood_type || undefined })
      setSuccess(true); setTimeout(() => navigate('/login'), 2200)
    } catch (err: any) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes rSlideUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rFadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes rBarGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes checkBounce { 0%{transform:scale(0) rotate(-15deg);opacity:0} 65%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes successPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.3)} 50%{box-shadow:0 0 0 14px rgba(37,99,235,0)} }
        @keyframes floatFeature { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

        .rp-page {
          min-height: 100vh; display: flex; font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f0f7ff; position: relative; overflow: hidden;
        }

        /* LEFT PANEL */
        .rp-left {
          display: none; flex-direction: column; justify-content: center;
          padding: 52px 44px; position: relative; z-index: 1;
          background: linear-gradient(160deg, #1d4ed8 0%, #0369a1 60%, #0ea5e9 100%);
        }
        @media (min-width: 1024px) { .rp-left { display: flex; width: 42%; } }

        .rp-left-logo { display: flex; align-items: center; gap: 11px; margin-bottom: 48px; }
        .rp-left-icon { width: 42px; height: 42px; border-radius: 13px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; font-weight: 900; backdrop-filter: blur(8px); }
        .rp-left-name { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }

        .rp-left-heading { font-family: 'Lora', serif; font-size: 34px; font-weight: 700; color: #fff; line-height: 1.22; margin-bottom: 14px; }
        .rp-left-sub { font-size: 14.5px; color: rgba(255,255,255,0.72); line-height: 1.65; max-width: 300px; margin-bottom: 36px; }

        .rp-feature { display: flex; gap: 13px; align-items: flex-start; margin-bottom: 18px; animation: floatFeature 5s ease-in-out infinite; }
        .rp-feature:nth-child(2) { animation-delay: 1.5s; }
        .rp-feature:nth-child(3) { animation-delay: 3s; }
        .rp-feature-icon { width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
        .rp-feature-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .rp-feature-desc { font-size: 12.5px; color: rgba(255,255,255,0.60); line-height: 1.5; }

        .rp-left-bottom { margin-top: 36px; }

        /* LEFT decorative circles */
        .rp-left::before { content:''; position:absolute; top:-80px; right:-80px; width:280px; height:280px; border-radius:50%; background:rgba(255,255,255,0.07); pointer-events:none; }
        .rp-left::after  { content:''; position:absolute; bottom:-60px; left:-40px; width:220px; height:220px; border-radius:50%; background:rgba(255,255,255,0.05); pointer-events:none; }

        /* RIGHT PANEL */
        .rp-right {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 40px 24px; position: relative; z-index: 1; overflow-y: auto;
        }

        .rp-card {
          width: 100%; max-width: 400px;
          background: #fff; border-radius: 26px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 16px 50px rgba(37,99,235,0.10), 0 0 0 1px rgba(219,234,254,0.8);
          padding: 40px 36px;
          animation: rSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* Mobile logo */
        .rp-mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        @media (min-width: 1024px) { .rp-mobile-logo { display: none !important; } }
        .rp-mob-icon { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg,#1d4ed8,#0ea5e9); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 900; }
        .rp-mob-name { font-size: 15px; font-weight: 700; color: #1e3a5f; }

        .rp-heading { font-family: 'Lora', serif; font-size: 26px; font-weight: 700; color: #0f2040; line-height: 1.2; margin-bottom: 6px; }
        .rp-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
        .rp-sub a { color: #2563eb; font-weight: 600; text-decoration: none; }
        .rp-sub a:hover { text-decoration: underline; }

        .rp-label { display: block; font-size: 11.5px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.04em; text-transform: uppercase; }
        .rp-field { margin-bottom: 14px; position: relative; }
        .rp-inp { width: 100%; padding: 12px 16px 12px 42px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #1e293b; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; }
        .rp-inp::placeholder { color: #94a3b8; }
        .rp-inp:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.09); }
        .rp-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; line-height: 1; }
        .rp-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 4px; transition: color .2s; }
        .rp-eye:hover { color: #475569; }

        .rp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

        .rp-section-label {
          display: flex; align-items: center; gap: 8px; margin: 16px 0 12px;
          padding-top: 14px; border-top: 1px solid #f1f5f9;
        }
        .rp-section-text { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; }
        .rp-opt-badge { font-size: 10px; color: #0369a1; background: #e0f2fe; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 999px; font-weight: 600; }

        .rp-btn {
          width: 100%; padding: 14px; border-radius: 13px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 700; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%);
          box-shadow: 0 6px 22px rgba(29,78,216,0.30);
          transition: box-shadow .25s, transform .15s, opacity .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px; position: relative; overflow: hidden;
        }
        .rp-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent); background-size:200% 100%; animation:shimmer 2.6s linear infinite; }
        .rp-btn:hover:not(:disabled) { box-shadow: 0 10px 32px rgba(29,78,216,0.42); transform: translateY(-1px); }
        .rp-btn:active:not(:disabled) { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rp-trust { margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .rp-trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #94a3b8; }
        .rp-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; display: inline-block; }

        .rp-err { margin-bottom: 14px; padding: 10px 13px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; display: flex; gap: 8px; animation: rSlideUp .3s ease; }

        /* success */
        .rp-success { text-align: center; padding: 28px 12px; }
        .rp-success-icon { width: 70px; height: 70px; border-radius: 50%; background: #eff6ff; border: 2px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 18px; animation: checkBounce .55s cubic-bezier(.34,1.56,.64,1) forwards, successPulse 2.2s ease infinite .6s; }
        .rp-success-title { font-family: 'Lora', serif; font-size: 24px; font-weight: 700; color: #0f2040; margin-bottom: 7px; }
        .rp-success-sub { font-size: 13.5px; color: #64748b; }

        .rp-f1 { animation: rSlideUp .5s ease both .1s; opacity:0; }
        .rp-f2 { animation: rSlideUp .5s ease both .2s; opacity:0; }
        .rp-f3 { animation: rSlideUp .5s ease both .3s; opacity:0; }
        .rp-f4 { animation: rSlideUp .5s ease both .38s; opacity:0; }
        .rp-f5 { animation: rSlideUp .5s ease both .46s; opacity:0; }
        .rp-f6 { animation: rSlideUp .5s ease both .54s; opacity:0; }
        .rp-f7 { animation: rSlideUp .5s ease both .62s; opacity:0; }
      `}</style>

      <div className="rp-page">
        <BlobBackground />

        {/* ── Left panel ──────────────────────────────────────── */}
        <div className="rp-left">
          <div className="rp-left-logo">
            <div className="rp-left-icon">✚</div>
            <span className="rp-left-name">Smart Health Assistant</span>
          </div>

          <h1 className="rp-left-heading">
            Start your<br />
            <span style={{ color: '#bae6fd' }}>health journey</span><br />
            today.
          </h1>
          <p className="rp-left-sub">
            AI-powered preliminary health assessments grounded in the Gale Encyclopedia of Medicine.
          </p>

          <div className="rp-feature" style={{ animationDelay: '0s' }}>
            <div className="rp-feature-icon">🤖</div>
            <div><div className="rp-feature-title">AI Disease Prediction</div><div className="rp-feature-desc">RAG + ML combined for accurate, cited results</div></div>
          </div>
          <div className="rp-feature" style={{ animationDelay: '1.5s' }}>
            <div className="rp-feature-icon">🧪</div>
            <div><div className="rp-feature-title">Lab Report Analysis</div><div className="rp-feature-desc">Upload PDF — get instant interpretation</div></div>
          </div>
          <div className="rp-feature" style={{ animationDelay: '3s' }}>
            <div className="rp-feature-icon">💬</div>
            <div><div className="rp-feature-title">Natural Chat Intake</div><div className="rp-feature-desc">Just describe how you feel, in your own words</div></div>
          </div>

          <div className="rp-left-bottom">
            <StatsCard />
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────────── */}
        <div className="rp-right">

          {/* Mobile logo */}
          <div className="rp-mobile-logo">
            <div className="rp-mob-icon">✚</div>
            <span className="rp-mob-name">Smart Health Assistant</span>
          </div>

          <div className="rp-card">

            {success ? (
              <div className="rp-success">
                <div className="rp-success-icon">✓</div>
                <h2 className="rp-success-title">Account created!</h2>
                <p className="rp-success-sub">Redirecting you to sign in…</p>
              </div>
            ) : (
              <>
                <div className="rp-f1">
                  <h1 className="rp-heading">Create account</h1>
                  <p className="rp-sub">Already have one? <Link to="/login">Sign in →</Link></p>
                </div>

                {error && <div className="rp-err rp-f1"><span style={{ flexShrink:0 }}>⚠</span>{error}</div>}

                <form onSubmit={submit}>
                  <div className="rp-f2">
                    <label className="rp-label">Full name</label>
                    <div className="rp-field">
                      <span className="rp-ico">👤</span>
                      <input type="text" required placeholder="Your full name" className="rp-inp"
                        value={form.full_name} onChange={f('full_name')} />
                    </div>
                  </div>

                  <div className="rp-f3">
                    <label className="rp-label">Email address</label>
                    <div className="rp-field">
                      <span className="rp-ico">📧</span>
                      <input type="email" required placeholder="you@example.com" className="rp-inp"
                        value={form.email} onChange={f('email')} />
                    </div>
                  </div>

                  <div className="rp-f4">
                    <label className="rp-label">Password</label>
                    <div className="rp-field">
                      <span className="rp-ico">🔒</span>
                      <input type={showPw ? 'text' : 'password'} required minLength={8}
                        placeholder="Min. 8 characters" className="rp-inp" style={{ paddingRight:42 }}
                        value={form.password} onChange={f('password')} />
                      <button type="button" className="rp-eye" onClick={() => setShowPw(v => !v)}>
                        {showPw
                          ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                          : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Optional health info */}
                  <div className="rp-section-label rp-f5">
                    <span className="rp-section-text">Health profile</span>
                    <span className="rp-opt-badge">Optional</span>
                  </div>

                  <div className="rp-f5">
                    <div className="rp-grid2" style={{ marginBottom: 12 }}>
                      <div>
                        <label className="rp-label">Age</label>
                        <div className="rp-field" style={{ marginBottom:0 }}>
                          <span className="rp-ico">🎂</span>
                          <input type="number" placeholder="e.g. 28" min="1" max="120" className="rp-inp"
                            value={form.age} onChange={f('age')} />
                        </div>
                      </div>
                      <div>
                        <label className="rp-label">Gender</label>
                        <div className="rp-field" style={{ marginBottom:0 }}>
                          <span className="rp-ico">⚧</span>
                          <select className="rp-inp" value={form.gender} onChange={f('gender')}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <label className="rp-label">Blood type</label>
                    <div className="rp-field">
                      <span className="rp-ico">🩸</span>
                      <select className="rp-inp" value={form.blood_type} onChange={f('blood_type')}>
                        <option value="">Unknown</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rp-f6">
                    <button type="submit" disabled={loading} className="rp-btn">
                      {loading
                        ? <><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.35)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.75s linear infinite' }} />Creating account…</>
                        : 'Create Account →'
                      }
                    </button>
                  </div>
                </form>

                <div className="rp-trust rp-f7">
                  {['SSL Encrypted','Zero Data Retention','Free Forever'].map(t => (
                    <div key={t} className="rp-trust-item"><span className="rp-trust-dot" />{t}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}