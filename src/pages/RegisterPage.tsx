import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { AuthConnectivityBanner } from '@/components/auth/AuthConnectivityBanner'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { registerAccount } from '@/lib/api'
import { APP_NAME, MAX_ACCOUNTS } from '@/lib/constants'
import { checkSupabaseHealth, friendlyAuthError, requireSupabaseConfig } from '@/lib/supabase'

export function RegisterPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [healthTick, setHealthTick] = useState(0)

  if (!loading && session) return <Navigate to="/" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setHint(null)

    const cfg = requireSupabaseConfig()
    if (cfg) {
      setError('Supabase is not configured.')
      setHint(cfg)
      setHealthTick((n) => n + 1)
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setBusy(true)
    try {
      await registerAccount(email, password, fullName)
      navigate('/')
    } catch (err) {
      const friendly = friendlyAuthError(err)
      setError(friendly.message)
      if (friendly.hint) {
        setHint(friendly.hint)
      } else if (/fetch|network|reach|cannot/i.test(friendly.message)) {
        const health = await checkSupabaseHealth()
        if (!health.ok) setHint(health.hint)
      }
      setHealthTick((n) => n + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-mesh flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-magenta to-violet text-lg font-black text-white glow-magenta">
            TD
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Limited desk — max {MAX_ACCOUNTS} seats (owner excluded)
          </p>
        </div>
        <form onSubmit={onSubmit} className="card-surface space-y-4 p-6">
          <h2 className="text-lg font-bold">Create account</h2>
          <AuthConnectivityBanner forceCheck={healthTick} />
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              disabled={busy}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              disabled={busy}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={busy}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose">
              <p className="font-semibold">{error}</p>
              {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p> : null}
            </div>
          ) : null}
          <Button type="submit" variant="magenta" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Spinner className="h-4 w-4" /> Creating account…
              </>
            ) : (
              'Join Talent Desk'
            )}
          </Button>
          <p className="text-center text-sm text-ink-muted">
            Already have access?{' '}
            <Link className="font-semibold text-cyan hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
