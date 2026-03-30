import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED_ROLES = new Set(['recruiter', 'executive', 'admin'])

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  })
}

function createTempPassword() {
  const seed = crypto.randomUUID().replace(/-/g, '')
  return `${seed.slice(0, 8)}Aa1!`
}

function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase environment variables are missing.')
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

async function requireAdmin(request: Request, adminClient: ReturnType<typeof createClient>) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  if (!token) {
    return { error: json({ error: 'Missing authorization token.' }, { status: 401 }) }
  }

  const { data: userData, error: userError } = await adminClient.auth.getUser(token)
  if (userError || !userData.user) {
    return { error: json({ error: 'Invalid session.' }, { status: 401 }) }
  }

  const { data: callerProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profileError || callerProfile?.role !== 'admin') {
    return { error: json({ error: 'Admin access is required.' }, { status: 403 }) }
  }

  return { user: userData.user }
}

async function listUsers(adminClient: ReturnType<typeof createClient>) {
  const allUsers = []
  let page = 1

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error

    const batch = data.users ?? []
    allUsers.push(...batch)

    if (batch.length < 100) break
    page += 1
  }

  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, full_name, role, must_change_password')

  if (profilesError) throw profilesError

  const profileMap = new Map((profiles ?? []).map(profile => [profile.id, profile]))

  return allUsers.map(user => {
    const profile = profileMap.get(user.id)
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
      role: profile?.role ?? user.user_metadata?.role ?? null,
      must_change_password: profile?.must_change_password ?? false,
    }
  })
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    const adminClient = getSupabaseAdmin()
    const auth = await requireAdmin(request, adminClient)
    if (auth.error) return auth.error

    const body = await request.json()
    const action = body?.action

    if (action === 'list') {
      const users = await listUsers(adminClient)
      return json({ users })
    }

    if (action === 'create') {
      const email = String(body?.email ?? '').trim().toLowerCase()
      const fullName = String(body?.full_name ?? '').trim()
      const role = String(body?.role ?? '').trim()

      if (!email || !fullName || !ALLOWED_ROLES.has(role)) {
        return json({ error: 'A valid email, name, and role are required.' }, { status: 400 })
      }

      const tempPassword = createTempPassword()
      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      })

      if (createError || !createdUser.user) throw createError ?? new Error('Could not create the user.')

      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: createdUser.user.id,
          full_name: fullName,
          role,
          must_change_password: true,
        })

      if (profileError) throw profileError

      return json({
        user: {
          id: createdUser.user.id,
          email,
          full_name: fullName,
          role,
          must_change_password: true,
        },
        tempPassword,
      })
    }

    if (action === 'update-role') {
      const userId = String(body?.userId ?? '').trim()
      const role = String(body?.role ?? '').trim()

      if (!userId || !ALLOWED_ROLES.has(role)) {
        return json({ error: 'A valid user and role are required.' }, { status: 400 })
      }

      if (userId === auth.user.id) {
        return json({ error: 'You cannot change your own role here.' }, { status: 400 })
      }

      const { data: targetUser, error: targetUserError } = await adminClient.auth.admin.getUserById(userId)
      if (targetUserError || !targetUser.user) throw targetUserError ?? new Error('User not found.')

      const { error: updateProfileError } = await adminClient
        .from('profiles')
        .upsert(
          {
            id: userId,
            role,
          },
          { onConflict: 'id' },
        )

      if (updateProfileError) throw updateProfileError

      const nextMetadata = {
        ...(targetUser.user.user_metadata ?? {}),
        role,
      }

      const { error: updateUserError } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: nextMetadata,
      })

      if (updateUserError) throw updateUserError

      return json({
        user: {
          id: userId,
          role,
        },
      })
    }

    if (action === 'delete') {
      const userId = String(body?.userId ?? '').trim()
      if (!userId) {
        return json({ error: 'A valid user is required.' }, { status: 400 })
      }

      if (userId === auth.user.id) {
        return json({ error: 'You cannot delete your own account here.' }, { status: 400 })
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
      if (deleteError) throw deleteError

      return json({ success: true })
    }

    return json({ error: 'Unsupported action.' }, { status: 400 })
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 },
    )
  }
})
