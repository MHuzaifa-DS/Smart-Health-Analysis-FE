import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Landing page — Deep Teal + Cream + Navy
 *
 * Enhancements in this version:
 *   1. Typing headline — cycles through 4 phrases
 *   2. Live metric cards — values subtly animate like real monitoring
 *   3. Looping ECG line — continuous heartbeat sweep
 *   4. Streamed chat — bot responses typewriter character-by-character
 */

// ========== Inline icons ==========
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zM19 15l.75 2.75L22 18.5l-2.25.75L19 22l-.75-2.75L16 18.5l2.25-.75L19 15z" />
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
function ChartIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-5" />
    </svg>
  )
}
function ShieldIcon({ className = '' }: { className?: string }) {
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
function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21s-7-4.5-9.5-9C.9 8.5 2.5 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.6 4.5 4 8-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  )
}
function DropletIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c-4 4.5-7 8-7 11.5a7 7 0 0014 0c0-3.5-3-7-7-11.5z" />
    </svg>
  )
}
function ActivityIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
function FootprintIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 3C6 3 5 5 5 7.5S6 12 7 12s2-2 2-4.5S9.5 3 8 3zM15 3c-1.5 0-2 2-2 4.5S14 12 15 12s2-2 2-4.5S17 3 15 3zM4 14c-1 0-2 1-2 2.5v2c0 1 .5 2 1.5 2S5 19 5 17.5V15c0-.5-.5-1-1-1zM19 14c-.5 0-1 .5-1 1v2.5c0 1.5.5 2 1.5 2S21 18.5 21 17.5v-2c0-1.5-1-2.5-2-2.5z" />
    </svg>
  )
}
function SendIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

// ========== 1. Typing headline ==========
const PHRASES = [
  { plain: 'Your ', highlight: 'fatigue', tail: ', explained.' },
  { plain: 'Your ', highlight: 'lab results', tail: ', clarified.' },
  { plain: 'Your ', highlight: 'symptoms', tail: ', decoded.' },
  { plain: 'Your ', highlight: 'health', tail: ', understood.' },
]

function TypingHeadline() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const current = PHRASES[phraseIdx]
  const fullWord = current.highlight

  useEffect(() => {
    const targetLen = deleting ? 0 : fullWord.length
    if (charIdx === targetLen) {
      // Pause before next action
      const pauseMs = deleting ? 200 : 1800
      const t = setTimeout(() => {
        if (deleting) {
          setDeleting(false)
          setPhraseIdx((i) => (i + 1) % PHRASES.length)
        } else {
          setDeleting(true)
        }
      }, pauseMs)
      return () => clearTimeout(t)
    }
    const delay = deleting ? 40 : 90
    const t = setTimeout(() => {
      setCharIdx((c) => c + (deleting ? -1 : 1))
    }, delay)
    return () => clearTimeout(t)
  }, [charIdx, deleting, fullWord, phraseIdx])

  return (
    <h1
      className="text-3xl md:text-5xl font-bold tracking-tight leading-tight"
      style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
    >
      {current.plain}
      <span style={{ color: '#0D9488' }}>
        {fullWord.slice(0, charIdx)}
        <span
          className="inline-block w-[2px] h-[0.85em] align-middle ml-0.5"
          style={{
            backgroundColor: '#0D9488',
            animation: 'cursorBlink 1s step-start infinite',
            verticalAlign: 'middle',
          }}
        />
      </span>
      {charIdx === fullWord.length && !deleting && current.tail}
    </h1>
  )
}

// ========== 2. Animated metric card ==========
function useLiveMetric(min: number, max: number, interval = 2500) {
  const [value, setValue] = useState((min + max) / 2)
  useEffect(() => {
    const tick = () => {
      setValue((prev) => {
        // Random walk with drift-back to center
        const center = (min + max) / 2
        const drift = (center - prev) * 0.08
        const jitter = (Math.random() - 0.5) * (max - min) * 0.25
        const next = prev + drift + jitter
        return Math.max(min, Math.min(max, next))
      })
    }
    const id = setInterval(tick, interval)
    return () => clearInterval(id)
  }, [min, max, interval])
  return value
}

function useLiveSteps(start: number) {
  const [value, setValue] = useState(start)
  useEffect(() => {
    const id = setInterval(() => {
      // Occasionally bump steps by 1-4
      if (Math.random() > 0.5) setValue((v) => v + Math.floor(Math.random() * 4) + 1)
    }, 1800)
    return () => clearInterval(id)
  }, [])
  return value
}

// ========== Animated hero visual ==========
function AnimatedVisual() {
  const heartRate = useLiveMetric(68, 76, 2200)
  const systolic = useLiveMetric(114, 122, 3000)
  const diastolic = useLiveMetric(72, 80, 3000)
  const glucose = useLiveMetric(91, 97, 3500)
  const steps = useLiveSteps(8412)

  return (
    <div className="relative h-[520px] w-full flex items-center justify-center">
      <style>{`
        @keyframes scoreGrow { from { stroke-dashoffset: 754; } to { stroke-dashoffset: 136; } }
        @keyframes slowFloat  { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
        @keyframes slowFloat2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(-1.5deg); } }
        @keyframes slowFloat3 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(0.8deg); } }
        @keyframes countUp    { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseSlow  { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.05); } }
        @keyframes heartBeat  { 0%, 40%, 60%, 100% { transform: scale(1); } 45% { transform: scale(1.15); } 55% { transform: scale(1.05); } }
        @keyframes valueFlash { 0% { opacity: 0.7; } 100% { opacity: 1; } }

        /* ECG sweep — the line "draws" across, then resets, infinitely */
        @keyframes ecgSweep {
          0%   { stroke-dashoffset: 2000; }
          80%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -2000; }
        }

        @keyframes scoreCountUp {
          from { content: '0'; }
          to   { content: '82'; }
        }

        .live-value {
          animation: valueFlash 0.25s ease;
        }
      `}</style>

      {/* Soft teal orb */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, rgba(204, 251, 241, 0.3) 60%, transparent 80%)',
          animation: 'pulseSlow 6s ease-in-out infinite',
        }}
      />

      {/* LOOPING ECG — continuous heartbeat monitor sweep */}
      <svg
        viewBox="0 0 600 200"
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ecgGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="20%" stopColor="#0D9488" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#0D9488" stopOpacity="1" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points="0,100 60,100 80,70 95,130 110,100 180,100 220,100 240,70 255,130 270,100 360,100 400,100 420,75 435,125 450,100 540,100 600,100"
          fill="none"
          stroke="#0D9488"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: 'ecgSweep 3s linear infinite',
          }}
        />
      </svg>

      {/* Central health score ring */}
      <div className="relative z-10">
        <div
          className="w-64 h-64 rounded-full bg-white flex items-center justify-center"
          style={{
            border: '1px solid #E7E5E4',
            boxShadow:
              '0 20px 60px rgba(13, 148, 136, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06)',
          }}
        >
          <svg viewBox="0 0 280 280" className="w-full h-full absolute">
            <circle cx="140" cy="140" r="120" fill="none" stroke="#E7E5E4" strokeWidth="14" />
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="#0D9488"
              strokeWidth="14"
              strokeDasharray="754"
              strokeDashoffset="754"
              strokeLinecap="round"
              transform="rotate(-90 140 140)"
              style={{ animation: 'scoreGrow 2s ease-out forwards 0.4s' }}
            />
          </svg>
          <div
            className="relative flex flex-col items-center"
            style={{ animation: 'countUp 0.8s ease forwards 1.5s', opacity: 0 }}
          >
            <CountingScore target={82} />
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-2 font-semibold">
              Health Score
            </p>
            <div
              className="mt-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: '#F0FDFA', border: '1px solid #99F6E4' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#0F766E' }}>
                Looking good
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Heart rate — live animated, with beating heart icon */}
      <div
        className="absolute top-6 left-0 rounded-2xl p-4 flex items-center gap-3 z-20"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          boxShadow: '0 10px 30px rgba(13, 148, 136, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
          animation: 'slowFloat 5s ease-in-out infinite',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: '#FEE2E2',
            color: '#E11D48',
            animation: 'heartBeat 1.2s ease-in-out infinite',
          }}
        >
          <HeartIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Heart rate
          </p>
          <p
            className="text-lg font-bold text-slate-900 leading-none mt-0.5 live-value"
            style={{ fontFamily: "'Sora', sans-serif" }}
            key={`hr-${Math.round(heartRate)}`}
          >
            {Math.round(heartRate)}{' '}
            <span className="text-xs font-medium text-slate-500">bpm</span>
          </p>
        </div>
      </div>

      {/* Blood pressure — live */}
      <div
        className="absolute top-12 right-0 rounded-2xl p-4 flex items-center gap-3 z-20"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          boxShadow: '0 10px 30px rgba(13, 148, 136, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
          animation: 'slowFloat2 6s ease-in-out infinite 0.8s',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}
        >
          <ActivityIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Blood pressure
          </p>
          <p
            className="text-lg font-bold text-slate-900 leading-none mt-0.5 live-value"
            style={{ fontFamily: "'Sora', sans-serif" }}
            key={`bp-${Math.round(systolic)}-${Math.round(diastolic)}`}
          >
            {Math.round(systolic)}/{Math.round(diastolic)}
          </p>
        </div>
      </div>

      {/* Glucose — live */}
      <div
        className="absolute bottom-12 left-4 rounded-2xl p-4 flex items-center gap-3 z-20"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          boxShadow: '0 10px 30px rgba(13, 148, 136, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
          animation: 'slowFloat3 5.5s ease-in-out infinite 1.5s',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
        >
          <DropletIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Glucose
          </p>
          <p
            className="text-lg font-bold text-slate-900 leading-none mt-0.5 live-value"
            style={{ fontFamily: "'Sora', sans-serif" }}
            key={`glu-${Math.round(glucose)}`}
          >
            {Math.round(glucose)}{' '}
            <span className="text-xs font-medium text-slate-500">mg/dL</span>
          </p>
        </div>
      </div>

      {/* Steps — live counter */}
      <div
        className="absolute bottom-6 right-4 rounded-2xl p-4 flex items-center gap-3 z-20"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          boxShadow: '0 10px 30px rgba(13, 148, 136, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
          animation: 'slowFloat 6s ease-in-out infinite 2.2s',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
        >
          <FootprintIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Steps today
          </p>
          <p
            className="text-lg font-bold text-slate-900 leading-none mt-0.5 live-value"
            style={{ fontFamily: "'Sora', sans-serif" }}
            key={`steps-${steps}`}
          >
            {steps.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// ========== Counting score (0 -> 82 animation) ==========
function CountingScore({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return (
    <p
      className="text-6xl font-bold text-slate-900 leading-none"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      {value}
    </p>
  )
}

// ========== 4. Demo chat with streamed responses ==========
type ChatMessage = {
  role: 'bot' | 'user'
  text: string
  meta?: { confidence: number; sources: number; disease: string }
  ctaSignup?: boolean
  streaming?: boolean
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <style>{`
        @keyframes typingDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
      `}</style>
      {[0, 0.15, 0.3].map((d, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: '#94A3B8',
            animation: `typingDot 1.2s ease-in-out infinite ${d}s`,
          }}
        />
      ))}
    </div>
  )
}

function DemoChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: "Hi! I'm your AI health assistant. Describe any symptoms you're experiencing and I'll help analyze what might be going on.",
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [streamingIdx, setStreamingIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typing, streamingIdx])

  const getResponse = (text: string): ChatMessage => {
    const lower = text.toLowerCase()
    if (/\b(tired|fatigue|weak|exhausted|pale|anemia)\b/.test(lower)) {
      return {
        role: 'bot',
        text: 'These symptoms could indicate iron-deficiency anemia. Common signs include fatigue, pale skin, shortness of breath, and cold hands or feet. A Complete Blood Count (CBC) test would help confirm.',
        meta: { confidence: 87, sources: 3, disease: 'Iron-deficiency anemia' },
      }
    }
    if (/\b(headache|migraine|head.*pain|dizzy)\b/.test(lower)) {
      return {
        role: 'bot',
        text: 'Persistent headaches often point to tension-type headaches or migraines. Tracking frequency, location, and triggers helps narrow it down.',
        meta: { confidence: 72, sources: 2, disease: 'Tension headache' },
      }
    }
    if (/\b(thirst|urination|thirsty|peeing|pee.*often|diabetes)\b/.test(lower)) {
      return {
        role: 'bot',
        text: 'Excessive thirst with frequent urination is a classic early sign of Type 2 Diabetes. An HbA1c test and fasting glucose would help confirm.',
        meta: { confidence: 84, sources: 4, disease: 'Type 2 Diabetes' },
      }
    }
    if (/\b(blood.*pressure|bp|hypertension)\b/.test(lower)) {
      return {
        role: 'bot',
        text: 'High blood pressure often has no obvious symptoms, but dizziness and headaches can be warning signs. Regular monitoring and lifestyle changes make a real difference.',
        meta: { confidence: 79, sources: 3, disease: 'Hypertension' },
      }
    }
    if (/\b(cough|fever|cold|flu|sore.*throat)\b/.test(lower)) {
      return {
        role: 'bot',
        text: 'Cough with fever can point to viral infection or bronchitis. Duration and severity matter, and a check-up is sensible if symptoms persist beyond a week.',
        meta: { confidence: 68, sources: 2, disease: 'Upper respiratory infection' },
      }
    }
    return {
      role: 'bot',
      text: "Interesting. To get a full analysis with cited sources, recommended tests, and specialists, create a free account and I'll walk through your symptoms in detail.",
      ctaSignup: true,
    }
  }

  // Streams the text of the message at the given index character-by-character
  const streamMessage = (targetIdx: number, fullText: string, meta?: ChatMessage['meta'], ctaSignup?: boolean) => {
    setStreamingIdx(targetIdx)
    let i = 0
    const chunkSize = 2 // chars per tick, feels smooth without being slow
    const tick = () => {
      i += chunkSize
      if (i >= fullText.length) {
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === targetIdx ? { ...m, text: fullText, streaming: false, meta, ctaSignup } : m
          )
        )
        setStreamingIdx(null)
        return
      }
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === targetIdx ? { ...m, text: fullText.slice(0, i), streaming: true } : m
        )
      )
      const delay = 18 + Math.random() * 10 // slight jitter for natural feel
      setTimeout(tick, delay)
    }
    tick()
  }

  const send = (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || typing || streamingIdx !== null) return
    setMessages((m) => [...m, { role: 'user', text: msg }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = getResponse(msg)
      setTyping(false)
      // Add empty bot message and stream into it
      setMessages((prev) => {
        const newIdx = prev.length
        // Schedule streaming after render
        setTimeout(() => {
          streamMessage(newIdx, response.text, response.meta, response.ctaSignup)
        }, 50)
        return [...prev, { ...response, text: '', streaming: true }]
      })
    }, 900 + Math.random() * 400)
  }

  const quickReplies = [
    "I've been feeling really tired lately",
    'I have a persistent headache',
    "I'm always thirsty and peeing a lot",
  ]

  return (
    <div
      className="relative w-full h-[520px] rounded-3xl flex flex-col overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        boxShadow:
          '0 25px 70px rgba(13, 148, 136, 0.12), 0 4px 16px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: '#F5F4F0' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{
            backgroundColor: '#0D9488',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.28)',
          }}
        >
          <PlusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p
            className="font-semibold text-slate-900 text-sm"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Health Chat
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#10B981' }}
            />
            <p className="text-xs text-slate-500">AI online, try it live</p>
          </div>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{
            color: '#0F766E',
            backgroundColor: '#F0FDFA',
            border: '1px solid #99F6E4',
          }}
        >
          Demo
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => {
          if (m.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div
                  className="max-w-[85%] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed text-white"
                  style={{
                    backgroundColor: '#0D9488',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.22)',
                  }}
                >
                  {m.text}
                </div>
              </div>
            )
          }
          return (
            <div key={i} className="flex justify-start">
              <div className="max-w-[90%]">
                <div
                  className="rounded-2xl rounded-tl-md px-4 py-2.5 text-sm leading-relaxed text-slate-800"
                  style={{ backgroundColor: '#F5F4F0' }}
                >
                  {m.text}
                  {m.streaming && (
                    <span
                      className="inline-block w-[2px] h-[1em] align-middle ml-0.5"
                      style={{
                        backgroundColor: '#0D9488',
                        animation: 'cursorBlink 1s step-start infinite',
                      }}
                    />
                  )}
                </div>
                {m.meta && !m.streaming && (
                  <div className="mt-2 flex flex-wrap gap-1.5 animate-fade-up">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        color: '#0F766E',
                        backgroundColor: '#F0FDFA',
                        border: '1px solid #99F6E4',
                      }}
                    >
                      {m.meta.sources} sources cited
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        color: '#047857',
                        backgroundColor: '#D1FAE5',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      {m.meta.confidence}% confidence
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        color: '#334155',
                        backgroundColor: '#FAFAF9',
                        border: '1px solid #E7E5E4',
                      }}
                    >
                      {m.meta.disease}
                    </span>
                  </div>
                )}
                {m.ctaSignup && !m.streaming && (
                  <button
                    onClick={() => navigate('/register')}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: '#0D9488' }}
                  >
                    Create a free account
                    <ArrowIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ backgroundColor: '#F5F4F0' }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {messages.length === 1 && !typing && streamingIdx === null && (
        <div
          className="px-5 py-2 flex flex-wrap gap-1.5 border-t"
          style={{ borderColor: '#F5F4F0', backgroundColor: '#FAFAF9' }}
        >
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                border: '1px solid #E7E5E4',
                backgroundColor: '#FFFFFF',
                color: '#334155',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#14B8A6'
                e.currentTarget.style.backgroundColor = '#F0FDFA'
                e.currentTarget.style.color = '#0F766E'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E7E5E4'
                e.currentTarget.style.backgroundColor = '#FFFFFF'
                e.currentTarget.style.color = '#334155'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 border-t flex items-center gap-2"
        style={{ borderColor: '#F5F4F0', backgroundColor: '#FFFFFF' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          placeholder="Describe how you feel..."
          disabled={typing || streamingIdx !== null}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all disabled:opacity-60"
          style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF'
            e.currentTarget.style.borderColor = '#0D9488'
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.12)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = '#FAFAF9'
            e.currentTarget.style.borderColor = '#E7E5E4'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || typing || streamingIdx !== null}
          aria-label="Send"
          className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#0D9488',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.28)',
          }}
          onMouseEnter={(e) =>
            !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#0F766E')
          }
          onMouseLeave={(e) =>
            !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#0D9488')
          }
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ========== Main ==========
export default function LandingPage() {
  const navigate = useNavigate()

  const primaryBtn = {
    backgroundColor: '#0D9488',
    color: '#FFFFFF',
    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.28)',
  }

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF9' }}
    >
      <style>{`
        @keyframes cursorBlink { 50% { opacity: 0; } }
      `}</style>

      {/* ========== Navbar ========== */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(250, 250, 249, 0.85)',
          borderBottom: '1px solid #E7E5E4',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{
                backgroundColor: '#0D9488',
                boxShadow: '0 4px 10px rgba(13, 148, 136, 0.28)',
              }}
            >
              <PlusIcon className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p
                className="font-semibold text-slate-900 text-[15px]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                SmartHealth
              </p>
              <p className="text-[11px] text-slate-500 -mt-0.5">AI Health Assistant</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
              How it works
            </a>
            <a href="#trust" className="hover:text-teal-700 transition-colors">
              Why trust us
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ fontFamily: "'Sora', sans-serif", ...primaryBtn }}
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(204, 251, 241, 0.35) 0%, rgba(250, 250, 249, 0) 50%, rgba(240, 253, 250, 0.3) 100%)',
          }}
        />
        <div
          className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(20, 184, 166, 0.15)' }}
        />
        <div
          className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(204, 251, 241, 0.55)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}
            >
              <SparkleIcon className="w-3.5 h-3.5" />
              AI-powered health analysis
            </div>

            {/* Typing headline */}
            <div className="min-h-[88px] md:min-h-[120px] flex items-center justify-center">
              <TypingHeadline />
            </div>

            <p className="mt-3 text-slate-600 max-w-xl mx-auto">
              Try it below. Describe a symptom and see what the AI suggests, grounded in trusted
              medical references.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <AnimatedVisual />
            <DemoChat />
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all hover:opacity-90 hover:translate-y-[-1px]"
              style={{ fontFamily: "'Sora', sans-serif", ...primaryBtn }}
            >
              Get started free
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all"
              style={{
                fontFamily: "'Sora', sans-serif",
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E7E5E4',
              }}
            >
              Sign in
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500 text-center">
            For informational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </section>

      {/* ========== Features ========== */}
      <section id="features" className="py-20 md:py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0D9488' }}
            >
              Features
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              Everything you need for a quick health check
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Three focused tools that work together to give you a clearer picture of your health.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <PulseIcon className="w-6 h-6" />,
                title: 'Symptom Analysis',
                desc: 'Describe how you feel in your own words. Our AI cross-references the Gale Encyclopedia of Medicine to identify possible conditions.',
              },
              {
                icon: <FlaskIcon className="w-6 h-6" />,
                title: 'Lab Report Insights',
                desc: 'Upload a PDF or image of your bloodwork. Get plain-English explanations of every value and what they might mean.',
              },
              {
                icon: <ChartIcon className="w-6 h-6" />,
                title: 'Health Tracking',
                desc: 'Track metrics like blood pressure, glucose, and weight over time. Spot trends before they become problems.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl p-6 transition-all"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#99F6E4'
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(13, 148, 136, 0.10)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E7E5E4'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}
                >
                  {f.icon}
                </div>
                <h3
                  className="mt-5 text-lg font-semibold"
                  style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
                >
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== How it works ========== */}
      <section
        id="how-it-works"
        className="py-20 md:py-24"
        style={{
          background:
            'linear-gradient(180deg, rgba(240, 253, 250, 0.6) 0%, rgba(250, 250, 249, 1) 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0D9488' }}
            >
              How it works
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              Get insights in three simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Tell us how you feel', desc: 'Describe your symptoms in plain language, or upload a lab report PDF.' },
              { num: '02', title: 'AI analyzes your input', desc: 'We combine a medical knowledge base with validated clinical models to generate predictions.' },
              { num: '03', title: 'Review and act', desc: 'Get a clear summary with cited sources, recommended tests, and when to see a doctor.' },
            ].map((s) => (
              <div
                key={s.num}
                className="rounded-2xl p-7"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4' }}
              >
                <p
                  className="text-5xl font-bold leading-none"
                  style={{ fontFamily: "'Sora', sans-serif", color: '#CCFBF1' }}
                >
                  {s.num}
                </p>
                <h3
                  className="mt-3 text-lg font-semibold"
                  style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
                >
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Trust ========== */}
      <section id="trust" className="py-20 md:py-24" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="rounded-3xl p-10 md:p-14 text-white"
            style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 50%, #134E4A 100%)',
              boxShadow: '0 24px 60px rgba(13, 148, 136, 0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldIcon className="w-5 h-5" style={{ color: '#99F6E4' }} />
              <p
                className="text-sm font-medium uppercase tracking-wider"
                style={{ fontFamily: "'Sora', sans-serif", color: '#CCFBF1' }}
              >
                Built on trust
              </p>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Every prediction is grounded in real medical references.
            </h2>
            <p className="mt-4 leading-relaxed max-w-2xl" style={{ color: '#CCFBF1' }}>
              We don't invent diagnoses. Every analysis cites the Gale Encyclopedia of Medicine and
              is cross-validated by machine-learning models trained on established clinical datasets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all hover:opacity-90"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  backgroundColor: '#FFFFFF',
                  color: '#0F766E',
                }}
              >
                Start your first check-up
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E7E5E4' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: '#0D9488' }}
            >
              <PlusIcon className="w-4 h-4" />
            </div>
            <p
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              SmartHealth
            </p>
            <span className="text-xs text-slate-400">FYP 2026</span>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-right max-w-md">
            SmartHealth provides preliminary AI-assisted analysis for informational purposes only.
            Always consult a licensed healthcare professional for medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
