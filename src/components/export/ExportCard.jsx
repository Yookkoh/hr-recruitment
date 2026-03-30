import { forwardRef } from 'react'
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters'

const PLACEHOLDER = '-'

const STATUS_COLORS = {
  Pending: '#92400e',
  Active: '#065f46',
  Rejected: '#991b1b',
  Withdrawn: '#374151',
  Completed: '#1e40af',
}

const STATUS_BG = {
  Pending: '#fef3c7',
  Active: '#d1fae5',
  Rejected: '#fee2e2',
  Withdrawn: '#f3f4f6',
  Completed: '#dbeafe',
}

const STAGE_COLORS = {
  Interview: '#0c4a6e',
  Approval: '#581c87',
  Offer: '#7c2d12',
  Onboarding: '#134e4a',
  Closed: '#374151',
}

const STAGE_BG = {
  Interview: '#e0f2fe',
  Approval: '#f3e8ff',
  Offer: '#ffedd5',
  Onboarding: '#ccfbf1',
  Closed: '#f3f4f6',
}

const COLUMN_CONFIG = [
  { key: 'atoll', label: 'Atoll', width: '7%' },
  { key: 'location', label: 'Island / Division', width: '13%' },
  { key: 'requestedBy', label: 'Requested By', width: '12%' },
  { key: 'position', label: 'Position / Type', width: '16%' },
  { key: 'candidate', label: 'Candidate Details', width: '19%' },
  { key: 'status', label: 'Status', width: '10%' },
  { key: 'stage', label: 'Stage', width: '9%' },
  { key: 'joined', label: 'Joined', width: '6%' },
  { key: 'salary', label: 'Salary', width: '8%' },
]

let measurementCanvas = null

function measureTextWidth(text, fontSize, fontWeight = 700) {
  if (typeof document === 'undefined') {
    return text.length * fontSize * 0.62
  }

  if (!measurementCanvas) {
    measurementCanvas = document.createElement('canvas')
  }

  const context = measurementCanvas.getContext('2d')
  if (!context) return text.length * fontSize * 0.62

  context.font = `${fontWeight} ${fontSize}px Arial`
  return context.measureText(text).width
}

function Badge({ value, colorMap, bgMap }) {
  if (!value) return <span style={{ color: '#94a3b8' }}>{PLACEHOLDER}</span>

  const width = Math.max(52, Math.ceil(measureTextWidth(String(value), 10, 700) + 22))
  const height = 24

  return (
    <span style={{ display: 'inline-block', verticalAlign: 'top' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx={height / 2} fill={bgMap[value] ?? '#f3f4f6'} />
        <text
          x="50%"
          y="50%"
          fill={colorMap[value] ?? '#374151'}
          fontFamily="Arial, sans-serif"
          fontSize="10"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {value}
        </text>
      </svg>
    </span>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dbe3f0',
        borderRadius: 14,
        padding: '12px 14px',
      }}
    >
      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ color: '#0f172a', fontSize: 24, fontWeight: 700, marginTop: 6 }}>
        {value}
      </div>
    </div>
  )
}

function MetaChip({ label, value }) {
  const displayValue = value || PLACEHOLDER
  const text = `${label}: ${displayValue}`
  const width = Math.max(90, Math.ceil(measureTextWidth(text, 11, 600) + 26))
  const height = 30

  return (
    <span style={{ display: 'inline-block', verticalAlign: 'top' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width={width - 1} height={height - 1} rx={height / 2} fill="#eef4ff" stroke="#cfe0ff" />
        <text
          x="50%"
          y="50%"
          fontFamily="Arial, sans-serif"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <tspan fill="#475569" fontWeight="700">{label}:</tspan>
          <tspan fill="#1e3a8a"> {displayValue}</tspan>
        </text>
      </svg>
    </span>
  )
}

function PrimaryText({ children, compact = false, align = 'left' }) {
  return (
    <div
      style={{
        color: '#0f172a',
        fontSize: compact ? 11 : 11.5,
        fontWeight: 700,
        lineHeight: 1.35,
        textAlign: align,
        whiteSpace: compact ? 'nowrap' : 'normal',
      }}
    >
      {children || PLACEHOLDER}
    </div>
  )
}

function SecondaryText({ children, align = 'left' }) {
  return (
    <div
      style={{
        color: '#64748b',
        fontSize: 10,
        fontWeight: 500,
        lineHeight: 1.45,
        marginTop: 3,
        overflowWrap: 'anywhere',
        textAlign: align,
      }}
    >
      {children || PLACEHOLDER}
    </div>
  )
}

function Cell({ children, align = 'left' }) {
  return (
    <td
      style={{
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 10px',
        textAlign: align,
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  )
}

function buildSummary(records) {
  const summary = {
    total: records.length,
    active: 0,
    pending: 0,
    completed: 0,
  }

  for (const record of records) {
    if (record.status === 'Active') summary.active += 1
    if (record.status === 'Pending') summary.pending += 1
    if (record.status === 'Completed') summary.completed += 1
  }

  return summary
}

const ExportCard = forwardRef(function ExportCard({ records, filters }, ref) {
  const atollLabel = filters.atoll || 'All Atolls'
  const requesterLabel = filters.requestedBy || 'All Requesters'
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const summary = buildSummary(records)

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#f8fafc',
        boxSizing: 'border-box',
        colorScheme: 'light',
        fontFamily: 'Arial, sans-serif',
        padding: 24,
        width: 1280,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dbe3f0',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%)',
            color: '#ffffff',
            padding: '28px 30px 22px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: 12,
                    display: 'flex',
                    fontSize: 12,
                    fontWeight: 700,
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  }}
                >
                  ST
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>Staff Tracker</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.78)', fontSize: 13, marginTop: 2 }}>
                    Recruitment Progress Report
                  </div>
                </div>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: 12 }}>
                Built for clean image and PDF exports with grouped columns for easier reading.
              </div>
            </div>

            <div style={{ minWidth: 220, textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Generated</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14, marginTop: 4 }}>{today}</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 12, marginTop: 10 }}>
                {records.length} record{records.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            padding: '18px 24px',
          }}
        >
          <SummaryCard label="Total Records" value={summary.total} />
          <SummaryCard label="Active" value={summary.active} />
          <SummaryCard label="Pending" value={summary.pending} />
          <SummaryCard label="Completed" value={summary.completed} />
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
            <MetaChip label="Atoll" value={atollLabel} />
            <MetaChip label="Requested By" value={requesterLabel} />
            <MetaChip label="Export Format" value="Image / PDF Ready" />
          </div>

          <div
            style={{
              border: '1px solid #dbe3f0',
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                width: '100%',
              }}
            >
              <colgroup>
                {COLUMN_CONFIG.map(column => (
                  <col key={column.key} style={{ width: column.width }} />
                ))}
              </colgroup>

              <thead>
                <tr style={{ backgroundColor: '#eaf2ff' }}>
                  {COLUMN_CONFIG.map(column => (
                    <th
                      key={column.key}
                      style={{
                        borderBottom: '1px solid #d0def6',
                        color: '#1e3a8a',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '11px 10px',
                        textAlign: 'left',
                        textTransform: 'uppercase',
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMN_CONFIG.length}
                      style={{
                        color: '#94a3b8',
                        fontSize: 13,
                        padding: '36px 16px',
                        textAlign: 'center',
                      }}
                    >
                      No records match the current filters.
                    </td>
                  </tr>
                ) : (
                  records.map((row, index) => (
                    <tr key={row.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fbff' }}>
                      <Cell>
                        <PrimaryText compact>{row.atoll || PLACEHOLDER}</PrimaryText>
                      </Cell>

                      <Cell>
                        <PrimaryText>{row.island || PLACEHOLDER}</PrimaryText>
                        <SecondaryText>{row.division || 'No division listed'}</SecondaryText>
                      </Cell>

                      <Cell>
                        <PrimaryText>{row.requested_by || PLACEHOLDER}</PrimaryText>
                        <SecondaryText>Requested: {formatDate(row.requested_date)}</SecondaryText>
                      </Cell>

                      <Cell>
                        <PrimaryText>{row.position || PLACEHOLDER}</PrimaryText>
                        <SecondaryText>Type: {row.type || PLACEHOLDER}</SecondaryText>
                      </Cell>

                      <Cell>
                        <PrimaryText>{row.candidate_name || PLACEHOLDER}</PrimaryText>
                        <SecondaryText>ID: {row.id_card || PLACEHOLDER}</SecondaryText>
                        <SecondaryText>Contact: {formatPhone(row.candidate_contact)}</SecondaryText>
                      </Cell>

                      <Cell>
                        <Badge value={row.status} colorMap={STATUS_COLORS} bgMap={STATUS_BG} />
                      </Cell>

                      <Cell>
                        <Badge value={row.recruitment_stage} colorMap={STAGE_COLORS} bgMap={STAGE_BG} />
                      </Cell>

                      <Cell>
                        <PrimaryText compact>{formatDate(row.joined_date)}</PrimaryText>
                      </Cell>

                      <Cell align="right">
                        <PrimaryText align="right" compact>{formatCurrency(row.salary)}</PrimaryText>
                      </Cell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            color: '#94a3b8',
            display: 'flex',
            fontSize: 10,
            justifyContent: 'space-between',
            padding: '14px 24px 18px',
          }}
        >
          <span>Confidential - For internal use only</span>
          <span>Staff Tracker - Recruitment Management System</span>
        </div>
      </div>
    </div>
  )
})

export default ExportCard
