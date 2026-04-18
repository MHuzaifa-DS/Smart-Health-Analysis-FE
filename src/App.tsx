import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ChatPage from '@/pages/ChatPage'
import LabReportPage from '@/pages/LabReportPage'
import HistoryPage from '@/pages/HistoryPage'
import ProfilePage from '@/pages/ProfilePage'
import Layout from '@/components/ui/Layout'

// Requires auth — redirects to /login if not signed in
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public-only routes (landing/login/register) — redirect to dashboard if already signed in
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected app pages */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="lab-reports" element={<LabReportPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
