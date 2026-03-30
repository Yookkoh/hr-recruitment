import { useFilterOptions } from '../../hooks/useRecruitment'

const SELECT_CLASS = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20'

export default function FilterBar({ filters, onChange }) {
  const { atolls, requestedBys } = useFilterOptions()
  const hasFilters = filters.atoll || filters.requestedBy || filters.status

  function handle(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="grid gap-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Atoll</label>
        <select
          value={filters.atoll ?? ''}
          onChange={event => handle('atoll', event.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">All Atolls</option>
          {atolls.map(atoll => <option key={atoll} value={atoll}>{atoll}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Requested By</label>
        <select
          value={filters.requestedBy ?? ''}
          onChange={event => handle('requestedBy', event.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">All Requesters</option>
          {requestedBys.map(requestedBy => <option key={requestedBy} value={requestedBy}>{requestedBy}</option>)}
        </select>
      </div>

      {filters.status && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">Status Filter</p>
          <p className="mt-1 text-sm font-medium text-brand-900 dark:text-brand-100">{filters.status}</p>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={() => onChange({ atoll: '', requestedBy: '', status: '' })}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
