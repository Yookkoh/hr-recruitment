import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const AUTH_STORAGE_KEY = 'staff-tracker-auth'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: AUTH_STORAGE_KEY,
    // Disable navigator.lock to prevent auth from hanging when lock acquisition stalls.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
