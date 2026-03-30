import { STAGE_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from '../../utils/constants'

const INPUT_CLASS = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-500/20'

function Field({ label, required, hint, className = '', children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

function Section({ title, description, icon, children }) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-900/70 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm dark:bg-slate-950 dark:text-brand-200">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function RequestIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75A2.75 2.75 0 0 1 6.75 4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9h8M8 14h5" />
    </svg>
  )
}

function CandidateIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 20a7 7 0 1 1 14 0" />
    </svg>
  )
}

function ProgressIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 18h14" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 14.5 10.5 11l2.5 2.5L17 9.5" />
    </svg>
  )
}

export default function RecordFormFields({ form, onChange }) {
  function set(field, value) {
    onChange({ ...form, [field]: value })
  }

  return (
    <div className="space-y-4">
      <Section
        title="Request Details"
        description="Capture where the request came from, what role is needed, and the location it supports."
        icon={<RequestIcon />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Atoll" required>
            <input className={INPUT_CLASS} value={form.atoll ?? ''} onChange={event => set('atoll', event.target.value)} placeholder="e.g. HDH" />
          </Field>

          <Field label="Island">
            <input className={INPUT_CLASS} value={form.island ?? ''} onChange={event => set('island', event.target.value)} placeholder="Island name" />
          </Field>

          <Field label="Constituency">
            <input className={INPUT_CLASS} value={form.constituency ?? ''} onChange={event => set('constituency', event.target.value)} placeholder="Constituency" />
          </Field>

          <Field label="Requested By" required>
            <input className={INPUT_CLASS} value={form.requested_by ?? ''} onChange={event => set('requested_by', event.target.value)} placeholder="Team or requester" />
          </Field>

          <Field label="Requested Date">
            <input type="date" className={INPUT_CLASS} value={form.requested_date ?? ''} onChange={event => set('requested_date', event.target.value)} />
          </Field>

          <Field label="Type">
            <select className={INPUT_CLASS} value={form.type ?? 'New'} onChange={event => set('type', event.target.value)}>
              {TYPE_OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>
          </Field>

          <Field label="Position">
            <input className={INPUT_CLASS} value={form.position ?? ''} onChange={event => set('position', event.target.value)} placeholder="Role title" />
          </Field>

          <Field label="Hired Location">
            <input className={INPUT_CLASS} value={form.hired_location ?? ''} onChange={event => set('hired_location', event.target.value)} placeholder="Work location" />
          </Field>

          <Field label="Division">
            <input className={INPUT_CLASS} value={form.division ?? ''} onChange={event => set('division', event.target.value)} placeholder="Division or department" />
          </Field>
        </div>
      </Section>

      <Section
        title="Candidate Details"
        description="Add the candidate information you need for review, contact, and identification."
        icon={<CandidateIcon />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Candidate Name">
            <input className={INPUT_CLASS} value={form.candidate_name ?? ''} onChange={event => set('candidate_name', event.target.value)} placeholder="Full name" />
          </Field>

          <Field label="ID Card">
            <input className={INPUT_CLASS} value={form.id_card ?? ''} onChange={event => set('id_card', event.target.value)} placeholder="e.g. A154545" />
          </Field>

          <Field label="Candidate Contact">
            <input className={INPUT_CLASS} value={form.candidate_contact ?? ''} onChange={event => set('candidate_contact', event.target.value)} placeholder="Phone number or contact" />
          </Field>
        </div>
      </Section>

      <Section
        title="Progress and Assignment"
        description="Update the hiring stage, assignment owner, salary, and any notes that help the next reviewer."
        icon={<ProgressIcon />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Status">
            <select className={INPUT_CLASS} value={form.status ?? 'Pending'} onChange={event => set('status', event.target.value)}>
              {STATUS_OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>
          </Field>

          <Field label="Recruitment Stage">
            <select className={INPUT_CLASS} value={form.recruitment_stage ?? ''} onChange={event => set('recruitment_stage', event.target.value || null)}>
              <option value="">Select a stage</option>
              {STAGE_OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>
          </Field>

          <Field label="Joined Date">
            <input type="date" className={INPUT_CLASS} value={form.joined_date ?? ''} onChange={event => set('joined_date', event.target.value)} />
          </Field>

          <Field label="Assigned To">
            <input className={INPUT_CLASS} value={form.assigned_to ?? ''} onChange={event => set('assigned_to', event.target.value)} placeholder="Owner or recruiter" />
          </Field>

          <Field label="Salary (MVR)">
            <input type="number" className={INPUT_CLASS} value={form.salary ?? ''} onChange={event => set('salary', event.target.value ? Number(event.target.value) : null)} placeholder="0" />
          </Field>

          <Field
            label="Remarks"
            className="sm:col-span-2 xl:col-span-3"
            hint="Use this area for interview notes, blockers, or approvals that matter to the next person."
          >
            <textarea className={`${INPUT_CLASS} min-h-[120px] resize-y`} value={form.remarks ?? ''} onChange={event => set('remarks', event.target.value)} placeholder="Add notes or context" />
          </Field>
        </div>
      </Section>
    </div>
  )
}
