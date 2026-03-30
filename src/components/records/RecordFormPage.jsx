import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRecruitment } from '../../hooks/useRecruitment'
import RecordFormFields from './RecordFormFields'
import Toast from '../shared/Toast'

const EMPTY_FORM = {
  atoll: '', island: '', constituency: '', requested_by: '',
  requested_date: '', type: 'New', position: '', hired_location: '',
  division: '', candidate_name: '', id_card: '', candidate_contact: '',
  status: 'Pending', recruitment_stage: '', joined_date: '',
  remarks: '', assigned_to: '', salary: '',
}

function cleanPayload(form) {
  const out = {}
  for (const [k, v] of Object.entries(form)) {
    if (v === '' || v === null || v === undefined) out[k] = null
    else out[k] = v
  }
  return out
}

export default function RecordFormPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const isEdit       = Boolean(id)
  const { create, update, getById } = useRecruitment()

  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)
  const [loadErr, setLoadErr] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    getById(id).then(data => {
      const mapped = {}
      for (const k of Object.keys(EMPTY_FORM)) {
        mapped[k] = data[k] ?? ''
      }
      setForm(mapped)
    }).catch(err => setLoadErr(err.message))
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.atoll?.trim()) return setToast({ message: 'Atoll is required.', type: 'error' })
    if (!form.requested_by?.trim()) return setToast({ message: 'Requested By is required.', type: 'error' })

    setSaving(true)
    try {
      const payload = cleanPayload(form)
      if (isEdit) await update(id, payload)
      else        await create(payload)
      setToast({ message: isEdit ? 'Record updated.' : 'Record created.', type: 'success' })
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loadErr) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{loadErr}</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Record' : 'Add New Record'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <RecordFormFields form={form} onChange={setForm} />

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
