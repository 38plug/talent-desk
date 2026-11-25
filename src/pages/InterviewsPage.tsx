import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bell, CalendarDays, Check, Plus, Trash2, X } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  PageLoader,
  Select,
  Textarea,
  stageTone,
} from '@/components/ui'
import { DeskTotalsStrip } from '@/components/desk/DeskTotalsStrip'
import {
  deleteInterview,
  fetchCandidates,
  fetchEarnings,
  fetchInterviews,
  fetchOffers,
  upsertEarning,
  upsertInterview,
} from '@/lib/api'
import { estimateOfferCommission } from '@/lib/commission'
import {
  INTERVIEW_OUTCOME_CONFIRMED,
  INTERVIEW_OUTCOME_DECLINED,
  isInterviewDecided,
} from '@/lib/constants'
import {
  areInterviewRemindersEnabled,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/interview-reminders'
import { formatMoney } from '@/lib/utils'
import type { Interview } from '@/lib/types'

export function InterviewsPage() {
  const qc = useQueryClient()
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  })
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const { data: offers = [] } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })
  const { data: earnings = [] } = useQuery({ queryKey: ['earnings'], queryFn: fetchEarnings })

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [open, setOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [form, setForm] = useState({
    candidateId: '',
    offerId: '',
    scheduledAt: '',
    outcome: '',
    notes: '',
  })
  const [showNotifPrompt, setShowNotifPrompt] = useState(
    () => areInterviewRemindersEnabled() && getNotificationPermission() === 'default',
  )

  const save = useMutation({
    mutationFn: () =>
      upsertInterview({
        candidateId: form.candidateId,
        offerId: form.offerId || null,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        outcome: form.outcome || undefined,
        notes: form.notes || undefined,
      }),
    onSuccess: async () => {
      setOpen(false)
      setForm({ candidateId: '', offerId: '', scheduledAt: '', outcome: '', notes: '' })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['interviews'] }),
        qc.invalidateQueries({ queryKey: ['candidates'] }),
        qc.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    },
  })

  const remove = useMutation({
    mutationFn: deleteInterview,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['interviews'] }),
  })

  const decide = useMutation({
    mutationFn: async (payload: { interview: Interview; decision: 'confirmed' | 'declined' }) => {
      const { interview, decision } = payload
      const cand = candidates.find((c) => c.id === interview.candidateId)
      if (!cand) throw new Error('Candidate not found')

      const offerId = interview.offerId ?? cand.offerId
      const offer = offerId ? offers.find((o) => o.id === offerId) : undefined

      if (decision === 'confirmed') {
        const amount = estimateOfferCommission(offer, cand)
        if (amount == null) {
          throw new Error(
            'Cannot auto-calc commission — link an offer with provision (or candidate expected salary for %).',
          )
        }

        await upsertInterview(
          {
            candidateId: interview.candidateId,
            offerId: offerId ?? null,
            scheduledAt: interview.scheduledAt,
            outcome: INTERVIEW_OUTCOME_CONFIRMED,
            notes: interview.notes ?? undefined,
          },
          interview.id,
        )

        const already = earnings.some(
          (e) =>
            e.candidateId === cand.id &&
            (offerId ? e.offerId === offerId : true) &&
            e.notes?.includes(`interview:${interview.id}`),
        )
        if (!already) {
          await upsertEarning({
            candidateId: cand.id,
            offerId: offerId ?? null,
            amount,
            status: 'Estimated',
            notes: `Interview confirm · interview:${interview.id}`,
          })
        }
        // Candidate stage → Accepted via upsertInterview sync
        return { amount }
      }

      await upsertInterview(
        {
          candidateId: interview.candidateId,
          offerId: offerId ?? null,
          scheduledAt: interview.scheduledAt,
          outcome: INTERVIEW_OUTCOME_DECLINED,
          notes: interview.notes ?? undefined,
        },
        interview.id,
      )
      // Candidate stage → Rejected via upsertInterview sync
      return { amount: null as number | null }
    },
    onSuccess: async () => {
      setActionError(null)
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['interviews'] }),
        qc.invalidateQueries({ queryKey: ['earnings'] }),
        qc.invalidateQueries({ queryKey: ['candidates'] }),
        qc.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    },
  })

  const filtered = useMemo(() => {
    const now = Date.now()
    return interviews.filter((i) => {
      const t = new Date(i.scheduledAt).getTime()
      return tab === 'upcoming' ? t >= now : t < now
    })
  }, [interviews, tab])

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <DeskTotalsStrip />

      {showNotifPrompt ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-ink">
          <Bell className="h-4 w-4 shrink-0 text-lime" aria-hidden />
          <p className="min-w-0 flex-1 text-ink-muted">
            Allow system notifications so computer and phone browsers can alert you when an interview
            is about to start. In-app toast still works while the desk is open.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={async () => {
              await requestNotificationPermission()
              setShowNotifPrompt(getNotificationPermission() === 'default')
            }}
          >
            Allow alerts
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowNotifPrompt(false)}>
            Not now
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="pill-toggle inline-flex">
          {(['upcoming' as const, 'past' as const]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              data-active={tab === t}
              className="pill-toggle-item capitalize"
            >
              {t}
            </button>
          ))}
        </div>
        <Link
          to="/calendar"
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-[12px] border border-border px-3 text-sm font-semibold text-ink-muted hover:border-lime/40 hover:text-lime"
        >
          <CalendarDays className="h-4 w-4" /> Calendar
        </Link>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Schedule
        </Button>
      </div>

      {actionError ? <p className="text-sm text-rose">{actionError}</p> : null}

      {filtered.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming interviews' : 'No past interviews'}
          description={
            tab === 'past'
              ? 'After a slot passes, confirm hire (Estimated awaiting) or mark declined by the company.'
              : 'Schedule calls against candidates and offers. Outcomes stay on the record.'
          }
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Schedule interview
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((i) => {
            const cand = candidates.find((c) => c.id === i.candidateId)
            const offer = offers.find((o) => o.id === (i.offerId ?? cand?.offerId))
            const preview = estimateOfferCommission(offer, cand)
            const decided = isInterviewDecided(i.outcome)
            const showDecide = tab === 'past' && !decided

            return (
              <li key={i.id} className="card-surface flex flex-wrap items-center gap-3 !p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{cand?.name ?? 'Candidate'}</p>
                  <p className="text-sm text-ink-muted">{offer?.title ?? 'No offer linked'}</p>
                  <p className="mt-1 text-xs text-ink-dim">
                    {new Date(i.scheduledAt).toLocaleString()}
                    {tab === 'past' && preview != null ? (
                      <>
                        {' '}
                        · Est. commission {formatMoney(preview)}
                      </>
                    ) : null}
                  </p>
                </div>
                {i.outcome ? (
                  <Badge tone={stageTone(i.outcome)}>{i.outcome}</Badge>
                ) : (
                  <Badge>Scheduled</Badge>
                )}
                {showDecide ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="lime"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ interview: i, decision: 'confirmed' })}
                    >
                      <Check className="h-3.5 w-3.5" /> Confirmed
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ interview: i, decision: 'declined' })}
                    >
                      <X className="h-3.5 w-3.5" /> Declined
                    </Button>
                  </div>
                ) : null}
                <Button
                  size="sm"
                  variant="danger"
                  className="h-8 w-8 px-0"
                  aria-label={`Delete interview for ${cand?.name ?? 'candidate'}`}
                  title={`Delete interview for ${cand?.name ?? 'candidate'}`}
                  onClick={() => remove.mutate(i.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Schedule interview">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div>
            <Label>Candidate *</Label>
            <Select
              required
              value={form.candidateId}
              onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
            >
              <option value="">Select…</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Offer</Label>
            <Select
              value={form.offerId}
              onChange={(e) => setForm({ ...form, offerId: e.target.value })}
            >
              <option value="">None</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>When *</Label>
            <Input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>
          <div>
            <Label>Outcome</Label>
            <Input
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {save.isError ? (
            <p className="text-sm text-rose">
              {save.error instanceof Error ? save.error.message : 'Failed'}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
