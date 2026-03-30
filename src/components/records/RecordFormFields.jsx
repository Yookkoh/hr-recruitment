import { STATUS_OPTIONS, STAGE_OPTIONS, TYPE_OPTIONS } from '../../utils/constants'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

export default function RecordFormFields({ form, onChange }) {
  function set(field, value) {
    onChange({ ...form, [field]: value })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Atoll" required>
        <input className={inputCls} value={form.atoll ?? ''} onChange={e => set('atoll', e.target.value)} placeholder="e.g. HDH" />
      </Field>

      <Field label="Island">
        <input className={inputCls} value={form.island ?? ''} onChange={e => set('island', e.target.value)} />
      </Field>

      <Field label="Constituency">
        <input className={inputCls} value={form.constituency ?? ''} onChange={e => set('constituency', e.target.value)} />
      </Field>

      <Field label="Requested By" required>
        <input className={inputCls} value={form.requested_by ?? ''} onChange={e => set('requested_by', e.target.value)} />
      </Field>

      <Field label="Requested Date">
        <input type="date" className={inputCls} value={form.requested_date ?? ''} onChange={e => set('requested_date', e.target.value)} />
      </Field>

      <Field label="Type">
        <select className={inputCls} value={form.type ?? 'New'} onChange={e => set('type', e.target.value)}>
          {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Position">
        <input className={inputCls} value={form.position ?? ''} onChange={e => set('position', e.target.value)} />
      </Field>

      <Field label="Hired Location">
        <input className={inputCls} value={form.hired_location ?? ''} onChange={e => set('hired_location', e.target.value)} />
      </Field>

      <Field label="Division">
        <input className={inputCls} value={form.division ?? ''} onChange={e => set('division', e.target.value)} />
      </Field>

      <Field label="Candidate Name">
        <input className={inputCls} value={form.candidate_name ?? ''} onChange={e => set('candidate_name', e.target.value)} />
      </Field>

      <Field label="ID Card">
        <input className={inputCls} value={form.id_card ?? ''} onChange={e => set('id_card', e.target.value)} placeholder="e.g. A154545" />
      </Field>

      <Field label="Candidate Contact">
        <input className={inputCls} value={form.candidate_contact ?? ''} onChange={e => set('candidate_contact', e.target.value)} placeholder="Phone number" />
      </Field>

      <Field label="Status">
        <select className={inputCls} value={form.status ?? 'Pending'} onChange={e => set('status', e.target.value)}>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Recruitment Stage">
        <select className={inputCls} value={form.recruitment_stage ?? ''} onChange={e => set('recruitment_stage', e.target.value || null)}>
          <option value="">— Select —</option>
          {STAGE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Joined Date">
        <input type="date" className={inputCls} value={form.joined_date ?? ''} onChange={e => set('joined_date', e.target.value)} />
      </Field>

      <Field label="Assigned To">
        <input className={inputCls} value={form.assigned_to ?? ''} onChange={e => set('assigned_to', e.target.value)} />
      </Field>

      <Field label="Salary (MVR)">
        <input type="number" className={inputCls} value={form.salary ?? ''} onChange={e => set('salary', e.target.value ? Number(e.target.value) : null)} placeholder="0" />
      </Field>

      <Field label="Remarks">
        <textarea className={`${inputCls} resize-none`} rows={2} value={form.remarks ?? ''} onChange={e => set('remarks', e.target.value)} />
      </Field>
    </div>
  )
}
