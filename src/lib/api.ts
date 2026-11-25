import {
  adminCreateAccountRow,
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
  loadData,
  registerAccount as dbRegister,
  requireSession,
  signIn as dbSignIn,
  signOut as dbSignOut,
  upsertCandidateRow,
  upsertEarningRow,
  upsertInterviewRow,
  upsertOfferRow,
} from './local-db'
import {
  cloudAdminCreateAccount,
  cloudAdminDeleteAccount,
  cloudAdminListStats,
  cloudAdminResetLink,
  cloudAdminSetPassword,
  cloudAdminUpdateRole,
  cloudChangePassword,
  cloudConfirmEarning,
  cloudDeleteCandidate,
  cloudDeleteEarning,
  cloudDeleteInterview,
  cloudDeleteOffer,
  cloudExportDeskJson,
  cloudGetProfile,
  cloudImportDeskJson,
  cloudListActivities,
  cloudListCandidates,
  cloudListEarnings,
  cloudListInterviews,
  cloudListOffers,
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  cloudUpsertCandidate,
  cloudUpsertEarning,
  cloudUpsertInterview,
  cloudUpsertOffer,
  maybeAutoMigrateLocalToCloud,
} from './cloud-db'
import { isCloudSyncEnabled, supabase } from './supabase'
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
import { ADMIN_VIEW_ROLES, PIPELINE_ROLES, type Role } from './constants'
import { stageForInterviewOutcome } from './interview-stage'
import { parseNumericInput, stripAtHandle } from './utils'

export { isCloudSyncEnabled }

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

async function requireActorId(): Promise<string> {
  if (isCloudSyncEnabled) {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) throw new Error('Not signed in')
    return data.user.id
  }
  return requireSession().userId
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (isCloudSyncEnabled) return cloudGetProfile(userId)
  return getProfile(userId)
}

export async function fetchOffers(): Promise<Offer[]> {
  if (isCloudSyncEnabled) {
    await requireActorId()
    return cloudListOffers()
  }
  requireSession()
  return listOffers()
}

export async function fetchCandidates(): Promise<Candidate[]> {
  if (isCloudSyncEnabled) {
    await requireActorId()
    return cloudListCandidates()
  }
  requireSession()
  return listCandidates()
}

export async function fetchInterviews(): Promise<Interview[]> {
  if (isCloudSyncEnabled) {
    await requireActorId()
    return cloudListInterviews()
  }
  requireSession()
  return listInterviews()
}

export async function fetchEarnings(): Promise<Earning[]> {
  if (isCloudSyncEnabled) {
    await requireActorId()
    return cloudListEarnings()
  }
  requireSession()
  return listEarnings()
}

export async function fetchActivities(limit = 20): Promise<Activity[]> {
  if (isCloudSyncEnabled) {
    await requireActorId()
    return cloudListActivities(limit)
  }
  requireSession()
  return listActivities(limit)
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
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudConfirmEarning(userId, id)
    return
  }
  confirmEarningRow(userId, id)
}

export async function upsertCandidate(
  payload: Partial<Candidate> & { name: string },
  id?: string,
): Promise<void> {
  const userId = await requireActorId()
  const next = {
    ...payload,
    telegram: payload.telegram ? stripAtHandle(payload.telegram) || null : null,
    sentBy: payload.sentBy ? stripAtHandle(payload.sentBy) || null : null,
  }
  if (isCloudSyncEnabled) {
    await cloudUpsertCandidate(userId, next, id)
    return
  }
  upsertCandidateRow(userId, next, id)
}

export async function deleteCandidate(id: string): Promise<void> {
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudDeleteCandidate(userId, id)
    return
  }
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
  const userId = await requireActorId()
  const row = {
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
  }
  if (isCloudSyncEnabled) {
    await cloudUpsertOffer(userId, row, id)
    return
  }
  upsertOfferRow(userId, row, id)
}

export async function deleteOffer(id: string): Promise<void> {
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudDeleteOffer(userId, id)
    return
  }
  deleteOfferRow(userId, id)
}

async function syncCandidateStageFromInterview(
  userId: string,
  candidateId: string,
  outcome: string | null | undefined,
  offerId?: string | null,
): Promise<void> {
  const candidates = isCloudSyncEnabled
    ? await cloudListCandidates()
    : listCandidates()
  const cand = candidates.find((c) => c.id === candidateId)
  if (!cand) return

  const nextStage = stageForInterviewOutcome(outcome)
  const nextOfferId = offerId !== undefined && offerId !== null ? offerId : cand.offerId
  if (cand.stage === nextStage && cand.offerId === nextOfferId) return

  const patch: Partial<Candidate> & { name: string } = {
    name: cand.name,
    email: cand.email,
    phone: cand.phone,
    source: cand.source,
    stage: nextStage,
    market: cand.market,
    gender: cand.gender,
    offerId: nextOfferId,
    telegram: cand.telegram,
    sentBy: cand.sentBy,
    country: cand.country,
    age: cand.age,
    languages: cand.languages,
    currentLocation: cand.currentLocation,
    notes: cand.notes,
    expectedSalary: cand.expectedSalary,
  }

  if (isCloudSyncEnabled) {
    await cloudUpsertCandidate(userId, patch, candidateId)
  } else {
    upsertCandidateRow(userId, patch, candidateId)
  }
}

/**
 * Create/update interview and auto-set candidate stage:
 * scheduled → Interview; Confirmed → Accepted; Declined by company → Rejected.
 */
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
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudUpsertInterview(userId, payload, id)
  } else {
    upsertInterviewRow(userId, payload, id)
  }
  await syncCandidateStageFromInterview(
    userId,
    payload.candidateId,
    payload.outcome,
    payload.offerId,
  )
}

/** Align candidate stages with their latest interview (scheduled → Interview, etc.). */
export async function reconcileInterviewCandidateStages(): Promise<number> {
  const userId = await requireActorId()
  const interviews = isCloudSyncEnabled
    ? await cloudListInterviews()
    : listInterviews()
  if (interviews.length === 0) return 0

  const candidates = isCloudSyncEnabled
    ? await cloudListCandidates()
    : listCandidates()
  const byId = new Map(candidates.map((c) => [c.id, c]))

  const latestByCandidate = new Map<string, Interview>()
  for (const row of interviews) {
    const prev = latestByCandidate.get(row.candidateId)
    if (
      !prev ||
      new Date(row.scheduledAt).getTime() > new Date(prev.scheduledAt).getTime()
    ) {
      latestByCandidate.set(row.candidateId, row)
    }
  }

  let updated = 0
  for (const row of latestByCandidate.values()) {
    const before = byId.get(row.candidateId)
    const nextStage = stageForInterviewOutcome(row.outcome)
    if (!before || before.stage === nextStage) continue
    await syncCandidateStageFromInterview(
      userId,
      row.candidateId,
      row.outcome,
      row.offerId,
    )
    updated += 1
  }
  return updated
}

export async function deleteInterview(id: string): Promise<void> {
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudDeleteInterview(userId, id)
    return
  }
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
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudUpsertEarning(userId, payload, id)
    return
  }
  upsertEarningRow(userId, payload, id)
}

export async function deleteEarning(id: string): Promise<void> {
  const userId = await requireActorId()
  if (isCloudSyncEnabled) {
    await cloudDeleteEarning(userId, id)
    return
  }
  deleteEarningRow(userId, id)
}

export async function registerAccount(email: string, password: string, fullName?: string) {
  if (isCloudSyncEnabled) {
    await cloudSignUp(email, password, fullName)
    return
  }
  await dbRegister(email, password, fullName)
}

export async function loginAccount(email: string, password: string) {
  if (isCloudSyncEnabled) {
    await cloudSignIn(email, password)
    await maybeAutoMigrateLocalToCloud(loadData())
    return
  }
  await dbSignIn(email, password)
}

export async function logoutAccount() {
  if (isCloudSyncEnabled) {
    await cloudSignOut()
    return
  }
  dbSignOut()
}

export async function changePassword(currentPassword: string, newPassword: string) {
  if (isCloudSyncEnabled) {
    await cloudChangePassword(currentPassword, newPassword)
    return
  }
  await dbChangePassword(currentPassword, newPassword)
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  if (isCloudSyncEnabled) return cloudAdminListStats()
  return adminListStats()
}

export async function adminUpdateRole(id: string, role: Role) {
  if (isCloudSyncEnabled) {
    await cloudAdminUpdateRole(id, role)
    return
  }
  adminUpdateRoleRow(id, role)
}

export async function adminDeleteAccount(id: string) {
  if (isCloudSyncEnabled) {
    await cloudAdminDeleteAccount(id)
    return
  }
  adminDeleteAccountRow(id)
}

export async function adminSetPassword(id: string, password: string) {
  if (isCloudSyncEnabled) {
    await cloudAdminSetPassword(id, password)
    return
  }
  await adminSetPasswordRow(id, password)
}

export async function adminResetLink(id: string): Promise<string> {
  if (isCloudSyncEnabled) return cloudAdminResetLink(id)
  return adminResetPasswordRow(id)
}

export function canViewAdmin(role: Role | null | undefined): boolean {
  return !!role && ADMIN_VIEW_ROLES.includes(role)
}

/** Offers + candidates CRUD — all desk roles (not owner-only). */
export function canManagePipeline(role: Role | null | undefined): boolean {
  return !!role && PIPELINE_ROLES.includes(role)
}

export async function adminCreateAccount(input: {
  email: string
  password: string
  fullName?: string
  role?: Role
}) {
  if (isCloudSyncEnabled) return cloudAdminCreateAccount(input)
  return adminCreateAccountRow(input)
}

export function exportDataJson(includeCredentialHashes = false): string {
  if (isCloudSyncEnabled) {
    // Sync export is async — callers that need cloud should use exportDataJsonAsync.
    // Keep sync API for local mode; cloud Settings uses the async path.
    return JSON.stringify(exportDeskJson(includeCredentialHashes), null, 2)
  }
  return JSON.stringify(exportDeskJson(includeCredentialHashes), null, 2)
}

export async function exportDataJsonAsync(includeCredentialHashes = false): Promise<string> {
  if (isCloudSyncEnabled) {
    const doc = await cloudExportDeskJson()
    return JSON.stringify(doc, null, 2)
  }
  return JSON.stringify(exportDeskJson(includeCredentialHashes), null, 2)
}

export async function importDataJson(raw: string | unknown): Promise<{ accounts: number; rows: number }> {
  const parsed = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw
  if (isCloudSyncEnabled) return cloudImportDeskJson(parsed)
  return importDeskJson(parsed)
}

/** Manual “upload this browser’s local desk to cloud” from Settings. */
export async function uploadLocalDeskToCloud(): Promise<{ rows: number }> {
  if (!isCloudSyncEnabled) throw new Error('Cloud sync is not configured.')
  const { cloudUploadDeskData, markCloudMigrated } = await import('./cloud-db')
  const result = await cloudUploadDeskData(loadData())
  markCloudMigrated()
  return result
}
