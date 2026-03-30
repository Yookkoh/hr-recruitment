import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name, must_change_password')
      .eq('id', userId)
      .single()
    return data
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        setSession(session)
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchProfile(session.user.id)
          if (!cancelled) {
            setRole(profile?.role ?? null)
            setMustChangePassword(profile?.must_change_password ?? false)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION is handled by getSession above — skip to avoid duplicate fetch
      if (event === 'INITIAL_SESSION') return
      if (event === 'TOKEN_REFRESHED') { setSession(session); return }

      setSession(session)
      if (session?.user) {
        setUser(session.user)
        const profile = await fetchProfile(session.user.id)
        setRole(profile?.role ?? null)
        setMustChangePassword(profile?.must_change_password ?? false)
      } else {
        setUser(null)
        setRole(null)
        setMustChangePassword(false)
      }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (!user) return
    const profile = await fetchProfile(user.id)
    setRole(profile?.role ?? null)
    setMustChangePassword(profile?.must_change_password ?? false)
  }

  return (
    <AuthContext.Provider value={{ session, user, role, mustChangePassword, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
