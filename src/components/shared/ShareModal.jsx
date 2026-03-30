import { useRef, useState } from 'react'
import { useExport } from '../../hooks/useExport'
import ExportCard from '../export/ExportCard'

export default function ShareModal({ open, onClose, records, filters }) {
  const exportRef = useRef(null)
  const { exportAsJpg, exportAsPdf } = useExport(exportRef)
  const [loading, setLoading] = useState(null)

  if (!open) return null

  async function handleJpg() {
    setLoading('jpg')
    await exportAsJpg()
    setLoading(null)
  }

  async function handlePdf() {
    setLoading('pdf')
    await exportAsPdf()
    setLoading(null)
  }

  async function handleShare() {
    setLoading('share')
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true })
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `staff-tracker-${Date.now()}.jpg`, { type: 'image/jpeg' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Staff Tracker Report',
            text: `Recruitment progress — Atoll: ${filters.atoll || 'All'}, Requested By: ${filters.requestedBy || 'All'}`,
            files: [file],
          })
        } else {
          // Fallback: download the image
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `staff-tracker-${Date.now()}.jpg`
          a.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/jpeg', 0.95)
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Share Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">{records.length} record{records.length !== 1 ? 's' : ''} · {filters.atoll || 'All Atolls'} · {filters.requestedBy || 'All Requesters'}</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
          <button
            onClick={handleJpg}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading === 'jpg'
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              : '🖼️'}
            Save as JPEG
          </button>

          <button
            onClick={handlePdf}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading === 'pdf'
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              : '📄'}
            Save as PDF
          </button>

          <button
            onClick={handleShare}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading === 'share'
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : '📤'}
            Share JPEG
          </button>
        </div>

        {/* Preview */}
        <div className="overflow-auto flex-1 p-4 bg-gray-50">
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <ExportCard ref={exportRef} records={records} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}
