import { useEffect, useState } from 'react'
import { useRecruitment } from '../../hooks/useRecruitment'
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters'
import Modal from '../shared/Modal'
import Spinner from '../shared/Spinner'
import { StageBadge, StatusBadge } from './StatusBadge'

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 dark:text-slate-100">{value ?? '-'}</dd>
    </div>
  )
}

export default function RecordDetailModal({ recordId, onClose }) {
  const { getById } = useRecruitment({}, { enabled: false })
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadRecord() {
      setLoading(true)
      setError(null)

      try {
        const nextRecord = await getById(recordId)
        if (active) setRecord(nextRecord)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadRecord()

    return () => {
      active = false
    }
  }, [getById, recordId])

  return (
    <Modal open={!!recordId} onClose={onClose} title="Recruitment Record" size="lg">
      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-8 w-8 border-4" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/12 dark:text-red-200">{error}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Row label="Atoll" value={record?.atoll} />
          <Row label="Island" value={record?.island} />
          <Row label="Constituency" value={record?.constituency} />
          <Row label="Requested By" value={record?.requested_by} />
          <Row label="Requested Date" value={formatDate(record?.requested_date)} />
          <Row label="Type" value={record?.type} />
          <Row label="Position" value={record?.position} />
          <Row label="Hired Location" value={record?.hired_location} />
          <Row label="Division" value={record?.division} />
          <Row label="Candidate Name" value={record?.candidate_name} />
          <Row label="ID Card" value={record?.id_card} />
          <Row label="Contact" value={formatPhone(record?.candidate_contact)} />
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-slate-400">Status</dt>
            <dd className="mt-0.5"><StatusBadge value={record?.status} /></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 dark:text-slate-400">Stage</dt>
            <dd className="mt-0.5"><StageBadge value={record?.recruitment_stage} /></dd>
          </div>
          <Row label="Joined Date" value={formatDate(record?.joined_date)} />
          <Row label="Assigned To" value={record?.assigned_to} />
          <Row label="Salary" value={formatCurrency(record?.salary)} />
          {record?.remarks && (
            <div className="col-span-full">
              <dt className="text-xs font-medium text-gray-500 dark:text-slate-400">Remarks</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-slate-100">{record.remarks}</dd>
            </div>
          )}
        </dl>
      )}
    </Modal>
  )
}
