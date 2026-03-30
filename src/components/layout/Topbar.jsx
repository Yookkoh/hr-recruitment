import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggleButton from '../shared/ThemeToggleButton'
import Toast from '../shared/Toast'

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
  recruiter: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
  executive: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
}

function SignOutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 17.5H7.75A2.75 2.75 0 0 1 5 14.75v-5.5A2.75 2.75 0 0 1 7.75 6.5H10" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m14 16.5 4.5-4.5L14 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.5 12H10" />
    </svg>
  )
}

export default function Topbar() {
  const { user, role, signOut, signingOut } = useAuth()
  const [toast, setToast] = useState(null)

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      setToast({ message: error.message || 'Could not sign out right now.', type: 'error' })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-3 px-4 md:h-16 md:px-6 lg:px-8">
          <div className="min-w-0 sm:hidden">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Staff Tracker</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Recruitment workspace</p>
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Operations Workspace</p>
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Staff Tracker</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 sm:block" />
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">Recruitment Console</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className={`max-w-[92px] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize sm:hidden ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}>
              {role || 'member'}
            </span>

            <ThemeToggleButton />

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}>
                {role || 'member'}
              </span>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="min-w-0 max-w-[220px] text-right">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{user?.email || 'Signed in'}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Active session</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:rounded-2xl sm:px-3"
            >
              {signingOut ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : (
                <SignOutIcon />
              )}
              <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      </header>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
