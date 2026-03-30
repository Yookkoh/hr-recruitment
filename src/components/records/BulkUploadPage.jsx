import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Toast from '../shared/Toast'

const VALID_STATUS = new Set(['Pending', 'Active', 'Rejected', 'Withdrawn', 'Completed'])
const VALID_STAGE  = new Set(['Interview', 'Approval', 'Offer', 'Onboarding', 'Closed'])
const VALID_TYPE   = new Set(['New', 'Replacement', 'Contract'])

// Flexible column name mapping — handles variations in header spelling
const COL_MAP = {
  atoll:             ['atoll'],
  island:            ['island'],
  constituency:      ['constituency'],
  requested_by:      ['requested by', 'requestedby', 'requested_by'],
  requested_date:    ['requested date', 'requesteddate', 'requested_date'],
  type:              ['type'],
  position:          ['position'],
  hired_location:    ['hired location', 'hiredlocation', 'hired_location'],
  division:          ['division'],
  candidate_name:    ['candidate name', 'candidatename', 'candidate_name'],
  id_card:           ['id card', 'idcard', 'id_card', 'id card no', 'national id'],
  candidate_contact: ['candidate contact', 'contact', 'phone', 'candidate_contact'],
  status:            ['status'],
  recruitment_stage: ['recruitment stage', 'stage', 'recruitment_stage'],
  joined_date:       ['joined date', 'joineddate', 'joined_date', 'join date'],
  remarks:           ['remarks', 'notes', 'comment'],
  assigned_to:       ['assigned to', 'assignedto', 'assigned_to'],
  salary:            ['salary', 'salary (mvr)', 'pay'],
}

function resolveHeaders(rawHeaders) {
  const map = {}
  rawHeaders.forEach((h, i) => {
    if (!h) return
    const norm = String(h).trim().toLowerCase()
    for (const [field, aliases] of Object.entries(COL_MAP)) {
      if (aliases.includes(norm)) { map[field] = i; break }
    }
  })
  return map
}

function parseExcelDate(val) {
  if (!val) return null
  if (typeof val === 'number') {
    // Excel serial date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000))
    return date.toISOString().split('T')[0]
  }
  const s = String(val).trim()
  if (!s) return null
  // Try DD/MM/YYYY
  const parts = s.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }
  // ISO or other
  const d = new Date(s)
  return isNaN(d) ? null : d.toISOString().split('T')[0]
}

function rowToRecord(row, headerMap) {
  function get(field) {
    const idx = headerMap[field]
    return idx !== undefined ? row[idx] : undefined
  }
  function str(field) {
    const v = get(field)
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v).trim() : null
  }

  const rawStatus = str('status') || 'Pending'
  const rawStage  = str('recruitment_stage')
  const rawType   = str('type') || 'New'

  return {
    atoll:             str('atoll'),
    island:            str('island'),
    constituency:      str('constituency'),
    requested_by:      str('requested_by'),
    requested_date:    parseExcelDate(get('requested_date')),
    type:              VALID_TYPE.has(rawType) ? rawType : 'New',
    position:          str('position'),
    hired_location:    str('hired_location'),
    division:          str('division'),
    candidate_name:    str('candidate_name'),
    id_card:           str('id_card'),
    candidate_contact: str('candidate_contact'),
    status:            VALID_STATUS.has(rawStatus) ? rawStatus : 'Pending',
    recruitment_stage: rawStage && VALID_STAGE.has(rawStage) ? rawStage : null,
    joined_date:       parseExcelDate(get('joined_date')),
    remarks:           str('remarks'),
    assigned_to:       str('assigned_to'),
    salary:            get('salary') ? Number(get('salary')) || null : null,
  }
}

const PREVIEW_COLS = ['atoll','requested_by','position','division','candidate_name','status','recruitment_stage','salary']

export default function BulkUploadPage() {
  const navigate  = useNavigate()
  const fileRef   = useRef()
  const [rows, setRows]         = useState([])
  const [errors, setErrors]     = useState([])
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast]       = useState(null)
  const [done, setDone]         = useState(false)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setRows([])
    setErrors([])
    setDone(false)

    let read, utils
    try {
      const xlsx = await import('xlsx')
      read  = xlsx.read
      utils = xlsx.utils
    } catch {
      setErrors(['Failed to load Excel parser. Try refreshing the page.'])
      return
    }
    const buf   = await file.arrayBuffer()
    const wb    = read(buf, { type: 'array', cellDates: false })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const raw   = utils.sheet_to_json(sheet, { header: 1, defval: null })

    if (raw.length < 2) {
      setErrors(['File is empty or has no data rows.'])
      return
    }

    const headerRow = raw[0]
    const headerMap = resolveHeaders(headerRow)

    if (!headerMap.atoll && !headerMap.requested_by) {
      setErrors([
        'Could not detect required columns (Atoll, Requested By).',
        `Found headers: ${headerRow.filter(Boolean).join(', ')}`,
      ])
      return
    }

    const errs = []
    const parsed = []
    raw.slice(1).forEach((row, i) => {
      if (row.every(c => c === null || c === '')) return // skip blank rows
      const rec = rowToRecord(row, headerMap)
      if (!rec.atoll)        errs.push(`Row ${i + 2}: missing Atoll`)
      if (!rec.requested_by) errs.push(`Row ${i + 2}: missing Requested By`)
      parsed.push(rec)
    })

    setErrors(errs)
    setRows(parsed)
  }

  async function handleUpload() {
    const validRows = rows.filter(r => r.atoll && r.requested_by)
    if (!validRows.length) return

    setUploading(true)
    try {
      // Insert in batches of 100
      for (let i = 0; i < validRows.length; i += 100) {
        const batch = validRows.slice(i, i + 100)
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

  const validCount   = rows.filter(r => r.atoll && r.requested_by).length
  const invalidCount = rows.length - validCount

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Bulk Upload Records</h1>
      </div>

      {/* Upload zone */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center transition-colors hover:border-brand-400">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFile}
        />
        <div className="text-4xl mb-3">📂</div>
        <p className="text-sm font-medium text-gray-700">
          {fileName || 'Drop your Excel or CSV file here'}
        </p>
        <p className="mt-1 text-xs text-gray-400">Supports .xlsx, .xls, .csv</p>
        <button
          onClick={() => fileRef.current.click()}
          className="mt-4 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Choose File
        </button>
      </div>

      {/* Column mapping hint */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Expected columns (flexible naming accepted):</p>
        <p>Atoll · Island · Constituency · Requested By · Requested Date · Type · Position · Hired Location · Division · Candidate Name · ID Card · Candidate Contact · Status · Recruitment Stage · Joined Date · Remarks · Assigned To · Salary</p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">⚠️ {errors.length} issue{errors.length !== 1 ? 's' : ''} found</p>
          <ul className="space-y-0.5 text-xs text-red-600">
            {errors.slice(0, 10).map((e, i) => <li key={i}>• {e}</li>)}
            {errors.length > 10 && <li>… and {errors.length - 10} more</li>}
          </ul>
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-green-700">{validCount} valid</span>
              {invalidCount > 0 && <span className="ml-3 font-semibold text-red-600">{invalidCount} will be skipped (missing required fields)</span>}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || validCount === 0 || done}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : done ? 'Done ✓' : `Upload ${validCount} Records`}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500">#</th>
                  {PREVIEW_COLS.map(c => (
                    <th key={c} className="px-3 py-2 text-left font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                      {c.replace(/_/g, ' ')}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-gray-500">Valid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 50).map((row, i) => {
                  const isValid = row.atoll && row.requested_by
                  return (
                    <tr key={i} className={isValid ? '' : 'bg-red-50'}>
                      <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                      {PREVIEW_COLS.map(c => (
                        <td key={c} className="px-3 py-1.5 text-gray-700 whitespace-nowrap">
                          {row[c] ?? <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                      <td className="px-3 py-1.5">
                        {isValid
                          ? <span className="text-green-600">✓</span>
                          : <span className="text-red-500">✗</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {rows.length > 50 && (
              <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                Showing first 50 of {rows.length} rows
              </p>
            )}
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
