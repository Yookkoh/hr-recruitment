import { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import Toast from '../shared/Toast'

const ROLES = ['recruiter', 'executive', 'admin']

const ROLE_COLOR = {
  admin:     'bg-red-100 text-red-700',
  recruiter: 'bg-blue-100 text-blue-700',
  executive: 'bg-purple-100 text-purple-700',
}

export default function UsersPage() {
  const { users, loading, error, createUser, deleteUser } = useUsers()
  const [form, setForm]               = useState({ email: '', full_name: '', role: 'recruiter' })
  const [creating, setCreating]       = useState(false)
  const [newCreds, setNewCreds]       = useState(null)
  const [toast, setToast]             = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const result = await createUser(form.email, form.role, form.full_name)
      setNewCreds({ email: form.email, tempPassword: result.tempPassword })
      setForm({ email: '', full_name: '', role: 'recruiter' })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id, email) {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return
    try {
      await deleteUser(id)
      setToast({ message: 'User deleted.', type: 'success' })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">User Management</h1>

      {/* Create User */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Create New User</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex-1 min-w-36">
            <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Full Name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating…' : '+ Create User'}
          </button>
        </form>

        {newCreds && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="mb-1 text-sm font-semibold text-green-800">User created! Share these credentials:</p>
            <p className="text-sm text-green-700">Email: <strong>{newCreds.email}</strong></p>
            <p className="text-sm text-green-700">Temp Password: <strong className="font-mono">{newCreds.tempPassword}</strong></p>
            <p className="mt-1 text-xs text-green-600">User will be required to set a new password on first login.</p>
            <button onClick={() => setNewCreds(null)} className="mt-2 text-xs text-green-700 underline">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Full Name', 'Email', 'Role', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.must_change_password
                      ? <span className="font-medium text-amber-600">Pending password change</span>
                      : <span className="text-green-600">Active</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
