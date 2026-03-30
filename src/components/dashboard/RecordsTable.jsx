import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { StageBadge, StatusBadge } from './StatusBadge'

const RecordDetailModal = lazy(() => import('./RecordDetailModal'))
const MANAGER_ROLES = ['recruiter', 'admin']

function DetailItem({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{value || '-'}</p>
    </div>
  )
}

export default function RecordsTable({ records, loading, page, pageSize, totalCount, onPageChange, onDelete }) {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)

  const canManage = MANAGER_ROLES.includes(role)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const pageEnd = Math.min(page * pageSize, totalCount)

  function handleCardKeyDown(event, recordId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedId(recordId)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!records.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white text-center text-gray-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
        <span className="text-lg font-semibold text-gray-500 dark:text-slate-200">No records found</span>
        <p className="text-sm dark:text-slate-400">Try adjusting your filters or adding a new record.</p>
      </div>
    )
  }

  return (
      <>
      <div className="space-y-2 lg:hidden">
        {records.map(record => (
          <article key={record.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm [content-visibility:auto] dark:border-slate-800 dark:bg-slate-900">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(record.id)}
              onKeyDown={event => handleCardKeyDown(event, record.id)}
              className="space-y-3 p-3.5 text-left focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    {[record.atoll, record.island].filter(Boolean).join(' / ') || '-'}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {record.position || 'Unassigned position'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{record.requested_by || '-'}</p>
                </div>
                <StatusBadge value={record.status} />
              </div>

              <div className="flex flex-wrap gap-2">
                {record.recruitment_stage ? <StageBadge value={record.recruitment_stage} /> : null}
                {record.division ? (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {record.division}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <DetailItem label="Candidate" value={record.candidate_name} className="col-span-2" />
                <DetailItem label="Joined" value={formatDate(record.joined_date)} />
                <DetailItem label="Salary" value={formatCurrency(record.salary)} />
              </div>
            </div>

            {canManage && (
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-3.5 dark:border-slate-800">
                <button
                  onClick={() => navigate(`/records/${record.id}/edit`)}
                  className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-500/20 dark:text-brand-200 dark:hover:bg-brand-500/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-200 dark:hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
        <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-950/70">
            <tr>
              {['Atoll', 'Island', 'Requested By', 'Position', 'Division', 'Candidate', 'Status', 'Stage', 'Joined', 'Salary', canManage ? '' : null]
                .filter(Boolean)
                .map(column => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    {column}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {records.map(record => (
              <tr
                key={record.id}
                onClick={() => setSelectedId(record.id)}
                className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{record.atoll}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{record.island ?? '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{record.requested_by}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{record.position ?? '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{record.division ?? '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{record.candidate_name ?? '-'}</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge value={record.status} /></td>
                <td className="whitespace-nowrap px-4 py-3"><StageBadge value={record.recruitment_stage} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{formatDate(record.joined_date)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-slate-300">{formatCurrency(record.salary)}</td>
                {canManage && (
                  <td className="whitespace-nowrap px-4 py-3" onClick={event => event.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/records/${record.id}/edit`)}
                        className="rounded px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-500/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(record.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10"
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
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center sm:text-left">
            Showing {pageStart}-{pageEnd} of {totalCount}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800 sm:flex-none"
            >
              Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedId && (
        <Suspense fallback={null}>
          <RecordDetailModal recordId={selectedId} onClose={() => setSelectedId(null)} />
        </Suspense>
      )}
    </>
  )
}
