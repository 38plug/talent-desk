import type { DashboardMetrics } from './types'

/** Fallback KPIs when tables are empty so the desk still feels alive. */
export const DEMO_METRICS: DashboardMetrics = {
  totalIncome: 18400,
  estimated: 3200,
  candidates: 42,
  liveOffers: 8,
  interviewsUpcoming: 5,
  pendingEarnings: 6400,
  paidEarnings: 10200,
  overdueEarnings: 1800,
  stageCounts: {
    Screening: 12,
    Interview: 9,
    Offer: 7,
    Accepted: 5,
    Hired: 6,
    Rejected: 3,
  },
  incomeSeries: [
    { label: 'Mon', income: 1200, estimated: 400 },
    { label: 'Tue', income: 1800, estimated: 600 },
    { label: 'Wed', income: 1400, estimated: 350 },
    { label: 'Thu', income: 2200, estimated: 800 },
    { label: 'Fri', income: 2600, estimated: 500 },
    { label: 'Sat', income: 900, estimated: 200 },
    { label: 'Sun', income: 700, estimated: 150 },
  ],
  estimatedList: [],
  attention: [
    {
      id: 'demo-1',
      kind: 'overdue',
      title: 'Overdue provision',
      subtitle: 'Maria Santos — $1,200 past due',
      href: '/earnings',
    },
    {
      id: 'demo-2',
      kind: 'interview',
      title: 'Interview today',
      subtitle: 'Alex Chen · FX Sales · 15:00',
      href: '/interviews',
    },
    {
      id: 'demo-3',
      kind: 'estimate',
      title: 'Awaiting confirmation',
      subtitle: 'João Silva — $500 estimated',
      href: '/earnings',
    },
  ],
  recentCandidates: [],
  activity: [],
  isDemo: true,
}

export const SPARK_SERIES = {
  income: [12, 18, 14, 22, 28, 24, 32],
  candidates: [4, 6, 5, 8, 7, 9, 11],
  offers: [2, 3, 3, 4, 5, 4, 6],
  interviews: [1, 2, 1, 3, 2, 4, 3],
}
