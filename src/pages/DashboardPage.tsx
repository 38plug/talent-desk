import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bell, TrendingUp, Users, Briefcase, Calendar } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
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
import { formatMoney } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

export function DashboardPage() {
  const qc = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  })

  const confirm = useMutation({
    mutationFn: confirmEarning,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['dashboard'] }),
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

  const kpis = [
    {
      label: 'Total income',
      value: formatMoney(data.totalIncome),
      delta: 'Paid + Pending + Overdue',
      spark: SPARK_SERIES.income,
      color: '#22D3EE',
      icon: TrendingUp,
    },
    {
      label: 'Estimated awaiting',
      value: formatMoney(data.estimated),
      delta: 'Confirm → income',
      spark: SPARK_SERIES.candidates,
      color: '#A78BFA',
      icon: Bell,
    },
    {
      label: 'Candidates',
      value: String(data.candidates),
      delta: `${data.liveOffers} live offers`,
      spark: SPARK_SERIES.offers,
      color: '#EC4899',
      icon: Users,
    },
    {
      label: 'Interviews (7d)',
      value: String(data.interviewsUpcoming),
      delta: 'Upcoming window',
      spark: SPARK_SERIES.interviews,
      color: '#F59E0B',
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-5">
      {data.candidates === 0 && data.liveOffers === 0 && data.totalIncome === 0 && data.estimated === 0 ? (
        <div className="rounded-[16px] border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan shadow-[0_0_24px_rgb(34_211_238/0.12)]">
          <span className="font-semibold">{APP_NAME}</span> has no pipeline rows yet for this account.
          KPIs stay at zero until your real data is loaded (hosted Supabase) or you add records.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="hero-gradient-violet relative overflow-hidden rounded-[20px] p-6 text-white shadow-[0_0_48px_rgb(124_58_237/0.4)] lg:col-span-3">
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
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-black/40"
          >
            Open candidates <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="pointer-events-none absolute -right-8 -bottom-12 h-48 w-48 rounded-full bg-cyan/35 blur-3xl" />
          <div className="pointer-events-none absolute top-6 right-10 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="hero-gradient-cyan relative overflow-hidden rounded-[20px] p-5 text-canvas shadow-[0_0_40px_rgb(34_211_238/0.3)] lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-canvas/60 uppercase">
                Live desk
              </p>
              <p className="mt-2 text-3xl font-extrabold tabular">{formatMoney(data.paidEarnings)}</p>
              <p className="text-sm text-canvas/70">Paid provision</p>
            </div>
            <Briefcase className="h-7 w-7 opacity-70" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-[12px] bg-black/10 px-2 py-2">
              <p className="tabular text-base font-bold">{formatMoney(data.pendingEarnings)}</p>
              <p className="text-[10px] text-canvas/65">Pending</p>
            </div>
            <div className="rounded-[12px] bg-black/10 px-2 py-2">
              <p className="tabular text-base font-bold">{formatMoney(data.overdueEarnings)}</p>
              <p className="text-[10px] text-canvas/65">Overdue</p>
            </div>
            <div className="rounded-[12px] bg-black/10 px-2 py-2">
              <p className="tabular text-base font-bold">{data.liveOffers}</p>
              <p className="text-[10px] text-canvas/65">Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="card-glow !p-4">
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
                  {k.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-ink-dim">{k.delta}</p>
              </div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="card-glow xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Income vs estimated</CardTitle>
              <p className="mt-0.5 text-xs text-ink-dim">Glowing neon series · last 7 days</p>
            </div>
            <Badge tone="cyan">7 days</Badge>
          </CardHeader>
          <NeonAreaChart data={data.incomeSeries} />
        </Card>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <ul className="space-y-2.5">
            {data.attention.length === 0 ? (
              <li className="text-sm text-ink-muted">Nothing urgent — desk is clear.</li>
            ) : (
              data.attention.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-[14px] border border-border bg-canvas-raised/70 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="truncate text-xs text-ink-muted">{item.subtitle}</p>
                  </div>
                  <Link
                    to={item.href}
                    className="shrink-0 text-xs font-semibold text-cyan hover:underline"
                  >
                    Review
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Pipeline mix</CardTitle>
          </CardHeader>
          {stageData.length ? (
            <NeonDonut data={stageData} />
          ) : (
            <p className="text-sm text-ink-muted">No stage data yet.</p>
          )}
        </Card>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Daily income</CardTitle>
          </CardHeader>
          <NeonBarChart data={barData} />
        </Card>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Awaiting confirmation</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {data.estimatedList.length === 0 ? (
              <li className="text-sm text-ink-muted">No estimated rows waiting.</li>
            ) : (
              data.estimatedList.slice(0, 6).map((e) => (
                <li
                  key={e.id}
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
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <Card className="card-glow !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <CardTitle>Recent candidates</CardTitle>
            <p className="mt-0.5 text-xs text-ink-dim">Dense register · Telegram under name</p>
          </div>
          <Link to="/candidates" className="text-sm font-semibold text-cyan hover:underline">
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
                data.recentCandidates.map((c) => (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.name}</td>
                    <td>
                      <Badge tone={stageTone(c.stage)}>{c.stage}</Badge>
                    </td>
                    <td className="text-ink-muted">{c.source ?? '—'}</td>
                    <td className="text-ink-muted">
                      {c.telegram ? `@${c.telegram.replace(/^@/, '')}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
