import { useTheme } from '../../contexts/ThemeContext'

function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25M12 18.75V21M4.97 4.97l1.6 1.6M17.43 17.43l1.6 1.6M3 12h2.25M18.75 12H21M4.97 19.03l1.6-1.6M17.43 6.57l1.6-1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.25 12a3.25 3.25 0 1 1-6.5 0 3.25 3.25 0 0 1 6.5 0Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 14.2A8.95 8.95 0 0 1 9.8 3 9 9 0 1 0 21 14.2Z" />
    </svg>
  )
}

const VARIANT_STYLES = {
  shell: 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:rounded-2xl sm:px-3',
  auth: 'inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
}

export default function ThemeToggleButton({ variant = 'shell', showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Light mode' : 'Dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`${VARIANT_STYLES[variant]} ${className}`.trim()}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {showLabel && <span>{label}</span>}
    </button>
  )
}
