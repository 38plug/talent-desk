import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ScanLine, Trash2 } from 'lucide-react'
import { createWorker } from 'tesseract.js'
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
import { deleteOffer, fetchOffers, upsertOffer } from '@/lib/api'
import { parseOfferText, translateOfferText, type ParsedOfferPreview } from '@/lib/parse-offer'
import type { Offer, OfferFormValues } from '@/lib/types'
import { ensureAtHandle, formatMoney } from '@/lib/utils'

const blank = (): OfferFormValues => ({
  title: '',
  company: '',
  category: 'forex',
  status: 'Live',
  commissionType: 'fixed',
  commissionValue: '',
  commission: '',
  salaryMin: '',
  salaryMax: '',
  salary: '',
  location: '',
  telegram: '',
  description: '',
  roleType: '',
  accommodation: false,
  visa: false,
  flight: false,
  videoCall: false,
})

function fromOffer(o: Offer): OfferFormValues {
  return {
    title: o.title,
    company: o.company ?? '',
    category: o.category,
    status: o.status,
    commissionType: o.commissionType,
    commissionValue: o.commissionValue != null ? String(o.commissionValue) : '',
    commission: o.commission != null ? String(o.commission) : '',
    salaryMin: o.salaryMin != null ? String(o.salaryMin) : '',
    salaryMax: o.salaryMax != null ? String(o.salaryMax) : '',
    salary: o.salary != null ? String(o.salary) : '',
    location: o.location ?? '',
    telegram: o.telegram ?? '',
    description: o.description ?? '',
    roleType: o.roleType ?? '',
    accommodation: !!o.accommodation,
    visa: !!o.visa,
    flight: !!o.flight,
    videoCall: !!o.videoCall,
  }
}

function provisionLabel(o: Offer): string {
  const v = o.category === 'chinese' ? o.commission : o.commissionValue
  if (v == null) return '—'
  return o.commissionType === 'percent' ? `${v}%` : formatMoney(v)
}

function salaryLabel(o: Offer): string {
  if (o.category === 'chinese') return formatMoney(o.salary)
  if (o.salaryMin != null && o.salaryMax != null && o.salaryMin !== o.salaryMax) {
    return `${formatMoney(o.salaryMin)} – ${formatMoney(o.salaryMax)}`
  }
  return formatMoney(o.salaryMin ?? o.salaryMax ?? o.salary)
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function OffersPage() {
  const qc = useQueryClient()
  const { data: offers = [], isLoading } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>()
  const [form, setForm] = useState<OfferFormValues>(blank())
  const [scanOpen, setScanOpen] = useState(false)
  const [scanBusy, setScanBusy] = useState(false)
  const [scanMsg, setScanMsg] = useState<string | null>(null)
  const [scanPreview, setScanPreview] = useState<ParsedOfferPreview | null>(null)
  const [filter, setFilter] = useState<'all' | 'forex' | 'chinese'>('all')
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null)

  const save = useMutation({
    mutationFn: () => upsertOffer(form, editId),
    onSuccess: async () => {
      setFormOpen(false)
      setEditId(undefined)
      setForm(blank())
      await qc.invalidateQueries({ queryKey: ['offers'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      if (previewOffer && editId === previewOffer.id) {
        const next = (await fetchOffers()).find((o) => o.id === editId)
        setPreviewOffer(next ?? null)
      }
    },
  })

  const remove = useMutation({
    mutationFn: deleteOffer,
    onSuccess: async (_data, id) => {
      if (previewOffer?.id === id) setPreviewOffer(null)
      await qc.invalidateQueries({ queryKey: ['offers'] })
    },
  })

  const filtered = useMemo(
    () => offers.filter((o) => (filter === 'all' ? true : o.category === filter)),
    [offers, filter],
  )

  async function onScanFile(file: File) {
    setScanBusy(true)
    setScanMsg(null)
    setScanPreview(null)
    try {
      const worker = await createWorker(['eng', 'rus', 'por', 'deu', 'chi_sim', 'jpn', 'kor'])
      const { data } = await worker.recognize(file)
      await worker.terminate()
      const { text, translated } = await translateOfferText(data.text || '')
      setScanMsg(
        translated
          ? 'Translated to Portuguese for parsing. Review every field before creating.'
          : 'English/Portuguese kept as-is. Review every field before creating.',
      )
      setScanPreview(parseOfferText(text))
    } catch (err) {
      setScanMsg(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setScanBusy(false)
    }
  }

  function openCreateFromPreview() {
    if (!scanPreview) return
    setForm({
      ...blank(),
      ...scanPreview,
      status: 'Live',
    })
    setEditId(undefined)
    setScanOpen(false)
    setFormOpen(true)
  }

  function openEdit(o: Offer) {
    setEditId(o.id)
    setForm(fromOffer(o))
    setFormOpen(true)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-40"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">All categories</option>
          <option value="forex">Forex</option>
          <option value="chinese">Chinese</option>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => setScanOpen(true)}>
            <ScanLine className="h-4 w-4" /> Scan offer
          </Button>
          <Button
            onClick={() => {
              setEditId(undefined)
              setForm(blank())
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Post offer
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No offers posted"
          description="Post a forex or Chinese desk offer, or scan a screenshot into an editable preview."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Post offer
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <article
              key={o.id}
              role="button"
              tabIndex={0}
              aria-label={`Preview offer ${o.title}`}
              className="card-surface flex cursor-pointer flex-col gap-3 !p-4 transition-[border-color,box-shadow] hover:border-lime/25 hover:shadow-[0_0_0_1px_rgb(198_244_50/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              onClick={() => setPreviewOffer(o)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setPreviewOffer(o)
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-dim">{o.category}</p>
                  <h3 className="text-base font-bold text-ink">{o.title}</h3>
                  <p className="text-sm text-ink-muted">{o.company || '—'}</p>
                </div>
                <Badge tone={stageTone(o.status)}>{o.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-canvas-raised px-3 py-2">
                  <p className="text-[11px] text-ink-dim">Provision</p>
                  <p className="tabular font-semibold">{provisionLabel(o)}</p>
                </div>
                <div className="rounded-xl bg-canvas-raised px-3 py-2">
                  <p className="text-[11px] text-ink-dim">Salary</p>
                  <p className="tabular font-semibold">
                    {o.category === 'chinese' ? formatMoney(o.salary) : formatMoney(o.salaryMin)}
                  </p>
                </div>
              </div>
              {o.telegram ? (
                <p className="text-xs text-cyan">Recruiter {ensureAtHandle(o.telegram)}</p>
              ) : null}
              <div className="mt-auto flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(o)
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    remove.mutate(o.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={!!previewOffer}
        onClose={() => setPreviewOffer(null)}
        title="Offer preview"
        wide
        glass
      >
        {previewOffer ? (
          <OfferPreview
            offer={previewOffer}
            onEdit={() => {
              openEdit(previewOffer)
            }}
            onDelete={() => remove.mutate(previewOffer.id)}
          />
        ) : null}
      </Modal>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editId ? 'Edit offer' : 'Post offer'}
        wide
      >
        <OfferForm
          form={form}
          setForm={setForm}
          busy={save.isPending}
          error={save.error instanceof Error ? save.error.message : null}
          onSubmit={() => save.mutate()}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Scan offer" wide>
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Upload a screenshot. OCR runs in the browser (tesseract.js). Non-EN/PT text is translated
            to Portuguese for parsing — everything stays editable.
          </p>
          <Input
            type="file"
            accept="image/*"
            disabled={scanBusy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onScanFile(f)
            }}
          />
          {scanBusy ? <p className="text-sm text-cyan">Scanning…</p> : null}
          {scanMsg ? <p className="text-sm text-ink-muted">{scanMsg}</p> : null}
          {scanPreview ? (
            <div className="rounded-xl border border-border bg-canvas-raised p-4 text-sm">
              <p className="font-semibold">{scanPreview.title}</p>
              <p className="text-ink-muted">
                {scanPreview.category} · provision{' '}
                {scanPreview.commissionValue || scanPreview.commission || '—'}
              </p>
              <Button className="mt-3" onClick={openCreateFromPreview}>
                Edit preview & create
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}

function DetailTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/80 bg-canvas-raised/80 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-ink-dim">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

function OfferPreview({
  offer,
  onEdit,
  onDelete,
}: {
  offer: Offer
  onEdit: () => void
  onDelete: () => void
}) {
  const packageFlags = (
    [
      ['accommodation', 'Accommodation', offer.accommodation],
      ['visa', 'Visa', offer.visa],
      ['flight', 'Flight', offer.flight],
      ['videoCall', 'Video call', offer.videoCall],
    ] as const
  ).filter(([, , on]) => on)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-ink-dim">{offer.category}</p>
          <h3 className="text-xl font-bold text-ink">{offer.title}</h3>
          <p className="text-sm text-ink-muted">{offer.company || 'No company listed'}</p>
        </div>
        <Badge tone={stageTone(offer.status)}>{offer.status}</Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DetailTile label="Provision" value={provisionLabel(offer)} />
        <DetailTile label="Salary" value={salaryLabel(offer)} />
        <DetailTile
          label="Provision type"
          value={offer.commissionType === 'percent' ? 'Percent of salary' : 'Fixed amount'}
        />
        <DetailTile label="Location" value={offer.location || '—'} />
        <DetailTile
          label="Recruiter"
          value={
            offer.telegram ? (
              <span className="text-cyan">{ensureAtHandle(offer.telegram)}</span>
            ) : (
              '—'
            )
          }
        />
        {offer.roleType ? <DetailTile label="Role type" value={offer.roleType} /> : null}
        <DetailTile label="Created" value={formatWhen(offer.createdAt)} />
        <DetailTile label="Updated" value={formatWhen(offer.updatedAt)} />
      </div>

      {packageFlags.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-dim">Package</p>
          <div className="flex flex-wrap gap-2">
            {packageFlags.map(([key, label]) => (
              <Badge key={key} tone="lime">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-dim">Description</p>
        <div className="rounded-xl border border-border/80 bg-canvas-raised/80 px-4 py-3 text-sm whitespace-pre-wrap text-ink-muted">
          {offer.description?.trim() ? offer.description : 'No description provided.'}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={onEdit}>
          Edit offer
        </Button>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  )
}

function OfferForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  busy,
  error,
}: {
  form: OfferFormValues
  setForm: (f: OfferFormValues) => void
  onSubmit: () => void
  onCancel: () => void
  busy: boolean
  error: string | null
}) {
  const isChinese = form.category === 'chinese'
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div>
        <Label>Category</Label>
        <Select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value as OfferFormValues['category'] })
          }
        >
          <option value="forex">Forex</option>
          <option value="chinese">Chinese</option>
        </Select>
      </div>
      <div>
        <Label>Status</Label>
        <Select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as OfferFormValues['status'] })}
        >
          <option value="Live">Live</option>
          <option value="Paused">Paused</option>
          <option value="Closed">Closed</option>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label>Offer title *</Label>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label>Company</Label>
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>
      <div>
        <Label>Location</Label>
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </div>
      <div>
        <Label>Provision type</Label>
        <Select
          value={form.commissionType}
          onChange={(e) =>
            setForm({ ...form, commissionType: e.target.value as 'fixed' | 'percent' })
          }
        >
          <option value="fixed">Fixed amount</option>
          <option value="percent">Percent of salary</option>
        </Select>
      </div>
      {isChinese ? (
        <>
          <div>
            <Label>Provision</Label>
            <Input
              inputMode="decimal"
              value={form.commission}
              onChange={(e) => setForm({ ...form, commission: e.target.value })}
            />
          </div>
          <div>
            <Label>Salary</Label>
            <Input
              inputMode="decimal"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
          </div>
          <div>
            <Label>Role type</Label>
            <Input value={form.roleType} onChange={(e) => setForm({ ...form, roleType: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-3 self-end pb-2 text-sm">
            {(
              [
                ['accommodation', 'Accommodation'],
                ['visa', 'Visa'],
                ['flight', 'Flight'],
                ['videoCall', 'Video call'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <div>
            <Label>Provision</Label>
            <Input
              inputMode="decimal"
              value={form.commissionValue}
              onChange={(e) => setForm({ ...form, commissionValue: e.target.value })}
            />
          </div>
          <div>
            <Label>Salary min</Label>
            <Input
              inputMode="decimal"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            />
          </div>
          <div>
            <Label>Salary max</Label>
            <Input
              inputMode="decimal"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            />
          </div>
        </>
      )}
      <div className="sm:col-span-2">
        <Label>Recruiter Telegram (@username)</Label>
        <Input
          placeholder="@recruiter"
          value={form.telegram}
          onChange={(e) => setForm({ ...form, telegram: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-rose">{error}</p> : null}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          Save offer
        </Button>
      </div>
    </form>
  )
}
