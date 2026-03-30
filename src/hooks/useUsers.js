import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function invoke(action, body = {}) {
  const { data, error } = await supabase.functions.invoke('manage-users', {
    body: { action, ...body },
  })
  if (error) throw new Error(error.message)
  return data
}

export function useUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await invoke('list')
      setUsers(data.users ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function createUser(email, role, full_name) {
    const data = await invoke('create', { email, role, full_name })
    await loadUsers()
    return data
  }

  async function deleteUser(userId) {
    await invoke('delete', { userId })
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  async function updateUserRole(userId, role) {
    const data = await invoke('update-role', { userId, role })
    setUsers(prev => prev.map(user => (
      user.id === userId
        ? { ...user, role: data.user?.role ?? role }
        : user
    )))
    return data
  }

  return { users, loading, error, createUser, deleteUser, updateUserRole, refetch: loadUsers }
}
