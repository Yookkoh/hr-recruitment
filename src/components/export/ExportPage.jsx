import { useRef, useState } from 'react'
import { useRecruitment } from '../../hooks/useRecruitment'
import { useExport } from '../../hooks/useExport'
import FilterBar from '../dashboard/FilterBar'
import ExportCard from './ExportCard'
import ExportToolbar from './ExportToolbar'

export default function ExportPage() {
  const [filters, setFilters] = useState({ atoll: '', requestedBy: '' })
  const { records, loading } = useRecruitment(filters, { fetchAll: true })
  const exportRef = useRef(null)
  const { exportAsJpg, exportAsPdf } = useExport(exportRef)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Export / Share</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Filter records and download as JPG or PDF</p>
        </div>
        <ExportToolbar onJpg={exportAsJpg} onPdf={exportAsPdf} />
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="min-w-max">
            <ExportCard ref={exportRef} records={records} filters={filters} />
          </div>
        </div>
      )}
    </div>
  )
}
