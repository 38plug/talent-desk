import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const supabaseConfigured = Boolean(url && anon && !anon.includes('your-anon'))

export const supabaseUrl = url || 'http://127.0.0.1:54321'

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  anon || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: { 'x-client-info': 'talent-desk-spa' },
    },
  },
)

export function requireSupabaseConfig(): string | null {
  if (!url || !anon || anon.includes('your-anon')) {
    return 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example → .env and paste keys from `npx supabase status`.'
  }
  return null
}

export type ConnectivityStatus =
  | { ok: true; latencyMs: number }
  | { ok: false; reason: string; hint: string }

/** Probe GoTrue health — used on auth screens when sign-in fails. */
export async function checkSupabaseHealth(timeoutMs = 4000): Promise<ConnectivityStatus> {
  const cfg = requireSupabaseConfig()
  if (cfg) {
    return {
      ok: false,
      reason: 'Environment not configured',
      hint: cfg,
    }
  }

  const healthUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`
  const started = performance.now()
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { apikey: anon! },
    })
    const latencyMs = Math.round(performance.now() - started)
    if (!res.ok) {
      return {
        ok: false,
        reason: `Auth health returned HTTP ${res.status}`,
        hint: `Check that Supabase is running and VITE_SUPABASE_URL points at the API (usually http://127.0.0.1:54321), not the app tunnel.`,
      }
    }
    return { ok: true, latencyMs }
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    return {
      ok: false,
      reason: aborted ? 'Timed out reaching Supabase' : 'Cannot reach Supabase (network / fetch failed)',
      hint: connectivityHint(supabaseUrl),
    }
  } finally {
    window.clearTimeout(timer)
  }
}

export function connectivityHint(targetUrl: string): string {
  const local = /127\.0\.0\.1|localhost/.test(targetUrl)
  if (local) {
    return [
      'Local URL detected. Usually this means Docker/Supabase is down.',
      '1) Start Docker Desktop',
      '2) Run `npx supabase start`',
      '3) Confirm http://127.0.0.1:54321/auth/v1/health returns 200',
      '4) Refresh keys in .env from `npx supabase status`',
    ].join(' ')
  }
  return [
    'Remote/tunnel URL detected. If you see fetch failed:',
    '• Confirm the Cloudflared tunnel targets port 54321 (Supabase API), not 3000/5173 (app).',
    '• Tunnel hostnames change on restart — update VITE_SUPABASE_URL and restart Vite.',
    '• Verify https://<tunnel>/auth/v1/health returns 200 before signing in.',
  ].join(' ')
}

/** Map raw supabase/auth errors into operator-friendly copy. */
export function friendlyAuthError(err: unknown): { message: string; hint?: string } {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : 'Something went wrong signing in.'

  const lower = raw.toLowerCase()

  if (
    lower.includes('failed to fetch') ||
    lower === 'fetch failed' ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return {
      message: 'Cannot reach Talent Desk auth server.',
      hint: connectivityHint(supabaseUrl),
    }
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return { message: 'Email or password is incorrect.' }
  }

  if (lower.includes('email not confirmed')) {
    return {
      message: 'Email is not confirmed yet.',
      hint: 'Local Supabase usually auto-confirms; check Auth → Users in Studio (http://127.0.0.1:54323).',
    }
  }

  if (lower.includes('maximum') || lower.includes('4 accounts') || lower.includes('account limit')) {
    return {
      message: 'Maximum of 4 accounts reached. No more registrations allowed.',
    }
  }

  if (lower.includes('reserved')) {
    return { message: 'This email is reserved for the desk owner.' }
  }

  if (lower.includes('password') && lower.includes('8')) {
    return { message: 'Password must be at least 8 characters.' }
  }

  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return { message: 'An account with this email already exists. Sign in instead.' }
  }

  return { message: raw }
}
