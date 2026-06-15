import { useState, useCallback, type ReactNode } from 'react'
import { useDropzone } from 'react-dropzone'
import { labApi, type LabReportResponse, type LabTestResult } from '@/lib/api'
import { format } from 'date-fns'

// ========== Icons ==========
function UploadIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )
}
function FileIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}
function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z" />
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
function AlertIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
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
function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    </svg>
  )
}

// ========== Lab catalog ==========
const LAB_TESTS = [
  { key: 'fasting_glucose',   label: 'Fasting Glucose',       unit: 'mg/dL',  placeholder: '70-99' },
  { key: 'random_glucose',    label: 'Random Glucose',        unit: 'mg/dL',  placeholder: '<140' },
  { key: 'hba1c',             label: 'HbA1c',                 unit: '%',      placeholder: '<5.7' },
  { key: 'systolic_bp',       label: 'Systolic BP',           unit: 'mmHg',   placeholder: '90-120' },
  { key: 'diastolic_bp',      label: 'Diastolic BP',          unit: 'mmHg',   placeholder: '60-80' },
  { key: 'hemoglobin',        label: 'Hemoglobin',            unit: 'g/dL',   placeholder: '12-17.5' },
  { key: 'mcv',               label: 'MCV',                   unit: 'fL',     placeholder: '80-100' },
  { key: 'mch',               label: 'MCH',                   unit: 'pg',     placeholder: '27-33' },
  { key: 'mchc',              label: 'MCHC',                  unit: 'g/dL',   placeholder: '32-36' },
  { key: 'wbc',               label: 'WBC',                   unit: '/uL',    placeholder: '4500-11000' },
  { key: 'platelets',         label: 'Platelets',             unit: '/uL',    placeholder: '150k-400k' },
  { key: 'total_cholesterol', label: 'Total Cholesterol',     unit: 'mg/dL',  placeholder: '<200' },
  { key: 'ldl',               label: 'LDL Cholesterol',       unit: 'mg/dL',  placeholder: '<100' },
  { key: 'hdl',               label: 'HDL Cholesterol',       unit: 'mg/dL',  placeholder: '>40' },
  { key: 'creatinine',        label: 'Creatinine',            unit: 'mg/dL',  placeholder: '0.7-1.3' },
  { key: 'tsh',               label: 'TSH',                   unit: 'mIU/L',  placeholder: '0.4-4.0' },
  { key: 'serum_iron',        label: 'Serum Iron',            unit: 'ug/dL',  placeholder: '60-170' },
  { key: 'ferritin',          label: 'Ferritin',              unit: 'ng/mL',  placeholder: '12-300' },
]

// ========== Status config ==========
// Semantic colors restored (emerald/amber/rose) — medical users need
// to distinguish normal/borderline/critical at a glance.
// Primary UI theme is still teal + cream + navy.
interface StatusCfg {
  rowStyle: React.CSSProperties
  iconWrapStyle: React.CSSProperties
  labelColor: string
  icon: ReactNode
  label: string
  isCritical?: boolean
}

const STATUS_CONFIG: Record<string, StatusCfg> = {
  normal: {
    rowStyle: { backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4' },
    iconWrapStyle: { backgroundColor: '#D1FAE5', color: '#047857' },
    labelColor: '#047857',
    icon: <CheckIcon className="w-3 h-3" />,
    label: 'Normal',
  },
  low: {
    rowStyle: { backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' },
    iconWrapStyle: { backgroundColor: '#FEF3C7', color: '#B45309' },
    labelColor: '#B45309',
    icon: <ArrowDownIcon className="w-3 h-3" />,
    label: 'Low',
  },
  high: {
    rowStyle: { backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' },
    iconWrapStyle: { backgroundColor: '#FEF3C7', color: '#B45309' },
    labelColor: '#B45309',
    icon: <ArrowUpIcon className="w-3 h-3" />,
    label: 'High',
  },
  critical_low: {
    rowStyle: { backgroundColor: '#E11D48', border: '1px solid #E11D48' },
    iconWrapStyle: { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF' },
    labelColor: '#FFFFFF',
    icon: <AlertIcon className="w-3 h-3" />,
    label: 'Critical Low',
    isCritical: true,
  },
  critical_high: {
    rowStyle: { backgroundColor: '#E11D48', border: '1px solid #E11D48' },
    iconWrapStyle: { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF' },
    labelColor: '#FFFFFF',
    icon: <AlertIcon className="w-3 h-3" />,
    label: 'Critical High',
    isCritical: true,
  },
  unknown: {
    rowStyle: { backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4' },
    iconWrapStyle: { backgroundColor: '#F5F4F0', color: '#64748B' },
    labelColor: '#64748B',
    icon: <DotIcon className="w-3 h-3" />,
    label: 'Unknown',
  },
}

function TestResultRow({ result }: { result: LabTestResult }) {
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.unknown
  const isCritical = cfg.isCritical || result.emergency
  const nameColor = isCritical ? '#FFFFFF' : '#0F172A'
  const subTextColor = isCritical ? 'rgba(255, 255, 255, 0.75)' : '#64748B'
  const refColor = isCritical ? 'rgba(255, 255, 255, 0.7)' : '#94A3B8'

  return (
    <div
      className="flex items-start justify-between py-3 px-4 rounded-lg"
      style={cfg.rowStyle}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full"
            style={cfg.iconWrapStyle}
          >
            {cfg.icon}
          </span>
          <span
            className="text-sm font-medium capitalize"
            style={{ color: nameColor }}
          >
            {result.test_name.replace(/_/g, ' ')}
          </span>
          {result.emergency && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#FFFFFF', color: '#BE123C' }}
            >
              URGENT
            </span>
          )}
        </div>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: subTextColor }}>
          {result.interpretation}
        </p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="font-mono font-semibold text-sm" style={{ color: nameColor }}>
          {result.value}{' '}
          <span className="text-xs" style={{ color: subTextColor }}>{result.unit}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: refColor }}>
          ref: {result.normal_range}
        </p>
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: cfg.labelColor }}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  )
}

function OverallStatusBanner({ status, conditions }: { status: string; conditions: string[] }) {
  // Semantic colors for overall status (preserved medical meaning)
  const config: Record<
    string,
    { bgStyle: React.CSSProperties; iconColor: string; titleColor: string; subColor: string; icon: ReactNode; title: string }
  > = {
    normal: {
      bgStyle: { backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0' },
      iconColor: '#047857',
      titleColor: '#047857',
      subColor: '#334155',
      icon: <CheckIcon className="w-5 h-5" />,
      title: 'All values normal',
    },
    borderline: {
      bgStyle: { backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' },
      iconColor: '#B45309',
      titleColor: '#B45309',
      subColor: '#475569',
      icon: <AlertIcon className="w-5 h-5" />,
      title: 'Some values borderline',
    },
    abnormal: {
      bgStyle: { backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' },
      iconColor: '#B45309',
      titleColor: '#B45309',
      subColor: '#475569',
      icon: <AlertIcon className="w-5 h-5" />,
      title: 'Abnormal values detected',
    },
    critical: {
      bgStyle: { backgroundColor: '#E11D48', border: '1px solid #E11D48' },
      iconColor: '#FFFFFF',
      titleColor: '#FFFFFF',
      subColor: 'rgba(255, 255, 255, 0.85)',
      icon: <AlertIcon className="w-5 h-5" />,
      title: 'Critical values, seek care immediately',
    },
  }
  const c =
    config[status] || {
      bgStyle: { backgroundColor: '#F5F4F0', border: '1px solid #E7E5E4' },
      iconColor: '#64748B',
      titleColor: '#334155',
      subColor: '#64748B',
      icon: <DotIcon className="w-5 h-5" />,
      title: 'Results available',
    }

  return (
    <div className="rounded-xl p-4 animate-fade-up" style={c.bgStyle}>
      <div className="flex items-center gap-3">
        <span style={{ color: c.iconColor }}>{c.icon}</span>
        <div className="min-w-0">
          <p
            className="font-semibold text-sm"
            style={{ fontFamily: "'Sora', sans-serif", color: c.titleColor }}
          >
            {c.title}
          </p>
          {conditions.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: c.subColor }}>
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
          <h2
            className="font-semibold text-xl"
            style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
          >
            Report Analysis
          </h2>
          <p className="text-xs mt-0.5 capitalize" style={{ color: '#64748B' }}>
            {format(new Date(result.created_at), 'MMM d, yyyy h:mm a')} · {result.report_type.replace(/_/g, ' ')}
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-ghost text-sm"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          New Report
        </button>
      </div>

      <OverallStatusBanner status={result.overall_status} conditions={result.likely_conditions} />

      <div className="space-y-2">
        {result.results.map((r, i) => (
          <TestResultRow key={i} result={r} />
        ))}
      </div>

      {result.rag_interpretation && (
        <div
          className="card p-5"
          style={{ backgroundColor: '#F0FDFA', border: '1px solid #99F6E4' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-md text-white flex items-center justify-center"
              style={{ backgroundColor: '#0D9488' }}
            >
              <SparkleIcon className="w-3.5 h-3.5" />
            </div>
            <h3
              className="font-semibold text-sm"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F766E' }}
            >
              AI Medical Interpretation
            </h3>
            <span className="text-xs ml-1" style={{ color: '#64748B' }}>
              powered by Gale Encyclopedia
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#334155' }}>
            {result.rag_interpretation}
          </p>
        </div>
      )}

      <p
        className="text-xs italic text-center pb-2 leading-relaxed"
        style={{ color: '#94A3B8' }}
      >
        This analysis is for informational purposes only. Consult a healthcare professional for medical advice.
      </p>
    </div>
  )
}

// ========== Upload tab ==========
function UploadTab({ onResult }: { onResult: (r: LabReportResponse) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setUploadedFile(accepted[0])
      setError('')
    }
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
    setLoading(true)
    setError('')
    try {
      const { data } = await labApi.upload(uploadedFile)
      onResult(data)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'object' ? detail.message : detail || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  const dropStyle: React.CSSProperties = isDragActive
    ? { borderColor: '#0D9488', backgroundColor: '#F0FDFA' }
    : uploadedFile
    ? { borderColor: '#5EEAD4', backgroundColor: '#F0FDFA' }
    : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
        style={dropStyle}
        onMouseEnter={(e) => {
          if (!isDragActive && !uploadedFile) {
            e.currentTarget.style.borderColor = '#5EEAD4'
            e.currentTarget.style.backgroundColor = '#F0FDFA'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragActive && !uploadedFile) {
            e.currentTarget.style.borderColor = '#CBD5E1'
            e.currentTarget.style.backgroundColor = '#FFFFFF'
          }
        }}
      >
        <input {...getInputProps()} />
        {uploadedFile ? (
          <>
            <div
              className="w-14 h-14 rounded-xl text-white flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#0D9488', boxShadow: '0 6px 16px rgba(13, 148, 136, 0.28)' }}
            >
              <FileIcon className="w-6 h-6" />
            </div>
            <p
              className="font-semibold"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F766E' }}
            >
              {uploadedFile.name}
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              {(uploadedFile.size / 1024).toFixed(1)} KB · Click to change
            </p>
          </>
        ) : (
          <>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#CCFBF1', color: '#0D9488' }}
            >
              <UploadIcon className="w-6 h-6" />
            </div>
            <p
              className="font-semibold"
              style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
            >
              {isDragActive ? 'Drop it here' : 'Drop your lab report here'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              PDF, PNG or JPEG · Max 10 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-lg flex items-start gap-2"
          style={{ backgroundColor: '#FFE4E6', border: '1px solid #FECDD3', color: '#BE123C' }}
        >
          <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button onClick={analyze} disabled={!uploadedFile || loading} className="btn-primary w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Extracting &amp; Analyzing...
          </span>
        ) : (
          'Analyze Report'
        )}
      </button>

      <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
        OCR extracts values automatically. If extraction fails, use manual entry.
      </p>
    </div>
  )
}

// ========== Manual tab ==========
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
        if (isNaN(n)) {
          setError(`Invalid value for ${k}`)
          return
        }
        parsed[k] = n
      }
    }
    if (Object.keys(parsed).length === 0) {
      setError('Enter at least one value.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await labApi.analyze({ values: parsed })
      onResult(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-xs" style={{ color: '#64748B' }}>
        Enter the values from your lab report. Leave fields blank if not available.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LAB_TESTS.map(({ key, label, unit, placeholder }) => (
          <div key={key}>
            <label
              className="text-xs mb-1 flex items-center justify-between font-medium"
              style={{ color: '#475569' }}
            >
              <span>{label}</span>
              <span className="font-mono" style={{ color: '#94A3B8' }}>{unit}</span>
            </label>
            <input
              type="number"
              step="any"
              className="input text-sm py-2"
              placeholder={placeholder}
              value={values[key] || ''}
              onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-lg flex items-start gap-2"
          style={{ backgroundColor: '#FFE4E6', border: '1px solid #FECDD3', color: '#BE123C' }}
        >
          <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          'Analyze Values'
        )}
      </button>
    </form>
  )
}

// ========== Main ==========
export default function LabReportPage() {
  const [tab, setTab] = useState<'upload' | 'manual'>('upload')
  const [result, setResult] = useState<LabReportResponse | null>(null)

  if (result) {
    return (
      <div className="p-6 max-w-3xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <ResultsPanel result={result} onReset={() => setResult(null)} />
      </div>
    )
  }

  return (
    <div
      className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-up"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div>
        <h1
          className="font-semibold text-2xl"
          style={{ fontFamily: "'Sora', sans-serif", color: '#0F172A' }}
        >
          Lab Report Analyzer
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>
          Upload a report PDF or enter values manually for AI-powered interpretation
        </p>
      </div>

      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ backgroundColor: '#F5F4F0', border: '1px solid #E7E5E4' }}
      >
        {(['upload', 'manual'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              fontFamily: "'Sora', sans-serif",
              backgroundColor: tab === t ? '#0D9488' : 'transparent',
              color: tab === t ? '#FFFFFF' : '#475569',
              boxShadow: tab === t ? '0 4px 10px rgba(13, 148, 136, 0.22)' : 'none',
            }}
          >
            {t === 'upload' ? <UploadIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
            {t === 'upload' ? 'Upload File' : 'Manual Entry'}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {tab === 'upload' ? <UploadTab onResult={setResult} /> : <ManualTab onResult={setResult} />}
      </div>
    </div>
  )
}
