import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { loginAccount } from '@/lib/api'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { friendlyAuthError } from '@/lib/local-db'

export function LoginPage() {
  const { session, loading, notifyAuthChanged } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await loginAccount(email, password)
      notifyAuthChanged()
      navigate('/')
    } catch (err) {
      const friendly = friendlyAuthError(err)
      setError(friendly.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-mesh relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="auth-orb -top-24 -left-16 h-72 w-72 bg-violet" />
      <div className="auth-orb -right-20 bottom-0 h-80 w-80 bg-cyan" />
      <div className="auth-orb top-1/3 right-1/4 h-40 w-40 bg-magenta" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet via-magenta to-cyan text-xl font-black text-white glow-violet">
            TD
          </div>
          <h1 className="text-glow-violet text-4xl font-extrabold tracking-tight text-ink">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{APP_TAGLINE}</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="card-surface card-glow space-y-4 p-7 shadow-[0_0_80px_rgb(124_58_237/0.22)]"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Sign in</h2>
            <span className="rounded-full border border-cyan/30 bg-cyan/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-cyan uppercase">
              {APP_NAME}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">
            Accounts and desk data stay in this browser (localStorage). Empty until you add records
            or import JSON.
          </p>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
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
              autoComplete="current-password"
              required
              minLength={8}
              disabled={busy}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <div className="rounded-[14px] border border-rose/30 bg-rose/10 px-3 py-2.5 text-sm text-rose">
              <p className="font-semibold">{error}</p>
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Spinner className="h-4 w-4" /> Signing in…
              </>
            ) : (
              'Enter Talent Desk'
            )}
          </Button>
          <p className="text-center text-sm text-ink-muted">
            New here?{' '}
            <Link className="font-semibold text-cyan hover:underline" to="/register">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
