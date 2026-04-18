import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard',   icon: '⬡', label: 'Dashboard' },
  { to: '/chat',        icon: '◈', label: 'Health Chat' },
  { to: '/lab-reports', icon: '⬢', label: 'Lab Reports' },
  { to: '/history',     icon: '◉', label: 'History' },
  { to: '/profile',     icon: '◎', label: 'Profile' },
]

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await authApi.logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-ink-700 bg-ink-900">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-ink-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-sm">✚</div>
            <div>
              <p className="font-display font-semibold text-ink-50 text-sm leading-none">SmartHealth</p>
              <p className="text-xs text-ink-400 mt-0.5">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              <span className="font-display font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-ink-700">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-display font-semibold flex-shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-200 truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-ink-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout} disabled={loggingOut}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-ink-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all font-display"
          >
            <span>⏻</span> {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
