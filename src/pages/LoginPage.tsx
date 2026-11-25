import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '@/auth/AuthProvider'
import { AuthShell } from '@/components/auth/AuthShell'
import { MotionButtonShell } from '@/components/motion/Motion'
import { Button, Input, Label, Spinner } from '@/components/ui'
import { loginAccount } from '@/lib/api'
import { APP_NAME } from '@/lib/constants'
import { friendlyAuthError } from '@/lib/local-db'
import { fadeUp, springSnappy, staggerContainer } from '@/lib/motion'
import { playSfx } from '@/lib/sfx'

export function LoginPage() {
  const { session, loading, notifyAuthChanged } = useAuth()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    playSfx('tap')
    try {
      await loginAccount(email, password)
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
    <AuthShell accent="violet">
      <motion.form
        onSubmit={onSubmit}
        className="space-y-4"
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : 'hidden'}
        animate="show"
      >
        <motion.div
          className="flex items-center justify-between gap-2"
          variants={reduce ? undefined : fadeUp}
        >
          <h2 className="text-lg font-bold">Sign in</h2>
          <span className="rounded-full border border-cyan/30 bg-cyan/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-cyan uppercase">
            {APP_NAME}
          </span>
        </motion.div>
        <motion.p className="text-xs leading-relaxed text-ink-muted" variants={reduce ? undefined : fadeUp}>
          Accounts and desk data stay in this browser. Empty until you add records or import JSON.
        </motion.p>
        <motion.div variants={reduce ? undefined : fadeUp}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
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
            autoComplete="current-password"
            required
            minLength={8}
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
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Spinner className="h-4 w-4" /> Signing in…
                </>
              ) : (
                'Enter Talent Desk'
              )}
            </Button>
          </MotionButtonShell>
        </motion.div>
        <motion.p className="text-center text-sm text-ink-muted" variants={reduce ? undefined : fadeUp}>
          New here?{' '}
          <Link
            className="font-semibold text-cyan hover:underline"
            to="/register"
            onMouseEnter={() => playSfx('hover')}
            onClick={() => playSfx('whoosh')}
          >
            Create account
          </Link>
        </motion.p>
      </motion.form>
    </AuthShell>
  )
}
