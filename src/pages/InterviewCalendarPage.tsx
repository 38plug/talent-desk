import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  ScheduleInterviewModal,
  type ScheduleInterviewSeed,
} from '@/components/interviews/ScheduleInterviewModal'
import { Badge, Button, PageLoader } from '@/components/ui'
import { fetchCandidates, fetchInterviews, fetchOffers } from '@/lib/api'
import { localDayAtHour } from '@/lib/datetime'
import { cn } from '@/lib/utils'
import type { Interview } from '@/lib/types'

type ViewMode = 'month' | 'week' | 'day'

const WEEK_STARTS_ON = 1 as const // Monday
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 08–20

function interviewsOnDay(items: Interview[], day: Date) {
  return items.filter((i) => isSameDay(new Date(i.scheduledAt), day))
}

export function InterviewCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  })
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const { data: offers = [] } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers })

  const [view, setView] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState(() => startOfDay(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [seed, setSeed] = useState<ScheduleInterviewSeed | null>(null)

  // Deep-link from Candidates: /calendar?candidate=<id>[&at=<iso>]
  useEffect(() => {
    const candidateId = searchParams.get('candidate')
    if (!candidateId) return
    const at = searchParams.get('at')
    setSeed({
      candidateId,
      scheduledAt: at ?? localDayAtHour(new Date(), 10),
    })
    setModalOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('candidate')
    next.delete('at')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const candidateName = (id: string) => candidates.find((c) => c.id === id)?.name ?? 'Candidate'
  const offerTitle = (id: string | null) =>
    id ? (offers.find((o) => o.id === id)?.title ?? null) : null

  function openCreate(day?: Date, candidateId?: string) {
    const when = day ? localDayAtHour(day, 10) : localDayAtHour(cursor, 10)
    setSeed({ candidateId, scheduledAt: when })
    setModalOpen(true)
  }

  function openEdit(interview: Interview) {
    setSeed({ interview })
    setModalOpen(true)
  }

  function shift(dir: -1 | 1) {
    setCursor((c) => {
      if (view === 'month') return dir < 0 ? subMonths(c, 1) : addMonths(c, 1)
      if (view === 'week') return dir < 0 ? subWeeks(c, 1) : addWeeks(c, 1)
      return addDays(c, dir)
    })
  }

  const heading = useMemo(() => {
    if (view === 'month') return format(cursor, 'MMMM yyyy')
    if (view === 'week') {
      const start = startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON })
      const end = endOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON })
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
    }
    return format(cursor, 'EEEE, MMM d, yyyy')
  }, [cursor, view])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: WEEK_STARTS_ON })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: WEEK_STARTS_ON })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: WEEK_STARTS_ON })
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [cursor])

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="pill-toggle inline-flex">
          {(['month', 'week', 'day'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setView(t)}
              data-active={view === t}
              className="pill-toggle-item capitalize"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="glass"
            size="sm"
            className="h-9 w-9 px-0"
            aria-label="Previous"
            onClick={() => shift(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="glass" size="sm" onClick={() => setCursor(startOfDay(new Date()))}>
            Today
          </Button>
          <Button
            type="button"
            variant="glass"
            size="sm"
            className="h-9 w-9 px-0"
            aria-label="Next"
            onClick={() => shift(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">{heading}</h2>
        <Button className="ml-auto" onClick={() => openCreate(cursor)}>
          <Plus className="h-4 w-4" /> Schedule
        </Button>
      </div>

      {view === 'month' ? (
        <div className="card-surface overflow-hidden !p-0">
          <div className="grid grid-cols-7 border-b border-border bg-white/[0.02] text-center text-[10px] font-bold tracking-[0.14em] text-ink-dim uppercase">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="px-2 py-2.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayItems = interviewsOnDay(interviews, day)
              const inMonth = isSameMonth(day, cursor)
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'group min-h-[7.5rem] border-t border-r border-border p-1.5 last:border-r-0 sm:min-h-[8.5rem]',
                    !inMonth && 'bg-canvas/40',
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCursor(startOfDay(day))
                        setView('day')
                      }}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular',
                        today && 'bg-lime text-canvas glow-lime',
                        !today && inMonth && 'text-ink hover:bg-white/5',
                        !today && !inMonth && 'text-ink-dim',
                      )}
                      aria-label={format(day, 'MMMM d, yyyy')}
                    >
                      {format(day, 'd')}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1 text-ink-dim opacity-0 hover:bg-lime/15 hover:text-lime group-hover:opacity-100 focus:opacity-100 sm:opacity-60"
                      aria-label={`Schedule on ${format(day, 'MMM d')}`}
                      onClick={() => openCreate(day)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {dayItems.slice(0, 3).map((i) => (
                      <li key={i.id}>
                        <button
                          type="button"
                          onClick={() => openEdit(i)}
                          className="w-full truncate rounded-[8px] border border-lime/25 bg-lime/10 px-1.5 py-1 text-left text-[11px] font-semibold text-lime hover:border-lime/50 hover:bg-lime/20"
                          title={`${candidateName(i.candidateId)} · ${format(new Date(i.scheduledAt), 'HH:mm')}`}
                        >
                          <span className="tabular text-lime/80">
                            {format(new Date(i.scheduledAt), 'HH:mm')}
                          </span>{' '}
                          {candidateName(i.candidateId)}
                        </button>
                      </li>
                    ))}
                    {dayItems.length > 3 ? (
                      <li className="px-1 text-[10px] text-ink-dim">+{dayItems.length - 3} more</li>
                    ) : null}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {view === 'week' ? (
        <WeekOrDayGrid
          days={weekDays}
          interviews={interviews}
          candidateName={candidateName}
          onSelect={openEdit}
          onEmptyHour={(day, hour) => {
            const d = new Date(day)
            d.setHours(hour, 0, 0, 0)
            setSeed({ scheduledAt: d.toISOString() })
            setModalOpen(true)
          }}
        />
      ) : null}

      {view === 'day' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays className="h-4 w-4 text-lime" aria-hidden />
            <p className="text-sm text-ink-muted">
              {interviewsOnDay(interviews, cursor).length} interview
              {interviewsOnDay(interviews, cursor).length === 1 ? '' : 's'} this day
            </p>
            <Button size="sm" className="ml-auto" onClick={() => openCreate(cursor)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <WeekOrDayGrid
            days={[cursor]}
            interviews={interviews}
            candidateName={candidateName}
            offerTitle={offerTitle}
            onSelect={openEdit}
            onEmptyHour={(day, hour) => {
              const d = new Date(day)
              d.setHours(hour, 0, 0, 0)
              setSeed({ scheduledAt: d.toISOString() })
              setModalOpen(true)
            }}
            single
          />
        </div>
      ) : null}

      <ScheduleInterviewModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSeed(null)
        }}
        seed={seed}
      />
    </div>
  )
}

function WeekOrDayGrid({
  days,
  interviews,
  candidateName,
  offerTitle,
  onSelect,
  onEmptyHour,
  single,
}: {
  days: Date[]
  interviews: Interview[]
  candidateName: (id: string) => string
  offerTitle?: (id: string | null) => string | null
  onSelect: (i: Interview) => void
  onEmptyHour: (day: Date, hour: number) => void
  single?: boolean
}) {
  return (
    <div className="card-surface overflow-x-auto !p-0">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: single ? '4rem 1fr' : `4rem repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-canvas-raised/95" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'sticky top-0 z-10 border-b border-l border-border bg-canvas-raised/95 px-2 py-2.5 text-center',
              isToday(day) && 'bg-lime/10',
            )}
          >
            <p className="text-[10px] font-bold tracking-[0.14em] text-ink-dim uppercase">
              {format(day, 'EEE')}
            </p>
            <p
              className={cn(
                'mt-0.5 text-sm font-extrabold tabular',
                isToday(day) ? 'text-lime' : 'text-ink',
              )}
            >
              {format(day, 'd')}
            </p>
          </div>
        ))}

        {HOURS.map((hour) => (
          <HourRow
            key={hour}
            hour={hour}
            days={days}
            interviews={interviews}
            candidateName={candidateName}
            offerTitle={offerTitle}
            onSelect={onSelect}
            onEmptyHour={onEmptyHour}
            single={single}
          />
        ))}
      </div>
    </div>
  )
}

function HourRow({
  hour,
  days,
  interviews,
  candidateName,
  offerTitle,
  onSelect,
  onEmptyHour,
  single,
}: {
  hour: number
  days: Date[]
  interviews: Interview[]
  candidateName: (id: string) => string
  offerTitle?: (id: string | null) => string | null
  onSelect: (i: Interview) => void
  onEmptyHour: (day: Date, hour: number) => void
  single?: boolean
}) {
  return (
    <>
      <div className="border-t border-border px-2 py-3 text-right text-[11px] tabular text-ink-dim">
        {String(hour).padStart(2, '0')}:00
      </div>
      {days.map((day) => {
        const slotItems = interviews.filter((i) => {
          const d = new Date(i.scheduledAt)
          return isSameDay(d, day) && d.getHours() === hour
        })
        return (
          <div
            key={`${day.toISOString()}-${hour}`}
            className="min-h-[3.25rem] border-t border-l border-border p-1"
          >
            {slotItems.length === 0 ? (
              <button
                type="button"
                className="flex h-full min-h-[2.75rem] w-full items-center justify-center rounded-[10px] text-ink-dim opacity-0 transition hover:bg-white/[0.04] hover:opacity-100 focus:opacity-100"
                aria-label={`Schedule at ${String(hour).padStart(2, '0')}:00 on ${format(day, 'MMM d')}`}
                onClick={() => onEmptyHour(day, hour)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            ) : (
              <ul className="space-y-1">
                {slotItems.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(i)}
                      className={cn(
                        'w-full rounded-[10px] border border-lime/30 bg-lime/12 px-2 py-1.5 text-left hover:border-lime/55 hover:bg-lime/20',
                        single && 'px-3 py-2',
                      )}
                    >
                      <p className="truncate text-xs font-bold text-lime">
                        {format(new Date(i.scheduledAt), 'HH:mm')} · {candidateName(i.candidateId)}
                      </p>
                      {single ? (
                        <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                          {offerTitle?.(i.offerId) ?? 'No offer linked'}
                          {i.outcome ? ` · ${i.outcome}` : ''}
                        </p>
                      ) : null}
                      {single && i.outcome ? (
                        <div className="mt-1">
                          <Badge tone="cyan">{i.outcome}</Badge>
                        </div>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </>
  )
}
