/**
 * Browser-only Talent Desk store (localStorage).
 * Empty by default — no demo/seed KPIs.
 */

import { MAX_ACCOUNTS, OWNER_EMAIL, type Role } from './constants'
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

export function loadAccounts(): StoredAccount[] {
  return readJson<StoredAccount[]>(KEYS.accounts, [])
}

function saveAccounts(accounts: StoredAccount[]) {
  writeJson(KEYS.accounts, accounts)
}

export function loadData(): DeskData {
  return readJson<DeskData>(KEYS.data, emptyData())
}

function saveData(data: DeskData) {
  writeJson(KEYS.data, data)
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
  const account: StoredAccount = {
    id: id(),
    email: normalized,
    fullName: fullName?.trim() || null,
    role: isOwnerEmail || accounts.length === 0 ? 'owner' : 'user',
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }

  // Only one owner: if registering owner email later, keep existing owner roles as-is;
  // first account always becomes owner for empty desks.
  if (isOwnerEmail) account.role = 'owner'

  accounts.push(account)
  saveAccounts(accounts)

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

function forUser<T extends { userId: string }>(rows: T[], userId: string): T[] {
  return rows.filter((r) => r.userId === userId)
}

export function listOffers(userId: string): Offer[] {
  return forUser(loadData().offers, userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listCandidates(userId: string): Candidate[] {
  return forUser(loadData().candidates, userId).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )
}

export function listInterviews(userId: string): Interview[] {
  return forUser(loadData().interviews, userId).sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  )
}

export function listEarnings(userId: string): Earning[] {
  return forUser(loadData().earnings, userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listActivities(userId: string, limit = 20): Activity[] {
  return forUser(loadData().activities, userId)
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
    const idx = data.candidates.findIndex((c) => c.id === existingId && c.userId === userId)
    if (idx < 0) throw new Error('Candidate not found')
    const prev = data.candidates[idx]!
    data.candidates[idx] = {
      ...prev,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      source: payload.source ?? null,
      stage: payload.stage ?? prev.stage,
      offerId: payload.offerId ?? null,
      telegram: payload.telegram ?? null,
      sentBy: payload.sentBy ?? null,
      notes: payload.notes ?? null,
      expectedSalary: payload.expectedSalary ?? null,
      updatedAt: now,
    }
    pushActivity(data, userId, 'candidate', existingId, `Updated candidate ${payload.name}`)
  } else {
    const row: Candidate = {
      id: id(),
      userId,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      source: payload.source ?? null,
      stage: payload.stage ?? 'Screening',
      offerId: payload.offerId ?? null,
      telegram: payload.telegram ?? null,
      sentBy: payload.sentBy ?? null,
      notes: payload.notes ?? null,
      expectedSalary: payload.expectedSalary ?? null,
      createdAt: now,
      updatedAt: now,
    }
    data.candidates.unshift(row)
    pushActivity(data, userId, 'candidate', row.id, `Added candidate ${payload.name}`)
  }
  saveData(data)
}

export function deleteCandidateRow(userId: string, candidateId: string) {
  const data = loadData()
  data.candidates = data.candidates.filter((c) => !(c.id === candidateId && c.userId === userId))
  pushActivity(data, userId, 'candidate', candidateId, 'Deleted candidate')
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
    const idx = data.offers.findIndex((o) => o.id === existingId && o.userId === userId)
    if (idx < 0) throw new Error('Offer not found')
    data.offers[idx] = {
      ...data.offers[idx]!,
      ...payload,
      id: existingId,
      userId,
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
  data.offers = data.offers.filter((o) => !(o.id === offerId && o.userId === userId))
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
    const idx = data.interviews.findIndex((i) => i.id === existingId && i.userId === userId)
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
  data.interviews = data.interviews.filter((i) => !(i.id === interviewId && i.userId === userId))
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
    const idx = data.earnings.findIndex((e) => e.id === existingId && e.userId === userId)
    if (idx < 0) throw new Error('Earning not found')
    const prev = data.earnings[idx]!
    data.earnings[idx] = {
      ...prev,
      candidateId: payload.candidateId ?? null,
      offerId: payload.offerId ?? null,
      amount: payload.amount,
      status: payload.status,
      notes: payload.notes ?? null,
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
  data.earnings = data.earnings.filter((e) => !(e.id === earningId && e.userId === userId))
  pushActivity(data, userId, 'earning', earningId, 'Deleted earning')
  saveData(data)
}

export function confirmEarningRow(userId: string, earningId: string) {
  const data = loadData()
  const idx = data.earnings.findIndex((e) => e.id === earningId && e.userId === userId)
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
  const accounts = loadAccounts()
  const data = loadData()
  const nonOwner = accounts.filter(
    (a) => a.role !== 'owner' && a.email.toLowerCase() !== OWNER_EMAIL.toLowerCase(),
  )
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
    perAccount: accounts.map((a) => ({
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
  saveAccounts(accounts.filter((x) => x.id !== id))
  const data = loadData()
  data.candidates = data.candidates.filter((c) => c.userId !== id)
  data.offers = data.offers.filter((o) => o.userId !== id)
  data.interviews = data.interviews.filter((i) => i.userId !== id)
  data.earnings = data.earnings.filter((e) => e.userId !== id)
  data.activities = data.activities.filter((x) => x.userId !== id)
  saveData(data)
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

  const accounts: StoredAccount[] = []
  for (const a of incomingAccounts) {
    const email = a.email.trim().toLowerCase()
    let passwordHash = a.passwordHash
    let salt = a.salt
    if (a.password) {
      salt = randomSalt()
      passwordHash = await hashPassword(a.password, salt)
    }
    if (!passwordHash || !salt) {
      // Accounts without credentials get a placeholder — user must reset via admin
      salt = randomSalt()
      passwordHash = await hashPassword(crypto.randomUUID(), salt)
    }
    accounts.push({
      id: a.id || id(),
      email,
      fullName: a.fullName ?? null,
      role: a.role ?? 'user',
      passwordHash,
      salt,
      createdAt: a.createdAt || new Date().toISOString(),
    })
  }

  saveAccounts(accounts)
  saveData({
    candidates: data.candidates ?? [],
    offers: data.offers ?? [],
    interviews: data.interviews ?? [],
    earnings: data.earnings ?? [],
    activities: data.activities ?? [],
  })

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
