import { useState, useEffect, type ReactNode } from 'react'
import {
  predictionsApi, labApi, recommendationsApi,
  type RecommendationResponse,
} from '@/lib/api'
import { format } from 'date-fns'

// ========== Icons ==========
function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
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
function ChevronRight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18l6-6-6-6" />
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
function ArrowUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}
function ArrowDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  )
}
function DotIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="4" />
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
function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

const METHOD_LABELS: Record<string, string> = {
  rag_only: 'AI Medical Lookup',
  rag_ml_combined: 'AI + Clinical Models',
  ml_only: 'Clinical Models',
}
const fmtMethod = (m?: string) => !m ? '' : METHOD_LABELS[m] ?? m.replace(/_/g, ' ')

// Semantic dot — emerald (low/normal), amber (medium/borderline), rose (high/critical/abnormal)
function IntensityDot({ level }: { level: string }) {
  const color =
    level === 'high' || level === 'critical' || level === 'abnormal'
      ? '#E11D48'
      : level === 'medium' || level === 'borderline'
      ? '#D97706'
      : '#059669'
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  )
}

// ========== Prediction modal ==========
function PredictionModal({ predictionId, onClose }: { predictionId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [rec, setRec] = useState<RecommendationResponse | null>(null)
  const [sources, setSources] = useState<any>(null)
  const [tab, setTab] = useState<'analysis' | 'recommendations' | 'sources'>('analysis')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      predictionsApi.get(predictionId),
      recommendationsApi.get(predictionId).catch(() => null),
      predictionsApi.sources(predictionId).catch(() => null),
    ])
      .then(([pred, recRes, srcRes]) => {
        setData(pred.data)
        setRec(recRes?.data || null)
        setSources(srcRes?.data || null)
      })
      .finally(() => setLoading(false))
  }, [predictionId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-up"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7E5E4',
          boxShadow: '0 25px 70px rgba(13, 148, 136, 0.16), 0 4px 16px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #E7E5E4' }}
        >
          <div>
            <h2
              className="font-semibold"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              Prediction Detail
            </h2>
            {data && (
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                {format(new Date(data.created_at), 'MMM d, yyyy h:mm a')} · {fmtMethod(data.prediction_method)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex gap-1 px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #E7E5E4' }}
        >
          {[
            { key: 'analysis', label: 'Analysis' },
            { key: 'recommendations', label: 'Recommendations' },
            { key: 'sources', label: 'Sources' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                fontFamily: "'Sora', sans-serif",
                backgroundColor: tab === key ? '#0D9488' : 'transparent',
                color: tab === key ? '#FFFFFF' : '#475569',
                boxShadow: tab === key ? '0 4px 10px rgba(13, 148, 136, 0.22)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (tab !== key) {
                  e.currentTarget.style.backgroundColor = '#F5F4F0'
                  e.currentTarget.style.color = '#0F172A'
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== key) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#475569'
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: '#F5F4F0' }} />
              ))}
            </div>
          ) : tab === 'analysis' && data ? (
            <div className="space-y-3">
              {data.symptom_checks && (
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
                  >
                    Reported Symptoms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.symptom_checks?.symptoms || []).map((s: string) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#FFFFFF', color: '#334155', border: '1px solid #E7E5E4' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
                >
                  Top Prediction
                </p>
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span
                      className="font-semibold"
                      style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
                    >
                      {data.disease}
                    </span>
                    <span className={`badge-${data.risk_level}`}>{data.risk_level}</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#F5F4F0', border: '1px solid #E7E5E4' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(data.confidence_score || 0) * 100}%`,
                        backgroundColor: '#0D9488',
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
                    {Math.round((data.confidence_score || 0) * 100)}% confidence
                  </p>
                </div>
              </div>
            </div>
          ) : tab === 'recommendations' && rec ? (
            <div className="space-y-5">
              {/* Emergency — kept rose for medical urgency */}
              {rec.emergency_alert && (
                <div className="rounded-xl p-4 text-white" style={{ backgroundColor: '#E11D48' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertIcon className="w-4 h-4" />
                    <p
                      className="font-semibold text-sm"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      Emergency Alert
                    </p>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>
                    {rec.emergency_message}
                  </p>
                </div>
              )}

              {rec.recommended_tests.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
                  >
                    Recommended Tests
                  </p>
                  <div className="space-y-2">
                    {rec.recommended_tests.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg p-3"
                        style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}
                      >
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold mt-0.5 flex-shrink-0 uppercase tracking-wider"
                          style={
                            t.urgency === 'urgent'
                              ? { backgroundColor: '#E11D48', color: '#FFFFFF' }
                              : { backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1' }
                          }
                        >
                          {t.urgency}
                        </span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                            {t.test_name}
                          </p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#64748B' }}>
                            {t.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rec.recommended_specialists.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
                  >
                    Recommended Specialists
                  </p>
                  <div className="space-y-2">
                    {rec.recommended_specialists.map((s, i) => (
                      <div
                        key={i}
                        className="rounded-lg p-3"
                        style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}
                      >
                        <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                          {s.specialty}
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#64748B' }}>
                          {s.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rec.health_tips.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
                  >
                    Health Tips
                  </p>
                  <ul className="space-y-2">
                    {rec.health_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#334155' }}>
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#0D9488' }} />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : tab === 'sources' && sources ? (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#64748B' }}>
                Query: <span className="italic" style={{ color: '#334155' }}>"{sources.query_text}"</span>
              </p>
              {sources.sources?.length === 0 ? (
                <p className="text-sm" style={{ color: '#64748B' }}>
                  No sources, this prediction used ML-only mode.
                </p>
              ) : (
                sources.sources?.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-[11px] font-mono truncate" style={{ color: '#64748B' }}>
                        {s.chunk_id}
                      </span>
                      <span
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: '#0F766E' }}
                      >
                        {Math.round((s.relevance_score || 0) * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>
                      {s.text_preview}
                    </p>
                    <p className="text-xs mt-2 italic" style={{ color: '#94A3B8' }}>
                      {s.source}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#64748B' }}>
              No data available.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ========== Lab report modal ==========
function LabModal({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    labApi.get(reportId).then((r) => setData(r.data)).finally(() => setLoading(false))
  }, [reportId])

  const statusIcon = (s: string): ReactNode => {
    if (s === 'normal') return <CheckIcon className="w-3 h-3" />
    if (s === 'low' || s === 'critical_low') return <ArrowDownIcon className="w-3 h-3" />
    if (s === 'high' || s === 'critical_high') return <ArrowUpIcon className="w-3 h-3" />
    return <DotIcon className="w-3 h-3" />
  }

  // Semantic colors restored — emerald/amber/rose
  const statusStyle = (s: string): React.CSSProperties => {
    if (s === 'normal') return { backgroundColor: '#D1FAE5', color: '#047857' }
    if (s === 'critical_low' || s === 'critical_high') return { backgroundColor: '#E11D48', color: '#FFFFFF' }
    if (s === 'low' || s === 'high') return { backgroundColor: '#FEF3C7', color: '#B45309' }
    return { backgroundColor: '#F5F4F0', color: '#64748B' }
  }

  const overallColor = (s: string) => {
    if (s === 'normal') return '#047857'
    if (s === 'critical') return '#BE123C'
    if (s === 'borderline' || s === 'abnormal') return '#B45309'
    return '#64748B'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-up"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7E5E4',
          boxShadow: '0 25px 70px rgba(13, 148, 136, 0.16), 0 4px 16px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #E7E5E4' }}
        >
          <div>
            <h2
              className="font-semibold"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              Lab Report Detail
            </h2>
            {data && (
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                {format(new Date(data.created_at), 'MMM d, yyyy h:mm a')} ·{' '}
                <span
                  className="ml-1 capitalize font-semibold"
                  style={{ color: overallColor(data.overall_status) }}
                >
                  {data.overall_status}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: '#F5F4F0' }} />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-3">
              {(data.interpreted_results || []).map((r: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{ backgroundColor: '#FAFAF9', border: '1px solid #E7E5E4' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                      style={statusStyle(r.status)}
                    >
                      {statusIcon(r.status)}
                    </span>
                    <span
                      className="text-sm capitalize font-medium"
                      style={{ color: '#0F172A' }}
                    >
                      {r.test_name?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold" style={{ color: '#0F172A' }}>
                      {r.value}{' '}
                      <span className="text-xs font-normal" style={{ color: '#94A3B8' }}>
                        {r.unit}
                      </span>
                    </span>
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      {r.normal_range}
                    </p>
                  </div>
                </div>
              ))}

              {data.likely_conditions?.length > 0 && (
                <div className="pt-2" style={{ borderTop: '1px solid #E7E5E4' }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ fontFamily: "'Sora', sans-serif", color: '#475569' }}
                  >
                    Possible conditions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.likely_conditions.map((c: string) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#64748B' }}>
              Could not load report.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ========== Main ==========
export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'predictions' | 'labs'>('predictions')
  const [predictions, setPredictions] = useState<any[]>([])
  const [labs, setLabs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null)
  const [selectedLab, setSelectedLab] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const LIMIT = 15

  const loadData = async (p = 0) => {
    setLoading(true)
    try {
      const [predsRes, labsRes] = await Promise.all([
        predictionsApi.history(p * LIMIT, LIMIT),
        labApi.history(p * LIMIT, LIMIT),
      ])
      setPredictions(predsRes.data.predictions || [])
      setLabs(labsRes.data.reports || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(page)
  }, [page])

  return (
    <div
      className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-up"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div>
        <h1
          className="font-semibold text-2xl"
          style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
        >
          Health History
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>
          All your past analyses and lab reports
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ backgroundColor: '#F5F4F0', border: '1px solid #E7E5E4' }}
      >
        {(
          [
            ['predictions', 'Predictions'],
            ['labs', 'Lab Reports'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              fontFamily: "'Sora', sans-serif",
              backgroundColor: activeTab === key ? '#0D9488' : 'transparent',
              color: activeTab === key ? '#FFFFFF' : '#475569',
              boxShadow: activeTab === key ? '0 4px 10px rgba(13, 148, 136, 0.22)' : 'none',
            }}
          >
            {label}
            <span className="ml-2 text-xs opacity-70">
              {key === 'predictions' ? predictions.length : labs.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl animate-pulse"
              style={{ backgroundColor: '#F5F4F0' }}
            />
          ))}
        </div>
      ) : activeTab === 'predictions' ? (
        <>
          {predictions.length === 0 ? (
            <div className="card p-16 text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}
              >
                <ClockIcon className="w-6 h-6" />
              </div>
              <p className="text-sm" style={{ color: '#64748B' }}>
                No predictions yet. Start a health chat to get your first analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrediction(p.id)}
                  className="w-full card-hover p-4 flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <IntensityDot level={p.risk_level} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate" style={{ color: '#0F172A' }}>
                        {p.disease}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                        {format(new Date(p.created_at), 'MMM d, yyyy · h:mm a')}
                        {p.prediction_method && (
                          <span className="ml-1.5" style={{ color: '#94A3B8' }}>
                            · {fmtMethod(p.prediction_method)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className={`badge-${p.risk_level || 'low'}`}>{p.risk_level}</span>
                      <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                        {Math.round((p.confidence_score || 0) * 100)}%
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 transition-colors"
                      style={{ color: '#CBD5E1' }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {labs.length === 0 ? (
            <div className="card p-16 text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}
              >
                <FlaskIcon className="w-6 h-6" />
              </div>
              <p className="text-sm" style={{ color: '#64748B' }}>
                No lab reports yet. Upload or enter values to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {labs.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedLab(r.id)}
                  className="w-full card-hover p-4 flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <IntensityDot level={r.overall_status} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm capitalize truncate" style={{ color: '#0F172A' }}>
                        {r.report_type?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                        {format(new Date(r.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className={`badge-${r.overall_status || 'normal'}`}>{r.overall_status}</span>
                      {r.likely_conditions?.length > 0 && (
                        <p
                          className="text-xs mt-1 truncate max-w-[160px]"
                          style={{ color: '#64748B' }}
                        >
                          {r.likely_conditions[0]}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className="w-4 h-4 transition-colors"
                      style={{ color: '#CBD5E1' }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {(predictions.length === LIMIT || labs.length === LIMIT || page > 0) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-ghost text-sm disabled:opacity-30"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Previous
          </button>
          <span className="text-xs" style={{ color: '#64748B' }}>
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(activeTab === 'predictions' ? predictions : labs).length < LIMIT}
            className="btn-ghost text-sm disabled:opacity-30"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Next
          </button>
        </div>
      )}

      {selectedPrediction && (
        <PredictionModal
          predictionId={selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
        />
      )}
      {selectedLab && <LabModal reportId={selectedLab} onClose={() => setSelectedLab(null)} />}
    </div>
  )
}
