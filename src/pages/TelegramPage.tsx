import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogOut, MessageCircle, Search, Send, UserPlus } from 'lucide-react'
import { Button, EmptyState, Input, Label, PageLoader } from '@/components/ui'
import { fetchCandidates } from '@/lib/api'
import {
  clearTelegramSession,
  createTelegramClient,
  persistClientSession,
  resolveTelegramApi,
  storeTelegramApi,
  type TgDialogRow,
  type TgMessageRow,
  type TelegramApiCreds,
} from '@/lib/telegram-mtproto'
import { cn, ensureAtHandle, stripAtHandle } from '@/lib/utils'
import type { Candidate } from '@/lib/types'
import type { TelegramClient } from 'teleproto'

type AuthStep = 'creds' | 'phone' | 'code' | 'password' | 'ready' | 'connecting'

function mapDialogs(raw: Awaited<ReturnType<TelegramClient['getDialogs']>>): TgDialogRow[] {
  const rows: TgDialogRow[] = []
  for (const d of raw) {
    const entity = d.entity
    const id = String(d.id ?? '')
    if (!id) continue
    const username =
      entity && typeof entity === 'object' && 'username' in entity
        ? ((entity as { username?: string | null }).username ?? null)
        : null
    const title =
      d.title ||
      (entity && typeof entity === 'object' && 'firstName' in entity
        ? [ (entity as { firstName?: string; lastName?: string }).firstName,
            (entity as { lastName?: string }).lastName ]
            .filter(Boolean)
            .join(' ')
        : null) ||
      username ||
      'Chat'
    const msg = d.message
    const lastMessage =
      msg && typeof msg === 'object' && 'message' in msg
        ? String((msg as { message?: string }).message ?? '') || null
        : null
    rows.push({
      id,
      title: String(title),
      username: username ? String(username) : null,
      unread: Number(d.unreadCount ?? 0),
      entity,
      lastMessage,
      date: msg && typeof msg === 'object' && 'date' in msg
        ? Number((msg as { date?: number }).date ?? 0) || null
        : null,
    })
  }
  return rows
}

function mapMessages(raw: Awaited<ReturnType<TelegramClient['getMessages']>>): TgMessageRow[] {
  const rows: TgMessageRow[] = []
  for (const m of raw) {
    if (!m || typeof m !== 'object' || !('id' in m)) continue
    const text =
      'message' in m && typeof (m as { message?: unknown }).message === 'string'
        ? (m as { message: string }).message
        : ''
    const hasMedia = 'media' in m && Boolean((m as { media?: unknown }).media)
    if (!text && !hasMedia) continue
    rows.push({
      id: Number((m as { id: number }).id),
      text: text || (hasMedia ? '[media]' : ''),
      out: Boolean((m as { out?: boolean }).out),
      date: Number((m as { date?: number }).date ?? 0),
      senderName: null,
    })
  }
  return rows.sort((a, b) => a.date - b.date)
}

function matchCandidate(
  candidates: Candidate[],
  username: string | null,
  title: string,
): Candidate | null {
  const u = username ? stripAtHandle(username).toLowerCase() : ''
  if (u) {
    const byTg = candidates.find(
      (c) => c.telegram && stripAtHandle(c.telegram).toLowerCase() === u,
    )
    if (byTg) return byTg
  }
  const t = title.trim().toLowerCase()
  if (!t) return null
  return (
    candidates.find((c) => c.name.trim().toLowerCase() === t) ??
    candidates.find((c) => c.name.trim().toLowerCase().includes(t)) ??
    null
  )
}

export function TelegramPage() {
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  })

  const [step, setStep] = useState<AuthStep>(() =>
    resolveTelegramApi() ? (localStorage.getItem('talent-desk.telegram-session.v1') ? 'connecting' : 'phone') : 'creds',
  )
  const [credsForm, setCredsForm] = useState({ apiId: '', apiHash: '' })
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [meLabel, setMeLabel] = useState<string | null>(null)

  const [dialogs, setDialogs] = useState<TgDialogRow[]>([])
  const [dialogQ, setDialogQ] = useState('')
  const [active, setActive] = useState<TgDialogRow | null>(null)
  const [messages, setMessages] = useState<TgMessageRow[]>([])
  const [draft, setDraft] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)

  const clientRef = useRef<TelegramClient | null>(null)
  const phoneResolve = useRef<((v: string) => void) | null>(null)
  const codeResolve = useRef<((v: string) => void) | null>(null)
  const passwordResolve = useRef<((v: string) => void) | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const matched = useMemo(
    () => (active ? matchCandidate(candidates, active.username, active.title) : null),
    [active, candidates],
  )

  const filteredDialogs = useMemo(() => {
    const q = dialogQ.trim().toLowerCase()
    if (!q) return dialogs
    return dialogs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.username?.toLowerCase().includes(q) ?? false) ||
        (d.lastMessage?.toLowerCase().includes(q) ?? false),
    )
  }, [dialogs, dialogQ])

  const refreshDialogs = useCallback(async (client: TelegramClient) => {
    const list = await client.getDialogs({ limit: 80 })
    setDialogs(mapDialogs(list))
  }, [])

  const openChat = useCallback(
    async (row: TgDialogRow) => {
      const client = clientRef.current
      if (!client || !row.entity) return
      setActive(row)
      setLoadingChat(true)
      setError(null)
      try {
        const msgs = await client.getMessages(row.entity as never, { limit: 60 })
        setMessages(mapMessages(msgs))
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load messages')
      } finally {
        setLoadingChat(false)
      }
    },
    [],
  )

  const startClient = useCallback(
    async (creds: TelegramApiCreds) => {
      setBusy(true)
      setError(null)
      setStep('connecting')
      try {
        const client = createTelegramClient(creds)
        clientRef.current = client

        await client.start({
          phoneNumber: async () =>
            new Promise<string>((resolve) => {
              phoneResolve.current = resolve
              setStep('phone')
              setBusy(false)
            }),
          phoneCode: async () =>
            new Promise<string>((resolve) => {
              codeResolve.current = resolve
              setStep('code')
              setBusy(false)
            }),
          password: async () =>
            new Promise<string>((resolve) => {
              passwordResolve.current = resolve
              setStep('password')
              setBusy(false)
            }),
          onError: (err) => {
            setError(err instanceof Error ? err.message : String(err))
          },
        })

        persistClientSession(client)
        const me = await client.getMe()
        const label =
          me && typeof me === 'object'
            ? [
                'firstName' in me ? (me as { firstName?: string }).firstName : null,
                'username' in me && (me as { username?: string }).username
                  ? `@${(me as { username: string }).username}`
                  : null,
              ]
                .filter(Boolean)
                .join(' ')
            : 'Telegram'
        setMeLabel(label || 'Connected')
        await refreshDialogs(client)
        setStep('ready')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Telegram login failed')
        setStep(resolveTelegramApi() ? 'phone' : 'creds')
      } finally {
        setBusy(false)
      }
    },
    [refreshDialogs],
  )

  // Auto-connect once when API creds exist
  useEffect(() => {
    const creds = resolveTelegramApi()
    if (!creds) {
      setStep('creds')
      return
    }
    if (clientRef.current) return
    void startClient(creds)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only connect
  }, [])

  async function onSaveCreds(e: React.FormEvent) {
    e.preventDefault()
    const apiId = Number(credsForm.apiId)
    const apiHash = credsForm.apiHash.trim()
    if (!Number.isFinite(apiId) || apiId <= 0 || !apiHash) {
      setError('Enter a valid api_id and api_hash from my.telegram.org')
      return
    }
    storeTelegramApi({ apiId, apiHash })
    await startClient({ apiId, apiHash })
  }

  function submitPhone(e: React.FormEvent) {
    e.preventDefault()
    const v = phone.trim()
    if (!v) return
    setBusy(true)
    phoneResolve.current?.(v)
    phoneResolve.current = null
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault()
    const v = code.trim()
    if (!v) return
    setBusy(true)
    codeResolve.current?.(v)
    codeResolve.current = null
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    passwordResolve.current?.(password)
    passwordResolve.current = null
  }

  async function sendDraft(e: React.FormEvent) {
    e.preventDefault()
    const client = clientRef.current
    const text = draft.trim()
    if (!client || !active?.entity || !text) return
    setBusy(true)
    setError(null)
    try {
      await client.sendMessage(active.entity as never, { message: text })
      persistClientSession(client)
      setDraft('')
      const msgs = await client.getMessages(active.entity as never, { limit: 60 })
      setMessages(mapMessages(msgs))
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed')
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    try {
      await clientRef.current?.disconnect()
    } catch {
      /* ignore */
    }
    clientRef.current = null
    clearTelegramSession()
    setDialogs([])
    setActive(null)
    setMessages([])
    setMeLabel(null)
    setStep(resolveTelegramApi() ? 'phone' : 'creds')
  }

  if (step === 'connecting' && !error) {
    return <PageLoader />
  }

  if (step !== 'ready') {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <div className="rounded-[16px] border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-ink-muted">
          Personal Telegram login uses Telegram’s client API (not a bot). Session stays in this
          browser. Unofficial clients can risk account limits — use your own api_id / api_hash from{' '}
          <a
            className="font-semibold text-cyan hover:text-lime"
            href="https://my.telegram.org"
            target="_blank"
            rel="noreferrer"
          >
            my.telegram.org
          </a>
          .
        </div>

        {step === 'creds' ? (
          <form className="card-surface space-y-3 !p-5" onSubmit={onSaveCreds}>
            <h2 className="text-lg font-bold text-ink">Connect Telegram API</h2>
            <p className="text-sm text-ink-muted">
              Create an application under API development tools, then paste api_id and api_hash. You
              can also set <code className="text-xs">VITE_TELEGRAM_API_ID</code> /{' '}
              <code className="text-xs">VITE_TELEGRAM_API_HASH</code> in env.
            </p>
            <div>
              <Label>api_id</Label>
              <Input
                inputMode="numeric"
                value={credsForm.apiId}
                onChange={(e) => setCredsForm({ ...credsForm, apiId: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>api_hash</Label>
              <Input
                value={credsForm.apiHash}
                onChange={(e) => setCredsForm({ ...credsForm, apiHash: e.target.value })}
                required
              />
            </div>
            {error ? <p className="text-sm text-rose">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              Continue
            </Button>
          </form>
        ) : null}

        {step === 'phone' ? (
          <form className="card-surface space-y-3 !p-5" onSubmit={submitPhone}>
            <h2 className="text-lg font-bold text-ink">Phone number</h2>
            <p className="text-sm text-ink-muted">International format, e.g. +855…</p>
            <Input
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+855…"
              required
            />
            {error ? <p className="text-sm text-rose">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              Send code
            </Button>
          </form>
        ) : null}

        {step === 'code' ? (
          <form className="card-surface space-y-3 !p-5" onSubmit={submitCode}>
            <h2 className="text-lg font-bold text-ink">Login code</h2>
            <p className="text-sm text-ink-muted">
              Check Telegram on your other devices (app code) or SMS.
            </p>
            <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            {error ? <p className="text-sm text-rose">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              Verify
            </Button>
          </form>
        ) : null}

        {step === 'password' ? (
          <form className="card-surface space-y-3 !p-5" onSubmit={submitPassword}>
            <h2 className="text-lg font-bold text-ink">Two-step password</h2>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <p className="text-sm text-rose">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              Unlock
            </Button>
          </form>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[420px] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">Telegram</p>
          <p className="truncate text-sm text-ink-muted">{meLabel ?? 'Connected'}</p>
        </div>
        <Button type="button" variant="secondary" size="sm" className="ml-auto" onClick={() => void disconnect()}>
          <LogOut className="h-3.5 w-3.5" /> Disconnect
        </Button>
      </div>

      {error ? <p className="text-sm text-rose">{error}</p> : null}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
        {/* Dialogs */}
        <aside className="card-surface flex min-h-0 flex-col !p-0">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-dim" />
              <Input
                className="h-9 pl-8 text-sm"
                placeholder="Search chats"
                value={dialogQ}
                onChange={(e) => setDialogQ(e.target.value)}
              />
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {filteredDialogs.length === 0 ? (
              <li className="p-4 text-sm text-ink-dim">No chats</li>
            ) : (
              filteredDialogs.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => void openChat(d)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 border-b border-border/60 px-3 py-2.5 text-left hover:bg-white/[0.04]',
                      active?.id === d.id && 'bg-lime/10',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{d.title}</span>
                      {d.unread > 0 ? (
                        <span className="ml-auto rounded-full bg-lime/20 px-1.5 text-[10px] font-bold text-lime">
                          {d.unread}
                        </span>
                      ) : null}
                    </span>
                    <span className="truncate text-xs text-ink-dim">
                      {d.username ? ensureAtHandle(d.username) + ' · ' : ''}
                      {d.lastMessage ?? '—'}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Messages */}
        <section className="card-surface flex min-h-0 flex-col !p-0">
          {active ? (
            <>
              <header className="border-b border-border px-4 py-3">
                <p className="font-bold text-ink">{active.title}</p>
                <p className="text-xs text-ink-dim">
                  {active.username ? ensureAtHandle(active.username) : 'Private chat'}
                </p>
              </header>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {loadingChat ? (
                  <p className="text-sm text-ink-dim">Loading…</p>
                ) : messages.length === 0 ? (
                  <EmptyState title="No messages" description="Send the first message below." />
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn('flex', m.out ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-[14px] px-3 py-2 text-sm whitespace-pre-wrap',
                          m.out
                            ? 'bg-lime/20 text-ink'
                            : 'border border-border bg-canvas-raised text-ink',
                        )}
                      >
                        {m.text}
                        <p className="mt-1 text-[10px] text-ink-dim">
                          {m.date
                            ? new Date(m.date * 1000).toLocaleString(undefined, {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
              <form
                className="flex gap-2 border-t border-border p-3"
                onSubmit={(e) => void sendDraft(e)}
              >
                <Input
                  className="flex-1"
                  placeholder="Message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button type="submit" disabled={busy || !draft.trim()} className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <MessageCircle className="h-8 w-8 text-ink-dim" />
              <p className="text-sm text-ink-muted">Select a chat to read and reply.</p>
            </div>
          )}
        </section>

        {/* Candidate side panel */}
        <aside className="card-surface hidden min-h-0 flex-col gap-3 !p-4 lg:flex">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
            Candidate
          </p>
          {!active ? (
            <p className="text-sm text-ink-dim">Open a chat to match a desk candidate.</p>
          ) : matched ? (
            <div className="space-y-2 text-sm">
              <p className="text-base font-bold text-ink">{matched.name}</p>
              <p className="text-ink-muted">Stage · {matched.stage}</p>
              <p className="text-ink-muted">
                TG · {matched.telegram ? ensureAtHandle(matched.telegram) : '—'}
              </p>
              <p className="text-ink-muted">Market · {matched.market ?? 'unset'}</p>
              <Link
                to={`/candidates?id=${encodeURIComponent(matched.id)}`}
                className="inline-flex text-xs font-semibold text-cyan hover:text-lime"
              >
                Open candidate drawer
              </Link>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-ink-muted">
                No desk candidate matched{' '}
                {active.username ? ensureAtHandle(active.username) : active.title}.
              </p>
              <Link
                to="/candidates"
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan hover:text-lime"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add on Candidates
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
