import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const OWNER_EMAIL = 'qrrupt@gmail.com'
const MAX_ACCOUNTS = 4

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
    const { email, password, fullName } = await req.json()
    if (!email || !password || String(password).length < 8) {
      return json({ error: 'Valid email and password (min 8) required' }, 400)
    }
    if (String(email).toLowerCase() === OWNER_EMAIL) {
      return json({ error: 'This email is reserved.' }, 403)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: profiles, error: countErr } = await admin.from('profiles').select('id, email, role')
    if (countErr) return json({ error: countErr.message }, 500)

    const seats = (profiles ?? []).filter(
      (p) => p.role !== 'owner' && String(p.email).toLowerCase() !== OWNER_EMAIL,
    ).length
    if (seats >= MAX_ACCOUNTS) {
      return json({ error: 'Maximum of 4 accounts reached. No more registrations allowed.' }, 403)
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' },
    })
    if (error) return json({ error: error.message }, 400)

    await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName || '',
      role: 'user',
    })

    return json({ ok: true })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'register failed' }, 500)
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
