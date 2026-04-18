import axios from 'axios'

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Inject access token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            { refresh_token: refresh }
          )
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          error.config.headers.Authorization = `Bearer ${data.access_token}`
          return api(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Types ───────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string; email: string; full_name?: string
  age?: number; gender?: string; blood_type?: string; created_at?: string
}
export interface TokenResponse {
  access_token: string; refresh_token: string
  token_type: string; expires_in: number; user: UserProfile
}
export interface DiseasePrediction {
  disease: string; confidence: 'high'|'medium'|'low'
  confidence_score: number; matching_symptoms: string[]
  explanation: string; source_chunks: string[]
  ml_validation?: { status: string; ml_probability: number }
}
export interface PredictionResponse {
  prediction_id: string; predictions: DiseasePrediction[]
  recommended_tests: string[]; emergency: boolean
  emergency_reason?: string; prediction_method: string
  disclaimer: string; created_at: string
}
export interface LabTestResult {
  test_name: string; value: number; unit: string
  status: 'normal'|'low'|'high'|'critical_low'|'critical_high'|'unknown'
  normal_range: string; interpretation: string; emergency: boolean
}
export interface LabReportResponse {
  report_id: string; report_type: string; results: LabTestResult[]
  overall_status: 'normal'|'borderline'|'abnormal'|'critical'
  likely_conditions: string[]; rag_interpretation?: string; created_at: string
}
export interface RecommendedTest { test_name: string; reason: string; urgency: string }
export interface RecommendedSpecialist { specialty: string; reason: string }
export interface RecommendationResponse {
  recommendation_id: string; recommended_tests: RecommendedTest[]
  recommended_specialists: RecommendedSpecialist[]; health_tips: string[]
  emergency_alert: boolean; emergency_message?: string; created_at: string
}
export interface DashboardSummary {
  user: { full_name?: string; age?: number; gender?: string; blood_type?: string }
  statistics: { total_symptom_checks: number; total_lab_reports: number; last_check_date?: string }
  health_score?: number
  recent_predictions: any[]; recent_lab_reports: any[]
}
export interface ChatMessageResponse {
  session_id: string; reply: string; session_status: string
  extracted_symptoms: string[]; prediction?: PredictionResponse; emergency: boolean
}
export interface ChatSession {
  id: string; session_status: string; extracted_symptoms: string[]
  prediction_id?: string; created_at: string; updated_at: string; messages?: any[]
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (d: { email:string; password:string; full_name:string; age?:number; gender?:string; blood_type?:string }) =>
    api.post<TokenResponse>('/auth/register', d),
  login: (d: { email:string; password:string }) =>
    api.post<TokenResponse>('/auth/login', d),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token }),
  me: () => api.get<UserProfile>('/auth/me'),
  updateProfile: (d: Partial<UserProfile>) => api.put<UserProfile>('/auth/profile', d),
  logout: () => api.post('/auth/logout'),
}

// ── Symptoms ────────────────────────────────────────────────────────────────
export const symptomsApi = {
  list: () => api.get<{ symptoms: string[]; total: number }>('/symptoms/list'),
  analyze: (d: {
    symptoms: string[]; severity?: Record<string,number>
    duration_days?: number; free_text?: string; age?: number; gender?: string
  }) => api.post<PredictionResponse>('/symptoms/analyze', d),
}

// ── Lab Reports ─────────────────────────────────────────────────────────────
export const labApi = {
  analyze: (d: { report_type?: string; values: Record<string,number>; notes?: string }) =>
    api.post<LabReportResponse>('/lab-reports/analyze', d),
  upload: (file: File, report_type = 'blood_test') => {
    const fd = new FormData()
    fd.append('file', file); fd.append('report_type', report_type)
    return api.post<LabReportResponse>('/lab-reports/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  history: (skip=0, limit=20) =>
    api.get<{ reports: any[]; total: number }>(`/lab-reports/history?skip=${skip}&limit=${limit}`),
  get: (id: string) => api.get(`/lab-reports/${id}`),
}

// ── Predictions ─────────────────────────────────────────────────────────────
export const predictionsApi = {
  history: (skip=0, limit=20) =>
    api.get<{ predictions: any[] }>(`/predictions/history?skip=${skip}&limit=${limit}`),
  get: (id: string) => api.get(`/predictions/${id}`),
  sources: (id: string) => api.get(`/predictions/${id}/sources`),
}

// ── Recommendations ─────────────────────────────────────────────────────────
export const recommendationsApi = {
  get: (predictionId: string) =>
    api.get<RecommendationResponse>(`/recommendations/${predictionId}`),
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary'),
  metrics: (metric_type?: string, days = 30) =>
    api.get(`/dashboard/metrics?days=${days}${metric_type ? `&metric_type=${metric_type}` : ''}`),
  recordMetric: (metric_type: string, value: number, unit: string) =>
    api.post(`/dashboard/metrics?metric_type=${metric_type}&value=${value}&unit=${unit}`),
}

// ── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  message: (message: string, session_id?: string) =>
    api.post<ChatMessageResponse>('/chat/message', { message, session_id }),
  sessions: (limit=20) =>
    api.get<{ sessions: ChatSession[] }>(`/chat/sessions?limit=${limit}`),
  session: (id: string) => api.get<ChatSession>(`/chat/sessions/${id}`),
  endSession: (id: string) => api.post(`/chat/sessions/${id}/end`),
}

export default api
