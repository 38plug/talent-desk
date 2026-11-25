import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

/** Feature flag: cloud sync is on when both hosted env vars are real (not placeholders). */
export const isCloudSyncEnabled = Boolean(
  url &&
    anon &&
    !anon.includes('your-anon') &&
    !url.includes('YOUR_PROJECT_REF') &&
    /^https?:\/\//i.test(url),
)

export const supabaseUrl = url || ''

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
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

export function requireCloudConfig(): string | null {
  if (!isCloudSyncEnabled) {
    return 'Cloud sync is off. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (hosted project), then redeploy.'
  }
  return null
}

export function friendlyCloudAuthError(err: unknown): { message: string; hint?: string } {
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
      message: 'Cannot reach Talent Desk cloud auth.',
      hint: 'Check VITE_SUPABASE_URL points at https://<ref>.supabase.co and the project is not paused.',
    }
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return { message: 'Email or password is incorrect.' }
  }

  if (lower.includes('email not confirmed')) {
    return {
      message: 'Email is not confirmed yet.',
      hint: 'In Supabase Dashboard → Authentication → Providers → Email, disable “Confirm email” for the team desk, or confirm the user in Auth → Users.',
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
