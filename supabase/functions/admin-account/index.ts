import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const OWNER_EMAIL = 'qrrupt@gmail.com'
const MANAGE_ROLES = new Set(['owner', 'admin'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)
    const body = await req.json()
    const { id, action, role, password } = body

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: me } = await admin.from('profiles').select('*').eq('id', user.id).single()
    if (!me || !MANAGE_ROLES.has(me.role)) return json({ error: 'Admin access required' }, 403)

    const { data: target } = await admin.from('profiles').select('*').eq('id', id).single()
    if (!target) return json({ error: 'Account not found' }, 404)
    if (target.role === 'owner' || String(target.email).toLowerCase() === OWNER_EMAIL) {
      return json({ error: 'Owner cannot be changed or deleted' }, 403)
    }
    if (target.id === me.id) return json({ error: 'Cannot modify your own account this way' }, 403)
    if (me.role === 'admin' && !['user', 'moderator'].includes(target.role) && action === 'role') {
      return json({ error: 'Admins may only manage user/moderator' }, 403)
    }

    if (action === 'role') {
      if (!['admin', 'moderator', 'user'].includes(role)) return json({ error: 'Invalid role' }, 400)
      if (me.role === 'admin' && !['user', 'moderator'].includes(role)) {
        return json({ error: 'Admins may only assign user/moderator' }, 403)
      }
      const { error } = await admin.from('profiles').update({ role }).eq('id', id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'delete') {
      const { error } = await admin.auth.admin.deleteUser(id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'password') {
      if (!password || String(password).length < 8) return json({ error: 'Password min 8 chars' }, 400)
      const { error } = await admin.auth.admin.updateUserById(id, { password })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'reset') {
      const { data, error } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: target.email,
      })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, link: data.properties?.action_link ?? '' })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'admin-account failed' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
