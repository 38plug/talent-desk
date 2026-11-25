/**
 * Browser-only Talent Desk store (localStorage).
 * Empty by default — no demo/seed KPIs.
 */

import {
  CANDIDATE_GENDERS,
  MAX_ACCOUNTS,
  OFFER_CATEGORIES,
  OWNER_EMAIL,
  PRIMARY_ADMIN_EMAIL,
  type CandidateGender,
  type OfferCategory,
  type Role,
} from './constants'
import type {
  Activity,
  Candidate,
  Earning,
  Interview,
  Offer,
  Profile,
} from './types'

const KEYS = {
  accounts: 'talent-desk.accounts.v1',
  data: 'talent-desk.data.v1',
  session: 'talent-desk.session.v1',
  /** One-time: promote PRIMARY_ADMIN_EMAIL → admin when that seat already exists. */
  profAdminBootstrap: 'talent-desk.bootstrap.prof-admin.v1',
} as const

export const EXPORT_FORMAT = 'talent-desk-export' as const
export const EXPORT_VERSION = 1 as const

export type StoredAccount = {
  id: string
  email: string
  fullName: string | null
  role: Role
  passwordHash: string
  salt: string
  createdAt: string
}

export type DeskData = {
  candidates: Candidate[]
  offers: Offer[]
  interviews: Interview[]
  earnings: Earning[]
  activities: Activity[]
}

export type AuthSession = {
  userId: string
  email: string
}

export type TalentDeskExport = {
  format: typeof EXPORT_FORMAT
  version: typeof EXPORT_VERSION
  exportedAt: string
  accounts?: Array<{
    id: string
    email: string
    fullName: string | null
    role: Role
    /** Plain password only when exporting for re-import on another device */
    password?: string
    passwordHash?: string
    salt?: string
    createdAt: string
  }>
  data?: DeskData
}

function emptyData(): DeskData {
  return {
    candidates: [],
    offers: [],
    interviews: [],
    earnings: [],
    activities: [],
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function id(): string {
  return crypto.randomUUID()
}

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)))
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return bufToHex(bits)
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function isRole(value: unknown): value is Role {
  return value === 'owner' || value === 'admin' || value === 'moderator' || value === 'user'
}

/** Coerce whatever is in localStorage into a full accounts array (never owner-only). */
export function loadAccounts(): StoredAccount[] {
  const raw = readJson<unknown>(KEYS.accounts, [])
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.values(raw as Record<string, unknown>)
      : []

  const accounts: StoredAccount[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const a = item as Partial<StoredAccount>
    if (!a.id || !a.email || !a.passwordHash || !a.salt) continue
    accounts.push({
      id: String(a.id),
      email: String(a.email).trim().toLowerCase(),
      fullName: a.fullName ?? null,
      role: isRole(a.role) ? a.role : 'user',
      passwordHash: String(a.passwordHash),
      salt: String(a.salt),
      createdAt: String(a.createdAt ?? new Date().toISOString()),
    })
  }
  return applyPrimaryAdminBootstrap(accounts)
}

/**
 * One-time per browser: if PRIMARY_ADMIN_EMAIL already has a seat and is not owner,
 * promote to `admin`. Does not create the account — use Admin Add account / register.
 * Owner remains the sole `owner` (no co-owner).
 */
function applyPrimaryAdminBootstrap(accounts: StoredAccount[]): StoredAccount[] {
  if (typeof localStorage === 'undefined') return accounts
  if (localStorage.getItem(KEYS.profAdminBootstrap) === '1') return accounts

  const target = PRIMARY_ADMIN_EMAIL.toLowerCase()
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === target)
  if (idx < 0) {
    // Seat not on this device yet — leave flag unset so a later register/add still bootstraps.
    return accounts
  }

  const a = accounts[idx]!
  if (a.role === 'owner' || a.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    localStorage.setItem(KEYS.profAdminBootstrap, '1')
    return accounts
  }

  if (a.role !== 'admin') {
    const next = accounts.slice()
    next[idx] = { ...a, role: 'admin' }
    writeJson(KEYS.accounts, next)
    localStorage.setItem(KEYS.profAdminBootstrap, '1')
    return next
  }

  localStorage.setItem(KEYS.profAdminBootstrap, '1')
  return accounts
}

function saveAccounts(accounts: StoredAccount[]) {
  writeJson(KEYS.accounts, accounts)
}

/** Default role for a new non-owner seat (preferred admin mailbox → admin). */
function defaultSeatRole(email: string): Role {
  if (email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) return 'admin'
  return 'user'
}

function normalizeAge(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeMarket(value: unknown): OfferCategory | null {
  if (value === null || value === undefined || value === '') return null
  const s = String(value).toLowerCase()
  return (OFFER_CATEGORIES as readonly string[]).includes(s) ? (s as OfferCategory) : null
}

function normalizeGender(value: unknown): CandidateGender | null {
  if (value === null || value === undefined || value === '') return null
  const s = String(value).toLowerCase()
  return (CANDIDATE_GENDERS as readonly string[]).includes(s) ? (s as CandidateGender) : null
}

/** Fill missing profile fields on older candidate rows without wiping data. */
export function migrateCandidate(raw: Partial<Candidate> & Record<string, unknown>): Candidate {
  return {
    id: String(raw.id ?? ''),
    userId: String(raw.userId ?? ''),
    name: String(raw.name ?? ''),
    email: (raw.email as string) ?? null,
    phone: (raw.phone as string) ?? null,
    source: (raw.source as string) ?? null,
    stage: (raw.stage as Candidate['stage']) ?? 'Screening',
    market: normalizeMarket(raw.market),
    gender: normalizeGender(raw.gender),
    offerId: (raw.offerId as string) ?? null,
    telegram: (raw.telegram as string) ?? null,
    sentBy: (raw.sentBy as string) ?? null,
    country: (raw.country as string) ?? null,
    age: normalizeAge(raw.age),
    languages: (raw.languages as string) ?? null,
    currentLocation: (raw.currentLocation as string) ?? null,
    notes: (raw.notes as string) ?? null,
    expectedSalary: normalizeAge(raw.expectedSalary),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

function migrateDeskData(data: DeskData): DeskData {
  return {
    ...data,
    candidates: (data.candidates ?? []).map((c) =>
      migrateCandidate(c as Partial<Candidate> & Record<string, unknown>),
    ),
  }
}

export function loadData(): DeskData {
  return migrateDeskData(readJson<DeskData>(KEYS.data, emptyData()))
}

function saveData(data: DeskData) {
  writeJson(KEYS.data, migrateDeskData(data))
}

export function getSession(): AuthSession | null {
  return readJson<AuthSession | null>(KEYS.session, null)
}

export function setSession(session: AuthSession | null) {
  if (!session) localStorage.removeItem(KEYS.session)
  else writeJson(KEYS.session, session)
}

export function accountToProfile(a: StoredAccount): Profile {
  return {
    id: a.id,
    email: a.email,
    fullName: a.fullName,
    role: a.role,
    createdAt: a.createdAt,
  }
}

export function requireSession(): AuthSession {
  const s = getSession()
  if (!s) throw new Error('Not signed in')
  return s
}

function nonOwnerCount(accounts: StoredAccount[]): number {
  return accounts.filter(
    (a) => a.role !== 'owner' && a.email.toLowerCase() !== OWNER_EMAIL.toLowerCase(),
  ).length
}

export async function registerAccount(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthSession> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new Error('Email is required')
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')

  const accounts = loadAccounts()
  if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
    throw new Error('An account with this email already exists. Sign in instead.')
  }

  const isOwnerEmail = normalized === OWNER_EMAIL.toLowerCase()
  if (!isOwnerEmail && nonOwnerCount(accounts) >= MAX_ACCOUNTS) {
    throw new Error('Maximum of 4 accounts reached. No more registrations allowed.')
  }

  const salt = randomSalt()
  const passwordHash = await hashPassword(password, salt)
  // Sole owner: reserved mailbox or first seat on an empty desk. Prefer PRIMARY_ADMIN_EMAIL → admin (not co-owner).
  const role: Role =
    isOwnerEmail || accounts.length === 0 ? 'owner' : defaultSeatRole(normalized)
  const account: StoredAccount = {
    id: id(),
    email: normalized,
    fullName: fullName?.trim() || null,
    role,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }

  accounts.push(account)
  saveAccounts(accounts)
  if (normalized === PRIMARY_ADMIN_EMAIL.toLowerCase() && account.role === 'admin') {
    localStorage.setItem(KEYS.profAdminBootstrap, '1')
  }

  const session = { userId: account.id, email: account.email }
  setSession(session)
  return session
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  const normalized = email.trim().toLowerCase()
  const accounts = loadAccounts()
  const account = accounts.find((a) => a.email.toLowerCase() === normalized)
  if (!account) throw new Error('Email or password is incorrect.')

  const hash = await hashPassword(password, account.salt)
  if (hash !== account.passwordHash) throw new Error('Email or password is incorrect.')

  const session = { userId: account.id, email: account.email }
  setSession(session)
  return session
}

export function signOut() {
  setSession(null)
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = requireSession()
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.')

  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === session.userId)
  if (idx < 0) throw new Error('Not signed in')
  const account = accounts[idx]!

  const currentHash = await hashPassword(currentPassword, account.salt)
  if (currentHash !== account.passwordHash) throw new Error('Current password is incorrect')

  const salt = randomSalt()
  account.passwordHash = await hashPassword(newPassword, salt)
  account.salt = salt
  accounts[idx] = account
  saveAccounts(accounts)
}

export function getProfile(userId: string): Profile | null {
  const a = loadAccounts().find((x) => x.id === userId)
  return a ? accountToProfile(a) : null
}

/**
 * Full desk share on this device: every signed-in account sees and mutates the
 * same candidates, offers, interviews, earnings, and activity feed.
 * `userId` on each row is creator attribution only — never a list/mutate scope.
 */
export function listOffers(): Offer[] {
  return [...loadData().offers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listCandidates(): Candidate[] {
  return [...loadData().candidates].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function listInterviews(): Interview[] {
  return [...loadData().interviews].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
}

export function listEarnings(): Earning[] {
  return [...loadData().earnings].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listActivities(limit = 20): Activity[] {
  return [...loadData().activities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

function pushActivity(
  data: DeskData,
  userId: string,
  entityType: string,
  entityId: string | null,
  message: string,
) {
  data.activities.unshift({
    id: id(),
    userId,
    entityType,
    entityId,
    message,
    createdAt: new Date().toISOString(),
  })
  data.activities = data.activities.slice(0, 200)
}

export function upsertCandidateRow(
  userId: string,
  payload: Partial<Candidate> & { name: string },
  existingId?: string,
) {
  const data = loadData()
  const now = new Date().toISOString()
  if (existingId) {
    const idx = data.candidates.findIndex((c) => c.id === existingId)
    if (idx < 0) throw new Error('Candidate not found')
    const prev = data.candidates[idx]!
    data.candidates[idx] = migrateCandidate({
      ...prev,
      // Preserve creator attribution; any role may edit desk-shared rows.
      userId: prev.userId,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      source: payload.source ?? null,
      stage: payload.stage ?? prev.stage,
      market: payload.market !== undefined ? payload.market : prev.market,
      gender: payload.gender !== undefined ? payload.gender : prev.gender,
      offerId: payload.offerId ?? null,
      telegram: payload.telegram ?? null,
      sentBy: payload.sentBy ?? null,
      country: payload.country ?? null,
      age: payload.age ?? null,
      languages: payload.languages ?? null,
      currentLocation: payload.currentLocation ?? null,
      notes: payload.notes ?? null,
      expectedSalary: payload.expectedSalary ?? null,
      updatedAt: now,
    })
    pushActivity(data, userId, 'candidate', existingId, `Updated candidate ${payload.name}`)
  } else {
    const row: Candidate = migrateCandidate({
      id: id(),
      userId,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      source: payload.source ?? null,
      stage: payload.stage ?? 'Screening',
      market: payload.market ?? null,
      gender: payload.gender ?? null,
      offerId: payload.offerId ?? null,
      telegram: payload.telegram ?? null,
      sentBy: payload.sentBy ?? null,
      country: payload.country ?? null,
      age: payload.age ?? null,
      languages: payload.languages ?? null,
      currentLocation: payload.currentLocation ?? null,
      notes: payload.notes ?? null,
      expectedSalary: payload.expectedSalary ?? null,
      createdAt: now,
      updatedAt: now,
    })
    data.candidates.unshift(row)
    pushActivity(data, userId, 'candidate', row.id, `Added candidate ${payload.name}`)
  }
  saveData(data)
}

export function deleteCandidateRow(userId: string, candidateId: string) {
  const data = loadData()
  const target = data.candidates.find((c) => c.id === candidateId)
  if (!target) return

  data.candidates = data.candidates.filter((c) => c.id !== candidateId)
  // Cascade desk-wide: interviews require a candidate; earnings may reference one.
  data.interviews = data.interviews.filter((i) => i.candidateId !== candidateId)
  data.earnings = data.earnings.filter((e) => e.candidateId !== candidateId)
  pushActivity(data, userId, 'candidate', candidateId, `Deleted candidate ${target.name}`)
  saveData(data)
}

export function upsertOfferRow(
  userId: string,
  payload: Omit<Offer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
) {
  const data = loadData()
  const now = new Date().toISOString()
  if (existingId) {
    const idx = data.offers.findIndex((o) => o.id === existingId)
    if (idx < 0) throw new Error('Offer not found')
    const prev = data.offers[idx]!
    data.offers[idx] = {
      ...prev,
      ...payload,
      id: existingId,
      userId: prev.userId,
      updatedAt: now,
    }
    pushActivity(data, userId, 'offer', existingId, `Updated offer ${payload.title}`)
  } else {
    const row: Offer = {
      ...payload,
      id: id(),
      userId,
      createdAt: now,
      updatedAt: now,
    }
    data.offers.unshift(row)
    pushActivity(data, userId, 'offer', row.id, `Added offer ${payload.title}`)
  }
  saveData(data)
}

export function deleteOfferRow(userId: string, offerId: string) {
  const data = loadData()
  const existed = data.offers.some((o) => o.id === offerId)
  if (!existed) return
  data.offers = data.offers.filter((o) => o.id !== offerId)
  pushActivity(data, userId, 'offer', offerId, 'Deleted offer')
  saveData(data)
}

export function upsertInterviewRow(
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
  const data = loadData()
  const now = new Date().toISOString()
  if (existingId) {
    const idx = data.interviews.findIndex((i) => i.id === existingId)
    if (idx < 0) throw new Error('Interview not found')
    const prev = data.interviews[idx]!
    data.interviews[idx] = {
      ...prev,
      candidateId: payload.candidateId,
      offerId: payload.offerId ?? null,
      scheduledAt: payload.scheduledAt,
      outcome: payload.outcome ?? null,
      notes: payload.notes ?? null,
    }
    pushActivity(data, userId, 'interview', existingId, 'Updated interview')
  } else {
    const row: Interview = {
      id: id(),
      userId,
      candidateId: payload.candidateId,
      offerId: payload.offerId ?? null,
      scheduledAt: payload.scheduledAt,
      outcome: payload.outcome ?? null,
      notes: payload.notes ?? null,
      createdAt: now,
    }
    data.interviews.unshift(row)
    pushActivity(data, userId, 'interview', row.id, 'Scheduled interview')
  }
  saveData(data)
}

export function deleteInterviewRow(userId: string, interviewId: string) {
  const data = loadData()
  const existed = data.interviews.some((i) => i.id === interviewId)
  if (!existed) return
  data.interviews = data.interviews.filter((i) => i.id !== interviewId)
  pushActivity(data, userId, 'interview', interviewId, 'Deleted interview')
  saveData(data)
}

export function upsertEarningRow(
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
  const data = loadData()
  const now = new Date().toISOString()
  if (existingId) {
    const idx = data.earnings.findIndex((e) => e.id === existingId)
    if (idx < 0) throw new Error('Earning not found')
    const prev = data.earnings[idx]!
    data.earnings[idx] = {
      ...prev,
      candidateId: payload.candidateId ?? null,
      offerId: payload.offerId ?? null,
      amount: payload.amount,
      status: payload.status,
      notes: payload.notes ?? null,
      // Preserve creator attribution; any role may edit desk-shared rows.
      userId: prev.userId,
      updatedAt: now,
    }
    pushActivity(data, userId, 'earning', existingId, `Updated earning $${payload.amount}`)
  } else {
    const row: Earning = {
      id: id(),
      userId,
      candidateId: payload.candidateId ?? null,
      offerId: payload.offerId ?? null,
      amount: payload.amount,
      status: payload.status,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }
    data.earnings.unshift(row)
    pushActivity(data, userId, 'earning', row.id, `Added earning $${payload.amount}`)
  }
  saveData(data)
}

export function deleteEarningRow(userId: string, earningId: string) {
  const data = loadData()
  const existed = data.earnings.some((e) => e.id === earningId)
  if (!existed) return
  data.earnings = data.earnings.filter((e) => e.id !== earningId)
  pushActivity(data, userId, 'earning', earningId, 'Deleted earning')
  saveData(data)
}

export function confirmEarningRow(userId: string, earningId: string) {
  const data = loadData()
  const idx = data.earnings.findIndex((e) => e.id === earningId)
  if (idx < 0) throw new Error('Earning not found')
  data.earnings[idx] = {
    ...data.earnings[idx]!,
    status: 'Pending',
    updatedAt: new Date().toISOString(),
  }
  pushActivity(data, userId, 'earning', earningId, 'Confirmed earning → Pending')
  saveData(data)
}

export function adminListStats() {
  // Always expose every account in this browser's store — no owner-only filter.
  const accounts = loadAccounts()
  const data = loadData()
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
    candidates: data.candidates.length,
    offers: data.offers.length,
    interviews: data.interviews.length,
    earnings: data.earnings.length,
    estimated: data.earnings
      .filter((e) => e.status === 'Estimated')
      .reduce((s, e) => s + e.amount, 0),
    perAccount: sorted.map((a) => ({
      id: a.id,
      email: a.email,
      fullName: a.fullName,
      role: a.role,
      candidates: data.candidates.filter((c) => c.userId === a.id).length,
      offers: data.offers.filter((o) => o.userId === a.id).length,
      interviews: data.interviews.filter((i) => i.userId === a.id).length,
      earnings: data.earnings.filter((e) => e.userId === a.id).length,
    })),
  }
}

/** Create a seat without switching the current session (Admin console). */
export async function adminCreateAccountRow(input: {
  email: string
  password: string
  fullName?: string
  role?: Role
}): Promise<Profile> {
  const normalized = input.email.trim().toLowerCase()
  if (!normalized) throw new Error('Email is required')
  if (input.password.length < 8) throw new Error('Password must be at least 8 characters.')

  if (input.role === 'owner') throw new Error('Cannot assign owner role')
  // Preferred admin mailbox always lands as admin (owner stays sole owner elsewhere).
  const role: Role =
    normalized === PRIMARY_ADMIN_EMAIL.toLowerCase()
      ? 'admin'
      : (input.role ?? defaultSeatRole(normalized))

  const accounts = loadAccounts()
  if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
    throw new Error('An account with this email already exists. Sign in instead.')
  }
  if (normalized === OWNER_EMAIL.toLowerCase()) {
    throw new Error('This email is reserved for the desk owner.')
  }
  if (nonOwnerCount(accounts) >= MAX_ACCOUNTS) {
    throw new Error('Maximum of 4 accounts reached. No more registrations allowed.')
  }

  const salt = randomSalt()
  const passwordHash = await hashPassword(input.password, salt)
  const account: StoredAccount = {
    id: id(),
    email: normalized,
    fullName: input.fullName?.trim() || null,
    role,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }
  accounts.push(account)
  saveAccounts(accounts)
  if (normalized === PRIMARY_ADMIN_EMAIL.toLowerCase() && account.role === 'admin') {
    localStorage.setItem(KEYS.profAdminBootstrap, '1')
  }
  return accountToProfile(account)
}

export function adminUpdateRoleRow(id: string, role: Role) {
  if (role === 'owner') throw new Error('Cannot assign owner role')
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx < 0) throw new Error('Account not found')
  const a = accounts[idx]!
  if (a.role === 'owner' || a.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    throw new Error('Owner cannot be demoted')
  }
  accounts[idx] = { ...a, role }
  saveAccounts(accounts)
}

export function adminDeleteAccountRow(id: string) {
  const accounts = loadAccounts()
  const a = accounts.find((x) => x.id === id)
  if (!a) throw new Error('Account not found')
  if (a.role === 'owner' || a.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    throw new Error('Owner cannot be deleted')
  }
  // Seat only — desk rows stay shared. `userId` remains creator attribution.
  saveAccounts(accounts.filter((x) => x.id !== id))
}

export async function adminSetPasswordRow(id: string, password: string) {
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  const accounts = loadAccounts()
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx < 0) throw new Error('Account not found')
  const a = accounts[idx]!
  if (a.role === 'owner' || a.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    throw new Error('Owner password cannot be changed here')
  }
  const salt = randomSalt()
  accounts[idx] = {
    ...a,
    salt,
    passwordHash: await hashPassword(password, salt),
  }
  saveAccounts(accounts)
}

/** Local-only: mint a temporary password (no email). */
export async function adminResetPasswordRow(id: string): Promise<string> {
  const temp = `td-${crypto.randomUUID().slice(0, 10)}`
  await adminSetPasswordRow(id, temp)
  return `Temporary password (copy now): ${temp}`
}

export function exportDeskJson(includePasswords = false): TalentDeskExport {
  const accounts = loadAccounts()
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    accounts: accounts.map((a) => ({
      id: a.id,
      email: a.email,
      fullName: a.fullName,
      role: a.role,
      createdAt: a.createdAt,
      ...(includePasswords
        ? { passwordHash: a.passwordHash, salt: a.salt }
        : {}),
    })),
    data: loadData(),
  }
}

export async function importDeskJson(raw: unknown): Promise<{ accounts: number; rows: number }> {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid export JSON')
  const doc = raw as TalentDeskExport
  if (doc.format !== EXPORT_FORMAT) {
    throw new Error('Unrecognized export format — expected talent-desk-export')
  }

  const data = doc.data ?? emptyData()
  const incomingAccounts = doc.accounts ?? []
  const existing = loadAccounts()

  let accounts: StoredAccount[]
  if (incomingAccounts.length === 0) {
    // Never wipe local seats when an export omits accounts — that looked like
    // "Admin only shows the owner" after a data-only import.
    accounts = existing
  } else {
    // Merge by email: incoming credentials win; keep local seats not in the export.
    const byEmail = new Map<string, StoredAccount>()
    for (const a of existing) byEmail.set(a.email.toLowerCase(), a)

    for (const a of incomingAccounts) {
      const email = a.email.trim().toLowerCase()
      let passwordHash = a.passwordHash
      let salt = a.salt
      if (a.password) {
        salt = randomSalt()
        passwordHash = await hashPassword(a.password, salt)
      }
      const prev = byEmail.get(email)
      if (!passwordHash || !salt) {
        if (prev) {
          passwordHash = prev.passwordHash
          salt = prev.salt
        } else {
          salt = randomSalt()
          passwordHash = await hashPassword(crypto.randomUUID(), salt)
        }
      }
      byEmail.set(email, {
        id: a.id || prev?.id || id(),
        email,
        fullName: a.fullName ?? prev?.fullName ?? null,
        role: isRole(a.role) ? a.role : (prev?.role ?? 'user'),
        passwordHash,
        salt,
        createdAt: a.createdAt || prev?.createdAt || new Date().toISOString(),
      })
    }
    accounts = [...byEmail.values()]
  }

  saveAccounts(accounts)
  saveData(
    migrateDeskData({
      candidates: data.candidates ?? [],
      offers: data.offers ?? [],
      interviews: data.interviews ?? [],
      earnings: data.earnings ?? [],
      activities: data.activities ?? [],
    }),
  )

  const rows =
    (data.candidates?.length ?? 0) +
    (data.offers?.length ?? 0) +
    (data.interviews?.length ?? 0) +
    (data.earnings?.length ?? 0)

  return { accounts: accounts.length, rows }
}

export function friendlyAuthError(err: unknown): { message: string; hint?: string } {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : 'Something went wrong.'

  if (/incorrect|invalid login/i.test(raw)) {
    return { message: 'Email or password is incorrect.' }
  }
  if (/already exists/i.test(raw)) {
    return { message: 'An account with this email already exists. Sign in instead.' }
  }
  if (/maximum|4 accounts/i.test(raw)) {
    return { message: 'Maximum of 4 accounts reached. No more registrations allowed.' }
  }
  if (/reserved/i.test(raw)) {
    return { message: 'This email is reserved for the desk owner.' }
  }
  if (/8 characters/i.test(raw)) {
    return { message: 'Password must be at least 8 characters.' }
  }
  return { message: raw }
}
