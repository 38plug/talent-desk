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
      delta: data.isDemo ? '+12% demo' : 'Paid + Pending + Overdue',
      spark: SPARK_SERIES.income,
      color: '#22D3EE',
      icon: TrendingUp,
    },
    {
      label: 'Estimated awaiting',
      value: formatMoney(data.estimated),
      delta: 'Confirm to move into income',
      spark: SPARK_SERIES.candidates,
      color: '#7C3AED',
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
    <div className="space-y-6">
      {data.isDemo ? (
        <div className="rounded-2xl border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm text-cyan">
          {APP_NAME} is showing demo metrics — your tables are empty. Add candidates, offers, or earnings to replace this preview.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="hero-gradient-violet relative overflow-hidden rounded-[20px] p-6 text-white shadow-[0_0_40px_rgb(124_58_237/0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{APP_NAME}</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Pipeline command center</h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Scan income, confirm estimates, and clear what needs attention today.
          </p>
          <Link
            to="/candidates"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-black/35"
          >
            Open candidates <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="pointer-events-none absolute -right-6 -bottom-10 h-40 w-40 rounded-full bg-cyan/30 blur-3xl" />
        </div>
        <div className="hero-gradient-cyan relative overflow-hidden rounded-[20px] p-6 text-canvas shadow-[0_0_40px_rgb(34_211_238/0.25)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-canvas/60">Live desk</p>
              <p className="mt-2 text-3xl font-extrabold tabular">{formatMoney(data.paidEarnings)}</p>
              <p className="text-sm text-canvas/70">Paid provision to date</p>
            </div>
            <Briefcase className="h-8 w-8 opacity-70" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="tabular text-lg font-bold">{formatMoney(data.pendingEarnings)}</p>
              <p className="text-xs text-canvas/65">Pending</p>
            </div>
            <div>
              <p className="tabular text-lg font-bold">{formatMoney(data.overdueEarnings)}</p>
              <p className="text-xs text-canvas/65">Overdue</p>
            </div>
            <div>
              <p className="tabular text-lg font-bold">{data.liveOffers}</p>
              <p className="text-xs text-canvas/65">Live offers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <k.icon className="h-4 w-4" style={{ color: k.color }} />
                </div>
                <p className="text-xs text-ink-muted">{k.label}</p>
                <p className="mt-1 text-2xl font-bold tabular text-ink">{k.value}</p>
                <p className="mt-1 text-[11px] text-ink-dim">{k.delta}</p>
              </div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Income vs estimated</CardTitle>
            <Badge tone="cyan">7 days</Badge>
          </CardHeader>
          <NeonAreaChart data={data.incomeSeries} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {data.attention.length === 0 ? (
              <li className="text-sm text-ink-muted">Nothing urgent — desk is clear.</li>
            ) : (
              data.attention.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-canvas-raised/60 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-ink-muted">{item.subtitle}</p>
                  </div>
                  <Link to={item.href} className="text-xs font-semibold text-cyan hover:underline">
                    Review
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline mix</CardTitle>
          </CardHeader>
          {stageData.length ? (
            <NeonDonut data={stageData} />
          ) : (
            <p className="text-sm text-ink-muted">No stage data yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily income</CardTitle>
          </CardHeader>
          <NeonBarChart data={barData} />
        </Card>
        <Card>
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
                  className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
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
                    Candidate confirmed
                  </Button>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <CardTitle>Recent candidates</CardTitle>
          <Link to="/candidates" className="text-sm font-semibold text-cyan hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-ink-dim">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Stage</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Telegram</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-muted">
                    No candidates yet — demo KPIs above stay until you add pipeline data.
                  </td>
                </tr>
              ) : (
                data.recentCandidates.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-5 py-3">
                      <Badge tone={stageTone(c.stage)}>{c.stage}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{c.source ?? '—'}</td>
                    <td className="px-5 py-3 text-ink-muted">
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
