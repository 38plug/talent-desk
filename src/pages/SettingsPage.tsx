import { useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Card, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import { changePassword } from '@/lib/api'
import { APP_NAME, PIPELINE_STAGES } from '@/lib/constants'
import { friendlyAuthError } from '@/lib/supabase'

export function SettingsPage() {
  const { profile, user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setErr(null)
    setBusy(true)
    try {
      await changePassword(currentPassword, newPassword)
      setMsg('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      const f = friendlyAuthError(error)
      setErr(f.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-dim">Desk</dt>
            <dd className="font-semibold">{APP_NAME}</dd>
          </div>
          <div>
            <dt className="text-ink-dim">Email</dt>
            <dd className="font-semibold">{user?.email ?? profile?.email}</dd>
          </div>
          <div>
            <dt className="text-ink-dim">Role</dt>
            <dd className="font-semibold capitalize">{profile?.role ?? 'user'}</dd>
          </div>
          <div>
            <dt className="text-ink-dim">Name</dt>
            <dd className="font-semibold">{profile?.fullName || '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <form className="grid max-w-md gap-3" onSubmit={onChangePassword}>
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {msg ? <p className="text-sm text-emerald">{msg}</p> : null}
          {err ? <p className="text-sm text-rose">{err}</p> : null}
          <Button type="submit" disabled={busy} className="w-fit">
            Update password
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline stages</CardTitle>
        </CardHeader>
        <ol className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((s, i) => (
            <li
              key={s}
              className="rounded-full border border-border bg-canvas-raised px-3 py-1 text-xs font-semibold text-ink-muted"
            >
              {String(i + 1).padStart(2, '0')} {s}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-ink-muted">
          Stage changes write activity events. Rejected can happen from any stage.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provision rules</CardTitle>
        </CardHeader>
        <p className="text-sm text-ink-muted">
          Provision lives on each offer as a <strong className="text-ink">fixed</strong> amount per
          candidate or a <strong className="text-ink">percent</strong> of expected salary. UI wording
          is Provision; DB columns remain <code className="text-cyan">commission*</code>.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual system</CardTitle>
        </CardHeader>
        <p className="text-sm text-ink-muted">
          Neon dark violet / cyan / magenta. Dealing-slip / blotter direction is retired for this
          rebuild.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['#7C3AED', '#22D3EE', '#EC4899', '#10B981', '#F59E0B', '#F43F5E'].map((c) => (
            <span
              key={c}
              className="h-8 w-8 rounded-full border border-white/10"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
