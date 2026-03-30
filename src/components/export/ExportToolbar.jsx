import { useState } from 'react'

export default function ExportToolbar({ onJpg, onPdf }) {
  const [loadingJpg, setLoadingJpg] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [error, setError] = useState('')

  async function handleJpg() {
    setLoadingJpg(true)
    setError('')

    try {
      await onJpg()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingJpg(false)
    }
  }

  async function handlePdf() {
    setLoadingPdf(true)
    setError('')

    try {
      await onPdf()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <button
          onClick={handleJpg}
          disabled={loadingJpg || loadingPdf}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
        >
          {loadingJpg ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : 'JPEG'}
          Export JPG
        </button>

        <button
          onClick={handlePdf}
          disabled={loadingJpg || loadingPdf}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm sm:w-auto"
        >
          {loadingPdf ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : 'PDF'}
          Export PDF
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
    </div>
  )
}
