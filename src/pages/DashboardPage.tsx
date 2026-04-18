import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, type DashboardSummary } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { format } from 'date-fns'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#2DD4BF' : score >= 40 ? '#FBBF24' : '#FB7185'
  const data = [{ value: score, fill: color }, { value: 100 - score, fill: '#21262D' }]
  return (
    <div className="relative w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%"
          startAngle={90} endAngle={-270} data={data} barSize={8}>
          <RadialBar dataKey="value" cornerRadius={4} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl text-ink-50">{Math.round(score)}</span>
        <span className="text-xs text-ink-400">/ 100</span>
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  return <span className={`badge-${level}`}>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge-${status}`}>{status}</span>
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.summary()
      .then(r => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink-50">
            {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-ink-400 text-sm mt-1">Here's your health overview</p>
        </div>
        <button onClick={() => navigate('/chat')} className="btn-primary flex items-center gap-2">
          <span>◈</span> New Check-up
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse bg-ink-800" />
          ))}
        </div>
      ) : summary ? (
        <>
          {/* ── Stats row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Health Score */}
            <div className="card p-5 flex items-center gap-5">
              <HealthScoreRing score={summary.health_score ?? 80} />
              <div>
                <p className="text-xs text-ink-400 font-display uppercase tracking-wider">Health Score</p>
                <p className="text-sm text-ink-200 mt-2 leading-relaxed">
                  {(summary.health_score ?? 80) >= 70
                    ? 'Looking good! Keep it up.'
                    : (summary.health_score ?? 80) >= 40
                    ? 'Some areas need attention.'
                    : 'Please consult a doctor.'}
                </p>
              </div>
            </div>

            {/* Total checks */}
            <div className="card p-5 flex flex-col justify-between">
              <p className="text-xs text-ink-400 font-display uppercase tracking-wider">Symptom Checks</p>
              <p className="font-display font-bold text-4xl text-teal-400">
                {summary.statistics.total_symptom_checks}
              </p>
              <p className="text-xs text-ink-500">
                {summary.statistics.last_check_date
                  ? `Last: ${format(new Date(summary.statistics.last_check_date), 'MMM d')}`
                  : 'No checks yet'}
              </p>
            </div>

            {/* Lab reports */}
            <div className="card p-5 flex flex-col justify-between">
              <p className="text-xs text-ink-400 font-display uppercase tracking-wider">Lab Reports</p>
              <p className="font-display font-bold text-4xl text-teal-400">
                {summary.statistics.total_lab_reports}
              </p>
              <button onClick={() => navigate('/lab-reports')}
                className="text-xs text-teal-400 hover:text-teal-300 text-left transition-colors">
                Upload new report →
              </button>
            </div>
          </div>

          {/* ── Recent activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent predictions */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-medium text-ink-100 text-sm">Recent Predictions</h2>
                <button onClick={() => navigate('/history')}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors">View all</button>
              </div>
              {summary.recent_predictions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ink-500 text-sm">No predictions yet</p>
                  <button onClick={() => navigate('/chat')}
                    className="text-teal-400 text-sm hover:text-teal-300 mt-2 block mx-auto">
                    Start a health chat →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recent_predictions.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-ink-700 last:border-0">
                      <div>
                        <p className="text-sm text-ink-100 font-medium">{p.disease}</p>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {format(new Date(p.created_at), 'MMM d, yyyy')} · {p.prediction_method?.replace('_', ' ')}
                        </p>
                      </div>
                      <RiskBadge level={p.risk_level || 'low'} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent lab reports */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-medium text-ink-100 text-sm">Recent Lab Reports</h2>
                <button onClick={() => navigate('/lab-reports')}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Upload new</button>
              </div>
              {summary.recent_lab_reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ink-500 text-sm">No lab reports yet</p>
                  <button onClick={() => navigate('/lab-reports')}
                    className="text-teal-400 text-sm hover:text-teal-300 mt-2 block mx-auto">
                    Upload a report →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recent_lab_reports.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-ink-700 last:border-0">
                      <div>
                        <p className="text-sm text-ink-100 font-medium capitalize">{r.report_type?.replace('_', ' ')}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <StatusBadge status={r.overall_status || 'normal'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Chat with AI', icon: '◈', path: '/chat', desc: 'Describe symptoms' },
              { label: 'Upload Lab Report', icon: '⬢', path: '/lab-reports', desc: 'PDF or image' },
              { label: 'View History', icon: '◉', path: '/history', desc: 'Past results' },
              { label: 'Update Profile', icon: '◎', path: '/profile', desc: 'Health info' },
            ].map(({ label, icon, path, desc }) => (
              <button key={path} onClick={() => navigate(path)}
                className="card-hover p-4 text-left group transition-all">
                <span className="text-xl text-teal-400 group-hover:text-teal-300 transition-colors">{icon}</span>
                <p className="font-display font-medium text-ink-100 text-sm mt-2">{label}</p>
                <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-ink-400">Failed to load dashboard. Please refresh.</p>
        </div>
      )}
    </div>
  )
}
