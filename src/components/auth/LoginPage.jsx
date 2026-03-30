import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ThemeToggleButton from '../shared/ThemeToggleButton'

const HIGHLIGHTS = [
  'Track hiring status across all atolls in one place.',
  'Review candidate movement, assignments, and joined dates quickly.',
  'Export filtered reports without leaving the workflow.',
]

function SparkIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12.5 4 4L19 7" />
    </svg>
  )
}

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, mustChangePassword, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nextPath = location.state?.from
    ? `${location.state.from.pathname || ''}${location.state.from.search || ''}${location.state.from.hash || ''}` || '/'
    : '/'

  useEffect(() => {
    if (authLoading || !session) return

    navigate(mustChangePassword ? '/change-password' : nextPath, { replace: true })
  }, [authLoading, mustChangePassword, navigate, nextPath, session])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggleButton variant="auth" showLabel />
      </div>

      <div className="relative grid min-h-screen w-full lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between border-r border-slate-200/70 bg-white/55 px-10 py-12 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 lg:flex xl:px-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-100">
              <SparkIcon />
              Recruitment Console
            </div>
            <div className="mt-8 max-w-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-extrabold text-white shadow-[0_24px_50px_-28px_rgba(59,130,246,0.85)]">
                ST
              </div>
              <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white">
                Staff Tracker
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
                A focused workspace for recruitment operations, candidate progress, and reporting across the organization.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {HIGHLIGHTS.map(item => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-100">
                  <CheckIcon />
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md rounded-[32px] border border-white/15 bg-white/95 p-6 text-slate-900 shadow-[0_40px_90px_-55px_rgba(15,23,42,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92 dark:text-slate-100 sm:p-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:bg-brand-500/15 dark:text-brand-100 lg:hidden">
                <SparkIcon />
                Staff Tracker
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Continue to your recruitment workspace and pick up where the team left off.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/12 dark:text-red-200">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || authLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_45px_-28px_rgba(15,23,42,0.8)] hover:bg-slate-800 disabled:opacity-50"
              >
                {loading || authLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
