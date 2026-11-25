import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
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
} from '@/components/ui'
import {
  deleteInterview,
  fetchCandidates,
  fetchInterviews,
  fetchOffers,
  upsertInterview,
} from '@/lib/api'

export function InterviewsPage() {
  const qc = useQueryClient()
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  })
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const { data: offers = [] } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    candidateId: '',
    offerId: '',
    scheduledAt: '',
    outcome: '',
    notes: '',
  })

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
      await qc.invalidateQueries({ queryKey: ['interviews'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const remove = useMutation({
    mutationFn: deleteInterview,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['interviews'] }),
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="pill-toggle inline-flex">
          {(['upcoming', 'past'] as const).map((t) => (
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

      {filtered.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming interviews' : 'No past interviews'}
          description="Schedule calls against candidates and offers. Outcomes stay on the record."
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
            const offer = offers.find((o) => o.id === i.offerId)
            return (
              <li key={i.id} className="card-surface flex flex-wrap items-center gap-4 !p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{cand?.name ?? 'Candidate'}</p>
                  <p className="text-sm text-ink-muted">{offer?.title ?? 'No offer linked'}</p>
                  <p className="mt-1 text-xs text-ink-dim">
                    {new Date(i.scheduledAt).toLocaleString()}
                  </p>
                </div>
                {i.outcome ? <Badge tone="cyan">{i.outcome}</Badge> : <Badge>Scheduled</Badge>}
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
