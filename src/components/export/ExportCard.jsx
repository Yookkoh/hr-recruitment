import { forwardRef } from 'react'
import { StatusBadge, StageBadge } from '../dashboard/StatusBadge'
import { formatDate, formatCurrency } from '../../utils/formatters'

const ExportCard = forwardRef(function ExportCard({ records, filters }, ref) {
  const atollLabel       = filters.atoll       || 'All Atolls'
  const requesterLabel   = filters.requestedBy || 'All Requesters'
  const today            = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div ref={ref} className="bg-white p-8 font-sans" style={{ minWidth: 900 }}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recruitment Progress Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            Atoll: <strong>{atollLabel}</strong> &nbsp;·&nbsp; Requested By: <strong>{requesterLabel}</strong>
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>Generated: {today}</p>
          <p>{records.length} record{records.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            {['Atoll','Island','Requested By','Position','Division','Candidate','ID Card','Contact','Status','Stage','Joined Date','Salary'].map(h => (
              <th key={h} className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={12} className="border border-gray-200 px-4 py-8 text-center text-gray-400">
                No records match the current filters.
              </td>
            </tr>
          ) : (
            records.map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-200 px-2 py-1.5 font-medium">{row.atoll}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.island ?? '—'}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.requested_by}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.position ?? '—'}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.division ?? '—'}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.candidate_name ?? '—'}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.id_card ?? '—'}</td>
                <td className="border border-gray-200 px-2 py-1.5">{row.candidate_contact ?? '—'}</td>
                <td className="border border-gray-200 px-2 py-1.5"><StatusBadge value={row.status} /></td>
                <td className="border border-gray-200 px-2 py-1.5"><StageBadge value={row.recruitment_stage} /></td>
                <td className="border border-gray-200 px-2 py-1.5">{formatDate(row.joined_date)}</td>
                <td className="border border-gray-200 px-2 py-1.5">{formatCurrency(row.salary)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="mt-6 text-center text-xs text-gray-400">Confidential — For Internal Use Only</p>
    </div>
  )
})

export default ExportCard
