import { STATUS_OPTIONS } from '../../utils/constants'

const SUMMARY_STATUSES = [...STATUS_OPTIONS, 'Unspecified']

const SUMMARY_META = {
  Total: {
    panel: 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
    iconWrap: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9h8M8 14h5" />
      </svg>
    ),
  },
  Pending: {
    panel: 'border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-100',
    iconWrap: 'bg-amber-100 text-amber-700 dark:bg-amber-500/18 dark:text-amber-200',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  Active: {
    panel: 'border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-100',
    iconWrap: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-200',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m7 12.5 3.2 3.2L17.5 8.5" />
      </svg>
    ),
  },
  Rejected: {
    panel: 'border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-500/22 dark:bg-rose-500/12 dark:text-rose-100',
    iconWrap: 'bg-rose-100 text-rose-700 dark:bg-rose-500/18 dark:text-rose-200',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 8l8 8M16 8l-8 8" />
      </svg>
    ),
  },
  Withdrawn: {
    panel: 'border-slate-200 bg-slate-100/80 text-slate-900 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100',
    iconWrap: 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 12h12" />
      </svg>
    ),
  },
  Completed: {
    panel: 'border-sky-200 bg-sky-50/90 text-sky-950 dark:border-sky-500/22 dark:bg-sky-500/12 dark:text-sky-100',
    iconWrap: 'bg-sky-100 text-sky-700 dark:bg-sky-500/18 dark:text-sky-200',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12.5 9.2 17 19 7.5" />
      </svg>
    ),
  },
  Unspecified: {
    panel: 'border-slate-200 bg-slate-50/90 text-slate-900 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100',
    iconWrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16v.01" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      </svg>
    ),
  },
}

function SummaryCard({ label, value, loading, selected, onClick }) {
  const meta = SUMMARY_META[label] ?? SUMMARY_META.Total

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-[24px] border p-4 text-left shadow-[0_22px_50px_-36px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-40px_rgba(15,23,42,0.4)] dark:shadow-[0_28px_60px_-42px_rgba(2,6,23,0.95)] sm:p-5 ${meta.panel} ${selected ? 'ring-2 ring-slate-950 ring-offset-2 dark:ring-slate-200 dark:ring-offset-slate-950' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-75">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight">
            {loading ? '...' : value}
          </p>
          <p className="mt-2 text-xs font-medium opacity-70">
            {label === 'Total'
              ? (selected ? 'Showing all records' : 'Click to clear the status filter')
              : (selected ? 'Active filter' : 'Click to filter the records list')}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${meta.iconWrap}`}>
          {meta.icon}
        </div>
      </div>
    </button>
  )
}

function SummaryCardCompact({ label, value, loading, selected, onClick, className = '' }) {
  const meta = SUMMARY_META[label] ?? SUMMARY_META.Total

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-w-0 rounded-[22px] border px-4 py-3 text-left shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] transition-all dark:shadow-[0_24px_48px_-34px_rgba(2,6,23,0.95)] ${meta.panel} ${selected ? 'ring-2 ring-slate-950 ring-offset-2 dark:ring-slate-200 dark:ring-offset-slate-950' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-2xl ${meta.iconWrap}`}>
          {meta.icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight">
        {loading ? '...' : value}
      </p>
    </button>
  )
}

export default function StatusSummary({ counts, totalCount, loading, error, activeStatus, onStatusSelect }) {
  const visibleStatuses = SUMMARY_STATUSES.filter(status => status !== 'Unspecified' || (counts.Unspecified ?? 0) > 0)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Status Overview</h2>
        <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">Live counts update with your current dashboard filters.</p>
      </div>

      {error && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-200">
          Status summary could not be loaded. The records list is still available.
        </p>
      )}

      <div className="space-y-3 sm:hidden">
        <SummaryCardCompact
          label="Total"
          value={totalCount}
          loading={loading}
          selected={!activeStatus}
          onClick={() => onStatusSelect('')}
          className="w-full"
        />

        <div className="grid grid-cols-2 gap-3">
          {visibleStatuses.map(status => (
            <SummaryCardCompact
              key={status}
              label={status}
              value={counts[status] ?? 0}
              loading={loading}
              selected={activeStatus === status}
              onClick={() => onStatusSelect(activeStatus === status ? '' : status)}
            />
          ))}
        </div>

        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Tap a status card to filter the records list. Tap the active card again to clear it.
        </p>
      </div>

      <div className="hidden sm:grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <SummaryCard
          label="Total"
          value={totalCount}
          loading={loading}
          selected={!activeStatus}
          onClick={() => onStatusSelect('')}
        />
        {visibleStatuses.map(status => (
          <SummaryCard
            key={status}
            label={status}
            value={counts[status] ?? 0}
            loading={loading}
            selected={activeStatus === status}
            onClick={() => onStatusSelect(activeStatus === status ? '' : status)}
          />
        ))}
      </div>
    </section>
  )
}
