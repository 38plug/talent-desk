/** Format an ISO / Date value for `<input type="datetime-local">`. */
export function toDatetimeLocalValue(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Local midnight ISO for a calendar day (used as schedule seed). */
export function localDayAtHour(day: Date, hour = 10, minute = 0): string {
  const d = new Date(day)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
