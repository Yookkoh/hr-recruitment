import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useRecruitment } from '../../hooks/useRecruitment'
import FilterBar from './FilterBar'
import RecordsTable from './RecordsTable'
import Toast from '../shared/Toast'
import ShareModal from '../shared/ShareModal'

export default function DashboardPage() {
  const { role } = useAuth()
  const navigate  = useNavigate()
  const [filters, setFilters]   = useState({ atoll: '', requestedBy: '' })
  const [toast, setToast]       = useState(null)
  const [shareOpen, setShareOpen] = useState(false)

  const { records, loading, error, remove } = useRecruitment(filters)

  async function handleDelete(id) {
    if (!window.confirm('Delete this record? This cannot be undone.')) return
    try {
      await remove(id)
      setToast({ message: 'Record deleted.', type: 'success' })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">{records.length} record{records.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {role === 'HR' && (
            <button
              onClick={() => navigate('/records/new')}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              + Add Record
            </button>
          )}
          <button
            onClick={() => setShareOpen(true)}
            disabled={loading || records.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
          >
            📤 Share
          </button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <RecordsTable records={records} loading={loading} onDelete={handleDelete} />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        records={records}
        filters={filters}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
