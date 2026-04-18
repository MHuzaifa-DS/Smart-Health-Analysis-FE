import { useState, useEffect } from 'react'
import { authApi, dashboardApi, type UserProfile } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format } from 'date-fns'
import clsx from 'clsx'

// ── Profile edit form ──────────────────────────────────────────────────────────
function ProfileForm({ user, onSaved }: { user: UserProfile; onSaved: (u: UserProfile) => void }) {
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    age: user.age?.toString() || '',
    gender: user.gender || '',
    blood_type: user.blood_type || '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await authApi.updateProfile({
        full_name: form.full_name || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        blood_type: form.blood_type || undefined,
      })
      onSaved(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally { setLoading(false) }
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={form.full_name} onChange={f('full_name')} placeholder="Your full name" />
        </div>
        <div>
          <label className="label">Age</label>
          <input className="input" type="number" min="1" max="120" value={form.age} onChange={f('age')} placeholder="e.g. 30" />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={f('gender')}>
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Blood Type</label>
          <select className="input" value={form.blood_type} onChange={f('blood_type')}>
            <option value="">Unknown</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-emerald-400 text-sm animate-fade-in">✓ Saved</span>}
      </div>
    </form>
  )
}

// ── Metric recorder ────────────────────────────────────────────────────────────
const METRIC_OPTIONS = [
  { key: 'blood_sugar',                label: 'Blood Sugar',    unit: 'mg/dL' },
  { key: 'blood_pressure_systolic',    label: 'Systolic BP',    unit: 'mmHg'  },
  { key: 'blood_pressure_diastolic',   label: 'Diastolic BP',   unit: 'mmHg'  },
  { key: 'heart_rate',                 label: 'Heart Rate',     unit: 'bpm'   },
  { key: 'weight',                     label: 'Weight',         unit: 'kg'    },
  { key: 'hemoglobin',                 label: 'Hemoglobin',     unit: 'g/dL'  },
  { key: 'hba1c',                      label: 'HbA1c',          unit: '%'     },
  { key: 'temperature',                label: 'Temperature',    unit: '°C'    },
]

function MetricRecorder({ onRecorded }: { onRecorded: () => void }) {
  const [metricType, setMetricType] = useState(METRIC_OPTIONS[0].key)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const selectedMetric = METRIC_OPTIONS.find(m => m.key === metricType)!

  const record = async () => {
    if (!value) return
    setLoading(true)
    try {
      await dashboardApi.recordMetric(metricType, parseFloat(value), selectedMetric.unit)
      setSuccess(true); setValue('')
      setTimeout(() => { setSuccess(false); onRecorded() }, 1500)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-40">
        <label className="label">Metric</label>
        <select className="input" value={metricType} onChange={e => setMetricType(e.target.value)}>
          {METRIC_OPTIONS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>
      <div className="w-36">
        <label className="label">Value ({selectedMetric.unit})</label>
        <input className="input" type="number" step="any" placeholder="0.0" value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && record()} />
      </div>
      <button onClick={record} disabled={!value || loading} className="btn-primary h-10">
        {loading ? '…' : success ? '✓' : 'Record'}
      </button>
    </div>
  )
}

// ── Metrics chart ──────────────────────────────────────────────────────────────
const CHART_COLORS: Record<string, string> = {
  blood_sugar: '#2DD4BF', blood_pressure_systolic: '#FB7185',
  blood_pressure_diastolic: '#FBBF24', heart_rate: '#34D399',
  weight: '#818CF8', hemoglobin: '#F472B6', hba1c: '#38BDF8', temperature: '#FB923C',
}

function MetricsChart({ metrics }: { metrics: Record<string, any[]> }) {
  const [activeMetric, setActiveMetric] = useState<string>('')
  const metricKeys = Object.keys(metrics)

  useEffect(() => {
    if (metricKeys.length > 0 && !activeMetric) setActiveMetric(metricKeys[0])
  }, [metricKeys])

  if (metricKeys.length === 0) return (
    <div className="flex items-center justify-center h-40 text-ink-500 text-sm">
      No metrics recorded yet. Record your first metric above.
    </div>
  )

  const data = (metrics[activeMetric] || []).map(p => ({
    date: format(new Date(p.date), 'MMM d'),
    value: p.value,
  }))

  const color = CHART_COLORS[activeMetric] || '#2DD4BF'
  const option = METRIC_OPTIONS.find(m => m.key === activeMetric)

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="flex flex-wrap gap-2">
        {metricKeys.map(k => {
          const opt = METRIC_OPTIONS.find(m => m.key === k)
          return (
            <button key={k} onClick={() => setActiveMetric(k)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border transition-all font-display',
                activeMetric === k
                  ? 'border-transparent text-ink-950 font-semibold'
                  : 'border-ink-600 text-ink-400 hover:text-ink-200'
              )}
              style={activeMetric === k ? { backgroundColor: CHART_COLORS[k] || '#2DD4BF' } : {}}>
              {opt?.label || k}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      {data.length < 2 ? (
        <p className="text-center text-ink-500 text-sm py-8">Record more data points to see the trend chart.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
            <XAxis dataKey="date" tick={{ fill: '#6E7681', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6E7681', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#C9D1D9' }}
              itemStyle={{ color }}
              formatter={(v: any) => [`${v} ${option?.unit || ''}`, option?.label || activeMetric]}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
              dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [metrics, setMetrics] = useState<Record<string, any[]>>({})
  const [metricsLoading, setMetricsLoading] = useState(true)

  const loadMetrics = () => {
    setMetricsLoading(true)
    dashboardApi.metrics(undefined, 90)
      .then(r => setMetrics(r.data.metrics || {}))
      .catch(console.error)
      .finally(() => setMetricsLoading(false))
  }

  useEffect(() => { loadMetrics() }, [])

  const handleSaved = (updated: UserProfile) => {
    updateUser(updated)
  }

  if (!user) return null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400 text-2xl font-display font-bold flex-shrink-0">
          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink-50">
            {user.full_name || 'Your Profile'}
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2">
        {user.age && (
          <span className="text-xs bg-ink-800 border border-ink-700 text-ink-300 px-3 py-1.5 rounded-full">
            Age: {user.age}
          </span>
        )}
        {user.gender && (
          <span className="text-xs bg-ink-800 border border-ink-700 text-ink-300 px-3 py-1.5 rounded-full capitalize">
            {user.gender}
          </span>
        )}
        {user.blood_type && (
          <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 py-1.5 rounded-full font-medium">
            Blood Type: {user.blood_type}
          </span>
        )}
        {user.created_at && (
          <span className="text-xs bg-ink-800 border border-ink-700 text-ink-500 px-3 py-1.5 rounded-full">
            Member since {format(new Date(user.created_at), 'MMM yyyy')}
          </span>
        )}
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-ink-100 mb-5">Edit Profile</h2>
        <ProfileForm user={user} onSaved={handleSaved} />
      </div>

      {/* Health metrics */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-ink-100 mb-1">Health Metrics</h2>
        <p className="text-xs text-ink-500 mb-5">Track values over time — last 90 days</p>

        <MetricRecorder onRecorded={loadMetrics} />

        <div className="mt-6 border-t border-ink-700 pt-5">
          {metricsLoading ? (
            <div className="h-40 bg-ink-800 rounded-xl animate-pulse" />
          ) : (
            <MetricsChart metrics={metrics} />
          )}
        </div>
      </div>

      {/* Account info */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-ink-100 mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-ink-700">
            <span className="text-sm text-ink-400">Email</span>
            <span className="text-sm text-ink-200 font-mono">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ink-700">
            <span className="text-sm text-ink-400">User ID</span>
            <span className="text-xs text-ink-500 font-mono truncate max-w-48">{user.id}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-ink-400">Member since</span>
            <span className="text-sm text-ink-200">
              {user.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-ink-800/50 border border-ink-700 rounded-xl p-4">
        <p className="text-xs text-ink-500 leading-relaxed">
          <span className="text-ink-400 font-medium">Medical Disclaimer:</span> Smart Health Assistant provides
          preliminary AI-powered health insights based on the Gale Encyclopedia of Medicine and ML models.
          All predictions and analyses are for informational purposes only and do not constitute medical advice,
          diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.
        </p>
      </div>
    </div>
  )
}
