import { useAuth } from '../../contexts/AuthContext'

const ROLE_COLORS = {
  HR:   'bg-blue-100 text-blue-700',
  DCOO: 'bg-purple-100 text-purple-700',
  MD:   'bg-green-100 text-green-700',
}

export default function Topbar({ onMenuClick }) {
  const { user, role, signOut } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <button
        onClick={onMenuClick}
        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <span className="text-sm font-semibold text-gray-700 lg:hidden">HR Recruitment</span>

      <div className="ml-auto flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600'}`}>
          {role}
        </span>
        <span className="hidden text-sm text-gray-600 sm:block">{user?.email}</span>
        <button
          onClick={signOut}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
