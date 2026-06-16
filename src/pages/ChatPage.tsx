import { useState, useRef, useEffect } from 'react'
import { chatApi, type PredictionResponse, type ChatSession } from '@/lib/api'
import { format, formatDistanceToNow } from 'date-fns'

// ========== Types ==========
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  prediction?: PredictionResponse
  emergency?: boolean
}

// ========== Icons ==========
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
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
function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
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
function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
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
function PanelLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}
function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  )
}

// ========== Helpers ==========
// Generate a short title from the first user message in a session
function sessionTitle(session: ChatSession): string {
  // Try to use extracted symptoms first — most informative
  if (session.extracted_symptoms && session.extracted_symptoms.length > 0) {
    return session.extracted_symptoms.slice(0, 3).join(', ')
  }
  return 'New chat'
}

// Relative time like "5m ago", "2h ago", "yesterday"
function relativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return format(d, 'MMM d')
  } catch {
    return ''
  }
}

// Group sessions into Today / Yesterday / Previous 7 days / Older
function groupSessions(sessions: ChatSession[]) {
  const now = new Date()
  const today: ChatSession[] = []
  const yesterday: ChatSession[] = []
  const week: ChatSession[] = []
  const older: ChatSession[] = []

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const yDate = new Date(now)
  yDate.setDate(yDate.getDate() - 1)

  for (const s of sessions) {
    const d = new Date(s.updated_at)
    if (sameDay(d, now)) today.push(s)
    else if (sameDay(d, yDate)) yesterday.push(s)
    else if (now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000) week.push(s)
    else older.push(s)
  }

  return { today, yesterday, week, older }
}

// ========== Chat History Sidebar ==========
function ChatHistorySidebar({
  collapsed,
  onToggle,
  sessions,
  currentSessionId,
  loading,
  onSelect,
  onNewChat,
  onRefresh,
}: {
  collapsed: boolean
  onToggle: () => void
  sessions: ChatSession[]
  currentSessionId: string | undefined
  loading: boolean
  onSelect: (id: string) => void
  onNewChat: () => void
  onRefresh: () => void
}) {
  const groups = groupSessions(sessions)

  const renderGroup = (label: string, items: ChatSession[]) => {
    if (items.length === 0) return null
    return (
      <div className="mb-4">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-1.5"
          style={{ fontFamily: "'Sora', sans-serif", color: '#94A3B8' }}
        >
          {label}
        </p>
        <div className="space-y-0.5">
          {items.map((s) => {
            const isActive = s.id === currentSessionId
            const title = sessionTitle(s)
            const isComplete = s.session_status === 'complete'
            const isAbandoned = s.session_status === 'abandoned'

            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="w-full text-left px-3 py-2 rounded-lg transition-all group"
                style={{
                  backgroundColor: isActive ? '#F0FDFA' : 'transparent',
                  border: isActive ? '1px solid #99F6E4' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F5F4F0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  {/* Status dot */}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{
                      backgroundColor: isComplete
                        ? '#0D9488'
                        : isAbandoned
                        ? '#CBD5E1'
                        : '#F59E0B',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate capitalize"
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        color: isActive ? '#0F766E' : '#0F172A',
                      }}
                      title={title}
                    >
                      {title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                        {relativeTime(s.updated_at)}
                      </span>
                      {isComplete && (
                        <span className="text-[9px] px-1.5 py-0 rounded-full font-semibold" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                          done
                        </span>
                      )}
                      {s.session_status === 'analyzing' && (
                        <span className="text-[9px] px-1.5 py-0 rounded-full font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                          analyzing
                        </span>
                      )}
                      {s.prediction_id && (
                        <FlaskIcon className="w-2.5 h-2.5" style={{ color: '#0D9488' } as any} />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Collapsed: just a thin strip with toggle icon
  if (collapsed) {
    return (
      <div
        className="flex-shrink-0 flex flex-col items-center py-3"
        style={{
          width: '48px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E7E5E4',
        }}
      >
        <button
          onClick={onToggle}
          aria-label="Expand chat history"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: '#64748B' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0FDFA'
            e.currentTarget.style.color = '#0D9488'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#64748B'
          }}
        >
          <PanelLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          aria-label="New chat"
          className="w-9 h-9 mt-2 rounded-lg flex items-center justify-center text-white transition-all"
          style={{ backgroundColor: '#0D9488', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.28)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F766E')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D9488')}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Expanded sidebar
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onMobileClose} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:z-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E7E5E4',
        }}
      >
      {/* Header */}
      <div
        className="px-3 py-3 flex items-center justify-between gap-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #F5F4F0' }}
      >
        <button
          onClick={onNewChat}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all"
          style={{
            fontFamily: "'Sora', sans-serif",
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)',
            boxShadow: '0 6px 18px rgba(13, 148, 136, 0.30)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(13, 148, 136, 0.42)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(13, 148, 136, 0.30)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
        <button
          onClick={onToggle}
          aria-label="Collapse"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          style={{ color: '#64748B' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F5F4F0'
            e.currentTarget.style.color = '#0F172A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#64748B'
          }}
        >
          <PanelLeftIcon className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {loading ? (
          <div className="space-y-1.5 px-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg animate-pulse"
                style={{ backgroundColor: '#F5F4F0' }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}
            >
              <ChatIcon className="w-5 h-5" />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              No chats yet.
              <br />
              Start a new conversation.
            </p>
          </div>
        ) : (
          <>
            {renderGroup('Today', groups.today)}
            {renderGroup('Yesterday', groups.yesterday)}
            {renderGroup('Previous 7 days', groups.week)}
            {renderGroup('Older', groups.older)}
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2.5 text-[10px] flex-shrink-0"
        style={{ borderTop: '1px solid #F5F4F0', color: '#94A3B8' }}
      >
        <button
          onClick={onRefresh}
          className="w-full text-left transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0D9488')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
        >
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} · click to refresh
        </button>
      </div>
    </div>
    </>
  )
}

// ========== Typing indicator ==========
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{ backgroundColor: '#0D9488', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.22)' }}
      >
        <PlusIcon className="w-4 h-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ backgroundColor: '#F5F4F0' }}>
        <style>{`
          @keyframes chatDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
        `}</style>
        <div className="flex gap-1 items-center h-4">
          {[0, 0.15, 0.3].map((d, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#0D9488', animation: `chatDot 1.2s ease-in-out infinite ${d}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== Prediction card ==========
function PredictionCard({ prediction }: { prediction: PredictionResponse }) {
  const methodLabel =
    prediction.prediction_method === 'rag_ml_combined'
      ? 'AI + Clinical Models'
      : prediction.prediction_method === 'rag_only'
      ? 'AI Medical Lookup'
      : prediction.prediction_method === 'ml_only'
      ? 'Clinical Models'
      : (prediction.prediction_method || 'AI Assessment').replace(/_/g, ' ')

  return (
    <div
      className="mt-3 rounded-xl p-4 space-y-3 animate-fade-up"
      style={{ backgroundColor: '#F0FDFA', border: '1px solid #99F6E4' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md text-white flex items-center justify-center"
          style={{ backgroundColor: '#0D9488' }}
        >
          <FlaskIcon className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: '#0F766E' }}>
          Analysis Complete
        </span>
        <span
          className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #99F6E4', color: '#0F766E' }}
        >
          {methodLabel}
        </span>
      </div>

      {prediction.emergency && (
        <div className="rounded-lg px-3 py-2.5 flex items-start gap-2 text-white" style={{ backgroundColor: '#E11D48' }}>
          <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {prediction.emergency_reason || 'Please seek immediate medical attention.'}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {prediction.predictions.map((p, i) => (
          <div key={i} className="rounded-lg p-3" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4' }}>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span className="font-semibold text-sm truncate" style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}>
                {p.disease}
              </span>
              <span className={`badge-${p.confidence} flex-shrink-0`}>
                {p.confidence} · {Math.round(p.confidence_score * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full mb-2.5 overflow-hidden" style={{ backgroundColor: '#F5F4F0' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${p.confidence_score * 100}%`, backgroundColor: '#0D9488' }}
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{p.explanation}</p>
            {p.matching_symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.matching_symptoms.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#334155' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {prediction.recommended_tests.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "'Sora', sans-serif", color: '#334155' }}>
            Recommended Tests
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prediction.recommended_tests.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #99F6E4', color: '#0F766E' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] italic pt-2 leading-relaxed" style={{ color: '#64748B', borderTop: '1px solid #99F6E4' }}>
        {prediction.disclaimer}
      </p>
    </div>
  )
}

// ========== Message bubble ==========
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className={`flex items-end gap-2 animate-fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: '#0D9488', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.22)' }}
        >
          <PlusIcon className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'items-end flex flex-col' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'rounded-tr-md font-medium' : 'rounded-tl-md'}`}
          style={
            isUser
              ? { backgroundColor: '#0D9488', color: '#FFFFFF', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.22)' }
              : { backgroundColor: '#F5F4F0', color: '#334155' }
          }
        >
          {formatContent(msg.content)}
        </div>

        {msg.prediction && <PredictionCard prediction={msg.prediction} />}

        <span className="text-[11px] mt-1 px-1" style={{ color: '#94A3B8' }}>
          {format(msg.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  )
}

// ========== Starters ==========
const STARTERS = [
  "I've been feeling really tired lately",
  'I keep getting headaches and feel dizzy',
  "I'm always thirsty and need to pee frequently",
  "I've been short of breath and my skin looks pale",
]

// ========== Main ==========
export default function ChatPage() {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  // Current chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hello! I'm your Smart Health Assistant. Tell me how you've been feeling, describe your symptoms in your own words and I'll help analyze what might be going on.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [sessionStatus, setSessionStatus] = useState('collecting')
  const [extractedSymptoms, setExtractedSymptoms] = useState<string[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ---------- Fetch sessions list ----------
  const fetchSessions = async () => {
    setSessionsLoading(true)
    try {
      const { data } = await chatApi.sessions(30)
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setSessionsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  // ---------- Auto-scroll ----------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ---------- Load a specific session ----------
  const loadSession = async (id: string) => {
    if (id === sessionId) return // already loaded
    setLoadingHistory(true)
    try {
      const { data } = await chatApi.session(id)
      const loaded: Message[] = (data.messages || []).map((m: any, idx: number) => ({
        id: `${id}-${idx}`,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      }))
      // If session has zero messages, still show the greeting
      if (loaded.length === 0) {
        loaded.push({
          id: '0',
          role: 'assistant',
          content: "Hello! Tell me how you've been feeling.",
          timestamp: new Date(),
        })
      }
      setMessages(loaded)
      setSessionId(id)
      setSessionStatus(data.session_status || 'collecting')
      setExtractedSymptoms(data.extracted_symptoms || [])
    } catch (err) {
      console.error('Failed to load session:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // ---------- Start a new chat ----------
  const startNewSession = () => {
    setSessionId(undefined)
    setSessionStatus('collecting')
    setExtractedSymptoms([])
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Starting fresh! Tell me what's been bothering you.",
        timestamp: new Date(),
      },
    ])
  }

  // ---------- Send message ----------
  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages((p) => [...p, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await chatApi.message(content, sessionId)
      const wasNewSession = !sessionId
      setSessionId(data.session_id)
      setSessionStatus(data.session_status)
      setExtractedSymptoms(data.extracted_symptoms)

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        prediction: data.prediction ?? undefined,
        emergency: data.emergency,
      }
      setMessages((p) => [...p, assistantMsg])

      // Refresh sidebar: new session created OR status changed
      if (wasNewSession || data.session_status === 'complete') {
        fetchSessions()
      } else {
        // Light refresh to update last-updated timestamp
        fetchSessions()
      }
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      className="flex h-full"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FFFFFF' }}
    >
      {/* ========== Chat history sidebar ========== */}
      <ChatHistorySidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        sessions={sessions}
        currentSessionId={sessionId}
        loading={sessionsLoading}
        onSelect={loadSession}
        onNewChat={startNewSession}
        onRefresh={fetchSessions}
      />

      {/* ========== Main chat area ========== */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {loadingHistory && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(250, 250, 249, 0.85)' }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', boxShadow: '0 6px 18px rgba(13, 148, 136, 0.12)' }}>
              <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFBF1', borderTopColor: '#0D9488' }} />
              <span className="text-sm font-medium" style={{ color: '#334155' }}>Loading chat...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E5E4' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: '#0D9488', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.22)' }}
            >
              <ChatIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}>
                Health Chat
              </p>
              <div className="flex items-center gap-1.5">
                {sessionStatus === 'complete' ? (
                  <>
                    <CheckIcon className="w-3 h-3" style={{ color: '#0D9488' } as any} />
                    <p className="text-xs font-medium" style={{ color: '#0D9488' }}>Analysis complete</p>
                  </>
                ) : sessionStatus === 'analyzing' ? (
                  <>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0D9488', animation: 'chatDot 1.2s ease-in-out infinite' }} />
                    <p className="text-xs font-medium" style={{ color: '#334155' }}>Analyzing...</p>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#14B8A6' }} />
                    <p className="text-xs text-slate-500">Describe your symptoms naturally</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {extractedSymptoms.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-xs">
                <span className="text-xs text-slate-500">Noted:</span>
                {extractedSymptoms.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#F0FDFA', color: '#0F766E', border: '1px solid #99F6E4' }}
                  >
                    {s}
                  </span>
                ))}
                {extractedSymptoms.length > 4 && (
                  <span className="text-xs text-slate-500">+{extractedSymptoms.length - 4}</span>
                )}
              </div>
            )}
            {sessionStatus === 'complete' && (
              <button onClick={startNewSession} className="btn-ghost text-xs" style={{ fontFamily: "'Sora', sans-serif" }}>
                New Chat
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
          {messages.length === 1 && !sessionId && (
            <div className="flex flex-col items-center pt-6 pb-2 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-4 text-xs text-slate-500">
                <SparkleIcon className="w-3.5 h-3.5" style={{ color: '#14B8A6' } as any} />
                <span>Try one of these to get started</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {STARTERS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3.5 py-2 rounded-full transition-all"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      color: '#334155',
                      animation: `fadeUp 0.4s ease forwards ${i * 0.08}s`,
                      opacity: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#5EEAD4'
                      e.currentTarget.style.backgroundColor = '#F0FDFA'
                      e.currentTarget.style.color = '#0F766E'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.10)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E7E5E4'
                      e.currentTarget.style.backgroundColor = '#FFFFFF'
                      e.currentTarget.style.color = '#334155'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4 sm:px-6 py-4"
          style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E7E5E4' }}
        >
          {sessionStatus === 'complete' ? (
            <div className="flex items-center justify-center gap-3 py-2">
              <p className="text-sm" style={{ color: '#475569' }}>Analysis complete.</p>
              <button onClick={startNewSession} className="btn-primary text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                className="flex-1 resize-none leading-relaxed py-3 px-4 max-h-32 overflow-y-auto rounded-xl text-sm transition-all"
                placeholder="Describe how you're feeling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4', color: '#0F172A', outline: 'none' }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF'
                  e.currentTarget.style.borderColor = '#0D9488'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.10)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAFAF9'
                  e.currentTarget.style.borderColor = '#E7E5E4'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ backgroundColor: '#0D9488', boxShadow: '0 4px 10px rgba(13, 148, 136, 0.22)' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#0F766E'
                    e.currentTarget.style.boxShadow = '0 8px 18px rgba(13, 148, 136, 0.32)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#0D9488'
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(13, 148, 136, 0.22)'
                  }
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
          <p className="text-[11px] text-center mt-2" style={{ color: '#94A3B8' }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
