import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

type PanelBox = { top: number; left: number; width: number }

/** Probe `env(safe-area-inset-*)` — getPropertyValue('env(...)') does not work. */
function readSafeInset(side: 'left' | 'right'): number {
  if (typeof document === 'undefined') return 0
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;padding-${side}:env(safe-area-inset-${side},0px)`
  document.body.appendChild(probe)
  const pad =
    side === 'left'
      ? getComputedStyle(probe).paddingLeft
      : getComputedStyle(probe).paddingRight
  probe.remove()
  const n = Number.parseFloat(pad)
  return Number.isFinite(n) ? n : 0
}

/** Keep the panel inside the viewport; prefer right-align under the bell. */
function computePanelBox(anchor: DOMRect): PanelBox {
  // Match `.header-pad` floor (1.25rem) plus any notch inset.
  const marginL = Math.max(20, readSafeInset('left'))
  const marginR = Math.max(20, readSafeInset('right'))
  const gap = 8
  const vw = window.innerWidth
  const width = Math.min(22 * 16, Math.max(0, vw - marginL - marginR))
  // Ideal: right edges of panel and button align (desktop popover).
  let left = anchor.right - width
  if (left < marginL) left = marginL
  if (left + width > vw - marginR) left = Math.max(marginL, vw - marginR - width)
  return {
    top: anchor.bottom + gap,
    left,
    width,
  }
}

/**
 * Header bell: unread badge + dropdown for “Added candidate / Added offer” activity.
 * Watermark is per-browser (`talent-desk.notifications-seen.v1`).
 *
 * Panel portals to `document.body` — header `backdrop-blur` would otherwise make
 * `position:fixed` resolve against the header (clipping on phones, overflowing on desktop).
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
  const [panelBox, setPanelBox] = useState<PanelBox | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
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

  useLayoutEffect(() => {
    if (!open) {
      setPanelBox(null)
      return
    }
    function place() {
      const el = buttonRef.current
      if (!el) return
      setPanelBox(computePanelBox(el.getBoundingClientRect()))
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setOpen(false)
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

  const panel =
    open && panelBox
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Desk notifications"
            className="fixed z-[60] max-h-[min(24rem,calc(100dvh-5rem))] overflow-hidden rounded-[16px] border border-border bg-canvas-raised/95 shadow-[0_16px_48px_rgb(0_0_0/0.45)] backdrop-blur-xl"
            style={{
              top: panelBox.top,
              left: panelBox.left,
              width: panelBox.width,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
              <p className="min-w-0 truncate text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
                Notifications
              </p>
              <button
                type="button"
                className="shrink-0 text-xs font-semibold text-ink-dim hover:text-lime"
                onClick={() => {
                  markSeen()
                  setOpen(false)
                }}
              >
                Mark read
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto overflow-x-hidden">
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
                        <p className="font-semibold break-words text-ink">{a.message}</p>
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
          </div>,
          document.body,
        )
      : null

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/80 text-ink-muted transition hover:border-lime/35 hover:text-lime sm:h-10 sm:w-10"
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
      {panel}
    </div>
  )
}
