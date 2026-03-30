import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' }
      })
      if (error) throw error
      setUsers(data.users ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function createUser(email, role, full_name) {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'create', email, role, full_name }
    })
    if (error) throw new Error(error.message)
    await loadUsers()
    return data
  }

  async function deleteUser(userId) {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'delete', userId }
    })
    if (error) throw new Error(error.message)
    setUsers(prev => prev.filter(u => u.id !== userId))
    return data
  }

  return { users, loading, error, createUser, deleteUser, refetch: loadUsers }
}
