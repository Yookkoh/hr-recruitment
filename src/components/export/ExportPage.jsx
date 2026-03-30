import { useRef, useState } from 'react'
import { useRecruitment } from '../../hooks/useRecruitment'
import FilterBar from '../dashboard/FilterBar'
import ExportCard from './ExportCard'
import ExportToolbar from './ExportToolbar'
import { useExport } from '../../hooks/useExport'

export default function ExportPage() {
  const [filters, setFilters] = useState({ atoll: '', requestedBy: '' })
  const { records, loading }  = useRecruitment(filters)
  const exportRef             = useRef(null)
  const { exportAsJpg, exportAsPdf } = useExport(exportRef)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Export / Share</h1>
          <p className="text-sm text-gray-500 mt-0.5">Filter records and download as JPG or PDF</p>
        </div>
        <ExportToolbar onJpg={exportAsJpg} onPdf={exportAsPdf} />
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <ExportCard ref={exportRef} records={records} filters={filters} />
        </div>
      )}
    </div>
  )
}
