import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS_OPTIONS } from '../utils/constants'

const RECRUITMENT_CACHE_TTL = 30_000
const FILTER_OPTIONS_CACHE_TTL = 30 * 60_000

const recruitmentCache = new Map()
const statusCountsCache = new Map()
const dashboardSnapshotCache = new Map()

let filterOptionsCache = null
let filterOptionsPromise = null

function normalizeFilterValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeFilters(filters = {}) {
  return {
    atoll: normalizeFilterValue(filters.atoll),
    requestedBy: normalizeFilterValue(filters.requestedBy),
    status: normalizeFilterValue(filters.status),
  }
}

function applyFilters(query, filters) {
  if (filters.atoll) query = query.eq('atoll', filters.atoll)
  if (filters.requestedBy) query = query.eq('requested_by', filters.requestedBy)
  if (filters.status) query = filters.status === 'Unspecified' ? query.is('status', null) : query.eq('status', filters.status)
  return query
}

function buildCacheKey(filters, options) {
  return JSON.stringify({
    atoll: filters.atoll ?? '',
    requestedBy: filters.requestedBy ?? '',
    status: filters.status ?? '',
    page: options.page,
    pageSize: options.pageSize,
    fetchAll: options.fetchAll,
    countMode: options.countMode,
    select: options.select,
  })
}

function buildFilterKey(filters) {
  return JSON.stringify({
    atoll: filters.atoll ?? '',
    requestedBy: filters.requestedBy ?? '',
    status: filters.status ?? '',
  })
}

function buildDashboardSnapshotKey(filters, options) {
  return JSON.stringify({
    atoll: filters.atoll ?? '',
    requestedBy: filters.requestedBy ?? '',
    status: filters.status ?? '',
    page: options.page,
    pageSize: options.pageSize,
  })
}

function createEmptyStatusCounts() {
  const counts = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = 0
    return acc
  }, {})

  counts.Unspecified = 0

  return counts
}

export function invalidateRecruitmentCache() {
  recruitmentCache.clear()
  statusCountsCache.clear()
  dashboardSnapshotCache.clear()
  filterOptionsCache = null
  filterOptionsPromise = null
}

export function useRecruitment(filters = {}, options = {}) {
  const {
    enabled = true,
    page = 1,
    pageSize = 25,
    fetchAll = false,
    countMode = 'exact',
    select = '*',
  } = options

  const [records, setRecords] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const normalizedFilters = normalizeFilters(filters)
  const { atoll, requestedBy, status } = normalizedFilters

  const loadRecords = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled) {
        setLoading(false)
        return
      }

      const cacheKey = buildCacheKey(normalizedFilters, { page, pageSize, fetchAll, countMode, select })
      const cached = recruitmentCache.get(cacheKey)

      if (!force && cached && Date.now() - cached.timestamp < RECRUITMENT_CACHE_TTL) {
        setRecords(cached.records)
        setTotalCount(cached.totalCount)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const includeCount = !fetchAll && countMode !== 'none'

      let query = supabase
        .from('recruitment')
        .select(select, includeCount ? { count: countMode } : undefined)
        .order('created_at', { ascending: false })

      query = applyFilters(query, normalizedFilters)

      if (!fetchAll) {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        setError(error.message)
        setRecords([])
        setTotalCount(0)
        setLoading(false)
        return
      }

      const nextRecords = data ?? []
      const nextTotalCount = fetchAll
        ? nextRecords.length
        : includeCount
          ? count ?? nextRecords.length
          : cached?.totalCount ?? nextRecords.length

      recruitmentCache.set(cacheKey, {
        records: nextRecords,
        totalCount: nextTotalCount,
        timestamp: Date.now(),
      })

      setRecords(nextRecords)
      setTotalCount(nextTotalCount)
      setLoading(false)
    },
    [countMode, enabled, fetchAll, atoll, page, pageSize, requestedBy, select, status],
  )

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const refetch = useCallback(() => {
    invalidateRecruitmentCache()
    return loadRecords({ force: true })
  }, [loadRecords])

  const create = useCallback(async payload => {
    const { data, error } = await supabase.from('recruitment').insert(payload).select().single()
    if (error) throw new Error(error.message)
    invalidateRecruitmentCache()
    return data
  }, [])

  const update = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('recruitment').update(payload).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    invalidateRecruitmentCache()
    return data
  }, [])

  const remove = useCallback(async id => {
    const { error } = await supabase.from('recruitment').delete().eq('id', id)
    if (error) throw new Error(error.message)
    invalidateRecruitmentCache()
    setRecords(prev => prev.filter(record => record.id !== id))
    setTotalCount(prev => Math.max(0, prev - 1))
  }, [])

  const getById = useCallback(async id => {
    const { data, error } = await supabase.from('recruitment').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  }, [])

  return { records, totalCount, loading, error, refetch, create, update, remove, getById }
}

export function useDashboardRecruitment(filters = {}, options = {}) {
  const {
    enabled = true,
    page = 1,
    pageSize = 25,
  } = options

  const [records, setRecords] = useState([])
  const [counts, setCounts] = useState(() => createEmptyStatusCounts())
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const normalizedFilters = normalizeFilters(filters)
  const { atoll, requestedBy, status } = normalizedFilters

  const loadSnapshot = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled) {
        setLoading(false)
        return
      }

      const cacheKey = buildDashboardSnapshotKey(normalizedFilters, { page, pageSize })
      const cached = dashboardSnapshotCache.get(cacheKey)

      if (!force && cached && Date.now() - cached.timestamp < RECRUITMENT_CACHE_TTL) {
        setRecords(cached.records)
        setCounts(cached.counts)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const snapshot = await fetchDashboardSnapshot(normalizedFilters, { page, pageSize })

      dashboardSnapshotCache.set(cacheKey, {
        ...snapshot,
        timestamp: Date.now(),
      })

      setRecords(snapshot.records)
      setCounts(snapshot.counts)
      setLoading(false)

      if (snapshot.records.length === pageSize) {
        prefetchDashboardSnapshot(normalizedFilters, { page: page + 1, pageSize })
      }
    },
    [enabled, atoll, page, pageSize, requestedBy, status],
  )

  useEffect(() => {
    loadSnapshot().catch(err => {
      setRecords([])
      setCounts(createEmptyStatusCounts())
      setError(err.message)
      setLoading(false)
    })
  }, [loadSnapshot])

  const refetch = useCallback(() => {
    invalidateRecruitmentCache()
    return loadSnapshot({ force: true })
  }, [loadSnapshot])

  const remove = useCallback(async id => {
    const { error } = await supabase.from('recruitment').delete().eq('id', id)
    if (error) throw new Error(error.message)
    invalidateRecruitmentCache()
    setRecords(prev => prev.filter(record => record.id !== id))
  }, [])

  const summaryTotalCount = Object.values(counts).reduce((sum, value) => sum + value, 0)
  const totalCount = status ? (counts[status] ?? 0) : summaryTotalCount

  return {
    records,
    counts,
    totalCount,
    summaryTotalCount,
    loading,
    error,
    refetch,
    remove,
  }
}

async function fetchStatusCountsFallback(filters) {
  const results = await Promise.all(
    [...STATUS_OPTIONS, 'Unspecified'].map(async status => {
      const isUnspecified = status === 'Unspecified'
      let query = supabase
        .from('recruitment')
        .select('*', { count: 'exact', head: true })

      query = isUnspecified ? query.is('status', null) : query.eq('status', status)
      query = applyFilters(query, filters)

      const { count, error } = await query
      if (error) throw error

      return [status, count ?? 0]
    }),
  )

  const nextCounts = createEmptyStatusCounts()
  for (const [status, count] of results) nextCounts[status] = count
  return nextCounts
}

function isMissingStatusCountsFunction(error) {
  const message = error?.message ?? ''
  return error?.code === 'PGRST202' || message.includes('get_recruitment_status_counts')
}

async function fetchStatusCounts(filters) {
  const { data, error } = await supabase.rpc('get_recruitment_status_counts', {
    filter_atoll: filters.atoll || null,
    filter_requested_by: filters.requestedBy || null,
  })

  if (error) {
    if (isMissingStatusCountsFunction(error)) {
      return fetchStatusCountsFallback(filters)
    }

    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  const nextCounts = createEmptyStatusCounts()

  nextCounts.Pending = Number(row?.pending_count ?? 0)
  nextCounts.Active = Number(row?.active_count ?? 0)
  nextCounts.Rejected = Number(row?.rejected_count ?? 0)
  nextCounts.Withdrawn = Number(row?.withdrawn_count ?? 0)
  nextCounts.Completed = Number(row?.completed_count ?? 0)
  nextCounts.Unspecified = Number(row?.unspecified_count ?? 0)

  return nextCounts
}

async function fetchCachedStatusCounts(filters, { force = false } = {}) {
  const cacheKey = buildFilterKey({ ...filters, status: '' })
  const cached = statusCountsCache.get(cacheKey)

  if (!force && cached && Date.now() - cached.timestamp < RECRUITMENT_CACHE_TTL) {
    return cached.counts
  }

  const nextCounts = await fetchStatusCounts(filters)

  statusCountsCache.set(cacheKey, {
    counts: nextCounts,
    timestamp: Date.now(),
  })

  return nextCounts
}

function isMissingDashboardSnapshotFunction(error) {
  const message = error?.message ?? ''
  return error?.code === 'PGRST202' || message.includes('get_recruitment_dashboard_snapshot')
}

async function fetchDashboardSnapshotFallback(filters, options) {
  const summaryFilters = {
    atoll: filters.atoll,
    requestedBy: filters.requestedBy,
    status: '',
  }

  let query = supabase
    .from('recruitment')
    .select('id, atoll, island, requested_by, position, division, candidate_name, status, recruitment_stage, joined_date, salary')
    .order('created_at', { ascending: false })

  query = applyFilters(query, filters)

  const from = (options.page - 1) * options.pageSize
  const to = from + options.pageSize - 1
  query = query.range(from, to)

  const [{ data, error }, counts] = await Promise.all([
    query,
    fetchCachedStatusCounts(summaryFilters),
  ])

  if (error) throw error

  return {
    records: data ?? [],
    counts,
  }
}

async function fetchDashboardSnapshot(filters, options) {
  const { data, error } = await supabase.rpc('get_recruitment_dashboard_snapshot', {
    filter_atoll: filters.atoll || null,
    filter_requested_by: filters.requestedBy || null,
    filter_status: filters.status || null,
    page_number: options.page,
    page_size: options.pageSize,
  })

  if (error) {
    if (isMissingDashboardSnapshotFunction(error)) {
      return fetchDashboardSnapshotFallback(filters, options)
    }

    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  const nextCounts = createEmptyStatusCounts()

  nextCounts.Pending = Number(row?.pending_count ?? 0)
  nextCounts.Active = Number(row?.active_count ?? 0)
  nextCounts.Rejected = Number(row?.rejected_count ?? 0)
  nextCounts.Withdrawn = Number(row?.withdrawn_count ?? 0)
  nextCounts.Completed = Number(row?.completed_count ?? 0)
  nextCounts.Unspecified = Number(row?.unspecified_count ?? 0)

  return {
    records: Array.isArray(row?.records) ? row.records : [],
    counts: nextCounts,
  }
}

function prefetchDashboardSnapshot(filters, options) {
  const cacheKey = buildDashboardSnapshotKey(filters, options)
  const cached = dashboardSnapshotCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < RECRUITMENT_CACHE_TTL) return

  fetchDashboardSnapshot(filters, options)
    .then(result => {
      dashboardSnapshotCache.set(cacheKey, {
        ...result,
        timestamp: Date.now(),
      })
    })
    .catch(() => {})
}

async function fetchFilterOptionsFallback() {
  const { data, error } = await supabase.from('recruitment').select('atoll, requested_by')
  if (error) throw new Error(error.message)

  const atolls = new Set()
  const requestedBys = new Set()

  for (const row of data ?? []) {
    const atoll = row.atoll?.trim()
    const requestedBy = row.requested_by?.trim()

    if (atoll) atolls.add(atoll)
    if (requestedBy) requestedBys.add(requestedBy)
  }

  return {
    atolls: [...atolls].sort(),
    requestedBys: [...requestedBys].sort(),
    timestamp: Date.now(),
  }
}

async function fetchFilterOptions() {
  const { data, error } = await supabase.rpc('get_recruitment_filter_options')

  if (error) {
    if (error.code === 'PGRST202' || (error.message ?? '').includes('get_recruitment_filter_options')) {
      return fetchFilterOptionsFallback()
    }

    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  return {
    atolls: (row?.atolls ?? []).filter(Boolean),
    requestedBys: (row?.requested_bys ?? []).filter(Boolean),
    timestamp: Date.now(),
  }
}

export function useFilterOptions() {
  const [options, setOptions] = useState(() => ({
    atolls: filterOptionsCache?.atolls ?? [],
    requestedBys: filterOptionsCache?.requestedBys ?? [],
  }))

  useEffect(() => {
    let active = true

    async function loadOptions() {
      if (filterOptionsCache && Date.now() - filterOptionsCache.timestamp < FILTER_OPTIONS_CACHE_TTL) {
        if (active) {
          setOptions({
            atolls: filterOptionsCache.atolls,
            requestedBys: filterOptionsCache.requestedBys,
          })
        }
        return
      }

      if (!filterOptionsPromise) {
        filterOptionsPromise = fetchFilterOptions()
          .then(result => {
            filterOptionsCache = result
            return result
          })
          .finally(() => {
            filterOptionsPromise = null
          })
      }

      const nextOptions = await filterOptionsPromise

      if (active) {
        setOptions({
          atolls: nextOptions.atolls,
          requestedBys: nextOptions.requestedBys,
        })
      }
    }

    loadOptions().catch(() => {})

    return () => {
      active = false
    }
  }, [])

  return options
}

export function useStatusCounts(filters = {}, options = {}) {
  const { enabled = true } = options
  const [counts, setCounts] = useState(() => createEmptyStatusCounts())
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const normalizedFilters = normalizeFilters(filters)
  const { atoll, requestedBy } = normalizedFilters

  const loadCounts = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled) {
        setLoading(false)
        return
      }

      const cacheKey = buildFilterKey({ ...normalizedFilters, status: '' })
      const cached = statusCountsCache.get(cacheKey)

      if (!force && cached && Date.now() - cached.timestamp < RECRUITMENT_CACHE_TTL) {
        setCounts(cached.counts)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const nextCounts = await fetchCachedStatusCounts(normalizedFilters, { force })

      setCounts(nextCounts)
      setLoading(false)
    },
    [enabled, atoll, requestedBy],
  )

  useEffect(() => {
    loadCounts().catch(err => {
      setCounts(createEmptyStatusCounts())
      setError(err.message)
      setLoading(false)
    })
  }, [loadCounts])

  const refetch = useCallback(() => {
    statusCountsCache.clear()
    return loadCounts({ force: true })
  }, [loadCounts])

  return { counts, loading, error, refetch }
}
