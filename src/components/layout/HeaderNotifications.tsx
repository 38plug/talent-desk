import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { fetchActivities } from '@/lib/api'
import {
  hrefForActivity,
  isAddActivity,
  readNotificationsSeenAt,
  writeNotificationsSeenAt,
} from '@/lib/desk-notifications'
import { playSfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

/**
 * Header bell: unread badge + dropdown for “Added candidate / Added offer” activity.
 * Watermark is per-browser (`talent-desk.notifications-seen.v1`).
 */
export function HeaderNotifications() {
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => fetchActivities(40),
    // Live desk: pull new offer/candidate posts every second (cloud realtime also invalidates).
    refetchInterval: 1_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const [seenAt, setSeenAt] = useState(() => readNotificationsSeenAt())
  /** Snapshot of seen watermark when the panel opened — keeps “new” highlight for this open. */
  const [highlightBefore, setHighlightBefore] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const prevUnread = useRef(0)

  const notifyItems = useMemo(() => {
    return activities
      .map((a) => {
        const kind = isAddActivity(a.entityType, a.message)
        if (!kind) return null
        return { ...a, kind }
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
  }, [activities])

  const unread = useMemo(() => {
    if (!seenAt) return notifyItems.length
    return notifyItems.filter((a) => a.createdAt > seenAt).length
  }, [notifyItems, seenAt])

  useEffect(() => {
    if (unread > prevUnread.current && unread > 0) {
      playSfx('pop')
    }
    prevUnread.current = unread
  }, [unread])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function markSeen() {
    const latest = notifyItems[0]?.createdAt ?? new Date().toISOString()
    writeNotificationsSeenAt(latest)
    setSeenAt(latest)
  }

  function toggle() {
    playSfx('tap')
    const next = !open
    if (next) {
      setHighlightBefore(seenAt)
      markSeen()
    }
    setOpen(next)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/80 text-ink-muted transition hover:border-lime/35 hover:text-lime"
        aria-label={unread ? `${unread} new notifications` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-canvas shadow-[0_0_12px_rgb(198_244_50/0.55)]">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Desk notifications"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[16px] border border-border bg-canvas-raised/95 shadow-[0_16px_48px_rgb(0_0_0/0.45)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
              Notifications
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-ink-dim hover:text-lime"
              onClick={() => {
                markSeen()
                setOpen(false)
              }}
            >
              Mark read
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifyItems.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-ink-dim">
                No offer or candidate posts yet.
              </li>
            ) : (
              notifyItems.slice(0, 20).map((a) => {
                const isNew = !highlightBefore || a.createdAt > highlightBefore
                return (
                  <li key={a.id} className="border-b border-border/60 last:border-0">
                    <Link
                      to={hrefForActivity(a.kind, a.entityId)}
                      className={cn(
                        'block px-3 py-2.5 text-sm hover:bg-white/[0.04]',
                        isNew && 'bg-lime/[0.06]',
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <p className="font-semibold text-ink">{a.message}</p>
                      <p className="mt-0.5 text-[11px] text-ink-dim">
                        {a.kind === 'candidate' ? 'Candidate' : 'Offer'} ·{' '}
                        {new Date(a.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
