/**
 * Upcoming interview start alerts — browser Notification API + in-app toast.
 * Fires when an interview is within LEAD of scheduledAt (or shortly after).
 * Pref is local to this browser; works on desktop + mobile browsers that support
 * Notifications (iOS Safari needs Add to Home Screen for OS banners).
 */

export const INTERVIEW_REMINDERS_PREF_KEY = 'talent-desk.interview-reminders.v1'
const FIRED_KEY = 'talent-desk.interview-reminded.v1'

/** Notify this many ms before scheduledAt (“about to start”). */
export const INTERVIEW_REMINDER_LEAD_MS = 60_000
/** Still fire if the desk opens up to this long after start. */
export const INTERVIEW_REMINDER_GRACE_MS = 120_000

export type NotificationPermissionState = NotificationPermission | 'unsupported'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

/** Opt-in reminders. Default on when unset. */
export function areInterviewRemindersEnabled(): boolean {
  try {
    const v = localStorage.getItem(INTERVIEW_REMINDERS_PREF_KEY)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}

export function setInterviewRemindersEnabled(enabled: boolean) {
  try {
    localStorage.setItem(INTERVIEW_REMINDERS_PREF_KEY, enabled ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function readFired(): Record<string, number> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, number>
  } catch {
    return {}
  }
}

function writeFired(map: Record<string, number>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function wasInterviewReminded(id: string): boolean {
  return Boolean(readFired()[id])
}

export function markInterviewReminded(id: string) {
  const map = readFired()
  map[id] = Date.now()
  // Keep map from growing forever — drop entries older than 7 days
  const cutoff = Date.now() - 7 * 86400000
  for (const [k, at] of Object.entries(map)) {
    if (at < cutoff) delete map[k]
  }
  writeFired(map)
}

export function isInterviewDueForReminder(scheduledAt: string, now = Date.now()): boolean {
  const t = new Date(scheduledAt).getTime()
  if (Number.isNaN(t)) return false
  return now >= t - INTERVIEW_REMINDER_LEAD_MS && now <= t + INTERVIEW_REMINDER_GRACE_MS
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!notificationsSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export type InterviewReminderPayload = {
  id: string
  title: string
  body: string
  href: string
}

/** OS / browser notification. No-op when unsupported or permission not granted. */
export function showInterviewOsNotification(payload: InterviewReminderPayload): boolean {
  if (!notificationsSupported()) return false
  if (Notification.permission !== 'granted') return false
  try {
    const n = new Notification(payload.title, {
      body: payload.body,
      tag: `talent-desk-interview-${payload.id}`,
    })
    n.onclick = () => {
      try {
        window.focus()
        if (payload.href) window.location.assign(payload.href)
      } catch {
        /* ignore */
      }
      n.close()
    }
    return true
  } catch {
    return false
  }
}
