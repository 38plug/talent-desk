import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Download, Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  PageLoader,
  Select,
  stageTone,
} from '@/components/ui'
import {
  confirmEarning,
  deleteEarning,
  fetchCandidates,
  fetchEarnings,
  fetchOffers,
  upsertEarning,
} from '@/lib/api'
import { EARNING_STATUSES, type EarningStatus } from '@/lib/constants'
import { formatMoney, parseNumericInput } from '@/lib/utils'

export function EarningsPage() {
  const qc = useQueryClient()
  const { data: earnings = [], isLoading } = useQuery({
    queryKey: ['earnings'],
    queryFn: fetchEarnings,
  })
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const { data: offers = [] } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })

  const [statusFilter, setStatusFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    candidateId: '',
    offerId: '',
    amount: '',
    status: 'Estimated' as EarningStatus,
    notes: '',
  })

  const save = useMutation({
    mutationFn: async () => {
      const amount = parseNumericInput(form.amount)
      if (amount == null) throw new Error('Enter a valid amount (e.g. 1.600 or 1,600)')
      await upsertEarning({
        candidateId: form.candidateId || null,
        offerId: form.offerId || null,
        amount,
        status: form.status,
        notes: form.notes || undefined,
      })
    },
    onSuccess: async () => {
      setOpen(false)
      setForm({ candidateId: '', offerId: '', amount: '', status: 'Estimated', notes: '' })
      await qc.invalidateQueries({ queryKey: ['earnings'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const confirm = useMutation({
    mutationFn: confirmEarning,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['earnings'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const changeStatus = useMutation({
    mutationFn: async (payload: { id: string; status: EarningStatus }) => {
      const row = earnings.find((e) => e.id === payload.id)
      if (!row) return
      await upsertEarning(
        {
          candidateId: row.candidateId,
          offerId: row.offerId,
          amount: row.amount,
          status: payload.status,
          notes: row.notes ?? undefined,
        },
        payload.id,
      )
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['earnings'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      await changeStatus.mutateAsync({ id, status: 'Paid' })
    },
  })

  const remove = useMutation({
    mutationFn: deleteEarning,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['earnings'] }),
  })

  const filtered = useMemo(
    () => earnings.filter((e) => (statusFilter === 'all' ? true : e.status === statusFilter)),
    [earnings, statusFilter],
  )

  const totals = useMemo(() => {
    const sum = (s: EarningStatus) =>
      earnings.filter((e) => e.status === s).reduce((a, e) => a + e.amount, 0)
    return {
      estimated: sum('Estimated'),
      pending: sum('Pending'),
      paid: sum('Paid'),
      overdue: sum('Overdue'),
    }
  }, [earnings])

  function exportCsv() {
    const header = 'id,candidate,amount,status,createdAt\n'
    const body = filtered
      .map((e) => {
        const name = candidates.find((c) => c.id === e.candidateId)?.name ?? ''
        return `${e.id},${JSON.stringify(name)},${e.amount},${e.status},${e.createdAt}`
      })
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'talent-desk-earnings.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ['Awaiting (Estimated)', totals.estimated, 'violet'],
            ['Pending income', totals.pending, 'cyan'],
            ['Paid', totals.paid, 'emerald'],
            ['Overdue', totals.overdue, 'rose'],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="card-surface !p-4">
            <p className="text-xs text-ink-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular">{formatMoney(value)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {EARNING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
        <Button className="ml-auto" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add earning
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Ledger is empty"
          description="Earnings start as Estimated. Confirm to move them into personal income (Pending), then mark Paid."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add earning
            </Button>
          }
        />
      ) : (
        <div className="card-surface overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-ink-dim">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Offer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      {candidates.find((c) => c.id === e.candidateId)?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {offers.find((o) => o.id === e.offerId)?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular font-semibold">{formatMoney(e.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={stageTone(e.status)}>{e.status}</Badge>
                        <Select
                          className="h-8 w-[8.5rem] text-xs"
                          aria-label={`Payment status for ${candidates.find((c) => c.id === e.candidateId)?.name ?? 'earning'}`}
                          value={e.status}
                          disabled={changeStatus.isPending}
                          onChange={(ev) =>
                            changeStatus.mutate({
                              id: e.id,
                              status: ev.target.value as EarningStatus,
                            })
                          }
                        >
                          {EARNING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {e.status === 'Estimated' ? (
                          <Button size="sm" variant="cyan" onClick={() => confirm.mutate(e.id)}>
                            <Check className="h-3.5 w-3.5" /> Confirm
                          </Button>
                        ) : null}
                        {e.status === 'Pending' || e.status === 'Overdue' ? (
                          <Button size="sm" variant="secondary" onClick={() => markPaid.mutate(e.id)}>
                            Mark paid
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          className="h-8 w-8 px-0"
                          aria-label="Delete earning"
                          title="Delete earning"
                          onClick={() => remove.mutate(e.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add earning">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div>
            <Label>Candidate</Label>
            <Select
              value={form.candidateId}
              onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
            >
              <option value="">None</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Offer</Label>
            <Select value={form.offerId} onChange={(e) => setForm({ ...form, offerId: e.target.value })}>
              <option value="">None</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Amount *</Label>
            <Input
              required
              inputMode="decimal"
              placeholder="1.600 or 1600"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EarningStatus })}
            >
              {EARNING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-ink-dim">
              Default is Estimated — not income until confirmed.
            </p>
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
