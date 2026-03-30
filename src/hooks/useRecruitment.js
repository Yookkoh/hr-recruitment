import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRecruitment(filters = {}) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('recruitment').select('*').order('created_at', { ascending: false })

    if (filters.atoll)       query = query.ilike('atoll', `%${filters.atoll}%`)
    if (filters.requestedBy) query = query.ilike('requested_by', `%${filters.requestedBy}%`)

    const { data, error } = await query
    if (error) setError(error.message)
    else setRecords(data ?? [])
    setLoading(false)
  }, [filters.atoll, filters.requestedBy])

  useEffect(() => { fetch() }, [fetch])

  async function create(payload) {
    const { data, error } = await supabase.from('recruitment').insert(payload).select().single()
    if (error) throw new Error(error.message)
    setRecords(prev => [data, ...prev])
    return data
  }

  async function update(id, payload) {
    const { data, error } = await supabase.from('recruitment').update(payload).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    setRecords(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  async function remove(id) {
    const { error } = await supabase.from('recruitment').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  async function getById(id) {
    const { data, error } = await supabase.from('recruitment').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  }

  return { records, loading, error, refetch: fetch, create, update, remove, getById }
}

export function useFilterOptions() {
  const [atolls, setAtolls]             = useState([])
  const [requestedBys, setRequestedBys] = useState([])

  useEffect(() => {
    supabase.from('recruitment').select('atoll').then(({ data }) => {
      if (data) setAtolls([...new Set(data.map(r => r.atoll?.trim()).filter(Boolean))].sort())
    })
    supabase.from('recruitment').select('requested_by').then(({ data }) => {
      if (data) setRequestedBys([...new Set(data.map(r => r.requested_by?.trim()).filter(Boolean))].sort())
    })
  }, [])

  return { atolls, requestedBys }
}
