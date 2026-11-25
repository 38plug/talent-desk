import {
  adminDeleteAccountRow,
  adminListStats,
  adminResetPasswordRow,
  adminSetPasswordRow,
  adminUpdateRoleRow,
  changePassword as dbChangePassword,
  confirmEarningRow,
  deleteCandidateRow,
  deleteEarningRow,
  deleteInterviewRow,
  deleteOfferRow,
  exportDeskJson,
  getProfile,
  importDeskJson,
  listActivities,
  listCandidates,
  listEarnings,
  listInterviews,
  listOffers,
  registerAccount as dbRegister,
  requireSession,
  signIn as dbSignIn,
  signOut as dbSignOut,
  upsertCandidateRow,
  upsertEarningRow,
  upsertInterviewRow,
  upsertOfferRow,
} from './local-db'
import type {
  Activity,
  AdminStats,
  Candidate,
  DashboardMetrics,
  Earning,
  Interview,
  Offer,
  Profile,
} from './types'
import { ADMIN_VIEW_ROLES, type Role } from './constants'
import { parseNumericInput, stripAtHandle } from './utils'

/** Honest empty desk — never invents fake income/candidates. */
const EMPTY_METRICS: DashboardMetrics = {
  totalIncome: 0,
  estimated: 0,
  candidates: 0,
  liveOffers: 0,
  interviewsUpcoming: 0,
  pendingEarnings: 0,
  paidEarnings: 0,
  overdueEarnings: 0,
  stageCounts: {},
  incomeSeries: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({
    label,
    income: 0,
    estimated: 0,
  })),
  estimatedList: [],
  attention: [],
  recentCandidates: [],
  activity: [],
  isDemo: false,
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  return getProfile(userId)
}

export async function fetchOffers(): Promise<Offer[]> {
  const { userId } = requireSession()
  return listOffers(userId)
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const { userId } = requireSession()
  return listCandidates(userId)
}

export async function fetchInterviews(): Promise<Interview[]> {
  const { userId } = requireSession()
  return listInterviews(userId)
}

export async function fetchEarnings(): Promise<Earning[]> {
  const { userId } = requireSession()
  return listEarnings(userId)
}

export async function fetchActivities(limit = 20): Promise<Activity[]> {
  const { userId } = requireSession()
  return listActivities(userId, limit)
}

export async function getDashboardData(): Promise<DashboardMetrics> {
  const [candidates, offers, interviews, earnings, activity] = await Promise.all([
    fetchCandidates(),
    fetchOffers(),
    fetchInterviews(),
    fetchEarnings(),
    fetchActivities(),
  ])

  const empty =
    candidates.length === 0 &&
    offers.length === 0 &&
    interviews.length === 0 &&
    earnings.length === 0

  if (empty) {
    return { ...EMPTY_METRICS }
  }

  const incomeStatuses = new Set(['Pending', 'Paid', 'Overdue'])
  const totalIncome = earnings
    .filter((e) => incomeStatuses.has(e.status))
    .reduce((s, e) => s + e.amount, 0)
  const estimated = earnings
    .filter((e) => e.status === 'Estimated')
    .reduce((s, e) => s + e.amount, 0)

  const stageCounts: Record<string, number> = {}
  for (const c of candidates) {
    stageCounts[c.stage] = (stageCounts[c.stage] ?? 0) + 1
  }

  const candMap = Object.fromEntries(candidates.map((c) => [c.id, c.name]))
  const estimatedList = earnings
    .filter((e) => e.status === 'Estimated')
    .map((e) => ({
      ...e,
      candidateName: e.candidateId ? candMap[e.candidateId] : undefined,
    }))

  const now = Date.now()
  const weekLater = now + 7 * 86400000
  const interviewsUpcoming = interviews.filter((i) => {
    const t = new Date(i.scheduledAt).getTime()
    return t >= now && t <= weekLater
  }).length

  const attention: DashboardMetrics['attention'] = []
  for (const e of earnings.filter((x) => x.status === 'Overdue').slice(0, 3)) {
    attention.push({
      id: e.id,
      kind: 'overdue',
      title: 'Overdue provision',
      subtitle: `${e.candidateId ? candMap[e.candidateId] ?? 'Candidate' : 'Earning'} — $${e.amount}`,
      href: '/earnings',
    })
  }
  for (const e of estimatedList.slice(0, 3)) {
    attention.push({
      id: `est-${e.id}`,
      kind: 'estimate',
      title: 'Awaiting confirmation',
      subtitle: `${e.candidateName ?? 'Candidate'} — $${e.amount}`,
      href: '/earnings',
    })
  }
  for (const i of interviews.filter((x) => new Date(x.scheduledAt).getTime() >= now).slice(0, 2)) {
    attention.push({
      id: i.id,
      kind: 'interview',
      title: 'Upcoming interview',
      subtitle: new Date(i.scheduledAt).toLocaleString(),
      href: '/interviews',
    })
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const incomeSeries = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - idx))
    const label = days[d.getDay()]!
    const dayStart = new Date(d)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d)
    dayEnd.setHours(23, 59, 59, 999)
    const inRange = (iso: string) => {
      const t = new Date(iso).getTime()
      return t >= dayStart.getTime() && t <= dayEnd.getTime()
    }
    return {
      label,
      income: earnings
        .filter((e) => incomeStatuses.has(e.status) && inRange(e.createdAt))
        .reduce((s, e) => s + e.amount, 0),
      estimated: earnings
        .filter((e) => e.status === 'Estimated' && inRange(e.createdAt))
        .reduce((s, e) => s + e.amount, 0),
    }
  })

  return {
    totalIncome,
    estimated,
    candidates: candidates.length,
    liveOffers: offers.filter((o) => o.status === 'Live').length,
    interviewsUpcoming,
    pendingEarnings: earnings.filter((e) => e.status === 'Pending').reduce((s, e) => s + e.amount, 0),
    paidEarnings: earnings.filter((e) => e.status === 'Paid').reduce((s, e) => s + e.amount, 0),
    overdueEarnings: earnings.filter((e) => e.status === 'Overdue').reduce((s, e) => s + e.amount, 0),
    stageCounts,
    incomeSeries,
    estimatedList,
    attention,
    recentCandidates: candidates.slice(0, 8),
    activity,
    isDemo: false,
  }
}

export async function confirmEarning(id: string): Promise<void> {
  const { userId } = requireSession()
  confirmEarningRow(userId, id)
}

export async function upsertCandidate(
  payload: Partial<Candidate> & { name: string },
  id?: string,
): Promise<void> {
  const { userId } = requireSession()
  upsertCandidateRow(
    userId,
    {
      ...payload,
      telegram: payload.telegram ? stripAtHandle(payload.telegram) || null : null,
      sentBy: payload.sentBy ? stripAtHandle(payload.sentBy) || null : null,
    },
    id,
  )
}

export async function deleteCandidate(id: string): Promise<void> {
  const { userId } = requireSession()
  deleteCandidateRow(userId, id)
}

export async function upsertOffer(
  payload: {
    title: string
    company?: string
    category: Offer['category']
    status: Offer['status']
    commissionType: 'fixed' | 'percent'
    commissionValue?: string
    commission?: string
    salaryMin?: string
    salaryMax?: string
    salary?: string
    location?: string
    telegram?: string
    description?: string
    roleType?: string
    accommodation?: boolean
    visa?: boolean
    flight?: boolean
    videoCall?: boolean
  },
  id?: string,
): Promise<void> {
  const { userId } = requireSession()
  upsertOfferRow(
    userId,
    {
      title: payload.title,
      company: payload.company || null,
      category: payload.category,
      status: payload.status,
      commissionType: payload.commissionType,
      commissionValue: parseNumericInput(payload.commissionValue ?? ''),
      commission: parseNumericInput(payload.commission ?? ''),
      salaryMin: parseNumericInput(payload.salaryMin ?? ''),
      salaryMax: parseNumericInput(payload.salaryMax ?? ''),
      salary: parseNumericInput(payload.salary ?? ''),
      location: payload.location || null,
      telegram: payload.telegram ? stripAtHandle(payload.telegram) || null : null,
      description: payload.description || null,
      roleType: payload.roleType || null,
      accommodation: payload.accommodation ?? null,
      visa: payload.visa ?? null,
      flight: payload.flight ?? null,
      videoCall: payload.videoCall ?? null,
    },
    id,
  )
}

export async function deleteOffer(id: string): Promise<void> {
  const { userId } = requireSession()
  deleteOfferRow(userId, id)
}

export async function upsertInterview(
  payload: {
    candidateId: string
    offerId?: string | null
    scheduledAt: string
    outcome?: string
    notes?: string
  },
  id?: string,
): Promise<void> {
  const { userId } = requireSession()
  upsertInterviewRow(userId, payload, id)
}

export async function deleteInterview(id: string): Promise<void> {
  const { userId } = requireSession()
  deleteInterviewRow(userId, id)
}

export async function upsertEarning(
  payload: {
    candidateId?: string | null
    offerId?: string | null
    amount: number
    status: Earning['status']
    notes?: string
  },
  id?: string,
): Promise<void> {
  const { userId } = requireSession()
  upsertEarningRow(userId, payload, id)
}

export async function deleteEarning(id: string): Promise<void> {
  const { userId } = requireSession()
  deleteEarningRow(userId, id)
}

export async function registerAccount(email: string, password: string, fullName?: string) {
  await dbRegister(email, password, fullName)
}

export async function loginAccount(email: string, password: string) {
  await dbSignIn(email, password)
}

export async function logoutAccount() {
  dbSignOut()
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await dbChangePassword(currentPassword, newPassword)
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  return adminListStats()
}

export async function adminUpdateRole(id: string, role: Role) {
  adminUpdateRoleRow(id, role)
}

export async function adminDeleteAccount(id: string) {
  adminDeleteAccountRow(id)
}

export async function adminSetPassword(id: string, password: string) {
  await adminSetPasswordRow(id, password)
}

export async function adminResetLink(id: string): Promise<string> {
  return adminResetPasswordRow(id)
}

export function canViewAdmin(role: Role | null | undefined): boolean {
  return !!role && ADMIN_VIEW_ROLES.includes(role)
}

export function exportDataJson(includeCredentialHashes = false): string {
  return JSON.stringify(exportDeskJson(includeCredentialHashes), null, 2)
}

export async function importDataJson(raw: string | unknown): Promise<{ accounts: number; rows: number }> {
  const parsed = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw
  return importDeskJson(parsed)
}
