import { forwardRef } from 'react'
import { formatDate, formatCurrency } from '../../utils/formatters'

const STATUS_COLORS = {
  Pending:   '#92400e',
  Active:    '#065f46',
  Rejected:  '#991b1b',
  Withdrawn: '#374151',
  Completed: '#1e40af',
}
const STATUS_BG = {
  Pending:   '#fef3c7',
  Active:    '#d1fae5',
  Rejected:  '#fee2e2',
  Withdrawn: '#f3f4f6',
  Completed: '#dbeafe',
}
const STAGE_COLORS = {
  Interview:  '#0c4a6e',
  Approval:   '#581c87',
  Offer:      '#7c2d12',
  Onboarding: '#134e4a',
  Closed:     '#374151',
}
const STAGE_BG = {
  Interview:  '#e0f2fe',
  Approval:   '#f3e8ff',
  Offer:      '#ffedd5',
  Onboarding: '#ccfbf1',
  Closed:     '#f3f4f6',
}

function Badge({ value, colorMap, bgMap }) {
  if (!value) return <span style={{ color: '#9ca3af' }}>—</span>
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 600,
      color: colorMap[value] ?? '#374151',
      backgroundColor: bgMap[value] ?? '#f3f4f6',
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  )
}

const ExportCard = forwardRef(function ExportCard({ records, filters }, ref) {
  const atollLabel     = filters.atoll       || 'All Atolls'
  const requesterLabel = filters.requestedBy || 'All Requesters'
  const today          = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div ref={ref} style={{ backgroundColor: '#fff', padding: 32, fontFamily: 'Arial, sans-serif', minWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #1d4ed8' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>ST</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Staff Tracker</span>
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Recruitment Report</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>
            <strong>Atoll:</strong> {atollLabel}
          </div>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
            <strong>Requested By:</strong> {requesterLabel}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Generated: {today}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{records.length} record{records.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ backgroundColor: '#1d4ed8' }}>
            {['Atoll','Island','Requested By','Position','Division','Candidate','ID Card','Contact','Status','Stage','Joined','Salary'].map(h => (
              <th key={h} style={{
                padding: '7px 8px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                fontSize: 10,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={12} style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                No records match the current filters.
              </td>
            </tr>
          ) : (
            records.map((row, i) => (
              <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: '#111827', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{row.atoll}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.island ?? '—'}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{row.requested_by}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.position ?? '—'}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{row.division ?? '—'}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.candidate_name ?? '—'}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{row.id_card ?? '—'}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{row.candidate_contact ?? '—'}</td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>
                  <Badge value={row.status} colorMap={STATUS_COLORS} bgMap={STATUS_BG} />
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>
                  <Badge value={row.recruitment_stage} colorMap={STAGE_COLORS} bgMap={STAGE_BG} />
                </td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{formatDate(row.joined_date)}</td>
                <td style={{ padding: '6px 8px', color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', textAlign: 'right' }}>{formatCurrency(row.salary)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>Confidential — For Internal Use Only</span>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>Staff Tracker · Recruitment Management System</span>
      </div>
    </div>
  )
})

export default ExportCard
