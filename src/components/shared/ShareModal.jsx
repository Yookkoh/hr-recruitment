import { useRef, useState } from 'react'
import { useExport } from '../../hooks/useExport'
import { useRecruitment } from '../../hooks/useRecruitment'
import ExportCard from '../export/ExportCard'

const EXPORT_RECORD_SELECT = 'id, atoll, island, requested_by, requested_date, type, position, division, candidate_name, id_card, candidate_contact, status, recruitment_stage, joined_date, salary'

export default function ShareModal({ open, onClose, filters, recordCount }) {
  const exportRef = useRef(null)
  const { exportAsJpg, exportAsPdf, shareAsJpg } = useExport(exportRef)
  const { records, loading: recordsLoading } = useRecruitment(filters, {
    enabled: open,
    fetchAll: true,
    select: EXPORT_RECORD_SELECT,
  })
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleJpg() {
    setLoading('jpg')
    setError('')

    try {
      await exportAsJpg()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  async function handlePdf() {
    setLoading('pdf')
    setError('')

    try {
      await exportAsPdf()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  async function handleShare() {
    setLoading('share')
    setError('')

    try {
      await shareAsJpg({
        text: `Recruitment progress - Atoll: ${filters.atoll || 'All'}, Requested By: ${filters.requestedBy || 'All'}, Status: ${filters.status || 'All'}`,
        title: 'Staff Tracker Report',
      })
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex h-[100svh] w-full flex-col bg-white shadow-2xl dark:bg-slate-900 dark:text-slate-100 sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl">
        <div className="shrink-0 border-b border-gray-100 px-4 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Share Report</h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
                {recordCount} record{recordCount !== 1 ? 's' : ''} - {filters.atoll || 'All Atolls'} - {filters.requestedBy || 'All Requesters'} - {filters.status || 'All Statuses'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-gray-100 px-4 py-3 dark:border-slate-800 sm:px-6">
          <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <button
              onClick={handleJpg}
              disabled={!!loading || recordsLoading || records.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              {loading === 'jpg'
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                : 'JPEG'}
              Save as JPEG
            </button>

            <button
              onClick={handlePdf}
              disabled={!!loading || recordsLoading || records.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              {loading === 'pdf'
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                : 'PDF'}
              Save as PDF
            </button>

            <button
              onClick={handleShare}
              disabled={!!loading || recordsLoading || records.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm sm:w-auto"
            >
              {loading === 'share'
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : 'Share'}
              Share JPEG
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-3 dark:bg-slate-950 sm:p-4">
          {recordsLoading ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Loading report data...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="min-w-max">
                <ExportCard ref={exportRef} records={records} filters={filters} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
