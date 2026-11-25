/**
 * Header desk notifications — unread watermark for “Added candidate/offer” activity.
 */

export const NOTIFICATIONS_SEEN_KEY = 'talent-desk.notifications-seen.v1'

export type DeskNotifyKind = 'candidate' | 'offer'

export function isAddActivity(entityType: string, message: string): DeskNotifyKind | null {
  if (entityType === 'candidate' && message.startsWith('Added candidate')) return 'candidate'
  if (entityType === 'offer' && message.startsWith('Added offer')) return 'offer'
  return null
}

export function readNotificationsSeenAt(): string {
  try {
    return localStorage.getItem(NOTIFICATIONS_SEEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function writeNotificationsSeenAt(iso: string) {
  try {
    localStorage.setItem(NOTIFICATIONS_SEEN_KEY, iso)
  } catch {
    /* ignore */
  }
}

export function hrefForActivity(kind: DeskNotifyKind, entityId: string | null): string {
  if (kind === 'candidate' && entityId) {
    return `/candidates?id=${encodeURIComponent(entityId)}`
  }
  if (kind === 'offer') return '/offers'
  return '/'
}
