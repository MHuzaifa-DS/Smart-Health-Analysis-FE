import { useState, useEffect } from 'react'
import {
  predictionsApi, labApi, recommendationsApi,
  type PredictionResponse, type LabReportResponse, type RecommendationResponse
} from '@/lib/api'
import { format } from 'date-fns'
import clsx from 'clsx'

// ── Prediction detail modal ────────────────────────────────────────────────────
function PredictionModal({
  predictionId, onClose
}: { predictionId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [rec, setRec] = useState<RecommendationResponse | null>(null)
  const [sources, setSources] = useState<any>(null)
  const [tab, setTab] = useState<'analysis'|'recommendations'|'sources'>('analysis')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      predictionsApi.get(predictionId),
      recommendationsApi.get(predictionId).catch(() => null),
      predictionsApi.sources(predictionId).catch(() => null),
    ]).then(([pred, recRes, srcRes]) => {
      setData(pred.data)
      setRec(recRes?.data || null)
      setSources(srcRes?.data || null)
    }).finally(() => setLoading(false))
  }, [predictionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-ink-900 border border-ink-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700 flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-ink-50">Prediction Detail</h2>
            {data && (
              <p className="text-xs text-ink-400 mt-0.5">
                {format(new Date(data.created_at), 'MMM d, yyyy h:mm a')} · {data.prediction_method?.replace(/_/g,' ')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-ink-700 flex items-center justify-center text-ink-400 hover:text-ink-200 transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-ink-700 flex-shrink-0">
          {[
            { key: 'analysis', label: 'Analysis' },
            { key: 'recommendations', label: 'Recommendations' },
            { key: 'sources', label: 'RAG Sources' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all',
                tab === key ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25' : 'text-ink-400 hover:text-ink-200'
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_,i) => <div key={i} className="h-16 rounded-lg bg-ink-800 animate-pulse" />)}
            </div>
          ) : tab === 'analysis' && data ? (
            <div className="space-y-3">
              {data.symptom_checks && (
                <div className="bg-ink-800 rounded-xl p-4 border border-ink-700">
                  <p className="text-xs font-display text-ink-400 uppercase tracking-wider mb-2">Reported Symptoms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.symptom_checks?.symptoms || []).map((s: string) => (
                      <span key={s} className="text-xs bg-ink-700 text-ink-300 border border-ink-600 px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* The full predictions array is inside feature_values */}
              <div>
                <p className="text-xs font-display text-ink-400 uppercase tracking-wider mb-2">Top Prediction</p>
                <div className="bg-ink-800 rounded-xl p-4 border border-ink-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-semibold text-ink-50">{data.disease}</span>
                    <span className={`badge-${data.risk_level}`}>{data.risk_level}</span>
                  </div>
                  <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${(data.confidence_score || 0) * 100}%` }} />
                  </div>
                  <p className="text-xs text-ink-400 mt-1.5">{Math.round((data.confidence_score || 0) * 100)}% confidence</p>
                </div>
              </div>
            </div>
          ) : tab === 'recommendations' && rec ? (
            <div className="space-y-5">
              {rec.emergency_alert && (
                <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-4">
                  <p className="text-rose-400 font-display font-semibold text-sm mb-1">🚨 Emergency Alert</p>
                  <p className="text-rose-300 text-sm">{rec.emergency_message}</p>
                </div>
              )}
              {rec.recommended_tests.length > 0 && (
                <div>
                  <p className="text-xs font-display text-ink-400 uppercase tracking-wider mb-3">Recommended Tests</p>
                  <div className="space-y-2">
                    {rec.recommended_tests.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 bg-ink-800 rounded-lg p-3 border border-ink-700">
                        <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 flex-shrink-0',
                          t.urgency === 'urgent' ? 'bg-rose-500/15 text-rose-400' : 'bg-ink-700 text-ink-400'
                        )}>{t.urgency}</span>
                        <div>
                          <p className="text-sm font-medium text-ink-100">{t.test_name}</p>
                          <p className="text-xs text-ink-400 mt-0.5">{t.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rec.recommended_specialists.length > 0 && (
                <div>
                  <p className="text-xs font-display text-ink-400 uppercase tracking-wider mb-3">Recommended Specialists</p>
                  <div className="space-y-2">
                    {rec.recommended_specialists.map((s, i) => (
                      <div key={i} className="bg-ink-800 rounded-lg p-3 border border-ink-700">
                        <p className="text-sm font-medium text-ink-100">{s.specialty}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rec.health_tips.length > 0 && (
                <div>
                  <p className="text-xs font-display text-ink-400 uppercase tracking-wider mb-3">Health Tips</p>
                  <ul className="space-y-2">
                    {rec.health_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
                        <span className="text-teal-500 mt-0.5 flex-shrink-0">›</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : tab === 'sources' && sources ? (
            <div className="space-y-3">
              <p className="text-xs text-ink-500">
                Query: <span className="text-ink-300 italic">"{sources.query_text}"</span>
              </p>
              {sources.sources?.length === 0 ? (
                <p className="text-ink-400 text-sm">No RAG sources — this prediction used ML-only mode.</p>
              ) : (
                sources.sources?.map((s: any, i: number) => (
                  <div key={i} className="bg-ink-800 border border-ink-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-ink-500">{s.chunk_id}</span>
                      <span className="text-xs text-teal-400 font-medium">
                        {Math.round((s.relevance_score || 0) * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-ink-300 leading-relaxed">{s.text_preview}</p>
                    <p className="text-xs text-ink-600 mt-2 italic">{s.source}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="text-ink-400 text-sm">No data available.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Lab report detail modal ────────────────────────────────────────────────────
function LabModal({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    labApi.get(reportId).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [reportId])

  const STATUS_ICON: Record<string, string> = {
    normal: '●', low: '▼', high: '▲', critical_low: '⚠', critical_high: '⚠', unknown: '○'
  }
  const STATUS_COLOR: Record<string, string> = {
    normal: 'text-emerald-400', low: 'text-amber-400', high: 'text-amber-400',
    critical_low: 'text-rose-400', critical_high: 'text-rose-400', unknown: 'text-ink-400'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-ink-900 border border-ink-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700 flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-ink-50">Lab Report Detail</h2>
            {data && (
              <p className="text-xs text-ink-400 mt-0.5">
                {format(new Date(data.created_at), 'MMM d, yyyy h:mm a')} ·
                <span className={clsx('ml-1.5', {
                  'text-emerald-400': data.overall_status === 'normal',
                  'text-amber-400': data.overall_status === 'borderline' || data.overall_status === 'abnormal',
                  'text-rose-400': data.overall_status === 'critical',
                })}>{data.overall_status}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-ink-700 flex items-center justify-center text-ink-400 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-14 rounded-lg bg-ink-800 animate-pulse" />)}</div>
          ) : data ? (
            <div className="space-y-3">
              {(data.interpreted_results || []).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-ink-800 rounded-lg px-4 py-3 border border-ink-700">
                  <div className="flex items-center gap-2">
                    <span className={STATUS_COLOR[r.status] || 'text-ink-400'}>{STATUS_ICON[r.status] || '○'}</span>
                    <span className="text-sm text-ink-200 capitalize">{r.test_name?.replace(/_/g,' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm text-ink-100">{r.value} <span className="text-ink-500 text-xs">{r.unit}</span></span>
                    <p className="text-xs text-ink-500">{r.normal_range}</p>
                  </div>
                </div>
              ))}
              {data.likely_conditions?.length > 0 && (
                <div className="pt-2 border-t border-ink-700">
                  <p className="text-xs text-ink-400 mb-2">Possible conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.likely_conditions.map((c: string) => (
                      <span key={c} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : <p className="text-ink-400 text-sm">Could not load report.</p>}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
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
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData(page) }, [page])

  const RISK_COLOR: Record<string, string> = {
    high: 'text-rose-400', medium: 'text-amber-400', low: 'text-emerald-400'
  }
  const STATUS_COLOR: Record<string, string> = {
    normal: 'text-emerald-400', borderline: 'text-amber-400', abnormal: 'text-amber-400', critical: 'text-rose-400'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink-50">Health History</h1>
        <p className="text-ink-400 text-sm mt-1">All your past analyses and lab reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-ink-800 rounded-xl border border-ink-700 w-fit">
        {([['predictions', 'Predictions'], ['labs', 'Lab Reports']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={clsx(
              'px-5 py-2 rounded-lg text-sm font-display font-medium transition-all',
              activeTab === key ? 'bg-teal-500 text-ink-950' : 'text-ink-400 hover:text-ink-200'
            )}>
            {label}
            <span className="ml-2 text-xs opacity-60">
              {key === 'predictions' ? predictions.length : labs.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-ink-800 animate-pulse" />)}
        </div>
      ) : activeTab === 'predictions' ? (
        <>
          {predictions.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-2xl mb-3">◉</p>
              <p className="text-ink-400 text-sm">No predictions yet. Start a health chat to get your first analysis.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.map((p: any) => (
                <button key={p.id} onClick={() => setSelectedPrediction(p.id)}
                  className="w-full card-hover p-4 flex items-center justify-between group text-left transition-all">
                  <div className="flex items-center gap-4">
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', {
                      'bg-rose-400': p.risk_level === 'high',
                      'bg-amber-400': p.risk_level === 'medium',
                      'bg-emerald-400': p.risk_level === 'low',
                    })} />
                    <div>
                      <p className="font-medium text-ink-100 text-sm">{p.disease}</p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {format(new Date(p.created_at), 'MMM d, yyyy · h:mm a')}
                        {p.prediction_method && (
                          <span className="ml-2 text-ink-600">· {p.prediction_method.replace(/_/g,' ')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={clsx('text-sm font-display font-medium', RISK_COLOR[p.risk_level] || 'text-ink-400')}>
                        {p.risk_level}
                      </p>
                      <p className="text-xs text-ink-500">{Math.round((p.confidence_score || 0) * 100)}%</p>
                    </div>
                    <span className="text-ink-600 group-hover:text-ink-400 transition-colors text-sm">›</span>
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
              <p className="text-2xl mb-3">⬢</p>
              <p className="text-ink-400 text-sm">No lab reports yet. Upload or enter values to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {labs.map((r: any) => (
                <button key={r.id} onClick={() => setSelectedLab(r.id)}
                  className="w-full card-hover p-4 flex items-center justify-between group text-left">
                  <div className="flex items-center gap-4">
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', {
                      'bg-emerald-400': r.overall_status === 'normal',
                      'bg-amber-400': r.overall_status === 'borderline' || r.overall_status === 'abnormal',
                      'bg-rose-400': r.overall_status === 'critical',
                    })} />
                    <div>
                      <p className="font-medium text-ink-100 text-sm capitalize">{r.report_type?.replace('_',' ')}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{format(new Date(r.created_at), 'MMM d, yyyy · h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={clsx('text-sm font-display font-medium', STATUS_COLOR[r.overall_status] || 'text-ink-400')}>
                        {r.overall_status}
                      </p>
                      {r.likely_conditions?.length > 0 && (
                        <p className="text-xs text-ink-500">{r.likely_conditions[0]}</p>
                      )}
                    </div>
                    <span className="text-ink-600 group-hover:text-ink-400 transition-colors text-sm">›</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {(predictions.length === LIMIT || labs.length === LIMIT || page > 0) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-ghost text-sm disabled:opacity-30">← Previous</button>
          <span className="text-xs text-ink-500">Page {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)}
            disabled={(activeTab === 'predictions' ? predictions : labs).length < LIMIT}
            className="btn-ghost text-sm disabled:opacity-30">Next →</button>
        </div>
      )}

      {/* Modals */}
      {selectedPrediction && (
        <PredictionModal predictionId={selectedPrediction} onClose={() => setSelectedPrediction(null)} />
      )}
      {selectedLab && (
        <LabModal reportId={selectedLab} onClose={() => setSelectedLab(null)} />
      )}
    </div>
  )
}
