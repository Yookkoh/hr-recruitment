import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const PROFILE_SYNC_RETRY_DELAYS = [0, 250, 750]

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getFallbackRole(user) {
  return user?.user_metadata?.role ?? user?.app_metadata?.role ?? null
}

function getFallbackPasswordFlag(user) {
  return Boolean(user?.user_metadata?.must_change_password ?? user?.app_metadata?.must_change_password ?? false)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const syncRequestRef = useRef(0)

  const clearAuthState = useCallback(() => {
    setSession(null)
    setUser(null)
    setRole(null)
    setMustChangePassword(false)
  }, [])

  const fetchProfile = useCallback(async userId => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name, must_change_password')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  }, [])

  const fetchProfileWithRetry = useCallback(async userId => {
    let lastError = null

    for (const waitMs of PROFILE_SYNC_RETRY_DELAYS) {
      if (waitMs > 0) await delay(waitMs)

      try {
        const profile = await fetchProfile(userId)
        if (profile) return profile
      } catch (error) {
        lastError = error
      }
    }

    if (lastError) throw lastError
    return null
  }, [fetchProfile])

  const syncSessionState = useCallback(async nextSession => {
    const requestId = ++syncRequestRef.current

    setSession(nextSession)

    if (!nextSession?.user) {
      clearAuthState()
      return
    }

    setUser(nextSession.user)

    const fallbackRole = getFallbackRole(nextSession.user)
    const fallbackMustChangePassword = getFallbackPasswordFlag(nextSession.user)

    setRole(fallbackRole)
    setMustChangePassword(fallbackMustChangePassword)

    let profile = null

    try {
      profile = await fetchProfileWithRetry(nextSession.user.id)
    } catch {
      profile = null
    }

    if (syncRequestRef.current !== requestId) return

    setRole(profile?.role ?? fallbackRole)
    setMustChangePassword(profile?.must_change_password ?? fallbackMustChangePassword)
  }, [clearAuthState, fetchProfileWithRetry])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { data: { session: nextSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (cancelled) return
        await syncSessionState(nextSession)
      } catch {
        if (!cancelled) clearAuthState()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'INITIAL_SESSION') return

      if (event === 'TOKEN_REFRESHED') {
        setSession(nextSession)
        if (nextSession?.user) setUser(nextSession.user)
        return
      }

      if (cancelled) return

      setLoading(true)
      try {
        await syncSessionState(nextSession)
      } catch {
        if (!cancelled) clearAuthState()
      } finally {
        if (!cancelled) {
          setLoading(false)
          if (event === 'SIGNED_OUT') setSigningOut(false)
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [clearAuthState, syncSessionState])

  const signOut = useCallback(async () => {
    setSigningOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      const { error: localError } = await supabase.auth.signOut({ scope: 'local' })
      if (localError) {
        setSigningOut(false)
        throw error
      }
    }

    syncRequestRef.current += 1
    clearAuthState()
    setLoading(false)
    setSigningOut(false)
  }, [clearAuthState])

  async function refreshProfile() {
    if (!user) return null
    const profile = await fetchProfileWithRetry(user.id)
    setRole(profile?.role ?? getFallbackRole(user))
    setMustChangePassword(profile?.must_change_password ?? getFallbackPasswordFlag(user))
    return profile
  }

  function setPasswordChangeRequired(required) {
    setMustChangePassword(required)
  }

  return (
    <AuthContext.Provider value={{ session, user, role, mustChangePassword, loading, signingOut, signOut, refreshProfile, setPasswordChangeRequired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
