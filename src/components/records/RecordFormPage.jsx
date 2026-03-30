import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRecruitment } from '../../hooks/useRecruitment'
import Toast from '../shared/Toast'
import RecordFormFields from './RecordFormFields'

const EMPTY_FORM = {
  atoll: '', island: '', constituency: '', requested_by: '',
  requested_date: '', type: 'New', position: '', hired_location: '',
  division: '', candidate_name: '', id_card: '', candidate_contact: '',
  status: 'Pending', recruitment_stage: '', joined_date: '',
  remarks: '', assigned_to: '', salary: '',
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m15 6-6 6 6 6" />
    </svg>
  )
}

function cleanPayload(form) {
  const out = {}
  for (const [key, value] of Object.entries(form)) {
    if (value === '' || value === null || value === undefined) out[key] = null
    else out[key] = value
  }
  return out
}

export default function RecordFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { create, update, getById } = useRecruitment({}, { enabled: false })

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [loadErr, setLoadErr] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    getById(id).then(data => {
      const mapped = {}
      for (const key of Object.keys(EMPTY_FORM)) {
        mapped[key] = data[key] ?? ''
      }
      setForm(mapped)
    }).catch(err => setLoadErr(err.message))
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.atoll?.trim()) return setToast({ message: 'Atoll is required.', type: 'error' })
    if (!form.requested_by?.trim()) return setToast({ message: 'Requested By is required.', type: 'error' })

    setSaving(true)
    try {
      const payload = cleanPayload(form)
      if (isEdit) await update(id, payload)
      else await create(payload)
      setToast({ message: isEdit ? 'Record updated.' : 'Record created.', type: 'success' })
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loadErr) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/12 dark:text-red-200">{loadErr}</p>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-56px_rgba(2,6,23,0.96)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/')}
              className="mt-1 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeftIcon />
              Back
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700 dark:text-brand-200">
                {isEdit ? 'Update Existing Record' : 'Create New Record'}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                {isEdit ? 'Edit Record' : 'Add New Record'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                Capture request details, candidate information, and recruitment progress in one organized form.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Required fields: <span className="font-semibold text-slate-900 dark:text-slate-100">Atoll</span> and <span className="font-semibold text-slate-900 dark:text-slate-100">Requested By</span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/88 dark:shadow-[0_36px_90px_-56px_rgba(2,6,23,0.96)] sm:p-6">
        <RecordFormFields form={form} onChange={setForm} />

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_45px_-28px_rgba(15,23,42,0.85)] hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
