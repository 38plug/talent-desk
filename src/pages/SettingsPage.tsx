import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Card, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import {
  changePassword,
  exportDataJsonAsync,
  importDataJson,
  isCloudSyncEnabled,
  uploadLocalDeskToCloud,
} from '@/lib/api'
import { APP_NAME, PIPELINE_STAGES } from '@/lib/constants'
import { friendlyAuthError } from '@/lib/local-db'
import { friendlyCloudAuthError } from '@/lib/supabase'

export function SettingsPage() {
  const { profile, user, notifyAuthChanged, cloudSync } = useAuth()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [importErr, setImportErr] = useState<string | null>(null)
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [syncErr, setSyncErr] = useState<string | null>(null)

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
      const f = isCloudSyncEnabled ? friendlyCloudAuthError(error) : friendlyAuthError(error)
      setErr(f.message)
    } finally {
      setBusy(false)
    }
  }

  async function downloadExport() {
    const json = await exportDataJsonAsync(true)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `talent-desk-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function runImport(raw: string) {
    setImportMsg(null)
    setImportErr(null)
    try {
      const result = await importDataJson(raw)
      if (isCloudSyncEnabled) {
        setImportMsg(
          `Uploaded ${result.rows} pipeline row(s) to the shared cloud desk. Team accounts must register/sign in separately (local password hashes do not transfer).`,
        )
      } else {
        setImportMsg(`Imported ${result.accounts} account(s) and ${result.rows} pipeline row(s).`)
      }
      setImportText('')
      await qc.invalidateQueries()
      notifyAuthChanged()
    } catch (error) {
      setImportErr(error instanceof Error ? error.message : 'Import failed')
    }
  }

  async function onUploadLocal() {
    setSyncMsg(null)
    setSyncErr(null)
    setSyncBusy(true)
    try {
      const { rows } = await uploadLocalDeskToCloud()
      setSyncMsg(`Uploaded ${rows} local pipeline row(s) to the shared cloud desk.`)
      await qc.invalidateQueries()
    } catch (error) {
      setSyncErr(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setSyncBusy(false)
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
          <div className="sm:col-span-2">
            <dt className="text-ink-dim">Storage</dt>
            <dd className="font-semibold">
              {cloudSync
                ? 'Hosted Supabase · shared team desk (realtime + refresh)'
                : 'This browser · localStorage (device-local fallback)'}
            </dd>
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

      {cloudSync ? (
        <Card>
          <CardHeader>
            <CardTitle>Cloud sync</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-ink-muted">
            Every signed-in teammate sees the same candidates, offers, interviews, and earnings.
            First cloud login auto-uploads this browser’s local desk when the cloud is empty. Use the
            button below to force another upload from localStorage.
          </p>
          <Button type="button" variant="secondary" disabled={syncBusy} onClick={() => void onUploadLocal()}>
            {syncBusy ? 'Uploading…' : 'Upload this browser’s local desk to cloud'}
          </Button>
          {syncMsg ? <p className="mt-3 text-sm text-emerald">{syncMsg}</p> : null}
          {syncErr ? <p className="mt-3 text-sm text-rose">{syncErr}</p> : null}
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Import / export desk data</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-ink-muted">
          {cloudSync
            ? 'Paste or upload a Talent Desk JSON export to upsert pipeline rows into the shared cloud desk. Account passwords in the export do not transfer — each teammate registers once with Supabase Auth.'
            : 'Optional: paste or upload a Talent Desk JSON export to restore accounts and pipeline rows on this device. Desk starts empty — nothing is seeded.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void downloadExport()}>
            Download JSON export
          </Button>
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            Upload JSON file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const text = await file.text()
              await runImport(text)
              e.target.value = ''
            }}
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="import-json">Or paste JSON</Label>
          <textarea
            id="import-json"
            className="mt-1 min-h-28 w-full rounded-[14px] border border-border bg-canvas-raised px-3 py-2 font-mono text-xs text-ink outline-none focus:border-violet/50"
            placeholder='{"format":"talent-desk-export","version":1,...}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <Button
            type="button"
            className="mt-2"
            disabled={!importText.trim()}
            onClick={() => void runImport(importText)}
          >
            Import pasted JSON
          </Button>
        </div>
        {importMsg ? <p className="mt-3 text-sm text-emerald">{importMsg}</p> : null}
        {importErr ? <p className="mt-3 text-sm text-rose">{importErr}</p> : null}
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
          candidate or a <strong className="text-ink">percent</strong> of expected salary.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual system</CardTitle>
        </CardHeader>
        <p className="text-sm text-ink-muted">
          Lime Glass Desk for {APP_NAME}. See DESIGN.md for tokens.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['#C6F432', '#FFB5A0', '#111111', '#1A1A1A', '#22D3EE', '#EC4899'].map((c) => (
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
