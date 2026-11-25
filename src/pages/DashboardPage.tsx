import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Bell, TrendingUp, Users, Briefcase, Calendar } from 'lucide-react'
import { AnimatedNumber } from '@/components/motion/AnimatedNumber'
import { MotionItem, MotionStagger } from '@/components/motion/Motion'
import {
  Badge,
  Button,
  CardHeader,
  CardTitle,
  EmptyState,
  NeonAreaChart,
  NeonBarChart,
  NeonDonut,
  PageLoader,
  Sparkline,
  stageTone,
} from '@/components/ui'
import { confirmEarning, getDashboardData } from '@/lib/api'
import { SPARK_SERIES } from '@/lib/demo-data'
import { APP_NAME } from '@/lib/constants'
import { springSoft } from '@/lib/motion'
import { playSfx } from '@/lib/sfx'
import { formatMoney } from '@/lib/utils'

function GaugeRing({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label: string
}) {
  const reduce = useReducedMotion()
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduce ? 0 : 1.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.65))' }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <AnimatedNumber value={pct} className="text-2xl font-extrabold tabular text-ink" />
        <span className="text-[10px] font-semibold tracking-wide text-ink-dim uppercase">{label}</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const qc = useQueryClient()
  const reduce = useReducedMotion()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  })

  const confirm = useMutation({
    mutationFn: confirmEarning,
    onSuccess: () => {
      playSfx('success')
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  if (isLoading) return <PageLoader />
  if (isError || !data) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description={error instanceof Error ? error.message : 'Could not load metrics.'}
      />
    )
  }

  const stageData = Object.entries(data.stageCounts).map(([name, value]) => ({ name, value }))
  const barData = data.incomeSeries.map((d) => ({ label: d.label, value: d.income }))
  const incomeCap = Math.max(data.totalIncome + data.estimated, 1)

  const kpis = [
    {
      label: 'Total income',
      value: data.totalIncome,
      money: true,
      delta: 'Paid + Pending + Overdue',
      spark: SPARK_SERIES.income,
      color: '#22D3EE',
      icon: TrendingUp,
    },
    {
      label: 'Estimated awaiting',
      value: data.estimated,
      money: true,
      delta: 'Confirm → income',
      spark: SPARK_SERIES.candidates,
      color: '#A78BFA',
      icon: Bell,
    },
    {
      label: 'Candidates',
      value: data.candidates,
      money: false,
      delta: `${data.liveOffers} live offers`,
      spark: SPARK_SERIES.offers,
      color: '#EC4899',
      icon: Users,
    },
    {
      label: 'Interviews (7d)',
      value: data.interviewsUpcoming,
      money: false,
      delta: 'Upcoming window',
      spark: SPARK_SERIES.interviews,
      color: '#F59E0B',
      icon: Calendar,
    },
  ]

  return (
    <MotionStagger className="space-y-5">
      {data.candidates === 0 && data.liveOffers === 0 && data.totalIncome === 0 && data.estimated === 0 ? (
        <MotionItem className="rounded-[16px] border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan shadow-[0_0_24px_rgb(34_211_238/0.12)]">
          <span className="font-semibold">{APP_NAME}</span> has no pipeline rows yet for this account.
          KPIs stay at zero until you add records or import JSON from Settings.
        </MotionItem>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <MotionItem className="hero-gradient-violet relative overflow-hidden rounded-[20px] p-6 text-white shadow-[0_0_48px_rgb(124_58_237/0.4)] lg:col-span-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-white/75 uppercase">
            {APP_NAME}
          </p>
          <h2 className="mt-2 max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pipeline command center
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/85">
            Scan income, confirm estimates, and clear what needs attention today.
          </p>
          <Link
            to="/candidates"
            onMouseEnter={() => playSfx('hover')}
            onClick={() => playSfx('whoosh')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-black/40 hover:shadow-[0_0_24px_rgb(34_211_238/0.35)]"
          >
            Open candidates <ArrowUpRight className="h-4 w-4" />
          </Link>
          <motion.div
            className="pointer-events-none absolute -right-8 -bottom-12 h-48 w-48 rounded-full bg-cyan/35 blur-3xl"
            animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="pointer-events-none absolute top-6 right-10 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
        </MotionItem>

        <MotionItem className="glass-panel relative overflow-hidden rounded-[20px] p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-cyan uppercase">
                Live desk
              </p>
              <p className="mt-1 text-sm text-ink-muted">Paid provision</p>
              <p className="mt-1 text-3xl font-extrabold tabular text-ink">
                <AnimatedNumber value={data.paidEarnings} money />
              </p>
            </div>
            <Briefcase className="h-7 w-7 text-cyan/70" />
          </div>
          <GaugeRing value={data.totalIncome} max={incomeCap} label="booked" />
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            {[
              { label: 'Pending', value: data.pendingEarnings, money: true },
              { label: 'Overdue', value: data.overdueEarnings, money: true },
              { label: 'Live', value: data.liveOffers, money: false },
            ].map((cell) => (
              <div
                key={cell.label}
                className="rounded-[12px] border border-white/5 bg-white/[0.04] px-2 py-2 backdrop-blur"
              >
                <p className="tabular text-base font-bold text-ink">
                  {cell.money ? (
                    <AnimatedNumber value={cell.value} money />
                  ) : (
                    <AnimatedNumber value={cell.value} />
                  )}
                </p>
                <p className="text-[10px] text-ink-dim">{cell.label}</p>
              </div>
            ))}
          </div>
        </MotionItem>
      </div>

      <MotionStagger fast className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <MotionItem key={k.label} hoverSfx className="glass-panel card-glow !p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div
                  className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[12px]"
                  style={{ background: `${k.color}22`, boxShadow: `0 0 18px ${k.color}33` }}
                >
                  <k.icon className="h-4 w-4" style={{ color: k.color }} />
                </div>
                <p className="text-xs text-ink-muted">{k.label}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight tabular text-ink">
                  <AnimatedNumber value={k.value} money={k.money} />
                </p>
                <p className="mt-1 text-[11px] leading-snug text-ink-dim">{k.delta}</p>
              </div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
          </MotionItem>
        ))}
      </MotionStagger>

      <div className="grid gap-4 xl:grid-cols-3">
        <MotionItem className="glass-panel card-glow xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Income vs estimated</CardTitle>
              <p className="mt-0.5 text-xs text-ink-dim">Glowing neon series · last 7 days</p>
            </div>
            <Badge tone="cyan">7 days</Badge>
          </CardHeader>
          <NeonAreaChart data={data.incomeSeries} />
        </MotionItem>
        <MotionItem className="glass-panel card-glow">
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <ul className="space-y-2.5">
            {data.attention.length === 0 ? (
              <li className="text-sm text-ink-muted">Nothing urgent — desk is clear.</li>
            ) : (
              data.attention.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springSoft, delay: 0.05 * i }}
                  className="flex items-start justify-between gap-3 rounded-[14px] border border-border bg-canvas-raised/70 px-3 py-2.5"
                  onMouseEnter={() => playSfx('hover')}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="truncate text-xs text-ink-muted">{item.subtitle}</p>
                  </div>
                  <Link
                    to={item.href}
                    className="shrink-0 text-xs font-semibold text-cyan hover:underline"
                    onClick={() => playSfx('tap')}
                  >
                    Review
                  </Link>
                </motion.li>
              ))
            )}
          </ul>
        </MotionItem>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MotionItem className="glass-panel card-glow">
          <CardHeader>
            <CardTitle>Pipeline mix</CardTitle>
          </CardHeader>
          {stageData.length ? (
            <NeonDonut data={stageData} />
          ) : (
            <p className="text-sm text-ink-muted">No stage data yet.</p>
          )}
        </MotionItem>
        <MotionItem className="glass-panel card-glow">
          <CardHeader>
            <CardTitle>Daily income</CardTitle>
          </CardHeader>
          <NeonBarChart data={barData} />
        </MotionItem>
        <MotionItem className="glass-panel card-glow">
          <CardHeader>
            <CardTitle>Awaiting confirmation</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {data.estimatedList.length === 0 ? (
              <li className="text-sm text-ink-muted">No estimated rows waiting.</li>
            ) : (
              data.estimatedList.slice(0, 6).map((e, i) => (
                <motion.li
                  key={e.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springSoft, delay: 0.04 * i }}
                  className="flex items-center justify-between gap-2 rounded-[14px] border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{e.candidateName ?? 'Candidate'}</p>
                    <p className="tabular text-xs text-ink-muted">{formatMoney(e.amount)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="cyan"
                    disabled={confirm.isPending}
                    onClick={() => confirm.mutate(e.id)}
                  >
                    Confirmed
                  </Button>
                </motion.li>
              ))
            )}
          </ul>
        </MotionItem>
      </div>

      <MotionItem className="glass-panel card-glow !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <CardTitle>Recent candidates</CardTitle>
            <p className="mt-0.5 text-xs text-ink-dim">Dense register · Telegram under name</p>
          </div>
          <Link
            to="/candidates"
            className="text-sm font-semibold text-cyan hover:underline"
            onMouseEnter={() => playSfx('hover')}
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Telegram</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="!py-10 text-center text-ink-muted">
                    No candidates yet for this account.
                  </td>
                </tr>
              ) : (
                data.recentCandidates.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springSoft, delay: 0.035 * i }}
                    onMouseEnter={() => playSfx('hover')}
                  >
                    <td className="font-semibold">{c.name}</td>
                    <td>
                      <Badge tone={stageTone(c.stage)}>{c.stage}</Badge>
                    </td>
                    <td className="text-ink-muted">{c.source ?? '—'}</td>
                    <td className="text-ink-muted">
                      {c.telegram ? `@${c.telegram.replace(/^@/, '')}` : '—'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </MotionItem>
    </MotionStagger>
  )
}
