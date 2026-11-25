import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, X } from 'lucide-react'
import { fetchCandidates, fetchInterviews, fetchOffers } from '@/lib/api'
import {
  areInterviewRemindersEnabled,
  isInterviewDueForReminder,
  markInterviewReminded,
  showInterviewOsNotification,
  wasInterviewReminded,
} from '@/lib/interview-reminders'
import { playSfx } from '@/lib/sfx'
import { Button } from '@/components/ui'

type ActiveReminder = {
  id: string
  candidateName: string
  offerTitle: string | null
  scheduledAt: string
}

const TICK_MS = 5_000

/**
 * Desk-wide watcher: when an upcoming interview is about to start, fire an OS
 * notification (if permitted) and an in-app toast. Mount inside AppShell.
 */
export function InterviewReminderWatcher() {
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
    refetchInterval: 30_000,
  })
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  })
  const { data: offers = [] } = useQuery({
    queryKey: ['offers'],
    queryFn: fetchOffers,
  })

  const [toast, setToast] = useState<ActiveReminder | null>(null)

  useEffect(() => {
    if (!areInterviewRemindersEnabled()) return

    const candName = (id: string) => candidates.find((c) => c.id === id)?.name ?? 'Candidate'
    const offerTitle = (id: string | null) =>
      id ? (offers.find((o) => o.id === id)?.title ?? null) : null

    const tick = () => {
      if (!areInterviewRemindersEnabled()) return
      for (const i of interviews) {
        if (wasInterviewReminded(i.id)) continue
        if (!isInterviewDueForReminder(i.scheduledAt)) continue

        markInterviewReminded(i.id)
        const name = candName(i.candidateId)
        const offer = offerTitle(i.offerId)
        const when = new Date(i.scheduledAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
        const title = 'Interview starting'
        const body = offer ? `${name} · ${offer} · ${when}` : `${name} · ${when}`
        const href = `/interviews`

        showInterviewOsNotification({ id: i.id, title, body, href })
        playSfx('success')
        setToast({
          id: i.id,
          candidateName: name,
          offerTitle: offer,
          scheduledAt: i.scheduledAt,
        })
        // One toast at a time — first due interview wins this tick
        break
      }
    }

    tick()
    const id = window.setInterval(tick, TICK_MS)
    return () => window.clearInterval(id)
  }, [interviews, candidates, offers])

  if (!toast || typeof document === 'undefined') return null

  const whenLabel = new Date(toast.scheduledAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[220] flex justify-center p-3 sm:p-4"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[16px] border border-lime/35 bg-canvas/95 px-4 py-3 shadow-[0_0_32px_rgb(198_244_50/0.18)] backdrop-blur-xl">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-lime/15 text-lime">
          <Bell className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
            Interview starting
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-ink">{toast.candidateName}</p>
          <p className="truncate text-xs text-ink-muted">
            {toast.offerTitle ? `${toast.offerTitle} · ` : ''}
            {whenLabel}
          </p>
          <Link
            to="/interviews"
            className="mt-2 inline-flex text-xs font-semibold text-cyan hover:text-lime"
            onClick={() => setToast(null)}
          >
            Open interviews
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 px-0"
          aria-label="Dismiss reminder"
          onClick={() => setToast(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>,
    document.body,
  )
}
