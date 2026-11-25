import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Input, Label, Modal, Select, Textarea } from '@/components/ui'
import {
  deleteInterview,
  fetchCandidates,
  fetchOffers,
  upsertInterview,
} from '@/lib/api'
import type { Interview } from '@/lib/types'
import { toDatetimeLocalValue } from '@/lib/datetime'

export type ScheduleInterviewSeed = {
  candidateId?: string
  scheduledAt?: string
  interview?: Interview | null
}

type Props = {
  open: boolean
  onClose: () => void
  seed?: ScheduleInterviewSeed | null
}

type FormState = {
  candidateId: string
  offerId: string
  scheduledAt: string
  outcome: string
  notes: string
}

function emptyForm(seed?: ScheduleInterviewSeed | null): FormState {
  const interview = seed?.interview
  if (interview) {
    return {
      candidateId: interview.candidateId,
      offerId: interview.offerId ?? '',
      scheduledAt: toDatetimeLocalValue(interview.scheduledAt),
      outcome: interview.outcome ?? '',
      notes: interview.notes ?? '',
    }
  }
  return {
    candidateId: seed?.candidateId ?? '',
    offerId: '',
    scheduledAt: seed?.scheduledAt ? toDatetimeLocalValue(seed.scheduledAt) : '',
    outcome: '',
    notes: '',
  }
}

function ScheduleInterviewForm({
  seed,
  onClose,
}: {
  seed?: ScheduleInterviewSeed | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const { data: offers = [] } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })
  const [form, setForm] = useState<FormState>(() => emptyForm(seed))

  const editingId = seed?.interview?.id

  const save = useMutation({
    mutationFn: () =>
      upsertInterview(
        {
          candidateId: form.candidateId,
          offerId: form.offerId || null,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          outcome: form.outcome || undefined,
          notes: form.notes || undefined,
        },
        editingId,
      ),
    onSuccess: async () => {
      onClose()
      await qc.invalidateQueries({ queryKey: ['interviews'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const remove = useMutation({
    mutationFn: () => {
      if (!editingId) throw new Error('Nothing to delete')
      return deleteInterview(editingId)
    },
    onSuccess: async () => {
      onClose()
      await qc.invalidateQueries({ queryKey: ['interviews'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate()
      }}
    >
      {editingId ? <Badge tone="cyan">Editing scheduled call</Badge> : null}
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
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      {save.isError || remove.isError ? (
        <p className="text-sm text-rose">
          {(save.error ?? remove.error) instanceof Error
            ? ((save.error ?? remove.error) as Error).message
            : 'Failed'}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        {editingId ? (
          <Button
            type="button"
            variant="danger"
            className="mr-auto"
            disabled={remove.isPending || save.isPending}
            onClick={() => remove.mutate()}
          >
            Delete
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending || remove.isPending}>
          {editingId ? 'Save changes' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

export function ScheduleInterviewModal({ open, onClose, seed }: Props) {
  const formKey =
    seed?.interview?.id ??
    `${seed?.candidateId ?? 'new'}-${seed?.scheduledAt ?? 'blank'}`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={seed?.interview?.id ? 'Edit interview' : 'Schedule interview'}
    >
      {open ? (
        <ScheduleInterviewForm key={formKey} seed={seed} onClose={onClose} />
      ) : null}
    </Modal>
  )
}
