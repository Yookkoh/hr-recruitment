import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggleButton from '../shared/ThemeToggleButton'

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3 5 6v5c0 4.5 2.9 8.6 7 10 4.1-1.4 7-5.5 7-10V6l-7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9.5 12 1.8 1.8L14.8 10" />
    </svg>
  )
}

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, refreshProfile, setPasswordChangeRequired } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const nextPath = location.state?.from
    ? `${location.state.from.pathname || ''}${location.state.from.search || ''}${location.state.from.hash || ''}` || '/'
    : '/'

  async function handleSubmit(event) {
    event.preventDefault()

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!user?.id) {
      setError('Your session expired. Please sign in again.')
      return
    }

    setLoading(true)
    setError(null)

    let profileUpdated = false

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)

      if (profileError) throw profileError
      profileUpdated = true

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      setPasswordChangeRequired(false)
      try {
        await refreshProfile()
      } catch {
        // Local auth state is already updated, so we can still continue.
      }
      navigate(nextPath, { replace: true })
    } catch (err) {
      if (profileUpdated) {
        await supabase
          .from('profiles')
          .update({ must_change_password: true })
          .eq('id', user.id)
      }

      setPasswordChangeRequired(true)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggleButton variant="auth" showLabel />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/45 shadow-[0_45px_100px_-55px_rgba(15,23,42,0.95)] backdrop-blur-xl dark:bg-white/10 lg:grid-cols-[1fr_1.05fr]">
          <section className="hidden border-r border-slate-200/80 bg-white/50 px-8 py-10 dark:border-white/10 dark:bg-slate-950/60 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-100">
              <ShieldIcon />
              Security Step
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">Set a fresh password</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
              Your temporary credentials are active, but you need to secure the account before entering the workspace.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Recommended</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li>Use at least 8 characters.</li>
                <li>Choose something unique to this account.</li>
                <li>Store it in your password manager after saving.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white/95 px-5 py-8 text-slate-900 dark:bg-slate-900/92 dark:text-slate-100 sm:px-8 sm:py-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:bg-brand-500/15 dark:text-brand-100 lg:hidden">
                <ShieldIcon />
                Security Step
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Set New Password</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">You must update your password before continuing to the dashboard.</p>
            </div>

            {error && (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/12 dark:text-red-200">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20"
                  placeholder="Enter a strong password"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={event => setConfirm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20"
                  placeholder="Re-enter the password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_45px_-28px_rgba(15,23,42,0.8)] hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Set Password and Continue'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
