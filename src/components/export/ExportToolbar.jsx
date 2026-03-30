import { useState } from 'react'

export default function ExportToolbar({ onJpg, onPdf }) {
  const [loadingJpg, setLoadingJpg] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  async function handleJpg() {
    setLoadingJpg(true)
    await onJpg()
    setLoadingJpg(false)
  }

  async function handlePdf() {
    setLoadingPdf(true)
    await onPdf()
    setLoadingPdf(false)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleJpg}
        disabled={loadingJpg || loadingPdf}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
      >
        {loadingJpg ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        ) : '🖼️'}
        Export JPG
      </button>

      <button
        onClick={handlePdf}
        disabled={loadingJpg || loadingPdf}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {loadingPdf ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : '📄'}
        Export PDF
      </button>
    </div>
  )
}
