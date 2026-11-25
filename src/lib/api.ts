import { DEMO_METRICS } from './demo-data'
import { supabase, supabaseConfigured } from './supabase'
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
import { ADMIN_VIEW_ROLES, MAX_ACCOUNTS, OWNER_EMAIL, type Role } from './constants'
import { parseNumericInput, stripAtHandle } from './utils'

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    email: String(row.email ?? ''),
    fullName: (row.full_name as string) ?? (row.fullName as string) ?? null,
    role: (row.role as Role) ?? 'user',
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
  }
}

function mapOffer(row: Record<string, unknown>): Offer {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId ?? ''),
    title: String(row.title ?? ''),
    company: (row.company as string) ?? null,
    category: (row.category as Offer['category']) ?? 'forex',
    status: (row.status as Offer['status']) ?? 'Live',
    commissionType: (row.commission_type as Offer['commissionType']) ?? 'fixed',
    commissionValue: num(row.commission_value ?? row.commissionValue),
    commission: num(row.commission),
    salaryMin: num(row.salary_min ?? row.salaryMin),
    salaryMax: num(row.salary_max ?? row.salaryMax),
    salary: num(row.salary),
    location: (row.location as string) ?? null,
    telegram: (row.telegram as string) ?? null,
    description: (row.description as string) ?? null,
    roleType: (row.role_type as string) ?? (row.roleType as string) ?? null,
    accommodation: bool(row.accommodation),
    visa: bool(row.visa),
    flight: bool(row.flight),
    videoCall: bool(row.video_call ?? row.videoCall),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

function mapCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    name: String(row.name ?? ''),
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    source: (row.source as string) ?? null,
    stage: (row.stage as Candidate['stage']) ?? 'Screening',
    offerId: (row.offer_id as string) ?? (row.offerId as string) ?? null,
    telegram: (row.telegram as string) ?? null,
    sentBy: (row.sent_by as string) ?? (row.sentBy as string) ?? null,
    notes: (row.notes as string) ?? null,
    expectedSalary: num(row.expected_salary ?? row.expectedSalary),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

function mapInterview(row: Record<string, unknown>): Interview {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    candidateId: String(row.candidate_id ?? row.candidateId ?? ''),
    offerId: (row.offer_id as string) ?? null,
    scheduledAt: String(row.scheduled_at ?? row.scheduledAt ?? ''),
    outcome: (row.outcome as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: String(row.created_at ?? ''),
  }
}

function mapEarning(row: Record<string, unknown>): Earning {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    candidateId: (row.candidate_id as string) ?? null,
    offerId: (row.offer_id as string) ?? null,
    amount: num(row.amount) ?? 0,
    status: (row.status as Earning['status']) ?? 'Estimated',
    notes: (row.notes as string) ?? null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

function mapActivity(row: Record<string, unknown>): Activity {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    entityType: String(row.entity_type ?? row.entityType ?? ''),
    entityId: (row.entity_id as string) ?? null,
    message: String(row.message ?? ''),
    createdAt: String(row.created_at ?? ''),
  }
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function bool(v: unknown): boolean | null {
  if (v === null || v === undefined) return null
  return Boolean(v)
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabaseConfigured) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error || !data) return null
  return mapProfile(data as Record<string, unknown>)
}

export async function fetchOffers(): Promise<Offer[]> {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r) => mapOffer(r as Record<string, unknown>))
}

export async function fetchCandidates(): Promise<Candidate[]> {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error || !data) return []
  return data.map((r) => mapCandidate(r as Record<string, unknown>))
}

export async function fetchInterviews(): Promise<Interview[]> {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .order('scheduled_at', { ascending: true })
  if (error || !data) return []
  return data.map((r) => mapInterview(r as Record<string, unknown>))
}

export async function fetchEarnings(): Promise<Earning[]> {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r) => mapEarning(r as Record<string, unknown>))
}

export async function fetchActivities(limit = 20): Promise<Activity[]> {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((r) => mapActivity(r as Record<string, unknown>))
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
    return { ...DEMO_METRICS }
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
  const { error } = await supabase.from('earnings').update({ status: 'Pending' }).eq('id', id)
  if (error) throw error
}

export async function upsertCandidate(
  payload: Partial<Candidate> & { name: string },
  id?: string,
): Promise<void> {
  const row = {
    name: payload.name,
    email: payload.email || null,
    phone: payload.phone || null,
    source: payload.source || null,
    stage: payload.stage || 'Screening',
    offer_id: payload.offerId || null,
    telegram: payload.telegram ? stripAtHandle(payload.telegram) || null : null,
    sent_by: payload.sentBy ? stripAtHandle(payload.sentBy) || null : null,
    notes: payload.notes || null,
    expected_salary: payload.expectedSalary ?? null,
    updated_at: new Date().toISOString(),
  }
  if (id) {
    const { error } = await supabase.from('candidates').update(row).eq('id', id)
    if (error) throw error
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('candidates').insert({
      ...row,
      user_id: user?.id,
    })
    if (error) throw error
  }
}

export async function deleteCandidate(id: string): Promise<void> {
  const { error } = await supabase.from('candidates').delete().eq('id', id)
  if (error) throw error
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
  const row = {
    title: payload.title,
    company: payload.company || null,
    category: payload.category,
    status: payload.status,
    commission_type: payload.commissionType,
    commission_value: parseNumericInput(payload.commissionValue ?? ''),
    commission: parseNumericInput(payload.commission ?? ''),
    salary_min: parseNumericInput(payload.salaryMin ?? ''),
    salary_max: parseNumericInput(payload.salaryMax ?? ''),
    salary: parseNumericInput(payload.salary ?? ''),
    location: payload.location || null,
    telegram: payload.telegram ? stripAtHandle(payload.telegram) || null : null,
    description: payload.description || null,
    role_type: payload.roleType || null,
    accommodation: payload.accommodation ?? null,
    visa: payload.visa ?? null,
    flight: payload.flight ?? null,
    video_call: payload.videoCall ?? null,
    updated_at: new Date().toISOString(),
  }
  if (id) {
    const { error } = await supabase.from('offers').update(row).eq('id', id)
    if (error) throw error
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('offers').insert({ ...row, user_id: user?.id })
    if (error) throw error
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabase.from('offers').delete().eq('id', id)
  if (error) throw error
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
  const row = {
    candidate_id: payload.candidateId,
    offer_id: payload.offerId || null,
    scheduled_at: payload.scheduledAt,
    outcome: payload.outcome || null,
    notes: payload.notes || null,
  }
  if (id) {
    const { error } = await supabase.from('interviews').update(row).eq('id', id)
    if (error) throw error
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('interviews').insert({ ...row, user_id: user?.id })
    if (error) throw error
  }
}

export async function deleteInterview(id: string): Promise<void> {
  const { error } = await supabase.from('interviews').delete().eq('id', id)
  if (error) throw error
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
  const row = {
    candidate_id: payload.candidateId || null,
    offer_id: payload.offerId || null,
    amount: payload.amount,
    status: payload.status,
    notes: payload.notes || null,
    updated_at: new Date().toISOString(),
  }
  if (id) {
    const { error } = await supabase.from('earnings').update(row).eq('id', id)
    if (error) throw error
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from('earnings').insert({ ...row, user_id: user?.id })
    if (error) throw error
  }
}

export async function deleteEarning(id: string): Promise<void> {
  const { error } = await supabase.from('earnings').delete().eq('id', id)
  if (error) throw error
}

/** Register via Edge Function (service role + seat cap). Falls back to client signUp if fn missing. */
export async function registerAccount(email: string, password: string, fullName?: string) {
  if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    throw new Error('This email is reserved.')
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke('register', {
    body: { email, password, fullName },
  })

  if (!fnError && fnData?.ok) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return
  }

  // Fallback: client signUp (DB trigger still enforces seat cap)
  if (fnError && !String(fnError.message).includes('Failed to send')) {
    // continue to fallback only when function unavailable
  }
  if (fnData?.error) {
    throw new Error(String(fnData.error))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || '' } },
  })
  if (error) {
    if (/maximum|account limit|4 accounts/i.test(error.message)) {
      throw new Error('Maximum of 4 accounts reached. No more registrations allowed.')
    }
    throw error
  }
  if (!data.session) {
    const login = await supabase.auth.signInWithPassword({ email, password })
    if (login.error) throw login.error
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not signed in')
  const { error: verify } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (verify) throw new Error('Current password is incorrect')
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  const { data, error } = await supabase.functions.invoke('admin-stats')
  if (!error && data && !data.error) return data as AdminStats

  // Client fallback: aggregate from profiles + counts (RLS may limit)
  const { data: profiles } = await supabase.from('profiles').select('*')
  if (!profiles) return null
  const mapped = profiles.map((p) => mapProfile(p as Record<string, unknown>))
  const nonOwner = mapped.filter((p) => p.role !== 'owner' && p.email !== OWNER_EMAIL)
  return {
    accounts: mapped.length,
    seatsUsed: nonOwner.length,
    seatsMax: MAX_ACCOUNTS,
    candidates: 0,
    offers: 0,
    interviews: 0,
    earnings: 0,
    estimated: 0,
    perAccount: mapped.map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.fullName,
      role: p.role,
      candidates: 0,
      offers: 0,
      interviews: 0,
      earnings: 0,
    })),
  }
}

export async function adminUpdateRole(id: string, role: Role) {
  const { data, error } = await supabase.functions.invoke('admin-account', {
    body: { id, action: 'role', role },
  })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
}

export async function adminDeleteAccount(id: string) {
  const { data, error } = await supabase.functions.invoke('admin-account', {
    body: { id, action: 'delete' },
  })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
}

export async function adminSetPassword(id: string, password: string) {
  const { data, error } = await supabase.functions.invoke('admin-account', {
    body: { id, action: 'password', password },
  })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
}

export async function adminResetLink(id: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('admin-account', {
    body: { id, action: 'reset' },
  })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
  return String(data?.link ?? '')
}

export function canViewAdmin(role: Role | null | undefined): boolean {
  return !!role && ADMIN_VIEW_ROLES.includes(role)
}
