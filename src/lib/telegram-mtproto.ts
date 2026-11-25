/**
 * Personal Telegram (user account) via teleproto / MTProto.
 * Not a bot. Session lives in this browser. Requires api_id + api_hash from
 * https://my.telegram.org — unofficial client use can risk account limits/bans.
 */

import { TelegramClient } from 'teleproto'
import { StringSession } from 'teleproto/sessions'

export const TELEGRAM_SESSION_KEY = 'talent-desk.telegram-session.v1'
export const TELEGRAM_API_KEY = 'talent-desk.telegram-api.v1'

export type TelegramApiCreds = { apiId: number; apiHash: string }

export function readEnvTelegramApi(): TelegramApiCreds | null {
  const idRaw = import.meta.env.VITE_TELEGRAM_API_ID as string | undefined
  const hash = import.meta.env.VITE_TELEGRAM_API_HASH as string | undefined
  const apiId = idRaw ? Number(idRaw) : NaN
  if (!Number.isFinite(apiId) || apiId <= 0 || !hash?.trim()) return null
  return { apiId, apiHash: hash.trim() }
}

export function readStoredTelegramApi(): TelegramApiCreds | null {
  try {
    const raw = localStorage.getItem(TELEGRAM_API_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { apiId?: number; apiHash?: string }
    const apiId = Number(parsed.apiId)
    if (!Number.isFinite(apiId) || apiId <= 0 || !parsed.apiHash?.trim()) return null
    return { apiId, apiHash: parsed.apiHash.trim() }
  } catch {
    return null
  }
}

export function resolveTelegramApi(): TelegramApiCreds | null {
  return readEnvTelegramApi() ?? readStoredTelegramApi()
}

export function storeTelegramApi(creds: TelegramApiCreds) {
  localStorage.setItem(
    TELEGRAM_API_KEY,
    JSON.stringify({ apiId: creds.apiId, apiHash: creds.apiHash }),
  )
}

export function readSessionString(): string {
  try {
    return localStorage.getItem(TELEGRAM_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

export function writeSessionString(session: string) {
  try {
    if (session) localStorage.setItem(TELEGRAM_SESSION_KEY, session)
    else localStorage.removeItem(TELEGRAM_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function clearTelegramSession() {
  writeSessionString('')
}

export function createTelegramClient(creds: TelegramApiCreds): TelegramClient {
  const session = new StringSession(readSessionString())
  return new TelegramClient(session, creds.apiId, creds.apiHash, {
    connectionRetries: 5,
    // Browser uses WebSocket transport by default in teleproto
  })
}

export function persistClientSession(client: TelegramClient) {
  const saved = client.session.save()
  if (typeof saved === 'string') writeSessionString(saved)
}

export type TgDialogRow = {
  id: string
  title: string
  username: string | null
  unread: number
  /** Entity for getMessages / sendMessage */
  entity: unknown
  lastMessage: string | null
  date: number | null
}

export type TgMessageRow = {
  id: number
  text: string
  out: boolean
  date: number
  senderName: string | null
}

export function dialogTitle(d: {
  title?: string | null
  name?: string | null
}): string {
  return (d.title || d.name || 'Chat').trim() || 'Chat'
}
