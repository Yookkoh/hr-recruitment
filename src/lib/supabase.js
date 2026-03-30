import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Disable navigator.lock — prevents auth from hanging in production
    // when browser lock acquisition stalls
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
