import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, type DashboardSummary } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { format } from 'date-fns'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from 'recharts'

// ========== Helpers ==========
const METHOD_LABELS: Record<string, string> = {
  rag_only: 'AI Medical Lookup',
  rag_ml_combined: 'AI + Clinical Models',
  ml_only: 'Clinical Models',
  rag_ml: 'AI + Clinical Models',
}
function formatMethod(m?: string) {
  if (!m) return 'AI Assessment'
  return METHOD_LABELS[m] ?? m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type Tone = 'emerald' | 'amber' | 'rose'

function scoreState(score: number): {
  tone: Tone
  label: string
  message: string
  critical: boolean
} {
  if (score >= 70) {
    return {
      tone: 'emerald',
      label: 'Looking good',
      message: 'Your health indicators look stable. Keep up the good habits.',
      critical: false,
    }
  }
  if (score >= 40) {
    return {
      tone: 'amber',
      label: 'Needs attention',
      message: 'Some indicators are outside the typical range. Consider a check-up.',
      critical: false,
    }
  }
  return {
    tone: 'rose',
    label: 'Please seek medical attention',
    message:
      'Several indicators are significantly outside the typical range. We strongly recommend consulting a licensed healthcare professional soon.',
    critical: true,
  }
}

// ========== Icons ==========
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
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

// ========== Small components ==========
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center cursor-help"
        style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}
      >
        <InfoIcon className="w-3 h-3" />
      </span>
      <span
        role="tooltip"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-64 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white text-xs p-3 rounded-lg shadow-xl"
        style={{ backgroundColor: '#0F172A' }}
      >
        {text}
      </span>
    </span>
  )
}

function RiskBadge({ level }: { level: string }) {
  const safe = ['high', 'medium', 'low'].includes(level) ? level : 'low'
  return <span className={`badge-${safe}`}>{safe}</span>
}

function StatusBadge({ status }: { status: string }) {
  const safe = ['normal', 'abnormal', 'borderline', 'critical'].includes(status) ? status : 'normal'
  return <span className={`badge-${safe}`}>{safe}</span>
}

function HealthScoreRing({ score, tone }: { score: number; tone: Tone }) {
  // Semantic colors (keep these for medical meaning)
  const color = tone === 'emerald' ? '#059669' : tone === 'amber' ? '#D97706' : '#E11D48'
  const s = Math.max(0, Math.min(100, score))
  const data = [
    { value: s, fill: color },
    { value: 100 - s, fill: '#E7E5E4' },
  ]
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%" innerRadius="68%" outerRadius="100%"
          startAngle={90} endAngle={-270} data={data} barSize={8}
        >
          <RadialBar dataKey="value" cornerRadius={4} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl" style={{ color: '#0F172A' }}>{Math.round(s)}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  )
}

function CriticalHealthCard({ score, onAction }: { score: number; onAction: () => void }) {
  const state = scoreState(score)
  return (
    <div
      className="rounded-xl p-6 animate-fade-up"
      style={{
        backgroundColor: '#FFF1F2',          // rose-50
        border: '2px solid #FECDD3',          // rose-200
        boxShadow: '0 6px 24px rgba(225, 29, 72, 0.08)',
      }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <HealthScoreRing score={score} tone="rose" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-critical">Critical</span>
            <span className="text-xs text-slate-600">Health Score</span>
            <InfoTooltip text="Your health score is derived from recent symptom checks and lab results. Lower scores indicate more indicators outside the typical range. It is a summary signal, not a diagnosis." />
          </div>
          <h2 className="font-display font-semibold text-lg" style={{ color: '#0F172A' }}>{state.label}</h2>
          <p className="text-sm mt-1 leading-relaxed max-w-2xl" style={{ color: '#334155' }}>{state.message}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={onAction} className="btn-primary">Start a check-up</button>
            <a
              href="https://www.who.int/emergencies/find-a-helpline"
              target="_blank" rel="noreferrer"
              className="btn-ghost inline-flex items-center"
            >
              Find a helpline
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function StandardHealthCard({ score }: { score: number }) {
  const state = scoreState(score)
  return (
    <div className="card p-5 flex items-center gap-5 card-hover">
      <HealthScoreRing score={score} tone={state.tone} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 font-display uppercase tracking-wider">Health Score</p>
          <InfoTooltip text="Calculated from your recent symptom checks and lab report values. It is a summary signal, not a diagnosis." />
        </div>
        <p className="font-display font-medium text-sm mt-2" style={{ color: '#0F172A' }}>{state.label}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{state.message}</p>
      </div>
    </div>
  )
}

// ========== Metrics trend ==========
interface MetricPoint { date: string; value: number; metric?: string; unit?: string }

function normalizeMetrics(raw: any): MetricPoint[] {
  if (!raw) return []
  const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw.metrics) ? raw.metrics : Array.isArray(raw.data) ? raw.data : []
  return arr
    .map((m) => ({
      date: m.recorded_at ?? m.date ?? m.created_at ?? '',
      value: typeof m.value === 'number' ? m.value : Number(m.value) || 0,
      metric: m.metric_type ?? m.metric ?? m.type,
      unit: m.unit,
    }))
    .filter((m) => !!m.date)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

function MetricsTrend() {
  const [points, setPoints] = useState<MetricPoint[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.metrics(undefined, 30)
      .then((r) => setPoints(normalizeMetrics(r.data)))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card p-5 h-64 animate-pulse" style={{ backgroundColor: '#F5F4F0' }} />

  if (!points || points.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display font-medium text-sm" style={{ color: '#0F172A' }}>Track your health over time</p>
        <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto leading-relaxed">
          Log metrics like blood pressure, weight, or glucose from your Profile to see trends here.
        </p>
      </div>
    )
  }

  const byType: Record<string, MetricPoint[]> = {}
  points.forEach((p) => {
    const k = p.metric ?? 'metric'
    byType[k] = byType[k] ?? []
    byType[k].push(p)
  })
  const primaryKey = Object.keys(byType).sort((a, b) => byType[b].length - byType[a].length)[0]
  const primary = byType[primaryKey].slice(-14)
  const chartData = primary.map((p) => ({ date: format(new Date(p.date), 'MMM d'), value: p.value }))
  const label = primaryKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const unit = primary[0]?.unit ?? ''

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-medium text-sm" style={{ color: '#0F172A' }}>
            {label} trend {unit && <span className="text-slate-400 text-xs font-normal">({unit})</span>}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Last {primary.length} readings</p>
        </div>
        <span className="text-xs font-medium" style={{ color: '#0F766E' }}>{Object.keys(byType).length} metric(s)</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
            <YAxis stroke="#94A3B8" fontSize={11} />
            <RTooltip
              contentStyle={{
                background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: 8,
                fontSize: 12, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
              labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            />
            <Line type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={2}
              dot={{ fill: '#0D9488', r: 3 }} activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ========== Main ==========
export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    dashboardApi.summary()
      .then((r) => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const score = summary?.health_score ?? 80
  const state = scoreState(score)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-up">
      <style>{`
        @keyframes staggerUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .sh-stagger { animation: staggerUp 0.5s ease forwards; opacity: 0; }
      `}</style>

      {/* Disclaimer banner — soft teal (informational, not alarming) */}
      {!bannerDismissed && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-lg text-xs sh-stagger"
          style={{
            animationDelay: '0.05s',
            backgroundColor: '#F0FDFA',           // teal-50
            border: '1px solid #99F6E4',          // teal-200
          }}
        >
          <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#0D9488' }} />
          <p className="flex-1 leading-relaxed" style={{ color: '#334155' }}>
            <span className="font-semibold" style={{ color: '#0F766E' }}>Not a medical diagnosis.</span>{' '}
            Smart Health Assistant provides preliminary AI-assisted analysis for informational purposes only.
            Always consult a licensed healthcare professional for medical advice.
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-slate-400 hover:text-slate-700 transition-colors ml-2 w-5 h-5 flex items-center justify-center rounded"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between sh-stagger" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: '#0F172A' }}>
            {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your health overview</p>
        </div>
        <button onClick={() => navigate('/chat')} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Check-up
        </button>
      </div>

      {loading ? (
        <>
          <div className="card p-6 h-32 animate-pulse" style={{ backgroundColor: '#F5F4F0' }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card p-5 h-28 animate-pulse" style={{ backgroundColor: '#F5F4F0' }} />
            ))}
          </div>
        </>
      ) : summary ? (
        <>
          {state.critical ? (
            <>
              <div className="sh-stagger" style={{ animationDelay: '0.15s' }}>
                <CriticalHealthCard score={score} onAction={() => navigate('/chat')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sh-stagger" style={{ animationDelay: '0.2s' }}>
                <div className="card p-5 flex flex-col justify-between card-hover">
                  <p className="text-xs text-slate-500 font-display uppercase tracking-wider">Symptom Checks</p>
                  <p className="font-display font-bold text-4xl" style={{ color: '#0D9488' }}>
                    {summary.statistics.total_symptom_checks}
                  </p>
                  <p className="text-xs text-slate-500">
                    {summary.statistics.last_check_date
                      ? `Last: ${format(new Date(summary.statistics.last_check_date), 'MMM d')}`
                      : 'No checks yet'}
                  </p>
                </div>
                <div className="card p-5 flex flex-col justify-between card-hover">
                  <p className="text-xs text-slate-500 font-display uppercase tracking-wider">Lab Reports</p>
                  <p className="font-display font-bold text-4xl" style={{ color: '#0D9488' }}>
                    {summary.statistics.total_lab_reports}
                  </p>
                  <button onClick={() => navigate('/lab-reports')}
                    className="text-xs text-left transition-colors font-medium hover:opacity-80"
                    style={{ color: '#0D9488' }}>
                    Upload new report
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sh-stagger" style={{ animationDelay: '0.15s' }}>
              <StandardHealthCard score={score} />
              <div className="card p-5 flex flex-col justify-between card-hover">
                <p className="text-xs text-slate-500 font-display uppercase tracking-wider">Symptom Checks</p>
                <p className="font-display font-bold text-4xl" style={{ color: '#0D9488' }}>
                  {summary.statistics.total_symptom_checks}
                </p>
                <p className="text-xs text-slate-500">
                  {summary.statistics.last_check_date
                    ? `Last: ${format(new Date(summary.statistics.last_check_date), 'MMM d')}`
                    : 'No checks yet'}
                </p>
              </div>
              <div className="card p-5 flex flex-col justify-between card-hover">
                <p className="text-xs text-slate-500 font-display uppercase tracking-wider">Lab Reports</p>
                <p className="font-display font-bold text-4xl" style={{ color: '#0D9488' }}>
                  {summary.statistics.total_lab_reports}
                </p>
                <button onClick={() => navigate('/lab-reports')}
                  className="text-xs text-left transition-colors font-medium hover:opacity-80"
                  style={{ color: '#0D9488' }}>
                  Upload new report
                </button>
              </div>
            </div>
          )}

          <div className="sh-stagger" style={{ animationDelay: '0.25s' }}>
            <MetricsTrend />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sh-stagger" style={{ animationDelay: '0.3s' }}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-medium text-sm" style={{ color: '#0F172A' }}>Recent Predictions</h2>
                <button onClick={() => navigate('/history')}
                  className="text-xs transition-colors font-medium hover:opacity-80"
                  style={{ color: '#0D9488' }}>View all</button>
              </div>
              {summary.recent_predictions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No predictions yet</p>
                  <button onClick={() => navigate('/chat')}
                    className="text-sm mt-2 block mx-auto font-medium hover:opacity-80"
                    style={{ color: '#0D9488' }}>
                    Start a health chat
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recent_predictions.map((p: any) => {
                    const sourceCount = Array.isArray(p.source_chunks) ? p.source_chunks.length : Array.isArray(p.sources) ? p.sources.length : 0
                    return (
                      <div key={p.id}
                        className="flex items-center justify-between py-2.5 border-b last:border-0"
                        style={{ borderColor: '#F5F4F0' }}>
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-sm font-medium truncate" style={{ color: '#0F172A' }}>{p.disease}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                            <span>{format(new Date(p.created_at), 'MMM d, yyyy')}</span>
                            <span style={{ color: '#CBD5E1' }}>·</span>
                            <span>{formatMethod(p.prediction_method)}</span>
                            {sourceCount > 0 && (
                              <>
                                <span style={{ color: '#CBD5E1' }}>·</span>
                                <span style={{ color: '#0D9488' }}>{sourceCount} source{sourceCount > 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <RiskBadge level={p.risk_level || 'low'} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-medium text-sm" style={{ color: '#0F172A' }}>Recent Lab Reports</h2>
                <button onClick={() => navigate('/lab-reports')}
                  className="text-xs transition-colors font-medium hover:opacity-80"
                  style={{ color: '#0D9488' }}>Upload new</button>
              </div>
              {summary.recent_lab_reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No lab reports yet</p>
                  <button onClick={() => navigate('/lab-reports')}
                    className="text-sm mt-2 block mx-auto font-medium hover:opacity-80"
                    style={{ color: '#0D9488' }}>
                    Upload a report
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recent_lab_reports.map((r: any) => (
                    <div key={r.id}
                      className="flex items-center justify-between py-2.5 border-b last:border-0"
                      style={{ borderColor: '#F5F4F0' }}>
                      <div>
                        <p className="text-sm font-medium capitalize" style={{ color: '#0F172A' }}>
                          {r.report_type?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <StatusBadge status={r.overall_status || 'normal'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sh-stagger" style={{ animationDelay: '0.35s' }}>
            {[
              { label: 'Chat with AI', path: '/chat', desc: 'Describe symptoms' },
              { label: 'Upload Lab Report', path: '/lab-reports', desc: 'PDF or image' },
              { label: 'View History', path: '/history', desc: 'Past results' },
              { label: 'Update Profile', path: '/profile', desc: 'Health info' },
            ].map(({ label, path, desc }) => (
              <button key={path} onClick={() => navigate(path)} className="card-hover p-4 text-left group transition-all">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}
                >
                  <PlusIcon className="w-5 h-5" />
                </div>
                <p className="font-display font-medium text-sm mt-3" style={{ color: '#0F172A' }}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-slate-500">Failed to load dashboard. Please refresh.</p>
        </div>
      )}
    </div>
  )
}
