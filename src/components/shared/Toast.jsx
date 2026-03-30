import { useEffect } from 'react'

function ToastIcon({ type }) {
  if (type === 'error') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.06 19h13.88c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.33 16c-.77 1.33.19 3 1.73 3Z" />
      </svg>
    )
  }

  if (type === 'info') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01M11 12h1v4h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    )
  }

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12.5 4 4L19 7" />
    </svg>
  )
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 3500)
    return () => clearTimeout(timeout)
  }, [onClose])

  const styles = {
    success: 'border-emerald-200/80 bg-white text-emerald-700 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-200',
    error: 'border-red-200/80 bg-white text-red-700 dark:border-red-500/20 dark:bg-slate-900 dark:text-red-200',
    info: 'border-brand-200/80 bg-white text-brand-700 dark:border-brand-500/20 dark:bg-slate-900 dark:text-brand-200',
  }

  return (
    <div className={`fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:shadow-[0_28px_70px_-40px_rgba(2,6,23,0.95)] sm:inset-x-auto sm:right-5 sm:w-auto ${styles[type]}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-current/10">
        <ToastIcon type={type} />
      </div>
      <p className="flex-1 text-current">{message}</p>
      <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
