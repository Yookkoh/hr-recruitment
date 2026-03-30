import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, must_change_password')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('Profile fetch error:', err.message)
      return null
    }
  }

  useEffect(() => {
    // Safety: never stay loading more than 8 seconds
    const timeout = setTimeout(() => setLoading(false), 8000)

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      clearTimeout(timeout)
      if (error) setAuthError(error.message)
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        const profile = await fetchProfile(session.user.id)
        setRole(profile?.role ?? null)
        setMustChangePassword(profile?.must_change_password ?? false)
      }
      setLoading(false)
    }).catch(err => {
      clearTimeout(timeout)
      setAuthError(err.message)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

    return () => subscription.unsubscribe()
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
    <AuthContext.Provider value={{ session, user, role, mustChangePassword, loading, authError, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
