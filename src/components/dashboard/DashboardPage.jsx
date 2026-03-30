import { lazy, Suspense, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboardRecruitment } from '../../hooks/useRecruitment'
import Toast from '../shared/Toast'
import FilterBar from './FilterBar'
import RecordsTable from './RecordsTable'
import StatusSummary from './StatusSummary'

const ShareModal = lazy(() => import('../shared/ShareModal'))

const PAGE_SIZE = 25

function SparkIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12v4.25A2.75 2.75 0 0 0 9.75 19h4.5A2.75 2.75 0 0 0 17 16.25V12" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m12 15 0-10" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m8 8 4-4 4 4" />
    </svg>
  )
}

export default function DashboardPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ atoll: '', requestedBy: '', status: '' })
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const {
    records,
    counts: statusCounts,
    totalCount,
    summaryTotalCount,
    loading,
    error,
    remove,
    refetch,
  } = useDashboardRecruitment(filters, {
    page,
    pageSize: PAGE_SIZE,
  })

  const activeFilters = [
    filters.atoll ? `Atoll: ${filters.atoll}` : null,
    filters.requestedBy ? `Requested by: ${filters.requestedBy}` : null,
    filters.status ? `Status: ${filters.status}` : null,
  ].filter(Boolean)
  const hasFilters = activeFilters.length > 0
  const mobileFilterSummary = hasFilters
    ? `${activeFilters.length} filter${activeFilters.length === 1 ? '' : 's'} active`
    : 'All records'

  function handleFiltersChange(nextFilters) {
    startTransition(() => {
      setFilters(nextFilters)
      setPage(1)
    })
  }

  function handlePageChange(nextPage) {
    startTransition(() => {
      setPage(nextPage)
    })
  }

  function handleStatusSelect(status) {
    startTransition(() => {
      setFilters(current => ({ ...current, status }))
      setPage(1)
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record? This cannot be undone.')) return

    try {
      await remove(id)

      if (records.length === 1 && page > 1) handlePageChange(page - 1)
      else await refetch()

      setToast({ message: 'Record deleted.', type: 'success' })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-56px_rgba(2,6,23,0.96)] sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-500/15 dark:text-brand-200 sm:px-3 sm:text-[11px] sm:tracking-[0.22em]">
              <SparkIcon />
              Operations Board
            </div>
            <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:mt-4 sm:text-4xl">Staff Records</h1>
            <p className="mt-2 hidden text-sm leading-6 text-slate-600 dark:text-slate-300 sm:block sm:text-base">
              Track openings, candidate movement, and hiring outcomes across all atolls from one calm workspace.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                {totalCount} total records
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:hidden">
                {mobileFilterSummary}
              </span>
              {activeFilters.length > 0 ? activeFilters.map(filter => (
                <span key={filter} className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                  {filter}
                </span>
              )) : (
                <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                  All atolls and requesters
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
            {['recruiter', 'admin'].includes(role) && (
              <button
                onClick={() => navigate('/records/new')}
                className="hidden items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_45px_-28px_rgba(15,23,42,0.9)] hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white sm:inline-flex"
              >
                <PlusIcon />
                Add Record
              </button>
            )}
            <button
              onClick={() => setShareOpen(true)}
              disabled={loading || totalCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ShareIcon />
              Share Report
            </button>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(open => !open)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:hidden"
            >
              {mobileFiltersOpen ? 'Hide Filters' : hasFilters ? `Filters (${activeFilters.length})` : 'Show Filters'}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-56px_rgba(2,6,23,0.96)] sm:p-6">
          <StatusSummary
            counts={statusCounts}
            totalCount={summaryTotalCount}
            loading={loading}
            error={error}
            activeStatus={filters.status}
            onStatusSelect={handleStatusSelect}
          />
        </div>

        <section className={`rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-56px_rgba(2,6,23,0.96)] sm:p-6 ${mobileFiltersOpen || hasFilters ? 'block' : 'hidden'} xl:block`}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Refine View</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Focus the board by atoll or requester and the counts will follow.</p>
          <div className="mt-5">
            <FilterBar filters={filters} onChange={handleFiltersChange} />
          </div>
        </section>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/12 dark:text-red-200">{error}</p>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Records List</h2>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">Open a record for full details, or edit and delete directly from the list.</p>
        </div>

        <RecordsTable
          records={records}
          loading={loading || isPending}
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      </section>

      {shareOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
              <div className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                Preparing share tools...
              </div>
            </div>
          }
        >
          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            filters={filters}
            recordCount={totalCount}
          />
        </Suspense>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
