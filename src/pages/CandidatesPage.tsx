import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Drawer,
  EmptyState,
  Input,
  Label,
  Modal,
  PageLoader,
  Select,
  Textarea,
  genderTone,
  marketTone,
  stageTone,
} from '@/components/ui'
import { DeskTotalsStrip } from '@/components/desk/DeskTotalsStrip'
import { useAuth } from '@/auth/AuthProvider'
import {
  canManagePipeline,
  deleteCandidate,
  fetchCandidates,
  fetchOffers,
  upsertCandidate,
} from '@/lib/api'
import {
  CANDIDATE_GENDERS,
  CANDIDATE_MARKETS,
  genderLabel,
  marketLabel,
  PIPELINE_STAGES,
  type CandidateGender,
  type CandidateMarket,
  type PipelineStage,
} from '@/lib/constants'
import { ensureAtHandle } from '@/lib/utils'
import type { Candidate } from '@/lib/types'

type CandidateForm = {
  name: string
  email: string
  phone: string
  source: string
  stage: PipelineStage
  market: CandidateMarket | ''
  gender: CandidateGender | ''
  offerId: string
  telegram: string
  sentBy: string
  country: string
  age: string
  languages: string
  currentLocation: string
  notes: string
  expectedSalary: string
}

const emptyForm: CandidateForm = {
  name: '',
  email: '',
  phone: '',
  source: '',
  stage: 'Screening',
  market: '',
  gender: '',
  offerId: '',
  telegram: '',
  sentBy: '',
  country: '',
  age: '',
  languages: '',
  currentLocation: '',
  notes: '',
  expectedSalary: '',
}

function candidateToForm(c: Candidate): CandidateForm {
  return {
    name: c.name,
    email: c.email ?? '',
    phone: c.phone ?? '',
    source: c.source ?? '',
    stage: c.stage,
    market: c.market ?? '',
    gender: c.gender ?? '',
    offerId: c.offerId ?? '',
    telegram: c.telegram ?? '',
    sentBy: c.sentBy ?? '',
    country: c.country ?? '',
    age: c.age != null ? String(c.age) : '',
    languages: c.languages ?? '',
    currentLocation: c.currentLocation ?? '',
    notes: c.notes ?? '',
    expectedSalary: c.expectedSalary != null ? String(c.expectedSalary) : '',
  }
}

function formToPayload(form: CandidateForm) {
  return {
    name: form.name,
    email: form.email || null,
    phone: form.phone || null,
    source: form.source || null,
    stage: form.stage,
    market: form.market || null,
    gender: form.gender || null,
    offerId: form.offerId || null,
    telegram: form.telegram || null,
    sentBy: form.sentBy || null,
    country: form.country || null,
    age: form.age ? Number(form.age) : null,
    languages: form.languages || null,
    currentLocation: form.currentLocation || null,
    notes: form.notes || null,
    expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : null,
  }
}

function locationLine(c: Candidate): string | null {
  const bits = [c.currentLocation, c.country].filter(Boolean)
  return bits.length ? bits.join(' · ') : null
}

export function CandidatesPage() {
  const { profile } = useAuth()
  // All signed-in roles (user → owner) share candidates on this device.
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const canEdit = canManagePipeline(profile?.role ?? 'user')

  function scheduleInterview(c: Candidate) {
    navigate(`/calendar?candidate=${encodeURIComponent(c.id)}`)
  }
  const qc = useQueryClient()
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  })
  const { data: offers = [] } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })

  const [q, setQ] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [marketFilter, setMarketFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CandidateForm>(emptyForm)
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [editTg, setEditTg] = useState('')
  const [editSentBy, setEditSentBy] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Candidate | null>(null)

  // Deep-link from Offer preview: /candidates?id=<id>
  useEffect(() => {
    const id = searchParams.get('id')
    if (!id || isLoading) return
    const match = candidates.find((c) => c.id === id)
    if (match) {
      setSelected(match)
      setEditTg(match.telegram ?? '')
      setEditSentBy(match.sentBy ?? '')
    }
    const next = new URLSearchParams(searchParams)
    next.delete('id')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, candidates, isLoading])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(c: Candidate) {
    setEditingId(c.id)
    setForm(candidateToForm(c))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function requestDelete(c: Candidate) {
    setPendingDelete(c)
  }

  const save = useMutation({
    mutationFn: async () => {
      await upsertCandidate(formToPayload(form), editingId ?? undefined)
    },
    onSuccess: async () => {
      const savedId = editingId
      closeModal()
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      if (savedId) {
        const next = (await fetchCandidates()).find((c) => c.id === savedId)
        if (next) {
          setSelected(next)
          setEditTg(next.telegram ?? '')
          setEditSentBy(next.sentBy ?? '')
        }
      }
    },
  })

  const patchField = useMutation({
    mutationFn: async (payload: {
      id: string
      telegram?: string
      sentBy?: string
      stage?: PipelineStage
    }) => {
      const c = candidates.find((x) => x.id === payload.id)
      if (!c) return
      await upsertCandidate(
        {
          name: c.name,
          email: c.email,
          phone: c.phone,
          source: c.source,
          stage: payload.stage ?? c.stage,
          market: c.market,
          gender: c.gender,
          offerId: c.offerId,
          telegram: payload.telegram !== undefined ? payload.telegram : c.telegram,
          sentBy: payload.sentBy !== undefined ? payload.sentBy : c.sentBy,
          country: c.country,
          age: c.age,
          languages: c.languages,
          currentLocation: c.currentLocation,
          notes: c.notes,
          expectedSalary: c.expectedSalary,
        },
        payload.id,
      )
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['candidates'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const remove = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: async (_data, id) => {
      setPendingDelete(null)
      if (selected?.id === id) setSelected(null)
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['candidates'] }),
        qc.invalidateQueries({ queryKey: ['interviews'] }),
        qc.invalidateQueries({ queryKey: ['earnings'] }),
        qc.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    },
  })

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false
      if (marketFilter !== 'all') {
        if (marketFilter === 'unset') {
          if (c.market) return false
        } else if (c.market !== marketFilter) {
          return false
        }
      }
      if (genderFilter !== 'all') {
        if (genderFilter === 'unset') {
          if (c.gender) return false
        } else if (c.gender !== genderFilter) {
          return false
        }
      }
      if (!q.trim()) return true
      const hay =
        `${c.name} ${c.telegram ?? ''} ${c.sentBy ?? ''} ${c.source ?? ''} ${c.country ?? ''} ${c.languages ?? ''} ${c.currentLocation ?? ''} ${c.market ?? ''} ${c.gender ?? ''}`.toLowerCase()
      return hay.includes(q.toLowerCase())
    })
  }, [candidates, q, stageFilter, marketFilter, genderFilter])

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <DeskTotalsStrip />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-dim" />
          <Input className="pl-9" placeholder="Search candidates…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-44">
          <option value="all">All stages</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="w-40">
          <option value="all">All markets</option>
          <option value="forex">Forex</option>
          <option value="chinese">Chinese</option>
          <option value="unset">Unset</option>
        </Select>
        <Select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-40">
          <option value="all">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unset">Unset</option>
        </Select>
        {canEdit ? (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add candidate
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No candidates on the desk"
          description="Add your first candidate to start the pipeline. Talent Desk keeps Telegram handles and sender attribution with every row."
          action={
            canEdit ? (
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> Add candidate
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="card-surface overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-ink-dim">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Languages</th>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Offer</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-t border-border hover:bg-white/[0.03]"
                    onClick={() => {
                      setSelected(c)
                      setEditTg(c.telegram ?? '')
                      setEditSentBy(c.sentBy ?? '')
                    }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-ink-dim">
                        {c.telegram ? ensureAtHandle(c.telegram) : 'No Telegram'}
                        {c.age != null ? ` · ${c.age}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {c.languages?.trim() ? c.languages : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {c.market ? (
                        <Badge tone={marketTone(c.market)}>{marketLabel(c.market)}</Badge>
                      ) : (
                        <span className="text-ink-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.gender ? (
                        <Badge tone={genderTone(c.gender)}>{genderLabel(c.gender)}</Badge>
                      ) : (
                        <span className="text-ink-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {locationLine(c) ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={stageTone(c.stage)}>{c.stage}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p>{c.source ?? '—'}</p>
                      <p className="text-xs text-ink-dim">
                        {c.sentBy ? `Sent by ${ensureAtHandle(c.sentBy)}` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {offers.find((o) => o.id === c.offerId)?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-dim">
                      {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 px-0"
                            aria-label={`Schedule interview for ${c.name}`}
                            title={`Schedule interview for ${c.name}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              scheduleInterview(c)
                            }}
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 px-0"
                            aria-label={`Edit ${c.name}`}
                            title={`Edit ${c.name}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(c)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            className="h-8 w-8 px-0"
                            aria-label={`Delete ${c.name}`}
                            title={`Delete ${c.name}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              requestDelete(c)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit candidate' : 'Add candidate'}
        wide
      >
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div className="sm:col-span-2">
            <Label>Name *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Source</Label>
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div>
            <Label>Market</Label>
            <Select
              value={form.market}
              onChange={(e) =>
                setForm({ ...form, market: e.target.value as CandidateMarket | '' })
              }
            >
              <option value="">Unset</option>
              {CANDIDATE_MARKETS.map((m) => (
                <option key={m} value={m}>
                  {marketLabel(m)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as CandidateGender | '' })
              }
            >
              <option value="">Unset</option>
              {CANDIDATE_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {genderLabel(g)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Stage</Label>
            <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as PipelineStage })}>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
            <Label>Candidate Telegram (@username) — optional</Label>
            <Input
              placeholder="@candidate"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Sent by (Telegram @username)</Label>
            <Input
              placeholder="@sender"
              value={form.sentBy}
              onChange={(e) => setForm({ ...form, sentBy: e.target.value })}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. Albania"
            />
          </div>
          <div>
            <Label>Age</Label>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="e.g. 27"
            />
          </div>
          <div>
            <Label>Languages</Label>
            <Input
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              placeholder="e.g. English, Russian"
            />
          </div>
          <div>
            <Label>Current location</Label>
            <Input
              value={form.currentLocation}
              onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
              placeholder="e.g. Tbilisi, Georgia"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {save.isError ? (
            <p className="sm:col-span-2 text-sm text-rose">
              {save.error instanceof Error ? save.error.message : 'Save failed'}
            </p>
          ) : null}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {editingId ? 'Save changes' : 'Save candidate'}
            </Button>
          </div>
        </form>
      </Modal>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Candidate'}
      >
        {selected ? (
          <div className="space-y-4">
            <div>
              <Label>Stage</Label>
              <Select
                value={selected.stage}
                disabled={!canEdit}
                onChange={(e) => {
                  const stage = e.target.value as PipelineStage
                  setSelected({ ...selected, stage })
                  patchField.mutate({ id: selected.id, stage })
                }}
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Candidate Telegram</Label>
              <div className="flex gap-2">
                <Input
                  value={editTg}
                  disabled={!canEdit}
                  onChange={(e) => setEditTg(e.target.value)}
                  placeholder="@username"
                />
                {canEdit ? (
                  <Button
                    variant="secondary"
                    onClick={() => patchField.mutate({ id: selected.id, telegram: editTg })}
                  >
                    Save
                  </Button>
                ) : null}
              </div>
            </div>
            <div>
              <Label>Sent by</Label>
              <div className="flex gap-2">
                <Input
                  value={editSentBy}
                  disabled={!canEdit}
                  onChange={(e) => setEditSentBy(e.target.value)}
                  placeholder="@sender"
                />
                {canEdit ? (
                  <Button
                    variant="secondary"
                    onClick={() => patchField.mutate({ id: selected.id, sentBy: editSentBy })}
                  >
                    Save
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">Market</span>
                {selected.market ? (
                  <Badge tone={marketTone(selected.market)}>{marketLabel(selected.market)}</Badge>
                ) : (
                  <span className="text-sm text-ink-dim">Unset</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">Gender</span>
                {selected.gender ? (
                  <Badge tone={genderTone(selected.gender)}>{genderLabel(selected.gender)}</Badge>
                ) : (
                  <span className="text-sm text-ink-dim">Unset</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-canvas-raised p-3 text-sm text-ink-muted">
              <p>Source: {selected.source ?? '—'}</p>
              <p className="mt-1">Country: {selected.country || '—'}</p>
              <p className="mt-1">Age: {selected.age != null ? selected.age : '—'}</p>
              <p className="mt-1">Languages: {selected.languages || '—'}</p>
              <p className="mt-1">Current location: {selected.currentLocation || '—'}</p>
              <p className="mt-1">Notes: {selected.notes || '—'}</p>
            </div>
            {canEdit ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    scheduleInterview(selected)
                  }}
                >
                  <CalendarPlus className="h-4 w-4" /> Schedule interview
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    openEdit(selected)
                  }}
                >
                  <Pencil className="h-4 w-4" /> Edit candidate
                </Button>
                <Button variant="danger" onClick={() => requestDelete(selected)}>
                  <Trash2 className="h-4 w-4" /> Delete candidate
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={!!pendingDelete}
        onClose={() => {
          if (!remove.isPending) setPendingDelete(null)
        }}
        title="Delete candidate"
      >
        {pendingDelete ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Delete{' '}
              <span className="font-semibold text-ink">{pendingDelete.name}</span>? This removes
              the candidate and any linked interviews or earnings from this device. Offers stay.
            </p>
            {remove.isError ? (
              <p className="text-sm text-rose">
                {remove.error instanceof Error ? remove.error.message : 'Delete failed'}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={remove.isPending}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={remove.isPending}
                onClick={() => remove.mutate(pendingDelete.id)}
              >
                <Trash2 className="h-4 w-4" />
                {remove.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
