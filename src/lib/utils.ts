import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse money/count text: `1.600`, `1,600`, `1.600,50` → number. */
export function parseNumericInput(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  let s = String(raw).trim().replace(/[^\d.,\-]/g, '')
  if (!s) return null
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.')
    } else {
      s = s.replace(/,/g, '')
    }
  } else if (hasComma) {
    const parts = s.split(',')
    s = parts.length === 2 && parts[1]!.length <= 2 ? parts.join('.') : parts.join('')
  } else if (hasDot) {
    const parts = s.split('.')
    if (parts.length > 2) s = parts.join('')
    else if (parts.length === 2 && parts[1]!.length === 3 && parts[0]!.length <= 3) {
      s = parts.join('')
    }
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function formatMoney(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function ensureAtHandle(value: string | null | undefined): string {
  if (!value) return ''
  const v = value.trim()
  if (!v) return ''
  return v.startsWith('@') ? v : `@${v}`
}

export function stripAtHandle(value: string | null | undefined): string {
  if (!value) return ''
  return value.trim().replace(/^@+/, '')
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
