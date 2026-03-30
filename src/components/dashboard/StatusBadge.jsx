import { STATUS_COLORS, STAGE_COLORS } from '../../utils/constants'

export function StatusBadge({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  const cls = STATUS_COLORS[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  )
}

export function StageBadge({ value }) {
  if (!value) return <span className="text-gray-400">—</span>
  const cls = STAGE_COLORS[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  )
}
