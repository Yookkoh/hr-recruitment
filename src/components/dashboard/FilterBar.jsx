import { useFilterOptions } from '../../hooks/useRecruitment'

export default function FilterBar({ filters, onChange }) {
  const { atolls, requestedBys } = useFilterOptions()

  function handle(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[160px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Atoll</label>
        <select
          value={filters.atoll ?? ''}
          onChange={e => handle('atoll', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Atolls</option>
          {atolls.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="min-w-[160px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Requested By</label>
        <select
          value={filters.requestedBy ?? ''}
          onChange={e => handle('requestedBy', e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Requesters</option>
          {requestedBys.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {(filters.atoll || filters.requestedBy) && (
        <button
          onClick={() => onChange({ atoll: '', requestedBy: '' })}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
