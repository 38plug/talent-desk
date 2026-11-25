import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const OWNER_EMAIL = 'qrrupt@gmail.com'
const MAX_ACCOUNTS = 4
const VIEW_ROLES = new Set(['owner', 'admin', 'moderator'])

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
    if (!me || !VIEW_ROLES.has(me.role)) return json({ error: 'Admin access required' }, 403)

    const { data: profiles } = await admin.from('profiles').select('*')
    const list = profiles ?? []
    const seatsUsed = list.filter(
      (p) => p.role !== 'owner' && String(p.email).toLowerCase() !== OWNER_EMAIL,
    ).length

    const perAccount = []
    let candidates = 0
    let offers = 0
    let interviews = 0
    let earnings = 0
    let estimated = 0

    for (const p of list) {
      const [c, o, i, e] = await Promise.all([
        admin.from('candidates').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
        admin.from('offers').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
        admin.from('interviews').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
        admin.from('earnings').select('id, amount, status').eq('user_id', p.id),
      ])
      const cCount = c.count ?? 0
      const oCount = o.count ?? 0
      const iCount = i.count ?? 0
      const eRows = e.data ?? []
      candidates += cCount
      offers += oCount
      interviews += iCount
      earnings += eRows.length
      estimated += eRows.filter((r) => r.status === 'Estimated').reduce((s, r) => s + Number(r.amount || 0), 0)
      perAccount.push({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        role: p.role,
        candidates: cCount,
        offers: oCount,
        interviews: iCount,
        earnings: eRows.length,
      })
    }

    return json({
      accounts: list.length,
      seatsUsed,
      seatsMax: MAX_ACCOUNTS,
      candidates,
      offers,
      interviews,
      earnings,
      estimated,
      perAccount,
    })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'stats failed' }, 500)
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
