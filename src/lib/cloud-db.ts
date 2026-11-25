/**
 * Hosted Supabase desk store (shared team pipeline).
 * Used when `isCloudSyncEnabled` — see `src/lib/supabase.ts`.
 */

import { migrateCandidate } from './local-db'
import { MAX_ACCOUNTS, OWNER_EMAIL, PRIMARY_ADMIN_EMAIL, type Role } from './constants'
import { supabase } from './supabase'
import type {
  Activity,
  AdminStats,
  Candidate,
  Earning,
  Interview,
  Offer,
  Profile,
} from './types'
import type { DeskData, TalentDeskExport } from './local-db'
import { EXPORT_FORMAT } from './local-db'

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function bool(v: unknown): boolean | null {
  if (v === null || v === undefined) return null
  return Boolean(v)
}

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    email: String(row.email ?? ''),
    fullName: (row.full_name as string) ?? null,
    role: (row.role as Role) ?? 'user',
    createdAt: String(row.created_at ?? ''),
  }
}

function mapOffer(row: Record<string, unknown>): Offer {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    title: String(row.title ?? ''),
    company: (row.company as string) ?? null,
    category: (row.category as Offer['category']) ?? 'forex',
    status: (row.status as Offer['status']) ?? 'Live',
    commissionType: (row.commission_type as Offer['commissionType']) ?? 'fixed',
    commissionValue: num(row.commission_value),
    commission: num(row.commission),
    salaryMin: num(row.salary_min),
    salaryMax: num(row.salary_max),
    salary: num(row.salary),
    location: (row.location as string) ?? null,
    telegram: (row.telegram as string) ?? null,
    description: (row.description as string) ?? null,
    roleType: (row.role_type as string) ?? null,
    accommodation: bool(row.accommodation),
    visa: bool(row.visa),
    flight: bool(row.flight),
    videoCall: bool(row.video_call),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

function mapCandidate(row: Record<string, unknown>): Candidate {
  return migrateCandidate({
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    name: String(row.name ?? ''),
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    source: (row.source as string) ?? null,
    stage: (row.stage as Candidate['stage']) ?? 'Screening',
    market: row.market as Candidate['market'],
    gender: row.gender as Candidate['gender'],
    offerId: (row.offer_id as string) ?? null,
    telegram: (row.telegram as string) ?? null,
    sentBy: (row.sent_by as string) ?? null,
    country: (row.country as string) ?? null,
    age: num(row.age),
    languages: (row.languages as string) ?? null,
    currentLocation: (row.current_location as string) ?? null,
    notes: (row.notes as string) ?? null,
    expectedSalary: num(row.expected_salary),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  })
}

function mapInterview(row: Record<string, unknown>): Interview {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? ''),
    candidateId: String(row.candidate_id ?? ''),
    offerId: (row.offer_id as string) ?? null,
    scheduledAt: String(row.scheduled_at ?? ''),
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
    entityType: String(row.entity_type ?? ''),
    entityId: (row.entity_id as string) ?? null,
    message: String(row.message ?? ''),
    createdAt: String(row.created_at ?? ''),
  }
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Not signed in')
  return data.user.id
}

async function pushActivity(
  userId: string,
  entityType: string,
  entityId: string | null,
  message: string,
) {
  await supabase.from('activities').insert({
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    message,
  })
}

export async function cloudGetProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error || !data) return null
  return mapProfile(data as Record<string, unknown>)
}

export async function cloudListOffers(): Promise<Offer[]> {
  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapOffer(r as Record<string, unknown>))
}

export async function cloudListCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapCandidate(r as Record<string, unknown>))
}

export async function cloudListInterviews(): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .order('scheduled_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapInterview(r as Record<string, unknown>))
}

export async function cloudListEarnings(): Promise<Earning[]> {
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapEarning(r as Record<string, unknown>))
}

export async function cloudListActivities(limit = 20): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => mapActivity(r as Record<string, unknown>))
}

export async function cloudSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

export async function cloudSignUp(email: string, password: string, fullName?: string) {
  const normalized = email.trim().toLowerCase()
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')

  // Seat cap is enforced by the profiles insert trigger (hard stop). Soft check skipped
  // here because anon callers cannot count profiles under RLS before sign-up.

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      data: { full_name: fullName?.trim() || '' },
    },
  })
  if (error) throw error
  if (!data.session) {
    throw new Error(
      'Account created but email confirmation is required. Disable “Confirm email” in Supabase Auth settings for the team desk, then sign in.',
    )
  }
  return data
}

export async function cloudSignOut() {
  await supabase.auth.signOut()
}

export async function cloudChangePassword(currentPassword: string, newPassword: string) {
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.')
  const { data: userData } = await supabase.auth.getUser()
  const email = userData.user?.email
  if (!email) throw new Error('Not signed in')

  const { error: reauthErr } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (reauthErr) throw new Error('Current password is incorrect')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function cloudUpsertCandidate(
  userId: string,
  payload: Partial<Candidate> & { name: string },
  existingId?: string,
) {
  const now = new Date().toISOString()
  if (existingId) {
    const { error } = await supabase
      .from('candidates')
      .update({
        name: payload.name,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        source: payload.source ?? null,
        stage: payload.stage ?? 'Screening',
        market: payload.market ?? null,
        gender: payload.gender ?? null,
        offer_id: payload.offerId ?? null,
        telegram: payload.telegram ?? null,
        sent_by: payload.sentBy ?? null,
        country: payload.country ?? null,
        age: payload.age ?? null,
        languages: payload.languages ?? null,
        current_location: payload.currentLocation ?? null,
        notes: payload.notes ?? null,
        expected_salary: payload.expectedSalary ?? null,
        updated_at: now,
      })
      .eq('id', existingId)
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'candidate', existingId, `Updated candidate ${payload.name}`)
  } else {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        user_id: userId,
        name: payload.name,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        source: payload.source ?? null,
        stage: payload.stage ?? 'Screening',
        market: payload.market ?? null,
        gender: payload.gender ?? null,
        offer_id: payload.offerId ?? null,
        telegram: payload.telegram ?? null,
        sent_by: payload.sentBy ?? null,
        country: payload.country ?? null,
        age: payload.age ?? null,
        languages: payload.languages ?? null,
        current_location: payload.currentLocation ?? null,
        notes: payload.notes ?? null,
        expected_salary: payload.expectedSalary ?? null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'candidate', data.id, `Added candidate ${payload.name}`)
  }
}

export async function cloudDeleteCandidate(userId: string, candidateId: string) {
  const { data: target } = await supabase
    .from('candidates')
    .select('name')
    .eq('id', candidateId)
    .maybeSingle()
  if (!target) return

  // Match local cascade: drop interviews (FK) + earnings for this candidate
  await supabase.from('earnings').delete().eq('candidate_id', candidateId)
  const { error } = await supabase.from('candidates').delete().eq('id', candidateId)
  if (error) throw new Error(error.message)
  await pushActivity(
    userId,
    'candidate',
    candidateId,
    `Deleted candidate ${(target as { name: string }).name}`,
  )
}

export async function cloudUpsertOffer(
  userId: string,
  payload: Omit<Offer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
) {
  const now = new Date().toISOString()
  const row = {
    title: payload.title,
    company: payload.company,
    category: payload.category,
    status: payload.status,
    commission_type: payload.commissionType,
    commission_value: payload.commissionValue,
    commission: payload.commission,
    salary_min: payload.salaryMin,
    salary_max: payload.salaryMax,
    salary: payload.salary,
    location: payload.location,
    telegram: payload.telegram,
    description: payload.description,
    role_type: payload.roleType,
    accommodation: payload.accommodation,
    visa: payload.visa,
    flight: payload.flight,
    video_call: payload.videoCall,
    updated_at: now,
  }
  if (existingId) {
    const { error } = await supabase.from('offers').update(row).eq('id', existingId)
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'offer', existingId, `Updated offer ${payload.title}`)
  } else {
    const { data, error } = await supabase
      .from('offers')
      .insert({ ...row, user_id: userId, created_at: now })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'offer', data.id, `Added offer ${payload.title}`)
  }
}

export async function cloudDeleteOffer(userId: string, offerId: string) {
  const { error } = await supabase.from('offers').delete().eq('id', offerId)
  if (error) throw new Error(error.message)
  await pushActivity(userId, 'offer', offerId, 'Deleted offer')
}

export async function cloudUpsertInterview(
  userId: string,
  payload: {
    candidateId: string
    offerId?: string | null
    scheduledAt: string
    outcome?: string
    notes?: string
  },
  existingId?: string,
) {
  if (existingId) {
    const { error } = await supabase
      .from('interviews')
      .update({
        candidate_id: payload.candidateId,
        offer_id: payload.offerId ?? null,
        scheduled_at: payload.scheduledAt,
        outcome: payload.outcome ?? null,
        notes: payload.notes ?? null,
      })
      .eq('id', existingId)
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'interview', existingId, 'Updated interview')
  } else {
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        user_id: userId,
        candidate_id: payload.candidateId,
        offer_id: payload.offerId ?? null,
        scheduled_at: payload.scheduledAt,
        outcome: payload.outcome ?? null,
        notes: payload.notes ?? null,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'interview', data.id, 'Scheduled interview')
  }
}

export async function cloudDeleteInterview(userId: string, interviewId: string) {
  const { error } = await supabase.from('interviews').delete().eq('id', interviewId)
  if (error) throw new Error(error.message)
  await pushActivity(userId, 'interview', interviewId, 'Deleted interview')
}

export async function cloudUpsertEarning(
  userId: string,
  payload: {
    candidateId?: string | null
    offerId?: string | null
    amount: number
    status: Earning['status']
    notes?: string
  },
  existingId?: string,
) {
  const now = new Date().toISOString()
  if (existingId) {
    const { error } = await supabase
      .from('earnings')
      .update({
        candidate_id: payload.candidateId ?? null,
        offer_id: payload.offerId ?? null,
        amount: payload.amount,
        status: payload.status,
        notes: payload.notes ?? null,
        updated_at: now,
      })
      .eq('id', existingId)
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'earning', existingId, `Updated earning $${payload.amount}`)
  } else {
    const { data, error } = await supabase
      .from('earnings')
      .insert({
        user_id: userId,
        candidate_id: payload.candidateId ?? null,
        offer_id: payload.offerId ?? null,
        amount: payload.amount,
        status: payload.status,
        notes: payload.notes ?? null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    await pushActivity(userId, 'earning', data.id, `Added earning $${payload.amount}`)
  }
}

export async function cloudDeleteEarning(userId: string, earningId: string) {
  const { error } = await supabase.from('earnings').delete().eq('id', earningId)
  if (error) throw new Error(error.message)
  await pushActivity(userId, 'earning', earningId, 'Deleted earning')
}

export async function cloudConfirmEarning(userId: string, earningId: string) {
  const { error } = await supabase
    .from('earnings')
    .update({ status: 'Pending', updated_at: new Date().toISOString() })
    .eq('id', earningId)
  if (error) throw new Error(error.message)
  await pushActivity(userId, 'earning', earningId, 'Confirmed earning → Pending')
}

export async function cloudAdminListStats(): Promise<AdminStats> {
  const [{ data: profiles, error: pErr }, offers, candidates, interviews, earnings] =
    await Promise.all([
      supabase.from('profiles').select('*').order('email'),
      cloudListOffers(),
      cloudListCandidates(),
      cloudListInterviews(),
      cloudListEarnings(),
    ])
  if (pErr) throw new Error(pErr.message)
  const accounts = (profiles ?? []).map((r) => mapProfile(r as Record<string, unknown>))
  const nonOwner = accounts.filter(
    (a) => a.role !== 'owner' && a.email.toLowerCase() !== OWNER_EMAIL.toLowerCase(),
  )
  const sorted = [...accounts].sort((a, b) => {
    if (a.role === 'owner' && b.role !== 'owner') return -1
    if (b.role === 'owner' && a.role !== 'owner') return 1
    return a.email.localeCompare(b.email)
  })
  return {
    accounts: accounts.length,
    seatsUsed: nonOwner.length,
    seatsMax: MAX_ACCOUNTS,
    candidates: candidates.length,
    offers: offers.length,
    interviews: interviews.length,
    earnings: earnings.length,
    estimated: earnings
      .filter((e) => e.status === 'Estimated')
      .reduce((s, e) => s + e.amount, 0),
    perAccount: sorted.map((a) => ({
      id: a.id,
      email: a.email,
      fullName: a.fullName,
      role: a.role,
      candidates: candidates.filter((c) => c.userId === a.id).length,
      offers: offers.filter((o) => o.userId === a.id).length,
      interviews: interviews.filter((i) => i.userId === a.id).length,
      earnings: earnings.filter((e) => e.userId === a.id).length,
    })),
  }
}

export async function cloudAdminUpdateRole(id: string, role: Role) {
  if (role === 'owner') throw new Error('Cannot assign owner role')
  const { data: target } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (!target) throw new Error('Account not found')
  const t = mapProfile(target as Record<string, unknown>)
  if (t.role === 'owner' || t.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    throw new Error('Owner cannot be demoted')
  }
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function cloudAdminDeleteAccount(id: string) {
  const { data: target } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (!target) throw new Error('Account not found')
  const t = mapProfile(target as Record<string, unknown>)
  if (t.role === 'owner' || t.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    throw new Error('Owner cannot be deleted')
  }
  // Profile row only — desk rows stay. Also remove Auth user in Dashboard so they cannot re-enter.
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function cloudAdminCreateAccount(_input: {
  email: string
  password: string
  fullName?: string
  role?: Role
}): Promise<Profile> {
  throw new Error(
    'Cloud mode: create seats via Register on the login screen (or Supabase Dashboard → Auth → Add user). Admin “Add account” needs a service-role Edge Function — not available from the SPA anon key.',
  )
}

export async function cloudAdminSetPassword(_id: string, _password: string) {
  throw new Error(
    'Cloud mode: reset passwords in Supabase Dashboard → Authentication → Users (or deploy the optional admin-account Edge Function).',
  )
}

export async function cloudAdminResetLink(_id: string): Promise<string> {
  throw new Error(
    'Cloud mode: use Supabase Dashboard → Authentication → Users → Send password recovery / reset.',
  )
}

/** Upload local / export desk rows into the shared cloud tables (accounts stay in Auth). */
export async function cloudUploadDeskData(
  data: DeskData,
  actorUserId?: string,
): Promise<{ rows: number }> {
  const userId = actorUserId ?? (await requireUserId())

  // Preserve IDs when valid UUIDs so FKs survive; remap creator to current uploader when missing.
  const offerRows = (data.offers ?? []).map((o) => ({
    id: o.id || undefined,
    user_id: userId,
    title: o.title,
    company: o.company,
    category: o.category,
    status: o.status,
    commission_type: o.commissionType,
    commission_value: o.commissionValue,
    commission: o.commission,
    salary_min: o.salaryMin,
    salary_max: o.salaryMax,
    salary: o.salary,
    location: o.location,
    telegram: o.telegram,
    description: o.description,
    role_type: o.roleType,
    accommodation: o.accommodation,
    visa: o.visa,
    flight: o.flight,
    video_call: o.videoCall,
    created_at: o.createdAt || new Date().toISOString(),
    updated_at: o.updatedAt || new Date().toISOString(),
  }))

  if (offerRows.length) {
    const { error } = await supabase.from('offers').upsert(offerRows, { onConflict: 'id' })
    if (error) throw new Error(`Offers upload failed: ${error.message}`)
  }

  const candidateRows = (data.candidates ?? []).map((c) => {
    const m = migrateCandidate(c as Partial<Candidate> & Record<string, unknown>)
    return {
      id: m.id || undefined,
      user_id: userId,
      name: m.name,
      email: m.email,
      phone: m.phone,
      source: m.source,
      stage: m.stage,
      market: m.market,
      gender: m.gender,
      offer_id: m.offerId,
      telegram: m.telegram,
      sent_by: m.sentBy,
      country: m.country,
      age: m.age,
      languages: m.languages,
      current_location: m.currentLocation,
      notes: m.notes,
      expected_salary: m.expectedSalary,
      created_at: m.createdAt || new Date().toISOString(),
      updated_at: m.updatedAt || new Date().toISOString(),
    }
  })

  if (candidateRows.length) {
    const { error } = await supabase.from('candidates').upsert(candidateRows, { onConflict: 'id' })
    if (error) throw new Error(`Candidates upload failed: ${error.message}`)
  }

  const interviewRows = (data.interviews ?? []).map((i) => ({
    id: i.id || undefined,
    user_id: userId,
    candidate_id: i.candidateId,
    offer_id: i.offerId,
    scheduled_at: i.scheduledAt,
    outcome: i.outcome,
    notes: i.notes,
    created_at: i.createdAt || new Date().toISOString(),
  }))

  if (interviewRows.length) {
    const { error } = await supabase.from('interviews').upsert(interviewRows, { onConflict: 'id' })
    if (error) throw new Error(`Interviews upload failed: ${error.message}`)
  }

  const earningRows = (data.earnings ?? []).map((e) => ({
    id: e.id || undefined,
    user_id: userId,
    candidate_id: e.candidateId,
    offer_id: e.offerId,
    amount: e.amount,
    status: e.status,
    notes: e.notes,
    created_at: e.createdAt || new Date().toISOString(),
    updated_at: e.updatedAt || new Date().toISOString(),
  }))

  if (earningRows.length) {
    const { error } = await supabase.from('earnings').upsert(earningRows, { onConflict: 'id' })
    if (error) throw new Error(`Earnings upload failed: ${error.message}`)
  }

  const activityRows = (data.activities ?? []).slice(0, 200).map((a) => ({
    id: a.id || undefined,
    user_id: userId,
    entity_type: a.entityType,
    entity_id: a.entityId,
    message: a.message,
    created_at: a.createdAt || new Date().toISOString(),
  }))

  if (activityRows.length) {
    const { error } = await supabase.from('activities').upsert(activityRows, { onConflict: 'id' })
    if (error) throw new Error(`Activities upload failed: ${error.message}`)
  }

  const rows =
    offerRows.length +
    candidateRows.length +
    interviewRows.length +
    earningRows.length

  return { rows }
}

export async function cloudImportDeskJson(
  raw: unknown,
): Promise<{ accounts: number; rows: number }> {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid export JSON')
  const doc = raw as TalentDeskExport
  if (doc.format !== EXPORT_FORMAT) {
    throw new Error('Unrecognized export format — expected talent-desk-export')
  }
  const data = doc.data ?? {
    candidates: [],
    offers: [],
    interviews: [],
    earnings: [],
    activities: [],
  }
  const { rows } = await cloudUploadDeskData(data)
  // Accounts in the export are local PBKDF2 — they do not map to Supabase Auth.
  return { accounts: 0, rows }
}

export async function cloudExportDeskJson(): Promise<TalentDeskExport> {
  const [offers, candidates, interviews, earnings, activities, profiles] = await Promise.all([
    cloudListOffers(),
    cloudListCandidates(),
    cloudListInterviews(),
    cloudListEarnings(),
    cloudListActivities(200),
    supabase.from('profiles').select('*'),
  ])
  return {
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts: (profiles.data ?? []).map((r) => {
      const p = mapProfile(r as Record<string, unknown>)
      return {
        id: p.id,
        email: p.email,
        fullName: p.fullName,
        role: p.role,
        createdAt: p.createdAt,
      }
    }),
    data: { offers, candidates, interviews, earnings, activities },
  }
}

const AUTO_MIGRATE_KEY = 'talent-desk.cloud-auto-migrated.v1'

/** Once per browser: if cloud desk is empty and localStorage has rows, upload them. */
export async function maybeAutoMigrateLocalToCloud(
  localData: DeskData,
): Promise<{ uploaded: boolean; rows: number }> {
  if (typeof localStorage === 'undefined') return { uploaded: false, rows: 0 }
  if (localStorage.getItem(AUTO_MIGRATE_KEY) === '1') return { uploaded: false, rows: 0 }

  const localRows =
    (localData.candidates?.length ?? 0) +
    (localData.offers?.length ?? 0) +
    (localData.interviews?.length ?? 0) +
    (localData.earnings?.length ?? 0)
  if (localRows === 0) {
    localStorage.setItem(AUTO_MIGRATE_KEY, '1')
    return { uploaded: false, rows: 0 }
  }

  const [c, o] = await Promise.all([
    supabase.from('candidates').select('id', { count: 'exact', head: true }),
    supabase.from('offers').select('id', { count: 'exact', head: true }),
  ])
  const cloudEmpty = (c.count ?? 0) === 0 && (o.count ?? 0) === 0
  if (!cloudEmpty) {
    localStorage.setItem(AUTO_MIGRATE_KEY, '1')
    return { uploaded: false, rows: 0 }
  }

  const { rows } = await cloudUploadDeskData(localData)
  localStorage.setItem(AUTO_MIGRATE_KEY, '1')
  return { uploaded: true, rows }
}

export function markCloudMigrated() {
  localStorage.setItem(AUTO_MIGRATE_KEY, '1')
}

export function preferredAdminEmail() {
  return PRIMARY_ADMIN_EMAIL
}
