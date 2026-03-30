import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useRecruitment } from '../../hooks/useRecruitment'
import FilterBar from './FilterBar'
import RecordsTable from './RecordsTable'
import Toast from '../shared/Toast'

export default function DashboardPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ atoll: '', requestedBy: '' })
  const [toast, setToast]     = useState(null)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recruitment Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">{records.length} record{records.length !== 1 ? 's' : ''}</p>
        </div>
        {role === 'HR' && (
          <button
            onClick={() => navigate('/records/new')}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            + Add Record
          </button>
        )}
        {(role === 'DCOO' || role === 'MD') && (
          <button
            onClick={() => navigate('/export')}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            📤 Export / Share
          </button>
        )}
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <RecordsTable records={records} loading={loading} onDelete={handleDelete} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
