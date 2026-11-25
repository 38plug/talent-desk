import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '@/auth/AuthProvider'
import { AuthShell } from '@/components/auth/AuthShell'
import { MotionButtonShell } from '@/components/motion/Motion'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { registerAccount } from '@/lib/api'
import { APP_NAME, MAX_ACCOUNTS } from '@/lib/constants'
import { friendlyAuthError } from '@/lib/local-db'
import { fadeUp, springSnappy, staggerContainer } from '@/lib/motion'
import { playSfx } from '@/lib/sfx'

export function RegisterPage() {
  const { session, loading, notifyAuthChanged } = useAuth()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
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
    playSfx('tap')
    try {
      await registerAccount(email, password, fullName)
      playSfx('success')
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
    <AuthShell accent="lime">
      <motion.form
        onSubmit={onSubmit}
        className="space-y-4"
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : 'hidden'}
        animate="show"
      >
        <motion.div variants={reduce ? undefined : fadeUp}>
          <h2 className="text-lg font-bold">Create account</h2>
          <p className="floating-label mt-1 text-xs">
            Limited desk — max {MAX_ACCOUNTS} seats · {APP_NAME}
          </p>
        </motion.div>
        <motion.div variants={reduce ? undefined : fadeUp}>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            disabled={busy}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onFocus={() => playSfx('hover')}
          />
        </motion.div>
        <motion.div variants={reduce ? undefined : fadeUp}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            disabled={busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => playSfx('hover')}
          />
        </motion.div>
        <motion.div variants={reduce ? undefined : fadeUp}>
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
            onFocus={() => playSfx('hover')}
          />
        </motion.div>
        {error ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[14px] border border-rose/30 bg-rose/10 px-3 py-2.5 text-sm text-rose"
          >
            <p className="font-semibold">{error}</p>
          </motion.div>
        ) : null}
        <motion.div variants={reduce ? undefined : fadeUp} transition={springSnappy}>
          <MotionButtonShell>
            <Button type="submit" variant="lime" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Spinner className="h-4 w-4" /> Creating account…
                </>
              ) : (
                'Join Talent Desk'
              )}
            </Button>
          </MotionButtonShell>
        </motion.div>
        <motion.p className="text-center text-sm text-ink-muted" variants={reduce ? undefined : fadeUp}>
          Already have access?{' '}
          <Link
            className="font-semibold text-lime hover:underline"
            to="/login"
            onMouseEnter={() => playSfx('hover')}
            onClick={() => playSfx('whoosh')}
          >
            Sign in
          </Link>
        </motion.p>
      </motion.form>
    </AuthShell>
  )
}
