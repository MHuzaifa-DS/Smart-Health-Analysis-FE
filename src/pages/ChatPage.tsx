import { useState, useRef, useEffect } from 'react'
import { chatApi, type ChatMessageResponse, type PredictionResponse } from '@/lib/api'
import clsx from 'clsx'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  prediction?: PredictionResponse
  emergency?: boolean
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs flex-shrink-0">✚</div>
      <div className="bg-ink-800 border border-ink-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-typing"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PredictionCard({ prediction }: { prediction: PredictionResponse }) {
  const [showSources, setShowSources] = useState(false)
  return (
    <div className="mt-3 border border-teal-500/20 bg-teal-500/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-teal-400 text-sm">🔬</span>
        <span className="font-display font-semibold text-teal-400 text-sm">Analysis Complete</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
          prediction.prediction_method === 'rag_ml_combined'
            ? 'text-teal-400 bg-teal-500/10 border-teal-500/20'
            : 'text-ink-400 bg-ink-700 border-ink-600'
        }`}>
          {prediction.prediction_method?.replace(/_/g, ' ')}
        </span>
      </div>

      {prediction.emergency && (
        <div className="bg-rose-500/15 border border-rose-500/25 rounded-lg px-3 py-2.5 flex items-start gap-2">
          <span className="text-rose-400 mt-0.5">🚨</span>
          <p className="text-rose-300 text-sm">{prediction.emergency_reason || 'Please seek immediate medical attention.'}</p>
        </div>
      )}

      <div className="space-y-2.5">
        {prediction.predictions.map((p, i) => (
          <div key={i} className="bg-ink-900 rounded-lg p-3 border border-ink-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-semibold text-ink-50 text-sm">{p.disease}</span>
              <span className={`badge-${p.confidence}`}>{p.confidence} · {Math.round(p.confidence_score * 100)}%</span>
            </div>
            {/* Confidence bar */}
            <div className="h-1 bg-ink-700 rounded-full mb-2.5 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${p.confidence_score * 100}%` }} />
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">{p.explanation}</p>
            {p.matching_symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.matching_symptoms.map(s => (
                  <span key={s} className="text-xs bg-ink-800 text-ink-300 border border-ink-600 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {prediction.recommended_tests.length > 0 && (
        <div>
          <p className="text-xs font-display font-medium text-ink-400 uppercase tracking-wider mb-2">Recommended Tests</p>
          <div className="flex flex-wrap gap-1.5">
            {prediction.recommended_tests.map(t => (
              <span key={t} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-ink-500 italic border-t border-ink-700 pt-2">{prediction.disclaimer}</p>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  // Parse markdown-style bold **text** and line breaks
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-ink-100 font-semibold">{part.slice(2, -2)}</strong>
              : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className={clsx('flex items-end gap-2 animate-fade-up', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs flex-shrink-0">✚</div>
      )}

      <div className={clsx('max-w-[80%]', isUser && 'items-end flex flex-col')}>
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-teal-500 text-ink-950 rounded-br-sm font-medium'
            : 'bg-ink-800 border border-ink-700 text-ink-200 rounded-bl-sm'
        )}>
          {formatContent(msg.content)}
        </div>

        {msg.prediction && <PredictionCard prediction={msg.prediction} />}

        <span className="text-xs text-ink-600 mt-1 px-1">
          {format(msg.timestamp, 'h:mm a')}
        </span>
      </div>
    </div>
  )
}

const STARTERS = [
  "I've been feeling really tired lately",
  "I keep getting headaches and feel dizzy",
  "I'm always thirsty and need to pee frequently",
  "I've been short of breath and my skin looks pale",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your Smart Health Assistant. Tell me how you've been feeling — describe your symptoms in your own words and I'll help analyze what might be going on. 🩺",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [sessionStatus, setSessionStatus] = useState('collecting')
  const [extractedSymptoms, setExtractedSymptoms] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await chatApi.message(content, sessionId)
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
      setMessages(p => [...p, assistantMsg])
    } catch (err: any) {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const startNewSession = () => {
    setSessionId(undefined)
    setSessionStatus('collecting')
    setExtractedSymptoms([])
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Starting fresh! Tell me what's been bothering you.",
      timestamp: new Date(),
    }])
  }

  return (
    <div className="flex flex-col h-full bg-ink-950">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700 bg-ink-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">◈</div>
          <div>
            <p className="font-display font-semibold text-ink-50 text-sm">Health Chat</p>
            <p className="text-xs text-ink-400">
              {sessionStatus === 'complete' ? '✓ Analysis complete' :
               sessionStatus === 'analyzing' ? '⚙ Analyzing…' :
               'Describe your symptoms naturally'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {extractedSymptoms.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-64">
              <span className="text-xs text-ink-500">Noted:</span>
              {extractedSymptoms.slice(0,4).map(s => (
                <span key={s} className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {extractedSymptoms.length > 4 && (
                <span className="text-xs text-ink-500">+{extractedSymptoms.length - 4}</span>
              )}
            </div>
          )}
          {sessionStatus === 'complete' && (
            <button onClick={startNewSession} className="btn-ghost text-xs">New Chat</button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Starter prompts — shown only at beginning */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 justify-center pt-4 animate-fade-in">
            {STARTERS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-ink-800 hover:bg-ink-700 border border-ink-600 hover:border-teal-500/40 text-ink-300 hover:text-teal-400 px-3 py-2 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-ink-700 bg-ink-900">
        {sessionStatus === 'complete' ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <p className="text-sm text-ink-400">Analysis complete.</p>
            <button onClick={startNewSession} className="btn-primary text-sm">Start New Chat</button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              rows={1}
              className="input flex-1 resize-none leading-relaxed py-3 max-h-32 overflow-y-auto"
              placeholder="Describe how you're feeling…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 128) + 'px'
              }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="btn-primary flex-shrink-0 h-11 w-11 p-0 flex items-center justify-center rounded-xl">
              {loading ? (
                <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              ) : (
                <span className="text-base">↑</span>
              )}
            </button>
          </div>
        )}
        <p className="text-xs text-ink-600 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
