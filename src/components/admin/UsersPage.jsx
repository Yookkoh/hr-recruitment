import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUsers } from '../../hooks/useUsers'
import Toast from '../shared/Toast'

const ROLES = ['recruiter', 'executive', 'admin']

const ROLE_COLOR = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
  recruiter: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
  executive: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { users, loading, error, createUser, deleteUser, updateUserRole } = useUsers()
  const [form, setForm] = useState({ email: '', full_name: '', role: 'recruiter' })
  const [creating, setCreating] = useState(false)
  const [newCreds, setNewCreds] = useState(null)
  const [toast, setToast] = useState(null)
  const [roleDrafts, setRoleDrafts] = useState({})
  const [savingRoleId, setSavingRoleId] = useState(null)

  useEffect(() => {
    setRoleDrafts(Object.fromEntries(users.map(user => [user.id, user.role ?? 'recruiter'])))
  }, [users])

  async function handleCreate(event) {
    event.preventDefault()
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

  async function handleRoleSave(targetUser) {
    const nextRole = roleDrafts[targetUser.id] ?? targetUser.role ?? 'recruiter'
    if (nextRole === targetUser.role) return

    setSavingRoleId(targetUser.id)
    try {
      await updateUserRole(targetUser.id, nextRole)
      setToast({ message: `Role updated to ${nextRole}.`, type: 'success' })
    } catch (err) {
      setRoleDrafts(current => ({ ...current, [targetUser.id]: targetUser.role ?? 'recruiter' }))
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSavingRoleId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">User Management</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Create users, share temporary credentials, and manage account access.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-slate-200">Create New User</h2>
        <form
          onSubmit={handleCreate}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto] xl:items-end"
        >
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={event => setForm(current => ({ ...current, full_name: event.target.value }))}
              placeholder="Full Name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400">Role</label>
            <select
              value={form.role}
              onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {ROLES.map(role => <option key={role}>{role}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors xl:w-auto"
          >
            {creating ? 'Creating...' : '+ Create User'}
          </button>
        </form>

        {newCreds && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/12">
            <p className="mb-1 text-sm font-semibold text-green-800 dark:text-emerald-200">User created. Share these credentials:</p>
            <p className="break-all text-sm text-green-700 dark:text-emerald-100">Email: <strong>{newCreds.email}</strong></p>
            <p className="text-sm text-green-700 dark:text-emerald-100">Temp Password: <strong className="font-mono">{newCreds.tempPassword}</strong></p>
            <p className="mt-1 text-xs text-green-600 dark:text-emerald-200/80">The user will be required to set a new password on first login.</p>
            <button onClick={() => setNewCreds(null)} className="mt-2 text-xs text-green-700 underline dark:text-emerald-200">
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-red-600 dark:text-red-300">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 dark:text-slate-400">No users found.</p>
        ) : (
          <>
            <div className="space-y-3 p-4 lg:hidden">
              {users.map(user => (
                <article key={user.id} className="rounded-xl border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user.full_name || 'Unnamed user'}</p>
                      <p className="mt-1 break-all text-sm text-gray-600 dark:text-slate-300">{user.email}</p>
                      {user.id === currentUser?.id && (
                        <p className="mt-2 text-xs font-medium text-brand-700 dark:text-brand-200">Current signed-in admin</p>
                      )}
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[user.role] ?? 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-200'}`}>
                      {user.role || '-'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400">Role</label>
                    <select
                      value={roleDrafts[user.id] ?? user.role ?? 'recruiter'}
                      disabled={user.id === currentUser?.id || savingRoleId === user.id}
                      onChange={event => setRoleDrafts(current => ({ ...current, [user.id]: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900/60 dark:disabled:text-slate-500"
                    >
                      {ROLES.map(role => <option key={role}>{role}</option>)}
                    </select>
                  </div>

                  <p className={`mt-3 text-xs font-medium ${user.must_change_password ? 'text-amber-600 dark:text-amber-200' : 'text-green-600 dark:text-emerald-200'}`}>
                    {user.must_change_password ? 'Pending password change' : 'Active'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRoleSave(user)}
                      disabled={user.id === currentUser?.id || savingRoleId === user.id || (roleDrafts[user.id] ?? user.role) === user.role}
                      className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50 dark:border-brand-500/20 dark:text-brand-200 dark:hover:bg-brand-500/10"
                    >
                      {savingRoleId === user.id ? 'Saving...' : 'Save role'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={user.id === currentUser?.id}
                      className="rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:text-red-200 dark:hover:bg-red-500/10"
                    >
                      Delete user
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-950/70">
                  <tr>
                    {['Full Name', 'Email', 'Role', 'Status', ''].map(header => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{user.full_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <select
                            value={roleDrafts[user.id] ?? user.role ?? 'recruiter'}
                            disabled={user.id === currentUser?.id || savingRoleId === user.id}
                            onChange={event => setRoleDrafts(current => ({ ...current, [user.id]: event.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900/60 dark:disabled:text-slate-500"
                          >
                            {ROLES.map(role => <option key={role}>{role}</option>)}
                          </select>
                          {user.id === currentUser?.id && (
                            <p className="text-xs font-medium text-brand-700 dark:text-brand-200">Current signed-in admin</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {user.must_change_password
                          ? <span className="font-medium text-amber-600 dark:text-amber-200">Pending password change</span>
                          : <span className="text-green-600 dark:text-emerald-200">Active</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRoleSave(user)}
                            disabled={user.id === currentUser?.id || savingRoleId === user.id || (roleDrafts[user.id] ?? user.role) === user.role}
                            className="rounded px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50 dark:text-brand-200 dark:hover:bg-brand-500/10"
                          >
                            {savingRoleId === user.id ? 'Saving...' : 'Save role'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            disabled={user.id === currentUser?.id}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-200 dark:hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
