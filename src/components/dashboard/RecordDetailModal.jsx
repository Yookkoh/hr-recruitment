import Modal from '../shared/Modal'
import { StatusBadge, StageBadge } from './StatusBadge'
import { formatDate, formatCurrency, formatPhone } from '../../utils/formatters'

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  )
}

export default function RecordDetailModal({ record, onClose }) {
  if (!record) return null

  return (
    <Modal open={!!record} onClose={onClose} title="Recruitment Record" size="lg">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Row label="Atoll"            value={record.atoll} />
        <Row label="Island"           value={record.island} />
        <Row label="Constituency"     value={record.constituency} />
        <Row label="Requested By"     value={record.requested_by} />
        <Row label="Requested Date"   value={formatDate(record.requested_date)} />
        <Row label="Type"             value={record.type} />
        <Row label="Position"         value={record.position} />
        <Row label="Hired Location"   value={record.hired_location} />
        <Row label="Division"         value={record.division} />
        <Row label="Candidate Name"   value={record.candidate_name} />
        <Row label="ID Card"          value={record.id_card} />
        <Row label="Contact"          value={formatPhone(record.candidate_contact)} />
        <div>
          <dt className="text-xs font-medium text-gray-500">Status</dt>
          <dd className="mt-0.5"><StatusBadge value={record.status} /></dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500">Stage</dt>
          <dd className="mt-0.5"><StageBadge value={record.recruitment_stage} /></dd>
        </div>
        <Row label="Joined Date"      value={formatDate(record.joined_date)} />
        <Row label="Assigned To"      value={record.assigned_to} />
        <Row label="Salary"           value={formatCurrency(record.salary)} />
        {record.remarks && (
          <div className="col-span-full">
            <dt className="text-xs font-medium text-gray-500">Remarks</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{record.remarks}</dd>
          </div>
        )}
      </dl>
    </Modal>
  )
}
