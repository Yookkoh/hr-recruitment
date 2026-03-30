import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { StatusBadge, StageBadge } from './StatusBadge'
import { formatDate, formatCurrency } from '../../utils/formatters'
import RecordDetailModal from './RecordDetailModal'

const PAGE_SIZE = 25

export default function RecordsTable({ records, loading, onDelete }) {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState(null)

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const paginated  = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!records.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
        <span className="text-4xl">📭</span>
        <p className="text-sm">No records found</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Atoll','Island','Requested By','Position','Division','Candidate','Status','Stage','Joined','Salary', role === 'HR' ? '' : null]
                .filter(Boolean)
                .map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                    {col}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map(row => (
              <tr
                key={row.id}
                onClick={() => setSelected(row)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.atoll}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.island ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.requested_by}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.position ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.division ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.candidate_name ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge value={row.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StageBadge value={row.recruitment_stage} /></td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(row.joined_date)}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatCurrency(row.salary)}</td>
                {role === 'HR' && (
                  <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/records/${row.id}/edit`)}
                        className="rounded px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>{records.length} records · Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <RecordDetailModal record={selected} onClose={() => setSelected(null)} />
    </>
  )
}
