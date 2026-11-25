import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { registerAccount } from '@/lib/api'
import { APP_NAME, MAX_ACCOUNTS } from '@/lib/constants'
import { friendlyAuthError } from '@/lib/local-db'

export function RegisterPage() {
  const { session, loading, notifyAuthChanged } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setBusy(true)
    try {
      await registerAccount(email, password, fullName)
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
      <div className="auth-orb -top-16 right-0 h-72 w-72 bg-magenta" />
      <div className="auth-orb -bottom-24 -left-10 h-80 w-80 bg-cyan" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-magenta via-violet to-cyan text-xl font-black text-white glow-magenta">
            TD
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Limited desk — max {MAX_ACCOUNTS} seats (owner excluded)
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="card-surface card-glow space-y-4 p-7 shadow-[0_0_80px_rgb(236_72_153/0.18)]"
        >
          <h2 className="text-lg font-bold">Create account</h2>
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
            <div className="rounded-[14px] border border-rose/30 bg-rose/10 px-3 py-2.5 text-sm text-rose">
              <p className="font-semibold">{error}</p>
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
