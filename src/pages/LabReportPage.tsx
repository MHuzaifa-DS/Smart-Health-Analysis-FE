import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { labApi, type LabReportResponse, type LabTestResult } from '@/lib/api'
import clsx from 'clsx'
import { format } from 'date-fns'

// ── Lab test catalogue for manual entry ──────────────────────────────────────
const LAB_TESTS = [
  { key: 'fasting_glucose',   label: 'Fasting Glucose',       unit: 'mg/dL',  placeholder: '70–99' },
  { key: 'random_glucose',    label: 'Random Glucose',        unit: 'mg/dL',  placeholder: '<140' },
  { key: 'hba1c',             label: 'HbA1c',                 unit: '%',      placeholder: '<5.7' },
  { key: 'systolic_bp',       label: 'Systolic BP',           unit: 'mmHg',   placeholder: '90–120' },
  { key: 'diastolic_bp',      label: 'Diastolic BP',          unit: 'mmHg',   placeholder: '60–80' },
  { key: 'hemoglobin',        label: 'Hemoglobin',            unit: 'g/dL',   placeholder: '12–17.5' },
  { key: 'mcv',               label: 'MCV',                   unit: 'fL',     placeholder: '80–100' },
  { key: 'mch',               label: 'MCH',                   unit: 'pg',     placeholder: '27–33' },
  { key: 'mchc',              label: 'MCHC',                  unit: 'g/dL',   placeholder: '32–36' },
  { key: 'wbc',               label: 'WBC',                   unit: '/μL',    placeholder: '4500–11000' },
  { key: 'platelets',         label: 'Platelets',             unit: '/μL',    placeholder: '150k–400k' },
  { key: 'total_cholesterol', label: 'Total Cholesterol',     unit: 'mg/dL',  placeholder: '<200' },
  { key: 'ldl',               label: 'LDL Cholesterol',       unit: 'mg/dL',  placeholder: '<100' },
  { key: 'hdl',               label: 'HDL Cholesterol',       unit: 'mg/dL',  placeholder: '>40' },
  { key: 'creatinine',        label: 'Creatinine',            unit: 'mg/dL',  placeholder: '0.7–1.3' },
  { key: 'tsh',               label: 'TSH',                   unit: 'mIU/L',  placeholder: '0.4–4.0' },
  { key: 'serum_iron',        label: 'Serum Iron',            unit: 'μg/dL',  placeholder: '60–170' },
  { key: 'ferritin',          label: 'Ferritin',              unit: 'ng/mL',  placeholder: '12–300' },
]

// ── Result status helpers ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  normal:       { color: 'text-emerald-400', icon: '●', label: 'Normal' },
  low:          { color: 'text-amber-400',   icon: '▼', label: 'Low' },
  high:         { color: 'text-amber-400',   icon: '▲', label: 'High' },
  critical_low: { color: 'text-rose-400',    icon: '⚠', label: 'Critical Low' },
  critical_high:{ color: 'text-rose-400',    icon: '⚠', label: 'Critical High' },
  unknown:      { color: 'text-ink-400',     icon: '○', label: 'Unknown' },
}

function TestResultRow({ result }: { result: LabTestResult }) {
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.unknown
  return (
    <div className={clsx(
      'flex items-start justify-between py-3 px-4 rounded-lg border',
      result.emergency
        ? 'bg-rose-500/8 border-rose-500/25'
        : result.status === 'normal'
        ? 'bg-ink-900 border-ink-700'
        : 'bg-amber-500/5 border-amber-500/15'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={clsx('text-sm', cfg.color)}>{cfg.icon}</span>
          <span className="text-sm font-medium text-ink-100 capitalize">
            {result.test_name.replace(/_/g, ' ')}
          </span>
          {result.emergency && (
            <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded-full font-medium">
              URGENT
            </span>
          )}
        </div>
        <p className="text-xs text-ink-400 mt-1 leading-relaxed">{result.interpretation}</p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="font-mono font-medium text-ink-100 text-sm">
          {result.value} <span className="text-ink-500 text-xs">{result.unit}</span>
        </p>
        <p className="text-xs text-ink-500 mt-0.5">ref: {result.normal_range}</p>
        <span className={clsx('text-xs font-medium', cfg.color)}>{cfg.label}</span>
      </div>
    </div>
  )
}

function OverallStatusBanner({ status, conditions }: { status: string; conditions: string[] }) {
  const config = {
    normal:     { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '✓', color: 'text-emerald-400', title: 'All values normal' },
    borderline: { bg: 'bg-amber-500/10  border-amber-500/20',   icon: '△', color: 'text-amber-400',   title: 'Some values borderline' },
    abnormal:   { bg: 'bg-amber-500/10  border-amber-500/20',   icon: '⚠', color: 'text-amber-400',   title: 'Abnormal values detected' },
    critical:   { bg: 'bg-rose-500/10   border-rose-500/25',    icon: '✕', color: 'text-rose-400',    title: 'Critical values — seek care immediately' },
  }[status] || { bg: 'bg-ink-800 border-ink-700', icon: '○', color: 'text-ink-400', title: 'Results available' }

  return (
    <div className={clsx('rounded-xl border p-4', config.bg)}>
      <div className="flex items-center gap-3">
        <span className={clsx('text-xl', config.color)}>{config.icon}</span>
        <div>
          <p className={clsx('font-display font-semibold text-sm', config.color)}>{config.title}</p>
          {conditions.length > 0 && (
            <p className="text-xs text-ink-300 mt-0.5">
              Possible conditions: {conditions.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultsPanel({ result, onReset }: { result: LabReportResponse; onReset: () => void }) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-ink-50">Report Analysis</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            {format(new Date(result.created_at), 'MMM d, yyyy h:mm a')} ·
            {' '}{result.report_type.replace('_', ' ')}
          </p>
        </div>
        <button onClick={onReset} className="btn-ghost text-sm">New Report</button>
      </div>

      <OverallStatusBanner status={result.overall_status} conditions={result.likely_conditions} />

      {/* Test results */}
      <div className="space-y-2">
        {result.results.map((r, i) => <TestResultRow key={i} result={r} />)}
      </div>

      {/* RAG interpretation */}
      {result.rag_interpretation && (
        <div className="card p-5 border-teal-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-teal-400 text-sm">◈</span>
            <h3 className="font-display font-medium text-teal-400 text-sm">AI Medical Interpretation</h3>
            <span className="text-xs text-ink-500 ml-1">powered by Gale Encyclopedia</span>
          </div>
          <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-line">
            {result.rag_interpretation}
          </p>
        </div>
      )}

      <p className="text-xs text-ink-600 italic text-center pb-2">
        This analysis is for informational purposes only. Consult a healthcare professional for medical advice.
      </p>
    </div>
  )
}

// ── Upload tab ─────────────────────────────────────────────────────────────────
function UploadTab({ onResult }: { onResult: (r: LabReportResponse) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setUploadedFile(accepted[0]); setError('') }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: (f) => setError(f[0]?.errors[0]?.message || 'File rejected'),
  })

  const analyze = async () => {
    if (!uploadedFile) return
    setLoading(true); setError('')
    try {
      const { data } = await labApi.upload(uploadedFile)
      onResult(data)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'object' ? detail.message : (detail || 'Upload failed.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={clsx(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-teal-500 bg-teal-500/5'
          : uploadedFile
          ? 'border-teal-500/40 bg-teal-500/5'
          : 'border-ink-600 hover:border-ink-500 hover:bg-ink-800/50'
      )}>
        <input {...getInputProps()} />
        {uploadedFile ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400 text-xl mx-auto mb-3">⬢</div>
            <p className="font-display font-medium text-teal-400">{uploadedFile.name}</p>
            <p className="text-xs text-ink-400 mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB · Click to change</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-ink-700 border border-ink-600 flex items-center justify-center text-ink-400 text-xl mx-auto mb-3">⬡</div>
            <p className="font-display font-medium text-ink-200">
              {isDragActive ? 'Drop it here' : 'Drop your lab report here'}
            </p>
            <p className="text-xs text-ink-500 mt-1">PDF, PNG or JPEG · Max 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button onClick={analyze} disabled={!uploadedFile || loading} className="btn-primary w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
            Extracting & Analyzing…
          </span>
        ) : 'Analyze Report'}
      </button>

      <p className="text-xs text-ink-500 text-center">
        OCR extracts values automatically. If extraction fails, use manual entry.
      </p>
    </div>
  )
}

// ── Manual tab ─────────────────────────────────────────────────────────────────
function ManualTab({ onResult }: { onResult: (r: LabReportResponse) => void }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed: Record<string, number> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) {
        const n = parseFloat(v)
        if (isNaN(n)) { setError(`Invalid value for ${k}`); return }
        parsed[k] = n
      }
    }
    if (Object.keys(parsed).length === 0) { setError('Enter at least one value.'); return }
    setLoading(true); setError('')
    try {
      const { data } = await labApi.analyze({ values: parsed })
      onResult(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed.')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-xs text-ink-400">Enter the values from your lab report. Leave fields blank if not available.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LAB_TESTS.map(({ key, label, unit, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-ink-400 mb-1 flex items-center justify-between">
              <span>{label}</span>
              <span className="text-ink-600 font-mono">{unit}</span>
            </label>
            <input
              type="number" step="any"
              className="input text-sm py-2"
              placeholder={placeholder}
              value={values[key] || ''}
              onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
            Analyzing…
          </span>
        ) : 'Analyze Values'}
      </button>
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function LabReportPage() {
  const [tab, setTab] = useState<'upload' | 'manual'>('upload')
  const [result, setResult] = useState<LabReportResponse | null>(null)

  if (result) return (
    <div className="p-6 max-w-3xl mx-auto">
      <ResultsPanel result={result} onReset={() => setResult(null)} />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink-50">Lab Report Analyzer</h1>
        <p className="text-ink-400 text-sm mt-1">
          Upload a report PDF or enter values manually for AI-powered interpretation
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-ink-800 rounded-xl border border-ink-700 w-fit">
        {(['upload', 'manual'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx(
              'px-5 py-2 rounded-lg text-sm font-display font-medium transition-all',
              tab === t
                ? 'bg-teal-500 text-ink-950'
                : 'text-ink-400 hover:text-ink-200'
            )}>
            {t === 'upload' ? '⬡ Upload File' : '⬢ Manual Entry'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {tab === 'upload'
          ? <UploadTab onResult={setResult} />
          : <ManualTab onResult={setResult} />
        }
      </div>
    </div>
  )
}
