import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'
import { useState } from 'react'

// ========== Inline SVG icons ==========
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function HomeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10l9-7 9 7v11a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" />
    </svg>
  )
}
function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
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
function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function LogoutIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
function MenuIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  )
}

const NAV = [
  { to: '/dashboard',   Icon: HomeIcon,   label: 'Dashboard' },
  { to: '/chat',        Icon: ChatIcon,   label: 'Health Chat' },
  { to: '/lab-reports', Icon: FlaskIcon,  label: 'Lab Reports' },
  { to: '/history',     Icon: ClockIcon,  label: 'History' },
  { to: '/profile',     Icon: UserIcon,   label: 'Profile' },
]

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await authApi.logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FAFAF9' }}
    >
      <style>{`
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          50%      { box-shadow: 0 0 24px 0 rgba(255,255,255,0.18); }
        }
        @keyframes activeIndicator {
          0%, 100% { transform: scaleY(0.6); opacity: 0.7; }
          50%      { transform: scaleY(1);   opacity: 1;   }
        }
        .sh-nav-item { animation: navFadeIn 0.4s ease forwards; opacity: 0; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== Deep teal sidebar ========== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col flex-shrink-0 overflow-hidden text-white
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0D9488 0%, #0F766E 55%, #134E4A 100%)',
        }}
      >
        {/* Decorative accents */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              style={{ animation: 'logoGlow 3s ease-in-out infinite' }}
            >
              <PlusIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p
                className="font-semibold text-white text-[15px] leading-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                SmartHealth
              </p>
              <p className="text-[11px] leading-tight mt-0.5" style={{ color: '#99F6E4' }}>
                AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, Icon, label }, idx) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sh-nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-white font-semibold shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                }`
              }
              style={({ isActive }: any) => ({
                animationDelay: `${0.05 + idx * 0.05}s`,
                color: isActive ? '#0F766E' : undefined,
              } as any)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                      style={{
                        backgroundColor: '#0F766E',
                        animation: 'activeIndicator 2.2s ease-in-out infinite',
                      }}
                    />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span style={{ fontFamily: "'Sora', sans-serif" }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="relative px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div
              className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {user?.full_name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[11px] truncate" style={{ color: '#99F6E4' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <LogoutIcon className="w-4 h-4" />
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ========== Main content ========== */}
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#FAFAF9' }}>
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-semibold text-teal-700 text-sm"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              SmartHealth
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
