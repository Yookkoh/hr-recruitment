import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/formatters'
import { StageBadge, StatusBadge } from '../dashboard/StatusBadge'
import Toast from '../shared/Toast'

const VALID_STATUS = new Set(['Pending', 'Active', 'Rejected', 'Withdrawn', 'Completed'])
const VALID_STAGE = new Set(['Interview', 'Approval', 'Offer', 'Onboarding', 'Closed'])
const VALID_TYPE = new Set(['New', 'Replacement', 'Contract'])
const PREVIEW_COLS = ['atoll', 'requested_by', 'position', 'division', 'candidate_name', 'status', 'recruitment_stage', 'salary']
const DESKTOP_PREVIEW_LIMIT = 50
const MOBILE_PREVIEW_LIMIT = 20

const COL_MAP = {
  atoll: ['atoll'],
  island: ['island'],
  constituency: ['constituency'],
  requested_by: ['requested by', 'requestedby', 'requested_by'],
  requested_date: ['requested date', 'requesteddate', 'requested_date'],
  type: ['type'],
  position: ['position'],
  hired_location: ['hired location', 'hiredlocation', 'hired_location'],
  division: ['division'],
  candidate_name: ['candidate name', 'candidatename', 'candidate_name'],
  id_card: ['id card', 'idcard', 'id_card', 'id card no', 'national id'],
  candidate_contact: ['candidate contact', 'contact', 'phone', 'candidate_contact'],
  status: ['status'],
  recruitment_stage: ['recruitment stage', 'stage', 'recruitment_stage'],
  joined_date: ['joined date', 'joineddate', 'joined_date', 'join date'],
  remarks: ['remarks', 'notes', 'comment'],
  assigned_to: ['assigned to', 'assignedto', 'assigned_to'],
  salary: ['salary', 'salary (mvr)', 'pay'],
}

function resolveHeaders(rawHeaders) {
  const map = {}
  rawHeaders.forEach((header, index) => {
    if (!header) return
    const normalized = String(header).trim().toLowerCase()
    for (const [field, aliases] of Object.entries(COL_MAP)) {
      if (aliases.includes(normalized)) {
        map[field] = index
        break
      }
    }
  })
  return map
}

function parseExcelDate(value) {
  if (!value) return null
  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000))
    return date.toISOString().split('T')[0]
  }

  const stringValue = String(value).trim()
  if (!stringValue) return null

  const parts = stringValue.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const date = new Date(stringValue)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
}

function rowToRecord(row, headerMap) {
  function get(field) {
    const index = headerMap[field]
    return index !== undefined ? row[index] : undefined
  }

  function getString(field) {
    const value = get(field)
    return value !== undefined && value !== null && String(value).trim() !== '' ? String(value).trim() : null
  }

  const rawStatus = getString('status') || 'Pending'
  const rawStage = getString('recruitment_stage')
  const rawType = getString('type') || 'New'

  return {
    atoll: getString('atoll'),
    island: getString('island'),
    constituency: getString('constituency'),
    requested_by: getString('requested_by'),
    requested_date: parseExcelDate(get('requested_date')),
    type: VALID_TYPE.has(rawType) ? rawType : 'New',
    position: getString('position'),
    hired_location: getString('hired_location'),
    division: getString('division'),
    candidate_name: getString('candidate_name'),
    id_card: getString('id_card'),
    candidate_contact: getString('candidate_contact'),
    status: VALID_STATUS.has(rawStatus) ? rawStatus : 'Pending',
    recruitment_stage: rawStage && VALID_STAGE.has(rawStage) ? rawStage : null,
    joined_date: parseExcelDate(get('joined_date')),
    remarks: getString('remarks'),
    assigned_to: getString('assigned_to'),
    salary: get('salary') ? Number(get('salary')) || null : null,
  }
}

function PreviewField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{value || '-'}</p>
    </div>
  )
}

export default function BulkUploadPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState([])
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)
  const [done, setDone] = useState(false)

  async function handleFile(event) {
    const file = event.target.files[0]
    if (!file) return

    setFileName(file.name)
    setRows([])
    setErrors([])
    setDone(false)

    let read
    let utils
    try {
      const xlsx = await import('xlsx')
      read = xlsx.read
      utils = xlsx.utils
    } catch {
      setErrors(['Failed to load the Excel parser. Try refreshing the page.'])
      return
    }

    const buffer = await file.arrayBuffer()
    const workbook = read(buffer, { type: 'array', cellDates: false })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = utils.sheet_to_json(sheet, { header: 1, defval: null })

    if (rawRows.length < 2) {
      setErrors(['The file is empty or has no data rows.'])
      return
    }

    const headerRow = rawRows[0]
    const headerMap = resolveHeaders(headerRow)

    if (!headerMap.atoll && !headerMap.requested_by) {
      setErrors([
        'Could not detect the required columns (Atoll, Requested By).',
        `Found headers: ${headerRow.filter(Boolean).join(', ')}`,
      ])
      return
    }

    const nextErrors = []
    const parsedRows = []

    rawRows.slice(1).forEach((row, index) => {
      if (row.every(cell => cell === null || cell === '')) return

      const record = rowToRecord(row, headerMap)
      if (!record.atoll) nextErrors.push(`Row ${index + 2}: missing Atoll`)
      if (!record.requested_by) nextErrors.push(`Row ${index + 2}: missing Requested By`)
      parsedRows.push(record)
    })

    setErrors(nextErrors)
    setRows(parsedRows)
  }

  async function handleUpload() {
    const validRows = rows.filter(row => row.atoll && row.requested_by)
    if (!validRows.length) return

    setUploading(true)
    try {
      for (let index = 0; index < validRows.length; index += 100) {
        const batch = validRows.slice(index, index + 100)
        const { error } = await supabase.from('recruitment').insert(batch)
        if (error) throw new Error(error.message)
      }

      setDone(true)
      setToast({ message: `${validRows.length} records uploaded successfully.`, type: 'success' })
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setToast({ message: `Upload failed: ${err.message}`, type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const validCount = rows.filter(row => row.atoll && row.requested_by).length
  const invalidCount = rows.length - validCount
  const desktopRows = rows.slice(0, DESKTOP_PREVIEW_LIMIT)
  const mobileRows = rows.slice(0, MOBILE_PREVIEW_LIMIT)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            &lt; Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Bulk Upload Records</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Import a spreadsheet, review it on mobile, and upload clean rows in bulk.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFile}
        />
        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
          {fileName || 'Choose an Excel or CSV file to preview'}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Supported formats: .xlsx, .xls, .csv</p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-4 w-full rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors sm:w-auto"
        >
          Choose file
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        <p className="mb-1 font-semibold text-gray-700 dark:text-slate-200">Expected columns (flexible naming accepted):</p>
        <p>Atoll, Island, Constituency, Requested By, Requested Date, Type, Position, Hired Location, Division, Candidate Name, ID Card, Candidate Contact, Status, Recruitment Stage, Joined Date, Remarks, Assigned To, Salary</p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/12">
          <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-200">
            {errors.length} issue{errors.length !== 1 ? 's' : ''} found
          </p>
          <ul className="space-y-1 text-xs text-red-600 dark:text-red-200/90">
            {errors.slice(0, 10).map((error, index) => <li key={index}>- {error}</li>)}
            {errors.length > 10 && <li>... and {errors.length - 10} more</li>}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600 dark:text-slate-300">
              <span className="font-semibold text-green-700 dark:text-emerald-200">{validCount} valid</span>
              {invalidCount > 0 && (
                <span className="mt-1 block font-semibold text-red-600 dark:text-red-200 sm:ml-3 sm:mt-0 sm:inline">
                  {invalidCount} will be skipped because required fields are missing
                </span>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || validCount === 0 || done}
              className="w-full rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors sm:w-auto"
            >
              {uploading ? 'Uploading...' : done ? 'Done' : `Upload ${validCount} Records`}
            </button>
          </div>

          <div className="space-y-3 lg:hidden">
            {mobileRows.map((row, index) => {
              const isValid = row.atoll && row.requested_by
              return (
                <article key={`${row.id_card || row.candidate_name || 'row'}-${index}`} className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${isValid ? 'border-gray-200 dark:border-slate-800' : 'border-red-200 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/10'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{row.candidate_name || row.position || `Row ${index + 1}`}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{[row.atoll, row.requested_by].filter(Boolean).join(' / ') || 'Missing required fields'}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isValid ? 'bg-green-100 text-green-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200'}`}>
                      {isValid ? 'Valid' : 'Needs review'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.status ? <StatusBadge value={row.status} /> : null}
                    {row.recruitment_stage ? <StageBadge value={row.recruitment_stage} /> : null}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <PreviewField label="Position" value={row.position} />
                    <PreviewField label="Division" value={row.division} />
                    <PreviewField label="Salary" value={formatCurrency(row.salary)} />
                    <PreviewField label="Requested By" value={row.requested_by} />
                  </div>
                </article>
              )
            })}

            {rows.length > MOBILE_PREVIEW_LIMIT && (
              <p className="text-center text-xs text-gray-400 dark:text-slate-500">
                Showing first {MOBILE_PREVIEW_LIMIT} of {rows.length} rows on mobile
              </p>
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
            <table className="min-w-full divide-y divide-gray-100 text-xs dark:divide-slate-800">
              <thead className="bg-gray-50 dark:bg-slate-950/70">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 dark:text-slate-400">#</th>
                  {PREVIEW_COLS.map(column => (
                    <th key={column} className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                      {column.replace(/_/g, ' ')}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-gray-500 dark:text-slate-400">Valid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {desktopRows.map((row, index) => {
                  const isValid = row.atoll && row.requested_by
                  return (
                    <tr key={index} className={isValid ? '' : 'bg-red-50 dark:bg-red-500/10'}>
                      <td className="px-3 py-1.5 text-gray-400 dark:text-slate-500">{index + 1}</td>
                      {PREVIEW_COLS.map(column => (
                        <td key={column} className="whitespace-nowrap px-3 py-1.5 text-gray-700 dark:text-slate-300">
                          {row[column] ?? '-'}
                        </td>
                      ))}
                      <td className="px-3 py-1.5 text-gray-700 dark:text-slate-300">{isValid ? 'Yes' : 'No'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {rows.length > DESKTOP_PREVIEW_LIMIT && (
              <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 dark:border-slate-800 dark:text-slate-500">
                Showing first {DESKTOP_PREVIEW_LIMIT} of {rows.length} rows
              </p>
            )}
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
